import { describe, expect, it } from 'vitest';
import { CATEGORIES, CATEGORY_BY_ID } from '../categories';

describe('categories', () => {
  it('có đủ 7 category', () => {
    expect(CATEGORIES).toHaveLength(7);
  });

  it('id không trùng nhau', () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('order liên tục từ 1, để không có chỗ trống khi render', () => {
    const orders = CATEGORIES.map((c) => c.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('mỗi category có nhãn và blurb đủ 2 ngôn ngữ', () => {
    for (const c of CATEGORIES) {
      expect(c.label.vi.length).toBeGreaterThan(0);
      expect(c.label.en.length).toBeGreaterThan(0);
      expect(c.blurb.vi.length).toBeGreaterThan(0);
      expect(c.blurb.en.length).toBeGreaterThan(0);
    }
  });

  it('accent là mã hex hợp lệ', () => {
    for (const c of CATEGORIES) expect(c.accent).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('CATEGORY_BY_ID tra cứu được mọi id', () => {
    for (const c of CATEGORIES) expect(CATEGORY_BY_ID[c.id]).toBe(c);
  });
});
