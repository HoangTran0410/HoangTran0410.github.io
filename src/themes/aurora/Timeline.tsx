import { Briefcase, GraduationCap, Star } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';
import { useTimeline } from '../../hooks/useTimeline';

/**
 * Cùng bộ dự án đọc theo năm, xếp chung với mốc công việc và học vấn. Năm
 * dính bên trái khi cuộn; mốc là thẻ kính, dự án là các viên bấm được.
 */
export function Timeline() {
  const { ti } = useI18n();
  const { open } = useProjectDetail();
  const years = useTimeline();

  if (years.length === 0) return null;

  const newest = years[0].year;
  const oldest = years[years.length - 1].year;

  return (
    <section id="timeline" className="au-section au-wrap" aria-labelledby="au-tl-title">
      <header className="au-section-head" data-reveal>
        <p className="au-eyebrow">
          {ti({ vi: 'Hành trình', en: 'Journey' })} ·{' '}
          <span className="au-mono">{oldest === newest ? oldest : `${oldest}–${newest}`}</span>
        </p>
        <h2 id="au-tl-title" className="au-h2">
          {ti({ vi: 'Từng năm một', en: 'Year by year' })}
        </h2>
        <p className="au-lede">
          {ti({
            vi: 'Cũng những dự án đó nhưng theo năm, cạnh các mốc công việc. Bộ lọc ở trên ăn vào đây luôn.',
            en: 'The same projects by year, next to the work milestones. The filters above apply here too.',
          })}
        </p>
      </header>

      <ol className="au-tl">
        {years.map((y) => (
          <li key={y.year} className="au-tl-year" data-reveal>
            <p className="au-tl-label">
              <span>{y.year}</span>
            </p>

            <div className="au-tl-body">
              {y.jobs.map((job) => (
                <div key={`job-${job.company}`} className="au-milestone au-glass" data-kind="job">
                  <span className="au-milestone-icon" aria-hidden>
                    <Briefcase size={16} />
                  </span>
                  <div>
                    <p className="au-milestone-name">{job.company}</p>
                    <p className="au-dim">{ti(job.role)}</p>
                  </div>
                </div>
              ))}

              {y.schools.map((school) => (
                <div key={`school-${school.school}`} className="au-milestone au-glass" data-kind="school">
                  <span className="au-milestone-icon" aria-hidden>
                    <GraduationCap size={16} />
                  </span>
                  <div>
                    <p className="au-milestone-name">{school.school}</p>
                    <p className="au-dim">{ti(school.degree)}</p>
                  </div>
                </div>
              ))}

              {y.projects.length > 0 && (
                <ul className="au-tl-projects">
                  {y.projects.map((p) => {
                    const stars = p.stats?.stars ?? 0;
                    return (
                      <li key={p.slug}>
                        <button
                          type="button"
                          className="au-pill"
                          onClick={() => open(p.slug)}
                          style={{ '--accent-c': p.categoryMeta.accent } as React.CSSProperties}
                        >
                          <span className="au-dot" aria-hidden />
                          {p.title}
                          {stars > 0 && (
                            <span className="au-pill-stars" aria-label={`${stars} stars`}>
                              <Star aria-hidden size={11} />
                              {stars}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
