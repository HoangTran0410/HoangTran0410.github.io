import rawStats from '../data/github.generated.json';
import { CATEGORY_BY_ID } from '../data/categories';
import { PROJECTS } from '../data/projects';
import type { GithubStats, Project } from '../data/types';

const STATS = rawStats as Record<string, GithubStats>;

/**
 * Ghép dữ liệu curated với số liệu GitHub đã sync sẵn.
 *
 * Thứ tự mặc định: featured trước, rồi tới nhiều sao, rồi tới mới hơn.
 * Repo chưa có số liệu vẫn hiện bình thường, chỉ là không có chỗ sao.
 */
export function getProjects(): Project[] {
  return PROJECTS.map((p): Project => ({
    ...p,
    links: {
      ...p.links,
      repo: p.links.repo ?? (p.repo ? `https://github.com/${p.repo}` : undefined),
    },
    stats: p.repo ? STATS[p.repo] : undefined,
    categoryMeta: CATEGORY_BY_ID[p.category],
  })).sort((a, b) => {
    if (!!b.featured !== !!a.featured) return Number(!!b.featured) - Number(!!a.featured);
    const stars = (b.stats?.stars ?? 0) - (a.stats?.stars ?? 0);
    if (stars !== 0) return stars;
    return b.year - a.year;
  });
}
