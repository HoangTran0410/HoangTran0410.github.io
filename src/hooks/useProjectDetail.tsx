import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Project } from '../data/types';
import { useCatalog } from './useCatalog';
import { useUrlParam } from './useUrlState';

interface ProjectDetailValue {
  slug: string | null;
  project: Project | null;
  /** Danh sách đang lọc — next/prev đi trong đây. */
  projects: Project[];
  open: (slug: string) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
}

const ProjectDetailContext = createContext<ProjectDetailValue | null>(null);

export function ProjectDetailProvider({ children }: { children: ReactNode }) {
  const { projects, all } = useCatalog();
  const [slug, setSlug] = useUrlParam('p');

  const project = useMemo(
    () => (slug ? (all.find((p) => p.slug === slug) ?? null) : null),
    [slug, all],
  );

  // pushState để nút Back của trình duyệt đóng chi tiết lại thay vì thoát trang.
  const open = useCallback((s: string) => setSlug(s, true), [setSlug]);
  const close = useCallback(() => setSlug(null), [setSlug]);

  const step = useCallback(
    (delta: number) => {
      if (!project || projects.length === 0) return;
      const i = projects.findIndex((p) => p.slug === project.slug);
      // Dự án đang mở có thể đã bị lọc mất; khi đó nhảy về đầu danh sách.
      const from = i === -1 ? 0 : i;
      const nextIndex = (from + delta + projects.length) % projects.length;
      setSlug(projects[nextIndex].slug);
    },
    [project, projects, setSlug],
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, close, next, prev]);

  const value = useMemo<ProjectDetailValue>(
    () => ({ slug, project, projects, open, close, next, prev }),
    [slug, project, projects, open, close, next, prev],
  );

  return (
    <ProjectDetailContext.Provider value={value}>{children}</ProjectDetailContext.Provider>
  );
}

export function useProjectDetail(): ProjectDetailValue {
  const ctx = useContext(ProjectDetailContext);
  if (!ctx) throw new Error('useProjectDetail phải nằm trong <ProjectDetailProvider>');
  return ctx;
}
