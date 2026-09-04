import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';
import { useTimeline } from '../../hooks/useTimeline';

/**
 * Cách đọc thứ hai của cùng bộ dữ liệu: theo năm thay vì theo nhóm. Nhóm cho
 * biết mình làm những mảng gì, còn cái này cho biết mọi thứ đi tới đâu.
 */
export function Timeline() {
  const { t, ti, locale } = useI18n();
  const { open } = useProjectDetail();
  const years = useTimeline();

  if (years.length === 0) return null;

  return (
    <section id="timeline" className="px-[var(--gutter)] pb-20">
      <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-2">
        <h2 className="ed-display text-lg font-medium sm:text-xl">
          {locale === 'vi' ? 'Dòng thời gian' : 'Timeline'}
        </h2>
        <span className="ed-num text-xs text-muted">
          {years[years.length - 1].year}–{years[0].year}
        </span>
      </div>
      <p className="mt-2 max-w-[52ch] text-sm leading-snug text-muted">
        {locale === 'vi'
          ? 'Cùng những dự án đó, đọc theo năm thay vì theo nhóm. Lọc ở dưới cũng ăn vào đây.'
          : 'The same projects read by year instead of by category. The filters below apply here too.'}
      </p>

      <ol className="mt-9">
        {years.map((y, yi) => (
          <li
            key={y.year}
            className="ed-reveal grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-x-8"
            style={{ '--i': Math.min(yi, 10) } as React.CSSProperties}
          >
            <div className="relative">
              <span className="ed-display ed-num sticky top-16 block pt-4 text-2xl leading-none text-muted sm:text-4xl">
                {y.year}
              </span>
            </div>

            <div className="border-l border-line pb-8 pl-5 sm:pl-7">
              {y.jobs.map((job) => (
                <div key={job.company} className="relative pt-4">
                  <span
                    aria-hidden
                    className="absolute top-[1.55rem] -left-[calc(1.25rem+3.5px)] size-[7px] rounded-full bg-ink sm:-left-[calc(1.75rem+3.5px)]"
                  />
                  <p className="ed-meta">{t('story.experience')}</p>
                  <p className="ed-display mt-1 text-xl font-medium">{job.company}</p>
                  <p className="text-muted">{ti(job.role)}</p>
                </div>
              ))}

              {y.schools.map((school) => (
                <div key={school.school} className="relative pt-4">
                  <span
                    aria-hidden
                    className="absolute top-[1.55rem] -left-[calc(1.25rem+3.5px)] size-[7px] rounded-full bg-ink sm:-left-[calc(1.75rem+3.5px)]"
                  />
                  <p className="ed-meta">{t('story.education')}</p>
                  <p className="ed-display mt-1 text-xl font-medium">{school.school}</p>
                  <p className="text-muted">{ti(school.degree)}</p>
                </div>
              ))}

              {y.projects.length > 0 && (
                <ul className="pt-4">
                  {y.projects.map((p) => (
                    <li key={p.slug} className="relative flex flex-wrap items-baseline gap-x-3 py-1.5">
                      <span
                        aria-hidden
                        className="absolute top-[0.85rem] -left-[calc(1.25rem+2.5px)] size-[5px] rounded-full sm:-left-[calc(1.75rem+2.5px)]"
                        style={{ background: p.categoryMeta.accent }}
                      />
                      <button
                        type="button"
                        onClick={() => open(p.slug)}
                        className="ed-row-title ed-display text-left text-base font-medium hover:text-[var(--row-accent)] sm:text-lg"
                        style={{ '--row-accent': p.categoryMeta.accent } as React.CSSProperties}
                      >
                        {p.title}
                      </button>
                      <span className="min-w-0 flex-1 truncate text-sm text-muted">{ti(p.tagline)}</span>
                      {(p.stats?.stars ?? 0) > 0 && (
                        <span className="ed-num shrink-0 text-xs text-muted">★ {p.stats!.stars}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
