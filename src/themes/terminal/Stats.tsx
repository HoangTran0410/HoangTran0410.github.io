import { useMemo } from 'react';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { computeStats } from '../../lib/stats';

const BAR_WIDTH = 22;

/** Thanh bar vẽ bằng ký tự, vì đây là terminal chứ không phải dashboard. */
function bar(value: number, max: number): string {
  const filled = max <= 0 ? 0 : Math.max(1, Math.round((value / max) * BAR_WIDTH));
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, BAR_WIDTH - filled));
}

/** Output của `stats`. */
export function Stats() {
  const { all } = useCatalog();
  const { t } = useI18n();
  const s = useMemo(() => computeStats(all, PROFILE), [all]);

  const rows = [
    { key: 'stars', value: s.totalStars, label: t('stats.stars') },
    { key: 'forks', value: s.totalForks, label: t('stats.forks') },
    { key: 'projects', value: s.totalProjects, label: t('stats.projects') },
    { key: 'categories', value: s.categories, label: t('stats.categories') },
    { key: 'years', value: s.years, label: t('stats.years') },
  ];
  const max = Math.max(...rows.map((r) => r.value));

  return (
    <section className="term-stats">
      <dl className="term-stat-rows">
        {rows.map((r) => (
          <div key={r.key} className="term-stat-row">
            <dt>{r.key}</dt>
            <dd>
              <span className="term-bar" aria-hidden>
                {bar(r.value, max)}
              </span>
              <b className="term-stat-value">{r.value.toLocaleString('en-US')}</b>
              <span className="term-dim">{r.label}</span>
            </dd>
          </div>
        ))}
      </dl>

      {s.topLanguages.length > 0 && (
        <p className="term-langs">
          <span className="term-dim">languages: </span>
          {s.topLanguages.map((l) => `${l.name} (${l.count})`).join('  ')}
        </p>
      )}
      {s.lastPushed && (
        <p className="term-dim">
          {t('footer.updated')} {s.lastPushed}
        </p>
      )}
    </section>
  );
}
