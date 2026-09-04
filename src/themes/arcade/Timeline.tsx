import type { CSSProperties } from 'react';
import type { Project } from '../../data/types';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';
import { useTimeline } from '../../hooks/useTimeline';
import { usePrefersReducedMotion } from './useArcadeMotion';

/** 'YYYY-MM' → 'YYYY/MM'. Chưa công bố mốc thì không bịa ra một cái. */
function range(
  from: string | undefined,
  to: string | null | undefined,
  present: string,
): string | null {
  if (!from) return null;
  const fmt = (v: string) => v.replace('-', '/');
  return `${fmt(from)} → ${to ? fmt(to) : present}`;
}

/**
 * Cột mốc nghề nghiệp: cắm thẳng lên trục bằng một viên kim cương sáng, và là
 * thứ duy nhất trong khối này có khung panel. Dự án chỉ là dòng nhỏ bên trong —
 * liếc qua là biết ngay cái nào là mốc, cái nào là việc đã làm trong năm.
 */
function Milestone({
  kind,
  name,
  detail,
  when,
}: {
  kind: string;
  name: string;
  detail: string;
  when: string | null;
}) {
  return (
    <li className="ar-tl__milestone">
      <span aria-hidden className="ar-tl__node ar-tl__node--big" />
      <div className="ar-panel ar-edge px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="ar-label ar-tl__kind">{kind}</span>
          {when && <span className="ar-num text-[0.7rem] text-muted">{when}</span>}
        </div>
        <p className="ar-tl__company ar-display mt-1.5 text-lg sm:text-xl">{name}</p>
        <p className="mt-0.5 text-[0.95rem] leading-snug text-muted">{detail}</p>
      </div>
    </li>
  );
}

/** Một dự án trong năm. Chấm mượn màu nhóm, nên mỗi năm có bảng màu riêng. */
function Slot({ project }: { project: Project }) {
  const { ti } = useI18n();
  const { open } = useProjectDetail();
  const stars = project.stats?.stars ?? 0;

  return (
    <li
      className="ar-tl__slot"
      style={{ '--slot-accent': project.categoryMeta.accent } as CSSProperties}
    >
      <span aria-hidden className="ar-tl__dot" />
      <button type="button" onClick={() => open(project.slug)} className="ar-tl__title">
        {project.title}
      </button>
      <span className="ar-tl__tagline">{ti(project.tagline)}</span>
      {stars > 0 && (
        <span className="ar-star ar-tl__stars" aria-label={`${stars} stars`}>
          ★ {stars.toLocaleString('en-US')}
        </span>
      )}
    </li>
  );
}

/**
 * Cách đọc thứ hai của cùng bộ dữ liệu: theo năm thay vì theo nhóm. Nhóm cho
 * biết mình làm những mảng gì, còn cái này cho biết mọi thứ đi tới đâu — nên
 * nó ăn theo đúng bộ lọc của Catalog bên dưới chứ không sống một mình.
 */
export function Timeline() {
  const { t, ti } = useI18n();
  const years = useTimeline();
  const still = usePrefersReducedMotion();

  if (years.length === 0) return null;

  return (
    <section id="timeline" className="px-[var(--gutter)] pb-20">
      <div className="mb-4 flex items-center gap-4">
        <h2 className="ar-display flex items-baseline gap-3 text-xl sm:text-2xl">
          <span className="ar-num text-xs text-accent">01</span>
          {ti({ vi: 'Dòng thời gian', en: 'Timeline' })}
        </h2>
        <span aria-hidden className="ar-heading-rule" />
        <span className="ar-num shrink-0 text-xs text-muted">
          {years[years.length - 1].year}–{years[0].year}
        </span>
      </div>

      <p className="mb-8 max-w-[62ch] text-[0.95rem] leading-relaxed text-muted">
        {ti({
          vi: 'Cùng bộ dự án đó, đọc theo năm thay vì theo nhóm. Bộ lọc bên dưới ăn thẳng vào đây.',
          en: 'The same projects read by year instead of by category. The filters below apply here too.',
        })}
      </p>

      <div className="ar-tl">
        <span aria-hidden className="ar-tl__rail" />
        {!still && <span aria-hidden className="ar-tl__pulse" />}

        <ol className="ar-tl__list">
          {years.map((y, i) => (
            <li
              key={y.year}
              data-year={y.year}
              className="ar-tl__year ar-in"
              style={{ '--i': Math.min(i, 10) } as CSSProperties}
            >
              <div className="ar-tl__head">
                <span aria-hidden className="ar-tl__node" />
                <span className="ar-panel ar-tl__stamp ar-display ar-num">{y.year}</span>
                <span className="ar-tl__count">
                  {y.projects.length + y.jobs.length + y.schools.length}
                </span>
                <span aria-hidden className="ar-heading-rule" />
              </div>

              {(y.jobs.length > 0 || y.schools.length > 0) && (
                <ul className="ar-tl__milestones">
                  {y.jobs.map((job) => (
                    <Milestone
                      key={job.company}
                      kind={t('story.experience')}
                      name={job.company}
                      detail={ti(job.role)}
                      when={range(job.from, job.to, t('story.present'))}
                    />
                  ))}
                  {y.schools.map((school) => (
                    <Milestone
                      key={school.school}
                      kind={t('story.education')}
                      name={school.school}
                      detail={ti(school.degree)}
                      when={range(school.from, school.to, t('story.present'))}
                    />
                  ))}
                </ul>
              )}

              {y.projects.length > 0 && (
                <ul className="ar-tl__slots">
                  {y.projects.map((p) => (
                    <Slot key={p.slug} project={p} />
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
