import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('bất biến deploy', () => {
  it('public/CNAME trỏ đúng domain — mất file này là mất domain', () => {
    expect(readFileSync('public/CNAME', 'utf8').trim()).toBe('hoangtran99.is-a.dev');
  });

  it('vite base là gốc domain vì đây là user page repo', () => {
    expect(readFileSync('vite.config.ts', 'utf8')).toContain("base: '/'");
  });
});

describe('phần đầu trang tĩnh', () => {
  const html = readFileSync('index.html', 'utf8');

  it('#root không rỗng — SPA rỗng nghĩa là màn hình trắng cho tới khi JS chạy xong', () => {
    expect(html).toMatch(/<div id="root">\s*<div class="boot">/);
  });

  it('nêu tên và một cách liên hệ, để JS hỏng thì trang vẫn còn giá trị', () => {
    expect(html).toContain('Hoang Tran');
    expect(html).toContain('mailto:99.hoangtran@gmail.com');
  });

  it('đặt data-theme trước khi vẽ, nếu không người dùng theme tối thấy một nháy trắng', () => {
    expect(html).toContain("document.documentElement.dataset.theme");
    expect(html.indexOf('dataset.theme')).toBeLessThan(html.indexOf('id="root"'));
  });

  it('chỉ nhận đúng bốn theme đã biết, không tin thẳng localStorage', () => {
    expect(html).toContain("['editorial', 'arcade', 'bento', 'terminal']");
  });
});
