import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ProjectThumb } from '../../components/ProjectThumb';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';

/**
 * Ngăn kéo trượt từ bên phải (trên điện thoại là trượt từ dưới lên). Esc do
 * useProjectDetail bắt; ở đây lo khoá cuộn và trả focus về chỗ cũ.
 */
export function ProjectDetail() {
  const { project, close, next, prev } = useProjectDetail();
  const { t, ti } = useI18n();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const isOpen = !!project;

  useEffect(() => {
    if (!isOpen) return;
    opener.current = document.activeElement;
    closeBtn.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [isOpen]);

  // Chuyển dự án bằng nút trước/sau thì cuộn ngăn kéo về đầu.
  useEffect(() => {
    panel.current?.scrollTo?.({ top: 0 });
  }, [project?.slug]);

  if (!project) return null;

  const stars = project.stats?.stars ?? 0;
  const forks = project.stats?.forks ?? 0;
  const facts = [
    { key: 'year', label: t('detail.year'), value: String(project.year) },
    ...(stars > 0 ? [{ key: 'stars', label: t('stats.stars'), value: stars.toLocaleString('en-US') }] : []),
    ...(forks > 0 ? [{ key: 'forks', label: t('stats.forks'), value: forks.toLocaleString('en-US') }] : []),
    ...(project.stats?.language
      ? [{ key: 'lang', label: t('detail.language'), value: project.stats.language }]
      : []),
  ];

  return (
    <div className="au-overlay" role="presentation">
      <button type="button" className="au-backdrop" aria-label={t('detail.close')} tabIndex={-1} onClick={close} />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="au-detail-title"
        className="au-drawer"
        style={{ '--accent-c': project.categoryMeta.accent } as React.CSSProperties}
      >
        <div className="au-drawer-bar">
          <span className="au-card-chip au-chip-static">
            <span className="au-dot" aria-hidden />
            {ti(project.categoryMeta.label)}
          </span>
          <div className="au-drawer-nav">
            <button type="button" className="au-icon-btn" aria-label={t('detail.prev')} onClick={prev}>
              <ChevronLeft aria-hidden size={18} />
            </button>
            <button type="button" className="au-icon-btn" aria-label={t('detail.next')} onClick={next}>
              <ChevronRight aria-hidden size={18} />
            </button>
            <button ref={closeBtn} type="button" className="au-icon-btn" aria-label={t('detail.close')} onClick={close}>
              <X aria-hidden size={18} />
            </button>
          </div>
        </div>

        <div className="au-drawer-shot" key={project.slug}>
          <ProjectThumb project={project} className="au-card-shot" eager />
        </div>

        <div className="au-drawer-body">
          <h2 id="au-detail-title" className="au-drawer-title">
            {project.title}
          </h2>
          <p className="au-drawer-tagline">{ti(project.tagline)}</p>

          <div className="au-cta">
            {project.links.demo && (
              <a href={project.links.demo} target="_blank" rel="noreferrer" className="au-btn au-btn-primary">
                {t('detail.visit')}
                <ArrowUpRight aria-hidden size={16} />
              </a>
            )}
            {project.links.repo && (
              <a href={project.links.repo} target="_blank" rel="noreferrer" className="au-btn">
                {t('detail.source')}
                <ArrowUpRight aria-hidden size={16} />
              </a>
            )}
            {project.links.more && (
              <a href={project.links.more} target="_blank" rel="noreferrer" className="au-btn">
                {t('detail.readMore')}
                <ArrowUpRight aria-hidden size={16} />
              </a>
            )}
          </div>

          <p className="au-drawer-blurb">{ti(project.blurb)}</p>

          <dl className="au-facts">
            {facts.map((f) => (
              <div key={f.key} className="au-glass au-fact">
                <dt className="au-dim">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          <p className="au-eyebrow au-mt">{t('detail.tech')}</p>
          <ul className="au-tags au-tags-wrap">
            {project.tags.map((tag) => (
              <li key={tag} className="au-tag">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
