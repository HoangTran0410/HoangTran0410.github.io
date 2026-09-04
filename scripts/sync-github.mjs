/**
 * Kéo số liệu GitHub cho đúng các repo có trong danh sách curated,
 * ghi vào src/data/github.generated.json.
 *
 * Chạy trên máy:  npm run sync
 * Chạy trên CI:   workflow sync-github.yml, hằng ngày
 *
 * Nguyên tắc: một repo lỗi không được làm hỏng cả lần sync. Entry cũ giữ
 * nguyên và bị đánh dấu ok=false, để trang web vẫn hiện số liệu lần trước
 * thay vì đột nhiên mất sạch.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { PROJECTS } from '../src/data/projects.ts';

const OUT = new URL('../src/data/github.generated.json', import.meta.url);
const TOKEN = process.env.GITHUB_TOKEN ?? '';

const previous = (() => {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {
    return {};
  }
})();

const repos = [...new Set(PROJECTS.map((p) => p.repo).filter(Boolean))].sort();

async function fetchRepo(repo) {
  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'hoangtran-portfolio-sync',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const r = await res.json();
  return {
    repo,
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    language: r.language ?? null,
    pushedAt: (r.pushed_at ?? '').slice(0, 10),
    topics: r.topics ?? [],
    archived: !!r.archived,
    ok: true,
  };
}

const result = {};
const failed = [];

for (const repo of repos) {
  try {
    result[repo] = await fetchRepo(repo);
  } catch (err) {
    failed.push(`${repo}: ${err.message}`);
    const old = previous[repo];
    result[repo] = old
      ? { ...old, ok: false }
      : { repo, stars: 0, forks: 0, language: null, pushedAt: '', topics: [], archived: false, ok: false };
  }
}

const sorted = Object.fromEntries(Object.keys(result).sort().map((k) => [k, result[k]]));
writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);

const totalStars = Object.values(sorted).reduce((n, r) => n + r.stars, 0);
console.log(`Đã sync ${repos.length - failed.length}/${repos.length} repo · tổng ${totalStars} sao`);
if (!TOKEN) console.log('Không có GITHUB_TOKEN — đang dùng hạn mức 60 request/giờ cho khách.');
if (failed.length) {
  console.warn(`\n${failed.length} repo lỗi (giữ dữ liệu cũ, đánh dấu ok=false):`);
  for (const f of failed) console.warn(`  - ${f}`);
}
