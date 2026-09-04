import { describe, expect, it } from 'vitest';
import { computeStats } from '../stats';
import { getProjects } from '../merge';
import { PROFILE } from '../../data/profile';

describe('computeStats', () => {
  const s = computeStats(getProjects(), PROFILE);

  it('đếm số dự án khớp danh sách', () => {
    expect(s.totalProjects).toBe(getProjects().length);
  });

  it('tổng sao không âm', () => {
    expect(s.totalStars).toBeGreaterThanOrEqual(0);
  });

  it('số năm tính từ codingSince chứ không viết cứng', () => {
    expect(s.years).toBe(new Date().getFullYear() - PROFILE.codingSince);
  });

  it('top language sắp giảm dần và không có mục rỗng', () => {
    const counts = s.topLanguages.map((l) => l.count);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
    for (const l of s.topLanguages) expect(l.name).toBeTruthy();
  });

  it('đếm đủ 7 category', () => {
    expect(s.categories).toBe(7);
  });
});
