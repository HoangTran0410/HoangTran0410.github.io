import { CATEGORIES } from '../data/categories';
import type { Profile } from '../data/profile';
import type { Project } from '../data/types';

export interface LanguageCount {
  name: string;
  count: number;
}

export interface SiteStats {
  totalStars: number;
  totalForks: number;
  totalProjects: number;
  categories: number;
  /** Số năm kể từ khi bắt đầu code — tính từ profile, không viết cứng. */
  years: number;
  topLanguages: LanguageCount[];
  /** Ngày push gần nhất trong toàn bộ danh sách, ISO date hoặc null. */
  lastPushed: string | null;
}

export function computeStats(projects: Project[], profile: Profile): SiteStats {
  const byLanguage = new Map<string, number>();
  let totalStars = 0;
  let totalForks = 0;
  let lastPushed: string | null = null;

  for (const p of projects) {
    const s = p.stats;
    if (!s) continue;
    totalStars += s.stars;
    totalForks += s.forks;
    if (s.language) byLanguage.set(s.language, (byLanguage.get(s.language) ?? 0) + 1);
    if (!lastPushed || s.pushedAt > lastPushed) lastPushed = s.pushedAt;
  }

  const topLanguages = [...byLanguage.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 6);

  return {
    totalStars,
    totalForks,
    totalProjects: projects.length,
    categories: CATEGORIES.length,
    years: new Date().getFullYear() - profile.codingSince,
    topLanguages,
    lastPushed,
  };
}
