import { PROFILE } from '../../data/profile';
import { useI18n } from '../../hooks/useI18n';

function period(from: string | undefined, to: string | null | undefined, present: string): string | null {
  if (!from) return null;
  const fmt = (v: string) => v.replace('-', '/');
  return `${fmt(from)} — ${to ? fmt(to) : present}`;
}

export function Story() {
  const { t, ti } = useI18n();
  const { experience, education, skills } = PROFILE;

  return (
    <section id="about" className="px-[var(--gutter)] pb-20">
      <div className="grid gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-14">
          {experience.length > 0 && (
            <div>
              <h2 className="ed-meta border-b border-ink pb-2">{t('story.experience')}</h2>
              <ol className="mt-6 space-y-9">
                {experience.map((x) => {
                  const range = period(x.from, x.to, t('story.present'));
                  return (
                    <li key={`${x.company}-${x.from ?? ''}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <h3 className="ed-display text-xl font-medium">{x.company}</h3>
                        {range && <span className="ed-num text-xs text-muted">{range}</span>}
                      </div>
                      <p className="ed-meta mt-1 tracking-[0.1em] normal-case">{ti(x.role)}</p>
                      <p className="mt-2.5 leading-relaxed text-ink/90">{ti(x.summary)}</p>
                      {x.highlights.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {x.highlights.map((h, i) => (
                            <li key={i} className="flex gap-3 text-[0.97rem] leading-relaxed text-muted">
                              <span aria-hidden className="ed-num shrink-0 text-xs">
                                —
                              </span>
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
              <h2 className="ed-meta border-b border-ink pb-2">{t('story.education')}</h2>
              <ol className="mt-6 space-y-6">
                {education.map((e) => {
                  const range = period(e.from, e.to, t('story.present'));
                  return (
                    <li key={e.school}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <h3 className="ed-display text-lg font-medium">{e.school}</h3>
                        {range && <span className="ed-num text-xs text-muted">{range}</span>}
                      </div>
                      <p className="mt-1 text-muted">{ti(e.degree)}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        <div>
          <h2 className="ed-meta border-b border-ink pb-2">{t('story.skills')}</h2>
          <dl className="mt-6 space-y-7">
            {skills.map((g) => (
              <div key={g.label.en} className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
                <dt className="ed-meta pt-1">{ti(g.label)}</dt>
                <dd className="flex flex-wrap gap-x-2 gap-y-1.5">
                  {g.items.map((item) => (
                    <span
                      key={item}
                      className="border border-line px-2.5 py-1 font-meta text-[0.8rem] text-ink/85"
                    >
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
