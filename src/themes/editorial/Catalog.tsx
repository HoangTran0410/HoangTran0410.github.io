import { useCallback, useMemo, useRef, useState } from 'react';
import { CATEGORIES } from '../../data/categories';
import type { Category, Project } from '../../data/types';
import { ProjectThumb } from '../../components/ProjectThumb';
import { useCatalog } from '../../hooks/useCatalog';
import type { SortKey } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';

const SORTS: SortKey[] = ['featured', 'stars', 'recent', 'name'];

/** Tấm ảnh bay theo con trỏ khi rê qua một hàng. Chỉ dựng trên máy có chuột. */
function useHoverPlate() {
  const [project, setProject] = useState<Project | null>(null);
  const plate = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = plate.current;
    if (!el) return;
    el.style.left = `${e.clientX + 190}px`;
    el.style.top = `${e.clientY}px`;
  }, []);

  return { project, setProject, plate, onMove };
}

function Row({ project, index }: { project: Project; index: number }) {
  const { ti } = useI18n();
  const { open } = useProjectDetail();
  const stars = project.stats?.stars ?? 0;

  return (
    <article
      data-category={project.category}
      className="ed-row ed-reveal grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1 border-t border-line py-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-x-6 sm:py-5"
      style={
        {
          '--row-accent': project.categoryMeta.accent,
          '--i': Math.min(index, 12),
        } as React.CSSProperties
      }
    >
      <span className="ed-num text-xs text-muted">{String(index + 1).padStart(2, '0')}</span>

      <div className="min-w-0">
        <button
          type="button"
          onClick={() => open(project.slug)}
          className="ed-row-title ed-display block text-left text-xl leading-tight font-medium sm:text-2xl"
        >
          {project.title}
        </button>

        <p className="mt-1 text-[0.95rem] leading-snug text-muted">{ti(project.tagline)}</p>

        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {project.tags.slice(0, 4).map((tag) => (
            <li key={tag} className="ed-num text-[0.68rem] tracking-wide text-muted/80">
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <div className="ed-num flex shrink-0 items-baseline gap-3 text-xs text-muted">
        {stars > 0 && <span aria-label={`${stars} stars`}>★ {stars}</span>}
        <span className="tabular-nums">{project.year}</span>
      </div>
    </article>
  );
}

function Group({ category, projects, offset }: { category: Category; projects: Project[]; offset: number }) {
  const { ti } = useI18n();

  return (
    <section className="mt-14 first:mt-0">
      <header className="sticky top-[3.25rem] z-20 -mx-[var(--gutter)] bg-bg/92 px-[var(--gutter)] py-3 backdrop-blur">
        <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-2">
          <h2 className="ed-display text-lg font-medium sm:text-xl">
            <span className="ed-num mr-3 text-xs text-muted">
              {String(category.order).padStart(2, '0')}
            </span>
            {ti(category.label)}
          </h2>
          <span className="ed-num text-xs text-muted">{projects.length}</span>
        </div>
        <p className="mt-2 max-w-[52ch] text-sm leading-snug text-muted">{ti(category.blurb)}</p>
      </header>

      <div>
        {projects.map((p, i) => (
          <Row key={p.slug} project={p} index={offset + i} />
        ))}
      </div>
    </section>
  );
}

export function Catalog() {
  const { projects, query, setQuery, category, setCategory, sort, setSort, counts, reset } = useCatalog();
  const { t, ti } = useI18n();
  const { project: hovered, setProject, plate, onMove } = useHoverPlate();

  const groups = useMemo(() => {
    const out: { category: Category; projects: Project[]; offset: number }[] = [];
    let offset = 0;
    for (const c of CATEGORIES) {
      const items = projects.filter((p) => p.category === c.id);
      if (items.length === 0) continue;
      out.push({ category: c, projects: items, offset });
      offset += items.length;
    }
    return out;
  }, [projects]);

  return (
    <section id="work" className="px-[var(--gutter)] pb-20">
      {/* Thanh lọc dính trên đầu */}
      <div
        className="sticky top-0 z-30 -mx-[var(--gutter)] mb-10 border-b border-line bg-bg/92 px-[var(--gutter)] py-3 backdrop-blur"
        data-print="hide"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex min-w-[11rem] flex-1 items-center gap-2 border-b border-line focus-within:border-ink">
            <span className="sr-only">{t('search.label')}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full bg-transparent py-1.5 font-meta text-sm outline-none placeholder:text-muted/70"
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="ed-meta">{t('sort.label')}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="cursor-pointer border-b border-line bg-transparent py-1.5 font-meta text-sm outline-none focus:border-ink"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {t(`sort.${s}` as const)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <button
            type="button"
            onClick={() => setCategory('all')}
            aria-pressed={category === 'all'}
            className={`font-meta text-sm transition-colors ${
              category === 'all' ? 'text-ink underline decoration-2 underline-offset-4' : 'text-muted hover:text-ink'
            }`}
          >
            {t('filter.all')} <span className="ed-num text-[0.7rem]">{counts.all}</span>
          </button>

          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={`font-meta text-sm transition-colors ${
                category === c.id ? 'text-ink underline decoration-2 underline-offset-4' : 'text-muted hover:text-ink'
              }`}
              style={category === c.id ? { textDecorationColor: c.accent } : undefined}
            >
              {ti(c.label)} <span className="ed-num text-[0.7rem]">{counts[c.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="py-24 text-center">
          <p className="ed-display text-2xl">{t('empty.title')}</p>
          <p className="mt-2 text-muted">{t('empty.hint')}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 border border-ink px-4 py-2 font-meta text-sm transition-colors hover:bg-ink hover:text-bg"
          >
            {t('filter.reset')}
          </button>
        </div>
      ) : (
        <div onMouseMove={onMove}>
          {groups.map((g) => (
            <div
              key={g.category.id}
              onMouseOver={(e) => {
                const el = (e.target as HTMLElement).closest('article');
                const slug = el?.querySelector('button')?.textContent;
                setProject(g.projects.find((p) => p.title === slug) ?? null);
              }}
              onMouseLeave={() => setProject(null)}
            >
              <Group {...g} />
            </div>
          ))}
        </div>
      )}

      <div ref={plate} className="ed-plate" data-visible={hovered ? 'true' : 'false'} aria-hidden>
        {hovered && <ProjectThumb project={hovered} />}
      </div>
    </section>
  );
}
