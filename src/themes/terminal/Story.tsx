import { PROFILE } from '../../data/profile';
import { useI18n } from '../../hooks/useI18n';

function period(from: string | undefined, to: string | null | undefined, present: string): string | null {
  if (!from) return null;
  return `${from} → ${to ?? present}`;
}

/** Output của `skills` — kinh nghiệm, học vấn, kỹ năng. */
export function Story() {
  const { t, ti } = useI18n();
  const { experience, education, skills } = PROFILE;

  return (
    <section className="term-story">
      {experience.length > 0 && (
        <div className="term-block">
          <h2 className="term-block-head"># {t('story.experience')}</h2>
          <ol className="term-list">
            {experience.map((x) => {
              const range = period(x.from, x.to, t('story.present'));
              return (
                <li key={`${x.company}-${x.from ?? ''}`} className="term-item">
                  <p className="term-item-head">
                    <b>{x.company}</b>
                    <span className="term-dim"> · {ti(x.role)}</span>
                    {range && <span className="term-dim"> · {range}</span>}
                  </p>
                  <p className="term-item-body">{ti(x.summary)}</p>
                  {x.highlights.length > 0 && (
                    <ul className="term-bullets">
                      {x.highlights.map((h, i) => (
                        <li key={i}>
                          <span className="term-dim" aria-hidden>
                            {'>'}{' '}
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
        <div className="term-block">
          <h2 className="term-block-head"># {t('story.education')}</h2>
          <ol className="term-list">
            {education.map((e) => {
              const range = period(e.from, e.to, t('story.present'));
              return (
                <li key={e.school} className="term-item">
                  <p className="term-item-head">
                    <b>{e.school}</b>
                    {range && <span className="term-dim"> · {range}</span>}
                  </p>
                  <p className="term-item-body">{ti(e.degree)}</p>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="term-block">
        <h2 className="term-block-head"># {t('story.skills')}</h2>
        <dl className="term-kv">
          {skills.map((g) => (
            <div key={g.label.en} className="term-kv-row">
              <dt>{ti(g.label)}</dt>
              <dd>
                <span className="term-inline-list">
                  {g.items.map((item) => (
                    <span key={item} className="term-chip">
                      {item}
                    </span>
                  ))}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
