import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { computeStats } from '../../lib/stats';
import { usePrefersReducedMotion } from './useArcadeMotion';

const DURATION = 1100;

/**
 * Đếm từ 0 lên khi ô lăn vào tầm mắt. Không có IntersectionObserver (jsdom,
 * trình duyệt cũ) hoặc người dùng xin bớt chuyển động thì hiện luôn số cuối —
 * số liệu quan trọng hơn hiệu ứng.
 */
function useCountUp(value: number, animate: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(() => (animate ? 0 : value));

  useEffect(() => {
    const el = ref.current;
    if (!animate || !el || typeof IntersectionObserver === 'undefined') {
      setShown(value);
      return;
    }

    let raf = 0;
    let start = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min(1, (ts - start) / DURATION);
          const eased = 1 - Math.pow(1 - p, 3);
          setShown(Math.round(value * eased));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, animate]);

  return { ref, shown };
}

function Cell({
  value,
  label,
  accent,
  index,
}: {
  value: number;
  label: string;
  accent: string;
  index: number;
}) {
  const animate = !usePrefersReducedMotion();
  const { ref, shown } = useCountUp(value, animate);

  return (
    <div
      className="ar-panel ar-in ar-edge px-4 py-6 sm:px-6 sm:py-7"
      style={{ '--panel-accent': accent, '--card-accent': accent, '--i': index } as CSSProperties}
    >
      <dd
        ref={ref}
        className="ar-display text-4xl leading-none text-ink tabular-nums sm:text-5xl"
        style={{ textShadow: `0 0 26px color-mix(in oklab, ${accent} 42%, transparent)` }}
      >
        {shown.toLocaleString('en-US')}
      </dd>
      <dt className="ar-label mt-3 block">{label}</dt>
    </div>
  );
}

export function Stats() {
  const { all } = useCatalog();
  const { t } = useI18n();
  const s = useMemo(() => computeStats(all, PROFILE), [all]);

  const cells = [
    { value: s.totalStars, label: t('stats.stars'), accent: 'var(--accent)' },
    { value: s.totalProjects, label: t('stats.projects'), accent: 'var(--neon-cyan)' },
    { value: s.totalForks, label: t('stats.forks'), accent: 'var(--neon-pink)' },
    { value: s.years, label: t('stats.years'), accent: 'var(--neon-amber)' },
  ];

  return (
    <section className="px-[var(--gutter)] pb-16">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {cells.map((c, i) => (
          <Cell key={c.label} value={c.value} label={c.label} accent={c.accent} index={i} />
        ))}
      </dl>
    </section>
  );
}
