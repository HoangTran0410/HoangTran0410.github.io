import { useMemo } from 'react';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { computeStats } from '../../lib/stats';

export function Stats() {
  const { all } = useCatalog();
  const { t } = useI18n();
  const s = useMemo(() => computeStats(all, PROFILE), [all]);

  const items = [
    { value: s.totalStars.toLocaleString('en-US'), label: t('stats.stars') },
    { value: String(s.totalProjects), label: t('stats.projects') },
    { value: s.totalForks.toLocaleString('en-US'), label: t('stats.forks') },
    { value: String(s.years), label: t('stats.years') },
  ];

  return (
    <section className="px-[var(--gutter)] pb-14">
      <hr className="ed-rule" />
      <dl className="grid grid-cols-2 md:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={it.label}
            className="ed-reveal border-line px-1 py-6 not-last:border-b md:border-b-0 md:not-last:border-r md:px-6 md:first:pl-0"
            style={{ '--i': i } as React.CSSProperties}
          >
            <dd className="ed-display ed-num text-4xl leading-none sm:text-5xl">{it.value}</dd>
            <dt className="ed-meta mt-2.5">{it.label}</dt>
          </div>
        ))}
      </dl>
      <hr className="ed-rule" />
    </section>
  );
}
