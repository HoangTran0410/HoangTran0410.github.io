import { PROFILE } from '../../data/profile';
import { useI18n } from '../../hooks/useI18n';

function period(from: string | undefined, to: string | null | undefined, present: string): string | null {
  if (!from) return null;
  const fmt = (v: string) => v.replace('-', '/');
  return `${fmt(from)} — ${to ? fmt(to) : present}`;
}

/**
 * Hai ô: kỹ năng và chặng đường. Mảng rỗng thì ô/khối đó biến mất hẳn — không
 * để lại tiêu đề trống. Cả hai đều 2×2, nên cùng ô liên hệ và ô "nơi khác"
 * chúng khép lại đúng hai hàng cuối, lưới không hở.
 */
export function Story() {
  const { t, ti } = useI18n();
  const { experience, education, skills } = PROFILE;
  const hasJourney = experience.length > 0 || education.length > 0;

  return (
    <>
      <section className="bn-tile" data-cell="skills" data-span="2x2" data-lift="1">
        <h2 className="bn-label">{t('story.skills')}</h2>

        <dl className="mt-3.5 space-y-3">
          {skills.map((g) => (
            <div key={g.label.en}>
              <dt className="text-[0.78rem] text-muted">{ti(g.label)}</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {g.items.map((item) => (
                  <span key={item} className="bn-chip">
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {hasJourney && (
        <section className="bn-tile" data-cell="journey" data-span="2x2" data-lift="1">
          {experience.length > 0 && (
            <div>
              <h2 className="bn-label">{t('story.experience')}</h2>
              <ol className="mt-4 space-y-6">
                {experience.map((x) => {
                  const range = period(x.from, x.to, t('story.present'));
                  return (
                    <li key={`${x.company}-${x.from ?? ''}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h3 className="bn-serif m-0 text-2xl">{x.company}</h3>
                        {range && <span className="bn-num text-muted">{range}</span>}
                      </div>
                      <p className="mt-1 text-[0.88rem] text-muted">{ti(x.role)}</p>
                      <p className="mt-3 text-[1rem] leading-relaxed text-ink">{ti(x.summary)}</p>
                      {x.highlights.length > 0 && (
                        <ul className="mt-3 space-y-2">
                          {x.highlights.map((h, i) => (
                            <li key={i} className="flex gap-2 text-[0.92rem] leading-relaxed text-muted">
                              <span aria-hidden className="text-muted/60">
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
            <div className={experience.length > 0 ? 'mt-6' : undefined}>
              <h2 className="bn-label">{t('story.education')}</h2>
              <ol className="mt-3.5 space-y-3">
                {education.map((e) => {
                  const range = period(e.from, e.to, t('story.present'));
                  return (
                    <li key={e.school}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h3 className="bn-serif m-0 text-lg">{e.school}</h3>
                        {range && <span className="bn-num text-muted">{range}</span>}
                      </div>
                      <p className="mt-0.5 text-[0.85rem] text-muted">{ti(e.degree)}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </section>
      )}
    </>
  );
}
