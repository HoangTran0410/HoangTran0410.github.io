import type { CSSProperties } from 'react';
import type { EducationItem, ExperienceItem } from '../../data/profile';
import type { Project } from '../../data/types';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';
import { useTimeline } from '../../hooks/useTimeline';

interface Props {
  /**
   * Chỉ khối timeline mới nhất mang `id="timeline"`. Gõ lại lệnh thì id đi
   * theo khối mới, nên `#timeline` luôn trỏ đúng một chỗ trên màn hình.
   */
  anchor?: boolean;
}

/** Một dòng trên nhánh: mốc nghề nghiệp, mốc học, hoặc một dự án. */
type Node =
  | { kind: 'job'; key: string; job: ExperienceItem }
  | { kind: 'school'; key: string; school: EducationItem }
  | { kind: 'project'; key: string; project: Project };

/** Mốc đời người là hình thoi, dự án là vòng tròn — nhìn là phân biệt được. */
const MARK: Record<Node['kind'], string> = { job: '◆', school: '◈', project: '○' };

function period(from: string | undefined, to: string | null | undefined, present: string): string | null {
  if (!from) return null;
  return `${from} → ${to ?? present}`;
}

function nodesOf(year: { jobs: ExperienceItem[]; schools: EducationItem[]; projects: Project[] }): Node[] {
  return [
    ...year.jobs.map((job): Node => ({ kind: 'job', key: `job:${job.company}`, job })),
    ...year.schools.map((school): Node => ({ kind: 'school', key: `edu:${school.school}`, school })),
    ...year.projects.map((project): Node => ({ kind: 'project', key: `p:${project.slug}`, project })),
  ];
}

/**
 * Output của `timeline` — cách đọc thứ hai của cùng bộ dữ liệu: theo năm thay
 * vì theo nhóm. Vẽ như `git log --graph`: cột năm bên trái, nhánh bằng ký tự
 * khung, mỗi dòng là một commit của sự nghiệp.
 *
 * Khối này luôn sống theo bộ lọc chung (khác `ls`, vốn đóng băng kết quả lúc
 * chạy): timeline chỉ có nghĩa khi nó trả lời "cái đang lọc đi qua các năm thế
 * nào", chứ không phải một tấm ảnh cũ.
 */
export function Timeline({ anchor = true }: Props = {}) {
  const { t, ti } = useI18n();
  const { query, category } = useCatalog();
  const { open } = useProjectDetail();
  const years = useTimeline();

  const id = anchor ? 'timeline' : undefined;

  if (years.length === 0) {
    return (
      <section id={id} className="term-timeline">
        <p className="term-error">
          {ti({
            vi: 'timeline: không còn mốc nào lọt qua bộ lọc hiện tại.',
            en: 'timeline: nothing left after the current filter.',
          })}
        </p>
      </section>
    );
  }

  const newest = years[0].year;
  const oldest = years[years.length - 1].year;
  const projects = years.reduce((n, y) => n + y.projects.length, 0);
  const marks = years.reduce((n, y) => n + y.jobs.length + y.schools.length, 0);

  return (
    <section id={id} className="term-timeline">
      <p className="term-ls-head">
        <span className="term-dim">git log --graph</span>
        <span className="term-dim"> · </span>
        {oldest}–{newest}
        <span className="term-dim"> · </span>
        {projects} {ti({ vi: 'dự án', en: `project${projects === 1 ? '' : 's'}` })}
        <span className="term-dim"> · </span>
        {marks} {ti({ vi: 'mốc', en: `milestone${marks === 1 ? '' : 's'}` })}
        {category !== 'all' && (
          <>
            <span className="term-dim"> · category </span>
            {category}
          </>
        )}
        {query && (
          <>
            <span className="term-dim"> · grep </span>“{query}”
          </>
        )}
      </p>

      <p className="term-dim term-tl-lede">
        {ti({
          vi: 'Cùng những dự án đó, xếp theo năm thay vì theo nhóm — bộ lọc phía trên ăn vào đây.',
          en: 'The same projects read by year instead of by category — the filters above apply here too.',
        })}
      </p>

      <ol className="term-tl">
        {years.map((y, yi) => {
          const nodes = nodesOf(y);
          const own = y.jobs.length + y.schools.length;
          const summary = [
            own > 0 ? ti({ vi: `${own} mốc`, en: `${own} milestone${own > 1 ? 's' : ''}` }) : null,
            y.projects.length > 0
              ? ti({
                  vi: `${y.projects.length} dự án`,
                  en: `${y.projects.length} project${y.projects.length > 1 ? 's' : ''}`,
                })
              : null,
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <li
              key={y.year}
              className="term-tl-year"
              data-year={y.year}
              style={{ '--i': Math.min(yi, 12) } as CSSProperties}
            >
              <b className="term-tl-num">{y.year}</b>
              <span className="term-tl-cap">
                <span className="term-tl-rail" aria-hidden>
                  │
                </span>
                <span className="term-dim term-tl-sum">{summary}</span>
              </span>

              <ul className="term-tl-nodes">
                {nodes.map((node, i) => {
                  const rail = i === nodes.length - 1 ? '└─' : '├─';

                  if (node.kind === 'project') {
                    const p = node.project;
                    const stars = p.stats?.stars ?? 0;
                    return (
                      <li
                        key={node.key}
                        className="term-tl-node"
                        data-kind="project"
                        data-category={p.category}
                        style={{ '--row-accent': p.categoryMeta.accent } as CSSProperties}
                      >
                        <span className="term-tl-rail" aria-hidden>
                          {rail}
                        </span>
                        <span className="term-tl-mark" aria-hidden>
                          {MARK.project}
                        </span>
                        <span className="term-tl-main">
                          <button type="button" className="term-tl-name" onClick={() => open(p.slug)}>
                            {p.title}
                          </button>
                          <span className="term-tl-note">{ti(p.tagline)}</span>
                        </span>
                        {/* Không sao thì ô này rỗng hẳn và CSS gỡ nó đi — trên
                            màn hình hẹp mỗi dự án đỡ mất một dòng cho dấu chấm. */}
                        <span className="term-tl-meta">
                          {stars > 0 && (
                            <span className="term-tl-stars" aria-label={`${stars} stars`}>
                              ★{stars}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  }

                  const isJob = node.kind === 'job';
                  const name = isJob ? node.job.company : node.school.school;
                  const note = isJob ? ti(node.job.role) : ti(node.school.degree);
                  const range = isJob
                    ? period(node.job.from, node.job.to, t('story.present'))
                    : period(node.school.from, node.school.to, t('story.present'));

                  return (
                    <li key={node.key} className="term-tl-node" data-kind={node.kind}>
                      <span className="term-tl-rail" aria-hidden>
                        {rail}
                      </span>
                      <span className="term-tl-mark" aria-hidden>
                        {MARK[node.kind]}
                      </span>
                      <span className="term-tl-main">
                        <b className="term-tl-name">
                          <span className="sr-only">
                            {isJob ? t('story.experience') : t('story.education')}:{' '}
                          </span>
                          {name}
                        </b>
                        <span className="term-tl-note">{note}</span>
                      </span>
                      <span className="term-tl-meta">{range}</span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
