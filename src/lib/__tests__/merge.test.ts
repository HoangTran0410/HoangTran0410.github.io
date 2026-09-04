import { describe, expect, it } from 'vitest';
import { getProjects } from '../merge';
import { PROJECTS } from '../../data/projects';

describe('getProjects', () => {
  const all = getProjects();

  it('trả về đúng số mục curated', () => {
    expect(all).toHaveLength(PROJECTS.length);
  });

  it('resolve sẵn categoryMeta để render khỏi phải lookup', () => {
    for (const p of all) expect(p.categoryMeta.id).toBe(p.category);
  });

  it('mục featured đứng trước mục thường', () => {
    const firstNormal = all.findIndex((p) => !p.featured);
    const lastFeatured = all.map((p) => !!p.featured).lastIndexOf(true);
    expect(lastFeatured).toBeLessThan(firstNormal);
  });

  it('không vỡ khi một repo chưa có stats — chỉ là stats undefined', () => {
    expect(() => getProjects()).not.toThrow();
    for (const p of all.filter((x) => !x.stats)) {
      expect(p.title.length).toBeGreaterThan(0);
    }
  });

  it('suy ra link repo từ trường repo khi links.repo bỏ trống', () => {
    for (const p of all) {
      if (p.repo) expect(p.links.repo).toBe(`https://github.com/${p.repo}`);
    }
  });
});
