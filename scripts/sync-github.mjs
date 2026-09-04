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
const HANDLE = 'HoangTran0410';

const previous = (() => {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {
    return {};
  }
})();

const repos = [...new Set(PROJECTS.map((p) => p.repo).filter(Boolean))].sort();

function headers() {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hoangtran-portfolio-sync',
    ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
  };
}

/**
 * Đếm commit do chủ trang viết. Chỉ gọi cho repo là fork — với repo tự tạo thì
 * câu hỏi này không có ý nghĩa gì, mà mỗi lần gọi là một request.
 */
async function countMyCommits(repo) {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/commits?author=${HANDLE}&per_page=100`,
    { headers: headers() },
  );
  if (!res.ok) return -1; // không biết được, đừng vu oan
  const commits = await res.json();
  return Array.isArray(commits) ? commits.length : -1;
}

async function fetchRepo(repo) {
  const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: headers() });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const r = await res.json();
  const fork = !!r.fork;
  return {
    repo,
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    language: r.language ?? null,
    pushedAt: (r.pushed_at ?? '').slice(0, 10),
    createdAt: (r.created_at ?? '').slice(0, 10),
    topics: r.topics ?? [],
    archived: !!r.archived,
    fork,
    parent: r.parent?.full_name ?? null,
    myCommits: fork ? await countMyCommits(repo) : -1,
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
      : { repo, stars: 0, forks: 0, language: null, pushedAt: '', createdAt: '', topics: [], archived: false, fork: false, parent: null, myCommits: -1, ok: false };
  }
}

const sorted = Object.fromEntries(Object.keys(result).sort().map((k) => [k, result[k]]));
writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);

const totalStars = Object.values(sorted).reduce((n, r) => n + r.stars, 0);
console.log(`Đã sync ${repos.length - failed.length}/${repos.length} repo · tổng ${totalStars} sao`);

// Cảnh báo chuyện nhận vơ. Repo fork mà chủ trang không viết dòng nào thì không
// phải tác phẩm của mình; có viết vài dòng thì vẫn nên nói rõ đó là fork.
const forks = Object.values(sorted).filter((r) => r.fork);
if (forks.length) {
  console.warn(`\n${forks.length} repo trong danh sách là fork của người khác:`);
  for (const r of forks) {
    const n = r.myCommits;
    const mine = n < 0 ? 'không đếm được' : `${n} commit của bạn`;
    const verdict = n === 0 ? '  ← GỠ RA, đây không phải tác phẩm của bạn' : '  ← nên ghi rõ là fork';
    console.warn(`  - ${r.repo} (fork của ${r.parent}) · ${mine}${verdict}`);
  }
}
if (!TOKEN) console.log('Không có GITHUB_TOKEN — đang dùng hạn mức 60 request/giờ cho khách.');
if (failed.length) {
  console.warn(`\n${failed.length} repo lỗi (giữ dữ liệu cũ, đánh dấu ok=false):`);
  for (const f of failed) console.warn(`  - ${f}`);
}
