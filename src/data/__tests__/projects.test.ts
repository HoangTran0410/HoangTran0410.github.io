import { describe, expect, it } from 'vitest';
import { PROJECTS } from '../projects';
import { CATEGORY_BY_ID } from '../categories';
import rawStats from '../github.generated.json';
import type { GithubStats } from '../types';

const STATS = rawStats as Record<string, GithubStats>;

describe('projects curated', () => {
  it('có ít nhất 40 mục', () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(40);
  });

  it('slug không trùng', () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('slug an toàn cho URL', () => {
    for (const p of PROJECTS) expect(p.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('category nào cũng tồn tại thật', () => {
    for (const p of PROJECTS) expect(CATEGORY_BY_ID[p.category]).toBeDefined();
  });

  it('repo đúng dạng owner/name', () => {
    for (const p of PROJECTS) {
      if (p.repo) expect(p.repo, p.slug).toMatch(/^[\w.-]+\/[\w.-]+$/);
    }
  });

  it('mỗi mục có tagline và blurb đủ 2 ngôn ngữ', () => {
    for (const p of PROJECTS) {
      for (const loc of ['vi', 'en'] as const) {
        expect(p.tagline[loc].trim().length, `${p.slug} tagline.${loc}`).toBeGreaterThan(0);
        expect(p.blurb[loc].trim().length, `${p.slug} blurb.${loc}`).toBeGreaterThan(0);
      }
    }
  });

  it('tagline đủ ngắn để không vỡ layout card', () => {
    for (const p of PROJECTS) {
      expect(p.tagline.vi.length, `${p.slug} vi`).toBeLessThanOrEqual(80);
      expect(p.tagline.en.length, `${p.slug} en`).toBeLessThanOrEqual(80);
    }
  });

  it('mục featured phải bấm vào được — có demo hoặc repo', () => {
    for (const p of PROJECTS.filter((x) => x.featured)) {
      expect(p.links.demo ?? p.links.repo ?? p.repo, p.slug).toBeTruthy();
    }
  });

  it('mọi link đều là https', () => {
    for (const p of PROJECTS) {
      for (const url of Object.values(p.links)) {
        if (url) expect(url, `${p.slug}: ${url}`).toMatch(/^https:\/\//);
      }
    }
  });

  /**
   * `npm run discover -- --emit=<repo>` in ra một khung có sẵn chữ TODO. Khung
   * đó đủ ngắn để lọt mọi kiểm tra độ dài, nên nếu không có test này thì một
   * mục điền dở hoàn toàn có thể lên thẳng trang.
   */
  it('không còn chữ TODO nào sót lại từ khung sinh sẵn', () => {
    const unfinished = PROJECTS.filter((p) =>
      [p.tagline.vi, p.tagline.en, p.blurb.vi, p.blurb.en, p.category as string]
        .some((t) => t.includes('TODO')),
    ).map((p) => p.slug);

    expect(unfinished, 'điền nốt trước khi đưa lên trang').toEqual([]);
  });

  it('tháng nếu có phải nằm trong 1–12', () => {
    for (const p of PROJECTS) {
      if (p.month === undefined) continue;
      expect(p.month, p.slug).toBeGreaterThanOrEqual(1);
      expect(p.month, p.slug).toBeLessThanOrEqual(12);
    }
  });

  it('năm hợp lý', () => {
    for (const p of PROJECTS) {
      expect(p.year, p.slug).toBeGreaterThanOrEqual(2018);
      expect(p.year, p.slug).toBeLessThanOrEqual(new Date().getFullYear());
    }
  });

  /**
   * Chuyện đã xảy ra thật: năm repo trong danh sách hoá ra là fork của người
   * khác, có cái không một dòng nào là của chủ trang. Soi tay từng cái thì bỏ
   * sót — lần đầu bỏ sót đúng một cái. Nên `npm run sync` giờ ghi lại tình
   * trạng fork và số commit của chủ trang, còn chỗ này gác.
   *
   * Repo chưa sync thì bỏ qua: chưa biết thì đừng vu oan.
   */
  it('không có repo fork nào mà chủ trang không viết dòng nào', () => {
    const stolen = PROJECTS.filter((p) => {
      const s = p.repo ? STATS[p.repo] : undefined;
      return s?.ok && s.fork && s.myCommits === 0;
    }).map((p) => `${p.slug} (fork của ${STATS[p.repo!].parent})`);

    expect(stolen, 'fork mà không đóng góp gì thì không phải tác phẩm của mình').toEqual([]);
  });

  it('repo fork có đóng góp thì phải nói rõ là fork trong phần mô tả', () => {
    const unlabelled = PROJECTS.filter((p) => {
      const s = p.repo ? STATS[p.repo] : undefined;
      if (!s?.ok || !s.fork || s.myCommits <= 0) return false;
      const prose = `${p.blurb.vi} ${p.blurb.en} ${p.tagline.vi} ${p.tagline.en}`.toLowerCase();
      return !prose.includes('fork');
    }).map((p) => p.slug);

    expect(unlabelled, 'giữ fork thì được, nhưng phải nói rõ nó là fork').toEqual([]);
  });

  /**
   * Tag là viết tay, nên rất dễ trôi khỏi thực tế: đổi repo sang TypeScript rồi
   * mà tag vẫn ghi JavaScript thì chẳng ai nhận ra. Neo nó vào một sự thật
   * kiểm chứng được — ngôn ngữ chính GitHub báo — thì ít nhất phần xương sống
   * không bịa được.
   *
   * Đây là kiểm phần nào: 'Swing' hay 'Quadtree' vẫn là lời của người viết.
   */
  it('tag phải chứa ngôn ngữ chính mà GitHub báo', () => {
    const drifted = PROJECTS.filter((p) => {
      const lang = p.repo ? STATS[p.repo]?.language : null;
      if (!lang || !STATS[p.repo!]?.ok) return false;
      return !p.tags.some((t) => t.toLowerCase() === lang.toLowerCase());
    }).map((p) => `${p.slug}: GitHub báo ${STATS[p.repo!].language}, tag đang là [${p.tags.join(', ')}]`);

    expect(drifted, 'thêm ngôn ngữ đó vào tags, hoặc sửa lại cho đúng').toEqual([]);
  });

  it('category nào cũng có ít nhất một dự án, để không hiện nhóm rỗng', () => {
    const used = new Set(PROJECTS.map((p) => p.category));
    for (const id of Object.keys(CATEGORY_BY_ID)) expect(used.has(id as never), id).toBe(true);
  });
});
