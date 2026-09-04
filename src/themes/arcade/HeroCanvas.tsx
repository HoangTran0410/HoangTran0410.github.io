import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion, useWideViewport } from './useArcadeMotion';

/** Dưới ngưỡng này thì không dựng canvas — điện thoại có việc khác để làm. */
const MIN_WIDTH = 640;
const SPACING = 30;

interface Spark {
  x: number;
  y: number;
  vx: number;
  life: number;
}

/**
 * Lưới điểm trôi sau tên, thêm một tia quét ngang và vài đốm sáng bay qua.
 * Vẽ bằng fillRect (ô vuông nhỏ) chứ không phải arc: rẻ hơn nhiều và hợp
 * chất pixel hơn. Tự huỷ sạch khi unmount — cancelAnimationFrame + gỡ listener.
 */
export function HeroCanvas({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const wide = useWideViewport(MIN_WIDTH);
  const ref = useRef<HTMLCanvasElement>(null);
  const active = !reduced && wide;

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;

    // Chưa có kích thước thật (đang ẩn, hoặc môi trường không dựng layout) thì
    // không có gì để vẽ — và cũng khỏi phải hỏi context làm gì.
    const first = canvas.getBoundingClientRect();
    if (first.width < 1 || first.height < 1) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      ctx = null;
    }
    if (!ctx) return;
    const c = ctx;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let cols: number[] = [];
    let rows: number[] = [];
    let sparks: Spark[] = [];
    let raf = 0;
    let start = 0;

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = [];
      for (let x = 0; x <= w + SPACING; x += SPACING) cols.push(x);
      rows = [];
      for (let y = 0; y <= h + SPACING; y += SPACING) rows.push(y);

      sparks = Array.from({ length: 5 }, () => ({
        x: Math.random() * w,
        y: rows.length ? rows[Math.floor(Math.random() * rows.length)] : h / 2,
        vx: 40 + Math.random() * 90,
        life: Math.random(),
      }));
    };

    const frame = (ts: number) => {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      c.clearRect(0, 0, w, h);

      // Tia quét chạy vòng từ trái sang phải, làm sáng các điểm nó đi qua.
      const beam = ((t * 0.16) % 1.4 - 0.2) * w;

      for (const y of rows) {
        const rowPhase = y * 0.021;
        for (const x of cols) {
          const wave = Math.sin(x * 0.011 + t * 0.85) + Math.cos(rowPhase - t * 0.62);
          const k = (wave + 2) / 4;
          const near = Math.max(0, 1 - Math.abs(x - beam) / 180);
          const alpha = 0.1 + k * 0.2 + near * 0.46;
          if (alpha <= 0.06) continue;
          const size = 1.3 + k * 1.4 + near * 1.5;
          const dx = Math.sin(t * 0.55 + rowPhase) * 2.6;
          const dy = Math.cos(t * 0.42 + x * 0.008) * 2.6;
          c.fillStyle = `rgba(${near > 0.35 ? '196,181,253' : '167,139,250'},${alpha.toFixed(3)})`;
          c.fillRect(x + dx - size / 2, y + dy - size / 2, size, size);
        }
      }

      // Đốm sáng bay ngang, kéo theo một vệt ngắn.
      for (const s of sparks) {
        s.x += (s.vx * 16) / 1000;
        if (s.x > w + 60) {
          s.x = -60;
          s.y = rows.length ? rows[Math.floor(Math.random() * rows.length)] : h / 2;
          s.vx = 40 + Math.random() * 90;
        }
        s.life = (s.life + 0.004) % 1;
        const glow = 0.35 + 0.35 * Math.sin(s.life * Math.PI * 2);
        const grad = c.createLinearGradient(s.x - 54, s.y, s.x, s.y);
        grad.addColorStop(0, 'rgba(34,211,238,0)');
        grad.addColorStop(1, `rgba(34,211,238,${glow.toFixed(3)})`);
        c.fillStyle = grad;
        c.fillRect(s.x - 54, s.y - 1, 54, 2);
        c.fillStyle = `rgba(224,242,254,${(glow + 0.2).toFixed(3)})`;
        c.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
      }

      raf = requestAnimationFrame(frame);
    };

    measure();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [active]);

  if (!active) return null;

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
