import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { computeStats } from '../../lib/stats';

function period(
  from: string | undefined,
  to: string | null | undefined,
  present: string,
): string | null {
  if (!from) return null;
  const fmt = (v: string) => v.replace('-', '/');
  return `${fmt(from)} — ${to ? fmt(to) : present}`;
}

function Heading({ num, children }: { num: string; children: string }) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <h2 className="ar-display flex items-baseline gap-3 text-xl sm:text-2xl">
        <span className="ar-num text-xs text-accent">{num}</span>
        {children}
      </h2>
      <span aria-hidden className="ar-heading-rule" />
    </div>
  );
}

/**
 * Bảng ngôn ngữ hay dùng — đếm từ số liệu GitHub đã sync, không phải tự khai.
 * Nó cũng lấp đúng khoảng trống bên cột trái khi phần kinh nghiệm còn ngắn.
 */
function Languages() {
  const { all } = useCatalog();
  const { ti } = useI18n();
  const langs = useMemo(() => computeStats(all, PROFILE).topLanguages, [all]);
  if (langs.length === 0) return null;

  const max = langs[0].count;

  return (
    <div className="ar-panel ar-edge px-4 py-5 sm:px-5">
      <h3 className="ar-label">{ti({ vi: 'Viết nhiều nhất bằng', en: 'Most written in' })}</h3>
      <ul className="mt-4 space-y-2.5">
        {langs.map((l, i) => (
          <li key={l.name} className="grid grid-cols-[7.5rem_minmax(0,1fr)_2rem] items-center gap-3">
            <span className="ar-num truncate text-xs text-ink/85">{l.name}</span>
            <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <span
                className="ar-bar"
                style={
                  {
                    width: `${Math.round((l.count / max) * 100)}%`,
                    '--bar-to': ['var(--neon-cyan)', 'var(--neon-pink)', 'var(--neon-amber)'][i % 3],
                  } as CSSProperties
                }
              />
            </span>
            <span className="ar-num text-right text-xs text-muted">{l.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Story() {
  const { t, ti } = useI18n();
  const { experience, education, skills } = PROFILE;

  return (
    <section id="about" className="px-[var(--gutter)] pb-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="space-y-12">
          {experience.length > 0 && (
            <div>
              <Heading num="02">{t('story.experience')}</Heading>
              <ol className="space-y-4">
                {experience.map((x) => {
                  const range = period(x.from, x.to, t('story.present'));
                  return (
                    <li
                      key={`${x.company}-${x.from ?? ''}`}
                      className="ar-panel ar-edge px-4 py-5 sm:px-5"
                      style={{ '--card-accent': 'var(--accent)' } as CSSProperties}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="ar-display text-lg text-ink">{x.company}</h3>
                        <span className="ar-num text-xs text-muted">
                          {range ?? t('story.present')}
                        </span>
                      </div>
                      <p className="ar-label mt-1.5 block">{ti(x.role)}</p>
                      <p className="mt-3 leading-relaxed text-muted">{ti(x.summary)}</p>
                      {x.highlights.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {x.highlights.map((h, i) => (
                            <li
                              key={i}
                              className="flex gap-2.5 text-[0.95rem] leading-relaxed text-muted"
                            >
                              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                              {ti(h)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {education.length > 0 && (
            <div>
              <Heading num="03">{t('story.education')}</Heading>
              <ol className="space-y-3">
                {education.map((e) => {
                  const range = period(e.from, e.to, t('story.present'));
                  return (
                    <li key={e.school} className="ar-panel px-4 py-4 sm:px-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <h3 className="ar-display text-lg text-ink">{e.school}</h3>
                        {range && <span className="ar-num text-xs text-muted">{range}</span>}
                      </div>
                      <p className="mt-1 text-muted">{ti(e.degree)}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          <Languages />
        </div>

        <div>
          <Heading num={education.length > 0 ? '04' : '03'}>{t('story.skills')}</Heading>
          <dl className="space-y-6">
            {skills.map((g, i) => (
              <div key={g.label.en} className="ar-in" style={{ '--i': i } as CSSProperties}>
                <dt className="ar-label flex items-center gap-3">
                  {ti(g.label)}
                  <span aria-hidden className="ar-heading-rule" />
                </dt>
                <dd className="mt-2.5 flex flex-wrap gap-1.5">
                  {g.items.map((item) => (
                    <span key={item} className="ar-tag ar-tag--skill">
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
