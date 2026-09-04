import { useEffect, useRef } from 'react';
import { ProjectThumb } from '../../components/ProjectThumb';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';

/**
 * Chi tiết dự án — vẫn là bento, chỉ là một lưới nhỏ hơn nằm trong hộp thoại.
 * Esc do useProjectDetail bắt; ở đây lo phần khoá scroll và trả focus.
 */
export function ProjectDetail() {
  const { project, close, next, prev } = useProjectDetail();
  const { t, ti } = useI18n();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!project) return;
    opener.current = document.activeElement;
    closeBtn.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [project]);

  if (!project) return null;

  const stars = project.stats?.stars ?? 0;
  const forks = project.stats?.forks ?? 0;
  const facts = [
    { key: 'year', label: t('detail.year'), value: String(project.year) },
    ...(stars > 0 ? [{ key: 'stars', label: t('stats.stars'), value: String(stars) }] : []),
    ...(forks > 0 ? [{ key: 'forks', label: t('stats.forks'), value: String(forks) }] : []),
    ...(project.stats?.language
      ? [{ key: 'lang', label: t('detail.language'), value: project.stats.language }]
      : []),
  ];

  return (
    <div className="bn-overlay" role="presentation">
      <button type="button" className="bn-backdrop" aria-label={t('detail.close')} tabIndex={-1} onClick={close} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bn-detail-title"
        className="bn-dialog"
        style={{ '--tile-accent': project.categoryMeta.accent } as React.CSSProperties}
      >
        <div className="bn-dialog-hero">
          <ProjectThumb project={project} className="bn-shot" eager />
          <span className="bn-scrim" aria-hidden />

          <div className="absolute top-3.5 left-4 z-2 flex items-center gap-1.5">
            <span className="bn-chip bn-chip-media">
              <span className="bn-dot" aria-hidden style={{ background: project.categoryMeta.accent }} />
              {ti(project.categoryMeta.label)}
            </span>
          </div>

          <div className="absolute top-3.5 right-4 z-2 flex items-center gap-1.5">
            <button type="button" className="bn-nav-btn" aria-label={t('detail.prev')} onClick={prev}>
              ←
            </button>
            <button type="button" className="bn-nav-btn" aria-label={t('detail.next')} onClick={next}>
              →
            </button>
            <button ref={closeBtn} type="button" className="bn-close" onClick={close}>
              {t('detail.close')}
            </button>
          </div>

          <div className="absolute right-4 bottom-4 left-4">
            <h2
              id="bn-detail-title"
              className="bn-serif m-0 text-[clamp(1.8rem,4.6vw,3rem)] leading-none"
              style={{ color: 'var(--bn-on-media)' }}
            >
              {project.title}
            </h2>
            <p className="bn-on-media-soft mt-2 text-sm leading-snug sm:text-base">
              {ti(project.tagline)}
            </p>
          </div>
        </div>

        <div className="bn-dialog-body">
          <div className="bn-mini" data-span="full">
            <p className="text-[0.98rem] leading-relaxed text-ink">{ti(project.blurb)}</p>
          </div>

          <div className="bn-facts" data-span="full">
            {facts.map((f) => (
              <div key={f.key} className="bn-mini">
                <p className="bn-figure text-[2rem]! leading-none">{f.value}</p>
                <p className="bn-label mt-1.5 normal-case tracking-[0.06em]">{f.label}</p>
              </div>
            ))}
          </div>

          <div className="bn-mini" data-span="full">
            <p className="bn-label">{t('detail.tech')}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <li key={tag} className="bn-chip">
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="bn-mini flex flex-wrap gap-2" data-span="full">
            {project.links.demo && (
              <a href={project.links.demo} target="_blank" rel="noreferrer" className="bn-btn bn-btn-solid">
                {t('detail.visit')} ↗
              </a>
            )}
            {project.links.repo && (
              <a href={project.links.repo} target="_blank" rel="noreferrer" className="bn-btn">
                {t('detail.source')} ↗
              </a>
            )}
            {project.links.more && (
              <a href={project.links.more} target="_blank" rel="noreferrer" className="bn-btn">
                {t('detail.readMore')} ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
