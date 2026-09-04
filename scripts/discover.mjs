/**
 * Tìm repo public chưa có trong src/data/projects.ts.
 *
 *   npm run discover                 liệt kê repo chưa có, mới nhất lên đầu
 *   npm run discover -- --all        kể cả fork và repo không có mô tả
 *   npm run discover -- --emit=<tên> in sẵn một mục CuratedProject để dán vào
 *
 * Cố ý KHÔNG tự thêm vào danh sách. Trong 200+ repo public phần lớn là bài tập
 * và thử nghiệm; chọn cái nào lên trang là việc của người, script chỉ lo phần
 * không ai nhớ nổi: có cái gì mới mà chưa xét tới.
 */
import { readFileSync } from 'node:fs';
import { PROJECTS } from '../src/data/projects.ts';

const HANDLE = 'HoangTran0410';
const TOKEN = process.env.GITHUB_TOKEN ?? '';
const args = process.argv.slice(2);
const showAll = args.includes('--all');
const emit = args.find((a) => a.startsWith('--emit='))?.slice('--emit='.length);

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'hoangtran-portfolio-discover',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function getJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

async function paged(url) {
  const out = [];
  for (let page = 1; page <= 5; page += 1) {
    const batch = await getJson(`${url}${url.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

/** Chủ trang + mọi tổ chức công khai. Thêm org mới thì tự có, không phải sửa gì. */
async function allRepos() {
  const orgs = await paged(`https://api.github.com/users/${HANDLE}/orgs`).catch(() => []);
  const sources = [
    `https://api.github.com/users/${HANDLE}/repos?sort=pushed`,
    ...orgs.map((o) => `https://api.github.com/orgs/${o.login}/repos?sort=pushed`),
  ];
  const lists = await Promise.all(sources.map((u) => paged(u).catch(() => [])));
  const seen = new Map();
  for (const r of lists.flat()) if (!r.private) seen.set(r.full_name, r);
  return [...seen.values()];
}

async function myCommits(repo) {
  try {
    const c = await getJson(
      `https://api.github.com/repos/${repo}/commits?author=${HANDLE}&per_page=100`,
    );
    return Array.isArray(c) ? c.length : -1;
  } catch {
    return -1;
  }
}

const known = new Set(PROJECTS.map((p) => p.repo).filter(Boolean));
// Chính repo portfolio này, và repo README hồ sơ — không phải dự án để trưng bày.
known.add(`${HANDLE}/${HANDLE}.github.io`);
known.add(`${HANDLE}/${HANDLE}`);
const repos = await allRepos();
const missing = repos.filter((r) => !known.has(r.full_name));

// ── in sẵn một mục để dán vào projects.ts ────────────────────────────────
const PRETTY = {
  p5js: 'p5.js',
  'chrome-extension': 'Chrome Extension',
  'extension-chrome': 'Chrome Extension',
  nodejs: 'Node.js',
  'socket-io': 'Socket.IO',
  webrtc: 'WebRTC',
  api: 'API',
  ai: 'AI',
  css3: 'CSS',
  html5: 'HTML',
  ui: 'UI',
  osint: 'OSINT',
  pwa: 'PWA',
};

const titleCase = (t) =>
  PRETTY[t] ?? t.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

if (emit) {
  const r = repos.find((x) => x.name === emit || x.full_name === emit);
  if (!r) {
    console.error(`Không thấy repo "${emit}".`);
    process.exit(1);
  }
  const topics = (r.topics ?? []).filter((t) => t !== r.language?.toLowerCase());
  const tags = [r.language, ...topics.slice(0, 3).map(titleCase)].filter(Boolean);
  const created = (r.created_at ?? '').slice(0, 10);
  const desc = (r.description ?? '').replace(/'/g, "\\'").trim();

  console.log(`  {
    slug: '${slugify(r.name)}',
    repo: '${r.full_name}',
    title: '${r.name}',
    tagline: {
      vi: '${desc || 'TODO viết một câu, tối đa 80 ký tự'}',
      en: '${desc || 'TODO one line, 80 chars max'}',
    },
    blurb: {
      vi: 'TODO 2–4 câu. Nêu cái đáng chú ý, đừng lặp lại tên dự án.',
      en: 'TODO 2–4 sentences. Say what is interesting, do not restate the name.',
    },
    category: 'TODO products|games|extensions|devtools|osint|creative|archive',
    tags: [${tags.map((t) => `'${t}'`).join(', ')}],
    links: {${r.homepage ? ` demo: '${r.homepage.replace('http://', 'https://')}' ` : ''}},
    year: ${created.slice(0, 4) || new Date().getFullYear()},
    status: 'active',
  },`);
  console.log(`\n// tạo ${created} · ${r.stargazers_count}★ · topics: ${(r.topics ?? []).join(', ') || 'không có'}`);
  console.log('// Dán vào src/data/projects.ts, thay hết TODO, rồi chạy: npm run sync && npm test');
  process.exit(0);
}

// ── liệt kê ──────────────────────────────────────────────────────────────
const rows = [];
for (const r of missing) {
  const isFork = !!r.fork;
  let mine = -1;
  if (isFork) {
    mine = await myCommits(r.full_name);
    // Fork không đóng góp gì thì không phải tác phẩm của mình — đừng làm phiền.
    if (!showAll && mine === 0) continue;
  }
  if (!showAll && !r.description && !r.homepage && r.stargazers_count === 0) continue;
  rows.push({
    name: r.full_name,
    pushed: (r.pushed_at ?? '').slice(0, 10),
    stars: r.stargazers_count ?? 0,
    lang: r.language ?? '-',
    fork: isFork ? `fork ${mine} commit` : '',
    desc: (r.description ?? '').slice(0, 70),
  });
}
rows.sort((a, b) => b.pushed.localeCompare(a.pushed));

console.log(`${PROJECTS.length} dự án đang có trên trang · ${repos.length} repo public · ${rows.length} chưa xét tới\n`);
if (rows.length === 0) {
  console.log('Không có gì mới. ✓');
} else {
  for (const r of rows) {
    console.log(
      `${r.pushed}  ${String(r.stars).padStart(4)}★  ${r.lang.padEnd(12)}${r.fork.padEnd(16)}${r.name}`,
    );
    if (r.desc) console.log(`${' '.repeat(28)}${r.desc}`);
  }
  console.log(`\nMuốn thêm cái nào:  npm run discover -- --emit=<tên-repo>`);
  if (!showAll) console.log('Đang ẩn fork 0 commit và repo không mô tả — xem hết bằng --all');
}
