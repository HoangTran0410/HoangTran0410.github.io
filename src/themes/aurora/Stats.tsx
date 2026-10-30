import { useMemo } from 'react';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { computeStats } from '../../lib/stats';
import { useCountUp } from './motion';

/** Màu cho thanh ngôn ngữ — theo thứ tự xếp hạng, không theo tên. */
const LANG_COLORS = ['#a78bfa', '#22d3ee', '#f472b6', '#34d399', '#fbbf24', '#60a5fa'];

function Figure({ value, label, i }: { value: number; label: string; i: number }) {
  const ref = useCountUp(value);
  return (
    <div className="au-stat au-glass au-spot" data-reveal style={{ '--d': i } as React.CSSProperties}>
      <p className="au-stat-value">
        <span ref={ref}>{value.toLocaleString('en-US')}</span>
      </p>
      <p className="au-stat-label">{label}</p>
    </div>
  );
}

/**
 * Bốn con số đếm lên khi cuộn tới, kèm một thanh tỉ lệ ngôn ngữ chính trên
 * toàn bộ dự án, rồi một dải kỹ năng chạy ngang.
 */
export function Stats() {
  const { all } = useCatalog();
  const { t, ti } = useI18n();
  const s = useMemo(() => computeStats(all, PROFILE), [all]);
  const langTotal = s.topLanguages.reduce((n, l) => n + l.count, 0);
  const skills = useMemo(() => PROFILE.skills.flatMap((g) => g.items).filter((x) => x !== '...'), []);

  const items = [
    { key: 'stars', value: s.totalStars, label: t('stats.stars') },
    { key: 'projects', value: s.totalProjects, label: t('stats.projects') },
    { key: 'forks', value: s.totalForks, label: t('stats.forks') },
    { key: 'years', value: s.years, label: t('stats.years') },
  ];

  return (
    <section className="au-wrap au-stats" aria-label={ti({ vi: 'Số liệu', en: 'Numbers' })}>
      <div className="au-stat-grid">
        {items.map((it, i) => (
          <Figure key={it.key} value={it.value} label={it.label} i={i} />
        ))}
      </div>

      {langTotal > 0 && (
        <div className="au-langs au-glass" data-reveal>
          <p className="au-eyebrow">{ti({ vi: 'Ngôn ngữ chính trong các dự án', en: 'Main languages across projects' })}</p>
          <div className="au-lang-bar" aria-hidden>
            {s.topLanguages.map((l, i) => (
              <span
                key={l.name}
                style={{ flexGrow: l.count, background: LANG_COLORS[i % LANG_COLORS.length] }}
              />
            ))}
          </div>
          <ul className="au-lang-legend">
            {s.topLanguages.map((l, i) => (
              <li key={l.name}>
                <span className="au-dot" style={{ background: LANG_COLORS[i % LANG_COLORS.length] }} aria-hidden />
                {l.name}
                <span className="au-mono au-dim">{Math.round((l.count / langTotal) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="au-marquee" aria-hidden>
        <div className="au-marquee-track">
          {[...skills, ...skills].map((k, i) => (
            <span key={i} className="au-marquee-item">
              {k}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
