import { useEffect, useLayoutEffect, useRef } from 'react';

/** Không có IntersectionObserver (jsdom, trình duyệt rất cũ) thì coi như không có hiệu ứng. */
const canObserve = () => typeof window !== 'undefined' && 'IntersectionObserver' in window;

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Hiện dần các phần tử `[data-reveal]` khi cuộn tới.
 *
 * Mặc định mọi thứ đều hiện — chỉ khi chắc chắn có IntersectionObserver thì
 * shell mới gắn class `au-reveal` để CSS ẩn trước rồi mới hiện. Nhờ vậy JS
 * hỏng hay test trong jsdom cũng không bao giờ ra một trang trống.
 */
export function useReveal(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || !canObserve() || reducedMotion()) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.in = '1';
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const watch = () => {
      el.querySelectorAll<HTMLElement>('[data-reveal]:not([data-in])').forEach((n) => io.observe(n));
    };
    watch();
    el.classList.add('au-reveal');

    // Timeline đổi theo bộ lọc, nên phần tử mới có thể xuất hiện bất kỳ lúc nào.
    const mo = new MutationObserver(watch);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      el.classList.remove('au-reveal');
    };
  }, [root]);
}

/**
 * Đếm số từ 0 lên khi cuộn tới. Render ban đầu luôn là con số thật — hiệu ứng
 * chỉ viết thẳng vào textContent, nên không có lần render nào mang số sai.
 */
export function useCountUp(value: number) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !canObserve() || reducedMotion() || value < 10) return;

    const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
    el.textContent = fmt(0);
    let raf = 0;

    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1400;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = fmt(value * (1 - Math.pow(1 - p, 4)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = fmt(value);
    };
  }, [value]);

  return ref;
}

/**
 * Ánh đèn theo con trỏ trên các thẻ `.au-spot`: một listener duy nhất cho cả
 * trang, ghi toạ độ vào biến CSS của đúng thẻ đang trỏ.
 */
export function useSpotlight(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const card = (e.target as HTMLElement | null)?.closest?.<HTMLElement>('.au-spot');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    return () => el.removeEventListener('pointermove', onMove);
  }, [root]);
}
