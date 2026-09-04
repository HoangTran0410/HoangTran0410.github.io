import { useMemo } from 'react';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { computeStats } from '../../lib/stats';

/**
 * Bốn ô số liệu 1×1 rời nhau — cố tình không gộp thành một ô, vì bento sống
 * bằng nhịp to/nhỏ chứ không phải bằng bảng số.
 */
export function Stats() {
  const { all } = useCatalog();
  const { t } = useI18n();
  const s = useMemo(() => computeStats(all, PROFILE), [all]);

  const items = [
    { key: 'stars', value: s.totalStars.toLocaleString('en-US'), label: t('stats.stars'), glyph: '★' },
    { key: 'projects', value: String(s.totalProjects), label: t('stats.projects'), glyph: '◆' },
    { key: 'forks', value: s.totalForks.toLocaleString('en-US'), label: t('stats.forks'), glyph: '⑂' },
    { key: 'years', value: String(s.years), label: t('stats.years'), glyph: '↗' },
  ];

  return (
    <>
      {items.map((it, i) => (
        <div
          key={it.key}
          className="bn-tile justify-between"
          data-cell="stat"
          data-stat={it.key}
          data-lift="1"
          style={{ '--i': i + 1 } as React.CSSProperties}
        >
          <span aria-hidden className="text-lg text-muted/60">
            {it.glyph}
          </span>
          <div className="mt-3">
            <p className="bn-figure">{it.value}</p>
            <p className="bn-label mt-2 normal-case tracking-[0.06em]">{it.label}</p>
          </div>
        </div>
      ))}
    </>
  );
}
