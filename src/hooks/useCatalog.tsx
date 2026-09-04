import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CATEGORIES } from '../data/categories';
import type { CategoryId, Project } from '../data/types';
import { getProjects } from '../lib/merge';
import { normalize } from '../lib/normalize';
import { readParam, writeParam } from './useUrlState';

export type SortKey = 'featured' | 'stars' | 'recent' | 'name';
export type CategoryFilter = CategoryId | 'all';

const SORTS: SortKey[] = ['featured', 'stars', 'recent', 'name'];
const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

/** Chuỗi để so khớp khi search — gộp sẵn một lần cho mỗi dự án. */
function haystack(p: Project): string {
  return normalize(
    [p.title, p.slug, p.tagline.vi, p.tagline.en, p.repo ?? '', ...p.tags, p.categoryMeta.label.vi, p.categoryMeta.label.en].join(' '),
  );
}

interface CatalogValue {
  all: Project[];
  projects: Project[];
  query: string;
  setQuery: (q: string) => void;
  category: CategoryFilter;
  setCategory: (c: CategoryFilter) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  counts: Record<CategoryFilter, number>;
  reset: () => void;
}

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const all = useMemo(() => getProjects(), []);
  const index = useMemo(() => new Map(all.map((p) => [p.slug, haystack(p)])), [all]);

  const [query, setQueryState] = useState(() => readParam('q') ?? '');
  const [category, setCategoryState] = useState<CategoryFilter>(() => {
    const c = readParam('cat');
    return c && (CATEGORY_IDS as string[]).includes(c) ? (c as CategoryId) : 'all';
  });
  const [sort, setSortState] = useState<SortKey>(() => {
    const s = readParam('sort');
    return s && (SORTS as string[]).includes(s) ? (s as SortKey) : 'featured';
  });

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    writeParam('q', q || null);
  }, []);

  const setCategory = useCallback((c: CategoryFilter) => {
    setCategoryState(c);
    writeParam('cat', c === 'all' ? null : c);
  }, []);

  const setSort = useCallback((s: SortKey) => {
    setSortState(s);
    writeParam('sort', s === 'featured' ? null : s);
  }, []);

  const reset = useCallback(() => {
    setQueryState('');
    setCategoryState('all');
    setSortState('featured');
    writeParam('q', null);
    writeParam('cat', null);
    writeParam('sort', null);
  }, []);

  const projects = useMemo(() => {
    const needle = normalize(query);
    const filtered = all.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!needle) return true;
      return (index.get(p.slug) ?? '').includes(needle);
    });

    // 'featured' giữ nguyên thứ tự getProjects() đã sắp.
    if (sort === 'featured') return filtered;

    const sorted = [...filtered];
    if (sort === 'stars') sorted.sort((a, b) => (b.stats?.stars ?? 0) - (a.stats?.stars ?? 0));
    else if (sort === 'recent') sorted.sort((a, b) => b.year - a.year);
    else sorted.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
    return sorted;
  }, [all, index, query, category, sort]);

  const counts = useMemo(() => {
    const c = { all: all.length } as Record<CategoryFilter, number>;
    for (const id of CATEGORY_IDS) c[id] = 0;
    for (const p of all) c[p.category] += 1;
    return c;
  }, [all]);

  const value = useMemo<CatalogValue>(
    () => ({ all, projects, query, setQuery, category, setCategory, sort, setSort, counts, reset }),
    [all, projects, query, setQuery, category, setCategory, sort, setSort, counts, reset],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog phải nằm trong <CatalogProvider>');
  return ctx;
}
