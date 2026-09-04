import { describe, expect, it } from 'vitest';
import { gradientFor } from '../gradient';

describe('gradientFor', () => {
  it('cùng slug luôn ra cùng gradient', () => {
    expect(gradientFor('moba2d', '#a855f7')).toBe(gradientFor('moba2d', '#a855f7'));
  });
  it('slug khác nhau ra gradient khác nhau', () => {
    expect(gradientFor('moba2d', '#a855f7')).not.toBe(gradientFor('lol2d', '#a855f7'));
  });
  it('accent khác nhau ra gradient khác nhau', () => {
    expect(gradientFor('moba2d', '#a855f7')).not.toBe(gradientFor('moba2d', '#2563eb'));
  });
  it('trả về chuỗi CSS gradient hợp lệ', () => {
    expect(gradientFor('x', '#2563eb')).toMatch(/^linear-gradient\(/);
  });
});
