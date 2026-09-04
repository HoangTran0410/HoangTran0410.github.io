import type { CSSProperties } from 'react';
import { CATEGORIES } from '../../data/categories';
import type { Project } from '../../data/types';
import { useCatalog } from '../../hooks/useCatalog';
import type { CategoryFilter } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';

interface Props {
  /** Nhóm mà lệnh `ls` này đã hỏi; bỏ trống nghĩa là tất cả. */
  category?: CategoryFilter;
  /** Kết quả đã chụp lại lúc chạy lệnh — dùng khi khối này đã cũ. */
  items?: Project[];
}

const rowStyle = (p: Project) => ({ '--row-accent': p.categoryMeta.accent }) as CSSProperties;

function Row({ project, index }: { project: Project; index: number }) {
  const { ti } = useI18n();
  const { open } = useProjectDetail();
  const stars = project.stats?.stars ?? 0;

  return (
    <article data-category={project.category} className="term-row" style={rowStyle(project)}>
      <span className="term-row-index" aria-hidden>
        {String(index + 1).padStart(2, '0')}
      </span>

      <span className="term-row-stars" aria-label={stars > 0 ? `${stars} stars` : undefined}>
        {stars > 0 ? `★${stars}` : '·'}
      </span>

      <span className="term-row-year">{project.year}</span>

      <span className="term-row-cat">{project.category}/</span>

      <span className="term-row-main">
        <button type="button" className="term-row-name" onClick={() => open(project.slug)}>
          {project.title}
        </button>
        <span className="term-row-tagline">{ti(project.tagline)}</span>
      </span>

      <span className="term-row-hint" aria-hidden>
        cat {project.slug}
      </span>
    </article>
  );
}

/**
 * Output của `ls`. Khối mới nhất bám theo bộ lọc chung (gõ vào ô tìm kiếm là
 * nó co lại ngay); khối cũ đứng yên với kết quả lúc chạy, đúng như một
 * terminal thật không sửa lại chữ đã in.
 */
export function Catalog({ category = 'all', items }: Props = {}) {
  const catalog = useCatalog();
  const { t, ti } = useI18n();

  const live = category === catalog.category;
  const list = live ? catalog.projects : (items ?? catalog.all);
  const label = category === 'all' ? 'all' : ti(CATEGORIES.find((c) => c.id === category)!.label);

  return (
    <div className="term-ls">
      <p className="term-ls-head">
        <span className="term-dim">total</span> {list.length}
        <span className="term-dim"> · category </span>
        {label}
        {live && catalog.query && (
          <>
            <span className="term-dim"> · grep </span>“{catalog.query}”
          </>
        )}
      </p>

      {list.length === 0 ? (
        <div className="term-empty">
          <p className="term-error">{t('empty.title')}</p>
          <p className="term-dim">{t('empty.hint')}</p>
          <button type="button" className="term-btn" onClick={catalog.reset}>
            {t('filter.reset')}
          </button>
        </div>
      ) : (
        <ul className="term-rows">
          {list.map((p, i) => (
            <li key={p.slug}>
              <Row project={p} index={i} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
