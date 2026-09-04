import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/themes/editorial/print.css', 'utf8');

describe('CSS in ấn', () => {
  it('có khối @media print', () => {
    expect(css).toMatch(/@media\s+print/);
  });
  it('ẩn phần điều hướng và điều khiển khi in', () => {
    expect(css).toMatch(/\[data-print=['"]hide['"]\]/);
  });
  it('hiện URL sau mỗi link ngoài để bản in vẫn tra được', () => {
    expect(css).toContain('attr(href)');
  });
  it('đặt khổ giấy và lề', () => {
    expect(css).toMatch(/@page/);
  });
  it('không để một hàng dự án bị cắt đôi qua hai trang', () => {
    expect(css).toContain('break-inside: avoid');
  });
});
