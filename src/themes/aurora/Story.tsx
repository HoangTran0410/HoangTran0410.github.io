import { PROFILE } from '../../data/profile';
import { useI18n } from '../../hooks/useI18n';

function period(from: string | undefined, to: string | null | undefined, present: string): string | null {
  if (!from) return null;
  const fmt = (v: string) => v.replace('-', '/');
  return `${fmt(from)} — ${to ? fmt(to) : present}`;
}

/**
 * Kinh nghiệm bên trái, kỹ năng bên phải. Mảng nào rỗng thì phần đó biến mất
 * hẳn, không để lại tiêu đề trống.
 */
export function Story() {
  const { t, ti } = useI18n();
  const { experience, education, skills } = PROFILE;
  const hasJourney = experience.length > 0 || education.length > 0;

  return (
    <section id="about" className="au-section au-wrap" aria-labelledby="au-about-title">
      <header className="au-section-head" data-reveal>
        <p className="au-eyebrow">{t('nav.about')}</p>
        <h2 id="au-about-title" className="au-h2">
          {ti({ vi: 'Làm ở đâu, dùng gì', en: 'Where I work, what I use' })}
        </h2>
      </header>

      <div className="au-story">
        {hasJourney && (
          <div className="au-story-col">
            {experience.length > 0 && (
              <>
                <h3 className="au-eyebrow">{t('story.experience')}</h3>
                <ol className="au-xp">
                  {experience.map((x) => {
                    const range = period(x.from, x.to, t('story.present'));
                    return (
                      <li key={`${x.company}-${x.from ?? ''}`} className="au-xp-item au-glass au-spot" data-reveal>
                        <div className="au-xp-head">
                          <h4 className="au-h3">{x.company}</h4>
                          {range && <span className="au-mono au-dim">{range}</span>}
                        </div>
                        <p className="au-xp-role">{ti(x.role)}</p>
                        <p className="au-xp-summary">{ti(x.summary)}</p>
                        {x.highlights.length > 0 && (
                          <ul className="au-xp-list">
                            {x.highlights.map((h, i) => (
                              <li key={i}>{ti(h)}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </>
            )}

            {education.length > 0 && (
              <>
                <h3 className="au-eyebrow au-mt">{t('story.education')}</h3>
                <ol className="au-edu">
                  {education.map((e) => {
                    const range = period(e.from, e.to, t('story.present'));
                    return (
                      <li key={e.school} className="au-glass au-edu-item" data-reveal>
                        <div className="au-xp-head">
                          <h4 className="au-edu-name">{e.school}</h4>
                          {range && <span className="au-mono au-dim">{range}</span>}
                        </div>
                        <p className="au-dim">{ti(e.degree)}</p>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
          </div>
        )}

        {skills.length > 0 && (
          <div className="au-story-col">
            <h3 className="au-eyebrow">{t('story.skills')}</h3>
            <dl className="au-skills">
              {skills.map((g) => (
                <div key={g.label.en} className="au-skill au-glass au-spot" data-reveal>
                  <dt>{ti(g.label)}</dt>
                  <dd>
                    {g.items.map((item) => (
                      <span key={item} className="au-tag">
                        {item}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
