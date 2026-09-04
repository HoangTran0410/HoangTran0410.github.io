import { describe, expect, it } from 'vitest';
import { normalize } from '../normalize';

describe('normalize', () => {
  it('bỏ dấu tiếng Việt', () => {
    expect(normalize('Trò chơi dân gian')).toBe('tro choi dan gian');
  });
  it('xử lý đ và Đ', () => {
    expect(normalize('Đồ án Điện thoại')).toBe('do an dien thoai');
  });
  it('gộp khoảng trắng thừa', () => {
    expect(normalize('  a   b  ')).toBe('a b');
  });
  it('giữ nguyên chuỗi không dấu', () => {
    expect(normalize('React TypeScript')).toBe('react typescript');
  });
});
