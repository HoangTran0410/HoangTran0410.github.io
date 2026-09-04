import { useEffect, useRef } from 'react';
import { ProjectThumb } from '../../components/ProjectThumb';
import type { Project } from '../../data/types';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';

function Meta({ project }: { project: Project }) {
  const { t, ti } = useI18n();
  const s = project.stats;

  const rows: [string, string][] = [
    ['category', ti(project.categoryMeta.label)],
    [t('detail.year'), String(project.year)],
    ['status', project.status],
  ];
  if (project.repo) rows.push(['repo', project.repo]);
  if (s?.stars) rows.push([t('stats.stars'), String(s.stars)]);
  if (s?.forks) rows.push([t('stats.forks'), String(s.forks)]);
  if (s?.language) rows.push([t('detail.language'), s.language]);

  return (
    <dl className="term-kv">
      {rows.map(([k, v]) => (
        <div key={k} className="term-kv-row">
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
      <div className="term-kv-row">
        <dt>{t('detail.tech')}</dt>
        <dd>
          <span className="term-inline-list">
            {project.tags.map((tag) => (
              <span key={tag} className="term-chip">
                {tag}
              </span>
            ))}
          </span>
        </dd>
      </div>
    </dl>
  );
}

function Links({ project }: { project: Project }) {
  const { t } = useI18n();
  return (
    <p className="term-links">
      {project.links.demo && (
        <a className="term-btn term-btn-primary" href={project.links.demo} target="_blank" rel="noreferrer">
          {t('detail.visit')} ↗
        </a>
      )}
      {project.links.repo && (
        <a className="term-btn" href={project.links.repo} target="_blank" rel="noreferrer">
          {t('detail.source')} ↗
        </a>
      )}
      {project.links.more && (
        <a className="term-btn" href={project.links.more} target="_blank" rel="noreferrer">
          {t('detail.readMore')} ↗
        </a>
      )}
    </p>
  );
}

/**
 * Output của `cat <slug>` — in thẳng vào dòng chảy màn hình, không che gì cả.
 * Khác với dialog bên dưới: đây là thứ còn nằm lại trên màn hình sau đó.
 */
export function ProjectCard({ project }: { project: Project }) {
  const { ti } = useI18n();

  return (
    <article data-category={project.category} className="term-card">
      <p className="term-card-head" aria-hidden>
        ── {project.slug}.md {'─'.repeat(Math.max(2, 44 - project.slug.length))}
      </p>
      <h2 className="term-card-title">{project.title}</h2>
      <p className="term-card-tagline">{ti(project.tagline)}</p>
      <p className="term-card-body">{ti(project.blurb)}</p>
      <Meta project={project} />
      <Links project={project} />
    </article>
  );
}

interface DetailProps {
  /**
   * Nơi trả tiêu điểm về khi cửa sổ đóng. Shell truyền ô nhập lệnh vào đây: ở
   * theme này chỗ người dùng cần quay lại là dòng lệnh, không phải cái nút vừa
   * bấm. Bỏ trống thì quay về đúng chỗ vừa bấm như mọi dialog khác.
   */
  restoreFocus?: () => void;
}

/** Cửa sổ chi tiết — `open <slug>`, hoặc bấm vào tên dự án trong `ls`. */
export function ProjectDetail({ restoreFocus }: DetailProps = {}) {
  const { project, close, next, prev } = useProjectDetail();
  const { t, ti } = useI18n();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  // Qua ref để effect dưới chỉ chạy lại khi đổi dự án, không phải mỗi lần render.
  const restore = useRef(restoreFocus);
  restore.current = restoreFocus;

  useEffect(() => {
    if (!project) return;
    opener.current = document.activeElement;
    closeBtn.current?.focus();
    return () => {
      // Không trả tiêu điểm là Tab tiếp theo nhảy về đầu trang.
      if (restore.current) restore.current();
      else (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [project]);

  if (!project) return null;

  return (
    <div className="term-overlay" role="presentation">
      <button type="button" className="term-scrim" aria-label={t('detail.close')} onClick={close} tabIndex={-1} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="term-detail-title"
        className="term-window"
      >
        <div className="term-window-bar">
          <span className="term-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="term-window-title">
            cat {project.slug}
            <span className="term-dim"> · {ti(project.categoryMeta.label)}</span>
          </span>
          <span className="term-window-actions">
            <button type="button" className="term-btn term-btn-icon" onClick={prev} aria-label={t('detail.prev')}>
              ←
            </button>
            <button type="button" className="term-btn term-btn-icon" onClick={next} aria-label={t('detail.next')}>
              →
            </button>
            <button ref={closeBtn} type="button" className="term-btn" onClick={close}>
              {t('detail.close')} [esc]
            </button>
          </span>
        </div>

        <div className="term-window-body">
          <h2 id="term-detail-title" className="term-card-title">
            {project.title}
          </h2>
          <p className="term-card-tagline">{ti(project.tagline)}</p>

          <div className="term-shot">
            <ProjectThumb project={project} eager />
          </div>

          <p className="term-card-body">{ti(project.blurb)}</p>
          <Meta project={project} />
          <Links project={project} />
        </div>
      </div>
    </div>
  );
}
