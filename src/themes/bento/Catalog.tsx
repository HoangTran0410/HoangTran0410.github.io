import { ProjectThumb } from '../../components/ProjectThumb';
import { CATEGORIES } from '../../data/categories';
import type { Project } from '../../data/types';
import { useCatalog } from '../../hooks/useCatalog';
import type { SortKey } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';
import { arrange, useCols } from './layout';

const SORTS: SortKey[] = ['featured', 'stars', 'recent', 'name'];

/** Ô lớn 2×2: ảnh phủ kín, chữ nằm trên lớp phủ tối dần từ dưới lên. */
function LargeTile({ project, index }: { project: Project; index: number }) {
  const { ti } = useI18n();
  const { open } = useProjectDetail();
  const stars = project.stats?.stars ?? 0;

  return (
    <article
      data-category={project.category}
      data-tile="lg"
      data-lift="1"
      className="bn-tile bn-proj"
      style={
        { '--tile-accent': project.categoryMeta.accent, '--i': Math.min(index, 16) } as React.CSSProperties
      }
    >
      <div className="bn-media">
        <ProjectThumb project={project} className="bn-shot" eager={index < 2} />
        <span className="bn-scrim" aria-hidden />
      </div>

      <div className="bn-proj-top">
        <span className="bn-chip bn-chip-media">
          <span className="bn-dot" aria-hidden style={{ background: project.categoryMeta.accent }} />
          {ti(project.categoryMeta.label)}
        </span>
        <span className="bn-chip bn-chip-media bn-num">{project.year}</span>
      </div>

      <div className="bn-proj-body">
        <h3 className="m-0">
          <button type="button" className="bn-title-btn" onClick={() => open(project.slug)}>
            {project.title}
          </button>
        </h3>

        <p className="bn-on-media-soft bn-clamp-2 mt-2 text-[0.92rem] leading-snug">
          {ti(project.tagline)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bn-chip bn-chip-media">
              {tag}
            </span>
          ))}
          {stars > 0 && (
            <span className="bn-chip bn-chip-media bn-num" aria-label={`${stars} stars`}>
              ★ {stars}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/** Ô nhỏ 1×1: không ảnh — chỉ chữ, tag và sao. `wide` nới nó ra 2 cột để khép
    kín hàng cuối, xem layout.ts. */
function SmallTile({ project, index, wide }: { project: Project; index: number; wide: boolean }) {
  const { ti } = useI18n();
  const { open } = useProjectDetail();
  const stars = project.stats?.stars ?? 0;

  return (
    <article
      data-category={project.category}
      data-tile="sm"
      data-wide={wide ? '1' : undefined}
      data-lift="1"
      className="bn-tile bn-proj"
      style={
        { '--tile-accent': project.categoryMeta.accent, '--i': Math.min(index, 16) } as React.CSSProperties
      }
    >
      <p className="bn-label flex items-center gap-1.5">
        <span className="bn-dot" aria-hidden />
        {ti(project.categoryMeta.label)}
      </p>

      <h3 className="mt-2.5 mb-0">
        <button type="button" className="bn-title-btn" onClick={() => open(project.slug)}>
          {project.title}
        </button>
      </h3>

      <p className="bn-clamp-2 mt-1.5 text-[0.85rem] leading-snug text-muted">{ti(project.tagline)}</p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        {project.tags[0] ? <span className="bn-chip">{project.tags[0]}</span> : <span />}
        <span className="bn-num text-muted">
          {stars > 0 && <span aria-label={`${stars} stars`}>★ {stars} · </span>}
          {project.year}
        </span>
      </div>
    </article>
  );
}

/**
 * Catalog trả về nhiều ô rời chứ không bọc trong một <section>, để chúng nằm
 * chung một lưới với ô identity / số liệu / kỹ năng / liên hệ — đó mới là
 * bento thật, thay vì một lưới dự án dán cạnh mấy khối rời.
 */
export function Catalog() {
  const { projects, query, setQuery, category, setCategory, sort, setSort, counts, reset } =
    useCatalog();
  const { t, ti } = useI18n();
  const cols = useCols();
  const dirty = query !== '' || category !== 'all' || sort !== 'featured';
  const cells = arrange(projects, cols, sort === 'featured');

  return (
    <>
      <div id="work" className="bn-tile bn-toolbar" data-cell="toolbar" data-span="full" data-lift="0">
        <div className="flex flex-wrap items-center gap-2">
          <label className="bn-search">
            <span className="sr-only">{t('search.label')}</span>
            <span aria-hidden className="text-muted">
              ⌕
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="sr-only">{t('sort.label')}</span>
            <select
              className="bn-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {t(`sort.${s}` as const)}
                </option>
              ))}
            </select>
          </label>

          {dirty && (
            <button type="button" className="bn-btn" onClick={reset}>
              {t('filter.reset')}
            </button>
          )}
        </div>

        <div
          className="mt-2.5 flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label={t('filter.label')}
        >
          <button
            type="button"
            className="bn-filter"
            aria-pressed={category === 'all'}
            onClick={() => setCategory('all')}
          >
            {t('filter.all')}
            <span className="bn-num opacity-60">{counts.all}</span>
          </button>

          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className="bn-filter"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              style={{ '--tile-accent': c.accent } as React.CSSProperties}
            >
              <span className="bn-dot" aria-hidden />
              {ti(c.label)}
              <span className="bn-num opacity-60">{counts[c.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {cells.length === 0 ? (
        <div className="bn-tile items-center justify-center text-center" data-cell="empty" data-span="full">
          <p className="bn-serif text-2xl text-ink">{t('empty.title')}</p>
          <p className="mt-2 text-sm text-muted">{t('empty.hint')}</p>
          <button type="button" className="bn-btn bn-btn-solid mt-5" onClick={reset}>
            {t('filter.reset')}
          </button>
        </div>
      ) : (
        cells.map((c, i) =>
          c.big ? (
            <LargeTile key={c.project.slug} project={c.project} index={i} />
          ) : (
            <SmallTile key={c.project.slug} project={c.project} index={i} wide={c.wide} />
          ),
        )
      )}
    </>
  );
}
