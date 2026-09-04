import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { ProjectThumb } from '../../components/ProjectThumb';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';

export function ProjectDetail() {
  const { project, close, next, prev } = useProjectDetail();
  const { t, ti } = useI18n();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  // Mở: nhớ nút vừa bấm, đưa focus vào nút đóng, khoá cuộn nền.
  // Đóng: trả focus về đúng chỗ cũ, mở khoá cuộn.
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

  const accent = project.categoryMeta.accent;
  const stars = project.stats?.stars ?? 0;
  const forks = project.stats?.forks ?? 0;

  const facts: { label: string; value: string }[] = [
    { label: t('detail.year'), value: String(project.year) },
  ];
  if (stars > 0) facts.push({ label: t('stats.stars'), value: stars.toLocaleString('en-US') });
  if (forks > 0) facts.push({ label: t('stats.forks'), value: forks.toLocaleString('en-US') });
  if (project.stats?.language) {
    facts.push({ label: t('detail.language'), value: project.stats.language });
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      role="presentation"
      style={{ '--card-accent': accent } as CSSProperties}
    >
      <button
        type="button"
        aria-label={t('detail.close')}
        onClick={close}
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        style={{
          background: 'color-mix(in oklab, var(--bg) 74%, transparent)',
          backdropFilter: 'blur(6px)',
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ar-detail-title"
        className="ar-dialog ar-scroll ar-edge relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto border border-line bg-surface"
        style={{ borderRadius: 'var(--radius)' }}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 backdrop-blur-xl sm:px-7"
          style={{ background: 'color-mix(in oklab, var(--surface) 88%, transparent)' }}
        >
          <span
            className="ar-label"
            style={{ color: accent, textShadow: `0 0 18px ${accent}88` }}
          >
            {ti(project.categoryMeta.label)}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prev}
              aria-label={t('detail.prev')}
              className="ar-pill size-8 justify-center p-0"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={t('detail.next')}
              className="ar-pill size-8 justify-center p-0"
            >
              →
            </button>
            <button ref={closeBtn} type="button" onClick={close} className="ar-pill">
              {t('detail.close')}
            </button>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-7 sm:py-8">
          <h2
            id="ar-detail-title"
            className="ar-display text-3xl leading-tight sm:text-[2.6rem]"
            style={{ textShadow: `0 0 34px ${accent}55` }}
          >
            {project.title}
          </h2>
          <p className="mt-2 text-lg leading-snug text-muted">{ti(project.tagline)}</p>

          <div
            className="mt-6 overflow-hidden border"
            style={{ borderRadius: 'var(--radius)', borderColor: `${accent}55` }}
          >
            <ProjectThumb project={project} eager ratio="16 / 9" />
          </div>

          <p className="mt-6 max-w-[62ch] leading-[1.72] text-ink/90">{ti(project.blurb)}</p>

          <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((f) => (
              <div
                key={f.label}
                className="ar-panel px-3 py-3"
                style={{ '--panel-accent': accent } as CSSProperties}
              >
                <dd className="ar-num text-lg text-ink">{f.value}</dd>
                <dt className="ar-label mt-1 block text-[0.6rem]">{f.label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-7">
            <p className="ar-label">{t('detail.tech')}</p>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <li key={tag} className="ar-tag">
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {project.links.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noreferrer"
                className="ar-btn ar-btn--solid"
                style={{ '--btn-accent': accent } as CSSProperties}
              >
                {t('detail.visit')} ↗
              </a>
            )}
            {project.links.repo && (
              <a href={project.links.repo} target="_blank" rel="noreferrer" className="ar-btn">
                {t('detail.source')} ↗
              </a>
            )}
            {project.links.more && (
              <a href={project.links.more} target="_blank" rel="noreferrer" className="ar-btn">
                {t('detail.readMore')} ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
