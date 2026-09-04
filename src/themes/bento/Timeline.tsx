import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';
import { useTimeline } from '../../hooks/useTimeline';

/**
 * Cách đọc thứ hai của cùng bộ dữ liệu: theo năm thay vì theo nhóm.
 *
 * Bento là một lưới duy nhất, còn timeline thì dài theo chiều dọc — nhét nguyên
 * một cột cao vào lưới là chắc chắn hở lỗ bên cạnh nó. Nên khối này lấy trọn
 * một hàng (`data-span="full"`, đúng `cols` ô ở mọi breakpoint, không bao giờ
 * lệch nhịp), rồi bên trong tự chia thành các thẻ năm chảy qua nhiều cột bằng
 * CSS multi-column: cao bao nhiêu cũng vẫn là một hàng của lưới ngoài, và
 * trình duyệt tự cân chiều cao các cột nên không có khoảng trắng ngơ ngác.
 *
 * Mốc công việc/học vấn là một thẻ có viền và sọc accent; dự án chỉ là một
 * dòng chữ với chấm màu nhóm — nhìn phát biết ngay dòng nào là mốc, dòng nào
 * là dự án.
 */
export function Timeline() {
  const { ti } = useI18n();
  const { open } = useProjectDetail();
  const years = useTimeline();

  if (years.length === 0) return null;

  const newest = years[0].year;
  const oldest = years[years.length - 1].year;
  const entries = years.reduce((n, y) => n + y.jobs.length + y.schools.length + y.projects.length, 0);

  return (
    <section
      id="timeline"
      className="bn-tile bn-timeline"
      data-cell="timeline"
      data-span="full"
      data-lift="0"
    >
      <div className="bn-timeline-head">
        <div className="min-w-0">
          <h2 className="bn-label">{ti({ vi: 'Theo năm', en: 'By year' })}</h2>
          <p className="bn-timeline-lede">
            {ti({
              vi: 'Cũng bộ dự án đó nhưng đọc theo năm thay vì theo nhóm, xếp chung với mốc công việc. Bộ lọc ở trên ăn vào đây luôn.',
              en: 'The same projects read by year instead of by category, sitting next to the work milestones. The filters above apply here too.',
            })}
          </p>
        </div>
        <p className="bn-num bn-timeline-span">
          {oldest === newest ? oldest : `${oldest}–${newest}`} · {entries}{' '}
          {ti({ vi: 'mốc', en: 'entries' })}
        </p>
      </div>

      <ol className="bn-years">
        {years.map((y, i) => (
          <li
            key={y.year}
            className="bn-year"
            data-year={y.year}
            style={{ '--i': Math.min(i, 12) } as React.CSSProperties}
          >
            <p className="bn-year-num">{y.year}</p>

            {y.jobs.map((job) => (
              <div key={`job-${job.company}`} className="bn-milestone" data-kind="job">
                <p className="bn-label bn-milestone-kind">{ti({ vi: 'Công việc', en: 'Work' })}</p>
                <p className="bn-serif bn-milestone-name">{job.company}</p>
                <p className="bn-milestone-role">{ti(job.role)}</p>
              </div>
            ))}

            {y.schools.map((school) => (
              <div key={`school-${school.school}`} className="bn-milestone" data-kind="school">
                <p className="bn-label bn-milestone-kind">{ti({ vi: 'Học vấn', en: 'School' })}</p>
                <p className="bn-serif bn-milestone-name">{school.school}</p>
                <p className="bn-milestone-role">{ti(school.degree)}</p>
              </div>
            ))}

            {y.projects.length > 0 && (
              <ul className="bn-year-projects">
                {y.projects.map((p) => {
                  const stars = p.stats?.stars ?? 0;
                  return (
                    <li
                      key={p.slug}
                      className="bn-year-proj"
                      data-category={p.category}
                      style={{ '--tile-accent': p.categoryMeta.accent } as React.CSSProperties}
                    >
                      <span className="bn-dot" aria-hidden />
                      <button type="button" className="bn-year-btn" onClick={() => open(p.slug)}>
                        {p.title}
                      </button>
                      {stars > 0 && (
                        <span className="bn-num bn-year-stars" aria-label={`${stars} stars`}>
                          ★ {stars}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
