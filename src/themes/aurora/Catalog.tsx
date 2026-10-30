import {
  Archive,
  ArrowUpRight,
  Gamepad2,
  Puzzle,
  Radar,
  Rocket,
  Search,
  Sparkles,
  Star,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ProjectThumb } from '../../components/ProjectThumb';
import { CATEGORIES } from '../../data/categories';
import type { CategoryId, Project } from '../../data/types';
import { useCatalog } from '../../hooks/useCatalog';
import type { SortKey } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';

const SORTS: SortKey[] = ['featured', 'stars', 'recent', 'name'];

const ICONS: Record<CategoryId, LucideIcon> = {
  products: Rocket,
  games: Gamepad2,
  extensions: Puzzle,
  devtools: Wrench,
  osint: Radar,
  creative: Sparkles,
  archive: Archive,
};

function Card({ project, index }: { project: Project; index: number }) {
  const { ti } = useI18n();
  const { open } = useProjectDetail();
  const stars = project.stats?.stars ?? 0;
  const Icon = ICONS[project.category];

  return (
    <article
      className="au-card au-spot"
      data-category={project.category}
      data-featured={project.featured ? '1' : undefined}
      style={
        {
          '--accent-c': project.categoryMeta.accent,
          '--i': Math.min(index, 14),
        } as React.CSSProperties
      }
    >
      <div className="au-card-media">
        <ProjectThumb project={project} className="au-card-shot" eager={index < 3} />
        <span className="au-card-chip">
          <Icon aria-hidden size={12} />
          {ti(project.categoryMeta.label)}
        </span>
        {stars > 0 && (
          <span className="au-card-stars" aria-label={`${stars} stars`}>
            <Star aria-hidden size={12} />
            {stars.toLocaleString('en-US')}
          </span>
        )}
      </div>

      <div className="au-card-body">
        <h3 className="au-card-title">
          <button type="button" className="au-stretch" onClick={() => open(project.slug)}>
            {project.title}
          </button>
          <ArrowUpRight aria-hidden size={16} className="au-card-arrow" />
        </h3>
        <p className="au-card-tagline">{ti(project.tagline)}</p>
        <div className="au-card-foot">
          <ul className="au-tags">
            {project.tags.slice(0, 3).map((tag) => (
              <li key={tag} className="au-tag">
                {tag}
              </li>
            ))}
          </ul>
          <span className="au-mono au-dim">{project.year}</span>
        </div>
      </div>
    </article>
  );
}

/**
 * Thanh lọc dính dưới thanh điều hướng, rồi lưới thẻ có ảnh. Phím `/` hoặc
 * ⌘K / Ctrl+K nhảy vào ô tìm kiếm từ bất kỳ đâu trên trang.
 */
export function Catalog() {
  const { projects, query, setQuery, category, setCategory, sort, setSort, counts, reset } =
    useCatalog();
  const { t, ti } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const dirty = query !== '' || category !== 'all' || sort !== 'featured';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable]');
      const combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (combo || (e.key === '/' && !typing)) {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section id="work" className="au-section au-wrap" aria-labelledby="au-work-title">
      <header className="au-section-head" data-reveal>
        <p className="au-eyebrow">
          {t('nav.work')} · <span className="au-mono">{counts.all}</span>
        </p>
        <h2 id="au-work-title" className="au-h2">
          {ti({ vi: 'Những thứ mình đã làm ra', en: 'Things I have shipped' })}
        </h2>
        <p className="au-lede">
          {ti({
            vi: 'Từ sản phẩm có doanh thu tới game chơi ngay trên trình duyệt. Bấm vào thẻ bất kỳ để xem chi tiết.',
            en: 'From products that pay for themselves to games you can play right in the browser. Open any card for the details.',
          })}
        </p>
      </header>

      <div className="au-toolbar au-glass">
        <div className="au-toolbar-row">
          <label className="au-search">
            <span className="sr-only">{t('search.label')}</span>
            <Search aria-hidden size={16} />
            <input
              ref={input}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
            />
            <kbd className="au-kbd" aria-hidden>
              /
            </kbd>
          </label>

          <label>
            <span className="sr-only">{t('sort.label')}</span>
            <select className="au-select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {t(`sort.${s}` as const)}
                </option>
              ))}
            </select>
          </label>

          {dirty && (
            <button type="button" className="au-btn au-btn-sm" onClick={reset}>
              {t('filter.reset')}
            </button>
          )}
        </div>

        <div className="au-filters" role="group" aria-label={t('filter.label')}>
          <button
            type="button"
            className="au-filter"
            aria-pressed={category === 'all'}
            onClick={() => setCategory('all')}
          >
            {t('filter.all')}
            <span className="au-count">{counts.all}</span>
          </button>
          {CATEGORIES.map((c) => {
            const Icon = ICONS[c.id];
            return (
              <button
                key={c.id}
                type="button"
                className="au-filter"
                aria-pressed={category === c.id}
                onClick={() => setCategory(c.id)}
                style={{ '--accent-c': c.accent } as React.CSSProperties}
              >
                <Icon aria-hidden size={14} />
                {ti(c.label)}
                <span className="au-count">{counts[c.id]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="au-empty au-glass">
          <p className="au-h3">{t('empty.title')}</p>
          <p className="au-dim">{t('empty.hint')}</p>
          <button type="button" className="au-btn au-btn-primary" onClick={reset}>
            {t('filter.reset')}
          </button>
        </div>
      ) : (
        <div className="au-grid" key={`${category}-${sort}`}>
          {projects.map((p, i) => (
            <Card key={p.slug} project={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
