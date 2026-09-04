import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync('index.html', 'utf8');

describe('SEO', () => {
  it('có title và description đủ dài', () => {
    expect(html).toMatch(/<title>.+<\/title>/);
    expect(html).toMatch(/name="description"\s+content="[^"]{60,}"/);
  });

  it('có đủ thẻ Open Graph để chia sẻ lên Facebook cho đẹp', () => {
    for (const p of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']) {
      expect(html, p).toContain(`property="${p}"`);
    }
  });

  it('có thẻ Twitter card cỡ lớn', () => {
    expect(html).toContain('twitter:card');
    expect(html).toContain('summary_large_image');
  });

  it('og:image là URL tuyệt đối vì mạng xã hội không hiểu đường dẫn tương đối', () => {
    expect(html).toMatch(/property="og:image"\s+content="https:\/\//);
  });

  it('có JSON-LD kiểu Person', () => {
    expect(html).toContain('application/ld+json');
    expect(html).toContain('"@type": "Person"');
  });

  it('có canonical trỏ về domain chính', () => {
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('https://hoangtran99.is-a.dev/');
  });

  it('khai báo màu theme cho thanh địa chỉ trên mobile', () => {
    expect(html).toContain('name="theme-color"');
  });

  it('khai báo song ngữ cho công cụ tìm kiếm', () => {
    expect(html).toMatch(/hreflang="vi"/);
    expect(html).toMatch(/hreflang="en"/);
  });
});

describe('robots.txt', () => {
  const txt = readFileSync('public/robots.txt', 'utf8');
  it('cho phép thu thập và chỉ ra sitemap', () => {
    expect(txt).toContain('Allow: /');
    expect(txt).toContain('Sitemap:');
  });
});
