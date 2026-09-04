import { useEffect, useRef } from 'react';
import { ProjectThumb } from '../../components/ProjectThumb';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';

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

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="presentation">
      <button
        type="button"
        aria-label={t('detail.close')}
        onClick={close}
        className="absolute inset-0 cursor-default bg-ink/25 backdrop-blur-[2px]"
        tabIndex={-1}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ed-detail-title"
        className="ed-dialog relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto border border-line bg-surface"
        style={{ boxShadow: '0 30px 90px rgb(20 18 16 / 0.28)' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-surface/95 px-5 py-3 backdrop-blur sm:px-8">
          <span className="ed-meta" style={{ color: project.categoryMeta.accent }}>
            {ti(project.categoryMeta.label)}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prev}
              aria-label={t('detail.prev')}
              className="px-2.5 py-1.5 font-meta text-sm text-muted transition-colors hover:text-ink"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={t('detail.next')}
              className="px-2.5 py-1.5 font-meta text-sm text-muted transition-colors hover:text-ink"
            >
              →
            </button>
            <button
              ref={closeBtn}
              type="button"
              onClick={close}
              className="ml-1 border border-line px-3 py-1.5 font-meta text-xs tracking-wide uppercase transition-colors hover:bg-surface-2"
            >
              {t('detail.close')}
            </button>
          </div>
        </div>

        <div className="px-5 py-7 sm:px-8 sm:py-9">
          <h2 id="ed-detail-title" className="ed-display text-3xl leading-tight font-semibold sm:text-5xl">
            {project.title}
          </h2>
          <p className="ed-display mt-2.5 text-lg leading-snug text-muted sm:text-xl">
            {ti(project.tagline)}
          </p>

          <div className="mt-6 border border-line p-1.5">
            <ProjectThumb project={project} eager />
          </div>

          <p className="mt-6 max-w-[58ch] text-[1.05rem] leading-[1.7]">{ti(project.blurb)}</p>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-5 sm:grid-cols-4">
            <div>
              <dt className="ed-meta">{t('detail.year')}</dt>
              <dd className="ed-num mt-1 text-lg">{project.year}</dd>
            </div>
            {stars > 0 && (
              <div>
                <dt className="ed-meta">{t('stats.stars')}</dt>
                <dd className="ed-num mt-1 text-lg">{stars}</dd>
              </div>
            )}
            {forks > 0 && (
              <div>
                <dt className="ed-meta">{t('stats.forks')}</dt>
                <dd className="ed-num mt-1 text-lg">{forks}</dd>
              </div>
            )}
            {project.stats?.language && (
              <div>
                <dt className="ed-meta">{t('detail.language')}</dt>
                <dd className="ed-num mt-1 text-lg">{project.stats.language}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6">
            <p className="ed-meta">{t('detail.tech')}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="ed-num border border-line px-2.5 py-1 text-[0.72rem] text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {project.links.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noreferrer"
                className="border border-ink bg-ink px-5 py-2.5 font-meta text-sm text-bg transition-opacity hover:opacity-85"
              >
                {t('detail.visit')} ↗
              </a>
            )}
            {project.links.repo && (
              <a
                href={project.links.repo}
                target="_blank"
                rel="noreferrer"
                className="border border-line px-5 py-2.5 font-meta text-sm transition-colors hover:bg-surface-2"
              >
                {t('detail.source')} ↗
              </a>
            )}
            {project.links.more && (
              <a
                href={project.links.more}
                target="_blank"
                rel="noreferrer"
                className="border border-line px-5 py-2.5 font-meta text-sm transition-colors hover:bg-surface-2"
              >
                {t('detail.readMore')} ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
