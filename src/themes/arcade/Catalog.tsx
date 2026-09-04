import { useCallback } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { ProjectThumb } from '../../components/ProjectThumb';
import { CATEGORIES } from '../../data/categories';
import type { Project } from '../../data/types';
import { useCatalog } from '../../hooks/useCatalog';
import type { SortKey } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';
import { usePrefersReducedMotion } from './useArcadeMotion';

const SORTS: SortKey[] = ['featured', 'stars', 'recent', 'name'];

/** Góc nghiêng tối đa. Quá 8° là card bắt đầu méo và chữ khó đọc. */
const MAX_TILT = 8;

function Card({ project, index, tilt }: { project: Project; index: number; tilt: boolean }) {
  const { ti } = useI18n();
  const { open } = useProjectDetail();
  const accent = project.categoryMeta.accent;
  const stars = project.stats?.stars ?? 0;

  // Ghi thẳng vào style của phần tử thay vì setState: con trỏ di chuyển hàng
  // trăm lần một giây, không có lý do gì để React phải render lại từng lần.
  const onMove = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    el.style.setProperty('--ry', `${((px - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - py) * 2 * MAX_TILT).toFixed(2)}deg`);
    el.dataset.hot = 'true';
  }, []);

  const onLeave = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.dataset.hot = 'false';
  }, []);

  return (
    <article
      data-category={project.category}
      data-tilt={tilt ? 'on' : undefined}
      className="ar-card ar-in ar-edge"
      style={{ '--card-accent': accent, '--i': Math.min(index, 11) } as CSSProperties}
      onMouseMove={tilt ? onMove : undefined}
      onMouseLeave={tilt ? onLeave : undefined}
    >
      <div className="ar-card__shot">
        <ProjectThumb project={project} ratio="16 / 10" />
        <span aria-hidden className="ar-card__veil" />
        <span aria-hidden className="ar-card__scan" />
        <span className="ar-card__badge">{ti(project.categoryMeta.label)}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pt-3.5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0">
            <button type="button" onClick={() => open(project.slug)} className="ar-card__title">
              {project.title}
            </button>
          </h3>
          {stars > 0 && (
            <span className="ar-star shrink-0" aria-label={`${stars} stars`}>
              ★ {stars.toLocaleString('en-US')}
            </span>
          )}
        </div>

        <p className="line-clamp-2 text-[0.88rem] leading-snug text-muted">{ti(project.tagline)}</p>

        <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {project.tags.slice(0, 3).map((tag) => (
            <li key={tag} className="ar-tag">
              {tag}
            </li>
          ))}
          <li className="ar-tag ml-auto border-transparent px-0 opacity-70">{project.year}</li>
        </ul>
      </div>

      <span aria-hidden className="ar-card__glow" />
    </article>
  );
}

export function Catalog() {
  const { projects, query, setQuery, category, setCategory, sort, setSort, counts, reset } =
    useCatalog();
  const { t, ti } = useI18n();
  const tilt = !usePrefersReducedMotion();

  return (
    <section id="work" className="px-[var(--gutter)] pb-20">
      <div className="mb-5 flex items-center gap-4">
        <h2 className="ar-display flex items-baseline gap-3 text-xl sm:text-2xl">
          <span className="ar-num text-xs text-accent">02</span>
          {t('nav.work')}
        </h2>
        <span aria-hidden className="ar-heading-rule" />
        <span className="ar-num text-xs text-muted">
          {projects.length}/{counts.all}
        </span>
      </div>

      <div
        className="sticky top-[3.4rem] z-30 -mx-[var(--gutter)] mb-8 border-y border-line px-[var(--gutter)] py-3.5 backdrop-blur-xl"
        style={{ background: 'color-mix(in oklab, var(--bg) 82%, transparent)' }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <label className="ar-field min-w-[8rem] flex-1">
            <span aria-hidden className="text-accent">
              ⌕
            </span>
            <span className="sr-only">{t('search.label')}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
            />
          </label>

          <label className="ar-field shrink-0">
            <span className="ar-label">{t('sort.label')}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {t(`sort.${s}` as const)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="ar-filters mt-3 -mx-1 px-1">
          <button type="button" onClick={() => setCategory('all')} aria-pressed={category === 'all'} className="ar-pill">
            {t('filter.all')}
            <span className="ar-pill__count">{counts.all}</span>
          </button>

          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className="ar-pill"
              style={{ '--pill-accent': c.accent } as CSSProperties}
            >
              {ti(c.label)}
              <span className="ar-pill__count">{counts[c.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {category !== 'all' && (
        <p className="mb-6 max-w-[64ch] text-[0.95rem] leading-relaxed text-muted">
          {ti(CATEGORIES.find((c) => c.id === category)?.blurb ?? { vi: '', en: '' })}
        </p>
      )}

      {projects.length === 0 ? (
        <div className="ar-panel flex flex-col items-center px-6 py-20 text-center">
          <p className="ar-display text-2xl text-ink">{t('empty.title')}</p>
          <p className="mt-2 text-muted">{t('empty.hint')}</p>
          <button type="button" onClick={reset} className="ar-btn ar-btn--solid mt-7">
            {t('filter.reset')}
          </button>
        </div>
      ) : (
        <div className="ar-grid">
          {projects.map((p, i) => (
            <Card key={p.slug} project={p} index={i} tilt={tilt} />
          ))}
        </div>
      )}

      {projects.length > 0 && (query || category !== 'all') && (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={reset} className="ar-btn">
            {t('filter.reset')}
            <span aria-hidden className="opacity-60">
              ✕
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
