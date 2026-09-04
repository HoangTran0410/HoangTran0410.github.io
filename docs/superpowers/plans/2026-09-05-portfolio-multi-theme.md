# Portfolio đa-theme — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng trang CV + portfolio tại `hoangtran99.is-a.dev` gom ~40 dự án của HoangTran0410 theo 7 category, render được bằng 4 theme đổi trực tiếp trên web, song ngữ VI/EN, chạy tốt trên PC và mobile.

**Architecture:** Bốn tầng phụ thuộc một chiều — data (thuần TS) → logic (headless hooks) → themes (4 renderer độc lập) → primitives dùng chung. Toàn bộ state (ngôn ngữ, filter, search, project đang mở) sống ở tầng logic nên đổi theme không mất gì. Một interface `Theme` bắt mỗi theme phủ đủ 6 khối nội dung, thiếu là compile error.

**Tech Stack:** Vite 7 · React 19 · TypeScript 5 · Tailwind CSS v4 (`@tailwindcss/vite`) · motion · lucide-react · Vitest + Testing Library + jsdom · Playwright (chỉ cho script chụp ảnh) · GitHub Actions → GitHub Pages

**Spec:** `docs/superpowers/specs/2026-09-05-portfolio-multi-theme-design.md`

## Global Constraints

- `public/CNAME` phải chứa đúng `hoangtran99.is-a.dev`. Mất file này là mất domain.
- Default branch giữ nguyên `master`. Không đổi sang `main`.
- Vite `base: '/'` — đây là user page repo, phục vụ ở gốc domain.
- Không có bất kỳ lệnh gọi GitHub API nào ở runtime của trình duyệt.
- Tầng `src/data/**` và `src/lib/**`, `src/hooks/**` không được import gì từ `src/themes/**`.
- Mọi chuỗi hiển thị cho người dùng phải song ngữ: kiểu `L10n = Record<'vi'|'en', string>`.
- Mọi animation phải tôn trọng `prefers-reduced-motion`.
- Node 20+.
- Commit message tiếng Việt, prefix theo Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).
- Mỗi commit kết thúc bằng dòng `Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5`

---

## File Structure

```
public/
  CNAME                        # hoangtran99.is-a.dev — BẤT KHẢ XÂM PHẠM
  shots/<slug>.webp            # ảnh chụp thật, script sinh, commit vào repo
  og.png                       # ảnh Open Graph
src/
  data/
    types.ts                   # L10n, Category, CuratedProject, GithubStats, Project
    categories.ts              # 7 category + accent + icon + thứ tự
    projects.ts                # ~40 mục curated — file chủ repo sẽ sửa nhiều nhất
    profile.ts                 # identity, bio, social, skills, experience, education
    github.generated.json      # CI ghi, không sửa tay
  lib/
    merge.ts                   # curated + generated → Project[]
    normalize.ts               # bỏ dấu tiếng Việt cho search
    gradient.ts                # gradient tất định từ slug
    stats.ts                   # số liệu tổng hợp cho khối Stats
  i18n/
    strings.ts                 # chuỗi UI song ngữ
  hooks/
    useI18n.tsx                # provider + hook
    useCatalog.tsx             # filter/search/sort + đồng bộ URL
    useTheme.tsx               # chọn theme, lazy load, preload
    useProjectDetail.tsx       # project đang mở + điều hướng bàn phím
    useUrlState.ts             # tiện ích đọc/ghi query param dùng chung
  themes/
    contract.ts                # type Theme, ThemeSections, ThemeMeta
    registry.ts                # ThemeId → () => Promise<Theme>
    editorial/                 # index.ts + 6 section + editorial.css
    arcade/
    bento/
    terminal/
  components/
    ProjectThumb.tsx           # ảnh thật, fallback gradient
    ThemeSwitcher.tsx          # không style cứng, ăn token của theme
    LangSwitcher.tsx
  styles/
    tokens.css                 # biến CSS cho từng [data-theme]
    base.css                   # @import tailwindcss + reset
  App.tsx                      # ghép provider + Suspense + theme shell
  main.tsx
scripts/
  sync-github.mjs
  shots.mjs
.github/workflows/
  deploy.yml
  sync-github.yml
```

---

## Phase 1 — Nền móng + Editorial (ship được)

### Task 1: Scaffold dự án, xoá template vCard, giữ CNAME

**Files:**
- Delete: `assets/`, `index.html` (bản vCard), `README.md` (bản template)
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/base.css`, `src/styles/tokens.css`, `.gitignore`, `README.md`
- Create: `public/CNAME` (nội dung `hoangtran99.is-a.dev`)
- Test: `src/__tests__/deploy-invariants.test.ts`

**Interfaces:**
- Consumes: không
- Produces: `npm run dev`, `npm run build`, `npm run test`, `npm run typecheck`

- [ ] **Step 1: Chuyển CNAME sang public/ trước khi xoá gì cả**

```bash
cd /Users/hoangtran/Desktop/Github/portfolio
mkdir -p public && git mv CNAME public/CNAME
cat public/CNAME   # phải in ra: hoangtran99.is-a.dev
```

- [ ] **Step 2: Xoá tài sản template cũ**

```bash
git rm -r --quiet assets index.html README.md
git rm --quiet .github/FUNDING.yml 2>/dev/null || true
ls -A   # còn lại: .git .github(rỗng hoặc mất) docs public LICENSE
```

Giữ `LICENSE`.

- [ ] **Step 3: Khởi tạo package.json và cài dependency**

```bash
npm init -y
npm pkg set name="portfolio" version="1.0.0" private=true type="module"
npm pkg set scripts.dev="vite" scripts.build="tsc -b && vite build" scripts.preview="vite preview"
npm pkg set scripts.test="vitest run" scripts.test:watch="vitest" scripts.typecheck="tsc --noEmit"
npm pkg set scripts.sync="node scripts/sync-github.mjs" scripts.shots="node scripts/shots.mjs"
npm i react react-dom motion lucide-react
npm i -D vite @vitejs/plugin-react typescript @types/react @types/react-dom \
        tailwindcss @tailwindcss/vite \
        vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom \
        tsx
```

- [ ] **Step 4: Viết vite.config.ts**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: { outDir: 'dist', assetsInlineLimit: 2048 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

`src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Viết test bất biến deploy (test này sẽ sống mãi)**

```ts
// src/__tests__/deploy-invariants.test.ts
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
```

- [ ] **Step 6: Chạy test, phải PASS**

Run: `npm test`
Expected: 2 passed.

- [ ] **Step 7: Viết index.html, main.tsx, App.tsx tối thiểu và build thử**

`index.html` có `<div id="root">`, `<html lang="vi">`, meta viewport, link `/favicon.svg`.
`App.tsx` tạm render `<h1>portfolio</h1>`.

Run: `npm run build`
Expected: build xanh, có `dist/index.html` và `dist/CNAME`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + Tailwind v4, gỡ template vCard

CNAME chuyển vào public/ để deploy workflow copy nguyên vẹn.
Thêm test bất biến giữ CNAME và base path.

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 2: Kiểu dữ liệu + category + test toàn vẹn

**Files:**
- Create: `src/data/types.ts`, `src/data/categories.ts`
- Test: `src/data/__tests__/categories.test.ts`

**Interfaces:**
- Consumes: không
- Produces: `Locale`, `L10n`, `CategoryId`, `Category`, `ProjectStatus`, `CuratedProject`, `GithubStats`, `Project`; `CATEGORIES: Category[]`, `CATEGORY_BY_ID: Record<CategoryId, Category>`

- [ ] **Step 1: Viết test trước**

```ts
// src/data/__tests__/categories.test.ts
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
```

- [ ] **Step 2: Chạy test để chắc chắn nó FAIL**

Run: `npx vitest run src/data/__tests__/categories.test.ts`
Expected: FAIL — không resolve được module `../categories`.

- [ ] **Step 3: Viết types.ts đúng như spec mục 4.1**

Copy nguyên các interface từ spec (`Locale`, `L10n`, `CategoryId`, `Category`, `ProjectStatus`, `CuratedProject`, `GithubStats`, `Project`), giữ nguyên comment tiếng Việt.

- [ ] **Step 4: Viết categories.ts**

```ts
import type { Category, CategoryId } from './types';

export const CATEGORIES: Category[] = [
  { id: 'products',   order: 1, accent: '#2563eb', icon: 'Rocket',
    label: { vi: 'Sản phẩm',        en: 'Products' },
    blurb: { vi: 'Những thứ có người dùng thật.',
             en: 'The ones with real users.' } },
  { id: 'games',      order: 2, accent: '#a855f7', icon: 'Gamepad2',
    label: { vi: 'Game',            en: 'Games' },
    blurb: { vi: 'Engine, web game, và những thứ chơi được ngay trên trình duyệt.',
             en: 'Engines, web games, things playable straight in the browser.' } },
  { id: 'extensions', order: 3, accent: '#f97316', icon: 'Puzzle',
    label: { vi: 'Tiện ích trình duyệt', en: 'Extensions' },
    blurb: { vi: 'Chrome/Firefox extension và userscript.',
             en: 'Chrome/Firefox extensions and userscripts.' } },
  { id: 'devtools',   order: 4, accent: '#14b8a6', icon: 'Wrench',
    label: { vi: 'Công cụ lập trình', en: 'Dev Tools' },
    blurb: { vi: 'Công cụ tự viết để đỡ khổ khi làm việc.',
             en: 'Tools built to make the work less painful.' } },
  { id: 'osint',      order: 5, accent: '#ef4444', icon: 'Radar',
    label: { vi: 'OSINT & Bảo mật',  en: 'OSINT & Security' },
    blurb: { vi: 'Tra cứu, phân tích, và mấy thứ hay ho về dữ liệu công khai.',
             en: 'Lookup, analysis, and the fun side of public data.' } },
  { id: 'creative',   order: 6, accent: '#ec4899', icon: 'Sparkles',
    label: { vi: 'Creative coding',  en: 'Creative Coding' },
    blurb: { vi: 'Code để vẽ, để nghe, để nghịch.',
             en: 'Code that draws, sounds, and plays.' } },
  { id: 'archive',    order: 7, accent: '#64748b', icon: 'Archive',
    label: { vi: 'Kho lưu trữ',      en: 'Archive' },
    blurb: { vi: 'Đồ án, bài tập lớn, và những repo đầu đời vẫn còn người dùng.',
             en: 'Coursework and early repos that people somehow still use.' } },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;
```

- [ ] **Step 5: Chạy test, phải PASS**

Run: `npx vitest run src/data/__tests__/categories.test.ts`
Expected: 6 passed.

- [ ] **Step 6: Commit**

```bash
git add src/data
git commit -m "feat(data): kiểu dữ liệu và 7 category kèm test toàn vẹn

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 3: Danh sách dự án curated + hồ sơ cá nhân

**Files:**
- Create: `src/data/projects.ts`, `src/data/profile.ts`
- Test: `src/data/__tests__/projects.test.ts`

**Interfaces:**
- Consumes: `CuratedProject`, `CategoryId`, `CATEGORY_BY_ID` (Task 2)
- Produces: `PROJECTS: CuratedProject[]`, `PROFILE: Profile`, `type Profile`

**Danh sách phải có (slug · repo · category · featured):**

| slug | repo | cat | ft |
|---|---|---|---|
| fbaio | `Useful-Scripts-Extension/fbaio` | products | ✓ |
| useful-script | `Useful-Scripts-Extension/useful-script` | products | ✓ |
| time-horizon | `HoangTran0410/time-horizon` | products | ✓ |
| chronoatlas | `HoangTran0410/chronoatlas` | products | ✓ |
| moba2d | `moba2d-game/core` | games | ✓ |
| moba2d-lol | `moba2d-packs/lol` | games | |
| moba2d-dota | `moba2d-packs/dota` | games | |
| moba2d-naruto | `moba2d-packs/naruto` | games | |
| lol2d | `HoangTran0410/LOL2D` | games | ✓ |
| lol2d-ver1 | `LOL2D/LOL2D-ver1` | games | |
| gamehub24 | `HoangTran0410/gamehub24` | games | ✓ |
| be-choi | `HoangTran0410/be-choi` | games | ✓ |
| gungame2 | `HoangTran0410/GunGame2` | games | |
| hyper-pong | `HoangTran0410/hyper-pong` | games | |
| pong | `HoangTran0410/Pong` | games | |
| minipool | `HoangTran0410/minipool.io` | games | |
| caro-online | `HoangTran0410/CaroOnline_SocketJava` | games | |
| reveal-deleted-fb | `HoangTran0410/RevealDeletedFBMessages` | extensions | ✓ |
| fbaio-ext | `fb-aio/fb-aio.github.io` | extensions | |
| useful-userscripts | `HoangTran0410/useful-user-scripts` | extensions | |
| jsdeob | `HoangTran0410/jsdeob-workbench` | devtools | ✓ |
| chatgpt-local-coder | `HoangTran0410/chatgpt-local-coder` | devtools | ✓ |
| documorph | `HoangTran0410/documorph` | devtools | |
| pixel-diff | `HoangTran0410/pixel-diff` | devtools | |
| titanbench | `HoangTran0410/titanbench` | devtools | |
| kotlin-lab | `HoangTran0410/kotlin-lab` | devtools | |
| github-osint | `HoangTran0410/github-osint` | osint | ✓ |
| cryptoflow | `HoangTran0410/cryptoflow` | osint | |
| ip-location | `HoangTran0410/ip-location-tracker` | osint | |
| face-compare | `HoangTran0410/face-compare` | osint | |
| fcksignups | `HoangTran0410/FckSignups` | osint | |
| cipher-breaker | `HoangTran0410/cipher-breaker` | osint | |
| p5js-playground | `HoangTran0410/p5js-playground` | creative | ✓ |
| carousel-3d | `HoangTran0410/3DCarousel` | creative | ✓ |
| visualyze | `HoangTran0410/Visualyze-design-your-own-` | creative | |
| lenticular | `HoangTran0410/analog-lenticular-animation` | creative | |
| music-visualizer | `HoangTran0410/music-visualizer` | creative | |
| motion-extraction | `HoangTran0410/motion-extraction` | creative | |
| linear-ability-three | `HoangTran0410/LinearAbiltyCastingThreeJS` | creative | |
| qr-jigsaw | `HoangTran0410/qr-jigsaw` | creative | |
| ifocus | `HoangTran0410/ifocus` | devtools | |
| fb-media-downloader | `HoangTran0410/FBMediaDownloader` | archive | |
| saoke-yagi | `HoangTran0410/saoke_yagi` | archive | |
| doan-web1 | `HoangTran0410/DoAn_Web1` | archive | |
| doan-web2 | `HoangTran0410/DoAn_Web2` | archive | |
| smartphone-store | `HoangTran0410/SmartPhone_Store_Manage_Java` | archive | |
| reversi-mcts | `HoangTran0410/Reversi-mcts` | archive | |

`links.demo` lấy từ trường `homepage` của GitHub đã khảo sát; mục nào không có homepage thì bỏ trống.

- [ ] **Step 1: Viết test toàn vẹn trước**

```ts
// src/data/__tests__/projects.test.ts
import { describe, expect, it } from 'vitest';
import { PROJECTS } from '../projects';
import { CATEGORY_BY_ID } from '../categories';

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
      if (p.repo) expect(p.repo).toMatch(/^[\w.-]+\/[\w.-]+$/);
    }
  });

  it('mỗi mục có tagline và blurb đủ 2 ngôn ngữ', () => {
    for (const p of PROJECTS) {
      for (const loc of ['vi', 'en'] as const) {
        expect(p.tagline[loc].trim().length).toBeGreaterThan(0);
        expect(p.blurb[loc].trim().length).toBeGreaterThan(0);
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

  it('năm hợp lý', () => {
    for (const p of PROJECTS) {
      expect(p.year).toBeGreaterThanOrEqual(2018);
      expect(p.year).toBeLessThanOrEqual(new Date().getFullYear());
    }
  });

  it('category nào cũng có ít nhất một dự án, để không hiện nhóm rỗng', () => {
    const used = new Set(PROJECTS.map((p) => p.category));
    for (const id of Object.keys(CATEGORY_BY_ID)) expect(used.has(id as never)).toBe(true);
  });
});
```

- [ ] **Step 2: Chạy test để chắc chắn FAIL**

Run: `npx vitest run src/data/__tests__/projects.test.ts`
Expected: FAIL — không resolve được `../projects`.

- [ ] **Step 3: Viết projects.ts theo bảng trên**

Mỗi mục viết tagline (≤ 80 ký tự) và blurb (2–4 câu) cả VI lẫn EN. Viết bằng giọng thật, nêu cái
đáng chú ý của dự án chứ không lặp lại tên. Ví dụ mẫu:

```ts
{
  slug: 'moba2d',
  repo: 'moba2d-game/core',
  title: 'moba2d',
  tagline: {
    vi: 'Engine MOBA 2D — tướng và bản đồ nằm trong content pack rời',
    en: 'A 2D MOBA engine — champions and maps live in separate content packs',
  },
  blurb: {
    vi: 'Phần lõi không biết gì về Liên Minh hay Dota. Nó chỉ định nghĩa một ContentApi, còn tướng, chiêu, quái rừng và bản đồ do các pack bên ngoài cung cấp. Hiện có ba pack: LMHT 58 tướng, Dota, và Naruto.',
    en: "The core knows nothing about League or Dota. It defines a ContentApi and lets outside packs supply champions, spells, jungle camps and maps. Three packs so far: League with 58 champions, Dota, and Naruto.",
  },
  category: 'games',
  tags: ['TypeScript', 'Canvas', 'Game engine', 'Monorepo'],
  links: { demo: 'https://moba2d.pages.dev/', repo: 'https://github.com/moba2d-game/core' },
  featured: true,
  year: 2026,
  status: 'active',
}
```

- [ ] **Step 4: Viết profile.ts**

```ts
import type { L10n } from './types';

export interface ExperienceItem {
  company: string;
  role: L10n;
  from: string;          // 'YYYY-MM'
  to: string | null;     // null = đang làm
  summary: L10n;
  highlights: L10n[];    // 2-4 gạch đầu dòng
}

export interface EducationItem {
  school: string;
  degree: L10n;
  from: string;
  to: string | null;
}

export interface SkillGroup {
  label: L10n;
  items: string[];
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: string;          // tên icon lucide, hoặc 'github'/'facebook'... cho brand
}

export interface Profile {
  name: string;
  handle: string;
  avatar: string;
  headline: L10n;
  bio: L10n;
  location: L10n;
  email: string;
  socials: SocialLink[];
  skills: SkillGroup[];
  experience: ExperienceItem[];
  education: EducationItem[];
  /** Năm bắt đầu code, dùng để tính "N năm kinh nghiệm" thay vì hardcode */
  codingSince: number;
}
```

Điền: name `Hoang Tran`, handle `HoangTran0410`, avatar
`https://avatars.githubusercontent.com/u/36368107?v=4`, email `99.hoangtran@gmail.com`,
location `Việt Nam / Vietnam`, socials (GitHub, Facebook `fb.com/9999.hoangtran`,
LinkedIn `linkedin.com/in/99-hoangtran`, StackOverflow `stackoverflow.com/users/11898496`,
CodePen `codepen.io/hoanghien0410`, blog `blog.fbaio.org`), `codingSince: 2018`.

`experience` điền sẵn một mục MoMo (M_Service) với comment ngay trên mảng:

```ts
// ─────────────────────────────────────────────────────────────────
// SỬA Ở ĐÂY: điền kinh nghiệm làm việc thật.
//   from/to dạng 'YYYY-MM', to = null nghĩa là đang làm.
//   highlights: 2-4 gạch đầu dòng, mỗi cái nêu một kết quả cụ thể.
//   Xoá cả mảng nếu không muốn hiện phần này — UI tự ẩn khi rỗng.
// ─────────────────────────────────────────────────────────────────
```

`education` để mảng rỗng kèm comment tương tự. Section tự ẩn khi mảng rỗng.

- [ ] **Step 5: Chạy toàn bộ test, phải PASS**

Run: `npm test`
Expected: tất cả xanh.

- [ ] **Step 6: Commit**

```bash
git add src/data
git commit -m "feat(data): 45+ dự án curated song ngữ và hồ sơ cá nhân

Danh sách viết tay vì 4 dự án thật nằm trong repo fork nên mọi cách
lọc tự động theo fork=false đều bỏ sót.

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 4: Script sync GitHub + merge dữ liệu

**Files:**
- Create: `scripts/sync-github.mjs`, `src/data/github.generated.json`, `src/lib/merge.ts`, `src/lib/stats.ts`
- Test: `src/lib/__tests__/merge.test.ts`, `src/lib/__tests__/stats.test.ts`

**Interfaces:**
- Consumes: `PROJECTS`, `CATEGORY_BY_ID`, `GithubStats`, `Project`, `PROFILE`
- Produces:
  - `getProjects(): Project[]` — curated đã gắn stats và `categoryMeta`, sắp mặc định
  - `computeStats(projects: Project[], profile: Profile): SiteStats`
  - `interface SiteStats { totalStars: number; totalProjects: number; totalForks: number; years: number; categories: number; topLanguages: {name: string; count: number}[] }`

- [ ] **Step 1: Viết test merge trước**

```ts
// src/lib/__tests__/merge.test.ts
import { describe, expect, it } from 'vitest';
import { getProjects } from '../merge';
import { PROJECTS } from '../../data/projects';

describe('getProjects', () => {
  const all = getProjects();

  it('trả về đúng số mục curated', () => {
    expect(all).toHaveLength(PROJECTS.length);
  });

  it('resolve sẵn categoryMeta để render khỏi phải lookup', () => {
    for (const p of all) expect(p.categoryMeta.id).toBe(p.category);
  });

  it('mục featured đứng trước mục thường', () => {
    const firstNormal = all.findIndex((p) => !p.featured);
    const lastFeatured = all.map((p) => !!p.featured).lastIndexOf(true);
    expect(lastFeatured).toBeLessThan(firstNormal);
  });

  it('không vỡ khi một repo chưa có stats — chỉ là stats undefined', () => {
    expect(() => getProjects()).not.toThrow();
    const missing = all.filter((p) => !p.stats);
    for (const p of missing) expect(p.title.length).toBeGreaterThan(0);
  });

  it('suy ra link repo từ trường repo khi links.repo bỏ trống', () => {
    for (const p of all) {
      if (p.repo) expect(p.links.repo).toBe(`https://github.com/${p.repo}`);
    }
  });
});
```

- [ ] **Step 2: Viết test stats**

```ts
// src/lib/__tests__/stats.test.ts
import { describe, expect, it } from 'vitest';
import { computeStats } from '../stats';
import { getProjects } from '../merge';
import { PROFILE } from '../../data/profile';

describe('computeStats', () => {
  const s = computeStats(getProjects(), PROFILE);

  it('đếm số dự án khớp danh sách', () => {
    expect(s.totalProjects).toBe(getProjects().length);
  });

  it('tổng sao không âm', () => {
    expect(s.totalStars).toBeGreaterThanOrEqual(0);
  });

  it('số năm tính từ codingSince chứ không hardcode', () => {
    expect(s.years).toBe(new Date().getFullYear() - PROFILE.codingSince);
  });

  it('top language sắp giảm dần và không có null', () => {
    const counts = s.topLanguages.map((l) => l.count);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
    for (const l of s.topLanguages) expect(l.name).toBeTruthy();
  });
});
```

- [ ] **Step 3: Chạy, phải FAIL**

Run: `npx vitest run src/lib`
Expected: FAIL — không resolve được `../merge`.

- [ ] **Step 4: Tạo github.generated.json rỗng và viết merge.ts + stats.ts**

`src/data/github.generated.json` khởi tạo `{}`.

```ts
// src/lib/merge.ts
import rawStats from '../data/github.generated.json';
import { CATEGORY_BY_ID } from '../data/categories';
import { PROJECTS } from '../data/projects';
import type { GithubStats, Project } from '../data/types';

const STATS = rawStats as Record<string, GithubStats>;

export function getProjects(): Project[] {
  return PROJECTS.map((p) => ({
    ...p,
    links: { ...p.links, repo: p.links.repo ?? (p.repo ? `https://github.com/${p.repo}` : undefined) },
    stats: p.repo ? STATS[p.repo] : undefined,
    categoryMeta: CATEGORY_BY_ID[p.category],
  })).sort((a, b) => {
    if (!!b.featured !== !!a.featured) return Number(!!b.featured) - Number(!!a.featured);
    const stars = (b.stats?.stars ?? 0) - (a.stats?.stars ?? 0);
    if (stars !== 0) return stars;
    return b.year - a.year;
  });
}
```

`stats.ts` cộng dồn stars/forks, đếm `language` (bỏ null), sắp giảm dần, cắt 6.

- [ ] **Step 5: Chạy test, phải PASS**

Run: `npx vitest run src/lib`
Expected: 9 passed.

- [ ] **Step 6: Viết scripts/sync-github.mjs**

Yêu cầu:
- Import `src/data/projects.ts` bằng `tsx` (`npx tsx scripts/sync-github.mjs`), gom các `repo` khác nhau.
- Gọi `https://api.github.com/repos/{repo}`, header `Authorization: Bearer ${process.env.GITHUB_TOKEN}` nếu có.
- Repo lỗi: giữ entry cũ, đặt `ok: false`, `console.warn`, **không** exit khác 0.
- Ghi `src/data/github.generated.json`, key sắp xếp bảng chữ cái, 2 space, có newline cuối.
- In tóm tắt: bao nhiêu cập nhật, bao nhiêu lỗi, tổng sao.

Đổi `npm pkg set scripts.sync="tsx scripts/sync-github.mjs"`.

- [ ] **Step 7: Chạy sync thật, kiểm tra kết quả**

Run: `npm run sync && npm test`
Expected: JSON có đủ entry cho mọi repo, test vẫn xanh, tổng sao > 900.

- [ ] **Step 8: Commit**

```bash
git add scripts src/lib src/data/github.generated.json package.json
git commit -m "feat(data): sync số liệu GitHub lúc build và merge vào model runtime

Trình duyệt không gọi GitHub API lần nào; CI ghi sẵn JSON vào repo.
Repo lỗi giữ dữ liệu cũ và đánh dấu ok=false thay vì làm hỏng cả lần sync.

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 5: useI18n + bảng chuỗi UI

**Files:**
- Create: `src/i18n/strings.ts`, `src/hooks/useI18n.tsx`, `src/hooks/useUrlState.ts`
- Test: `src/hooks/__tests__/useI18n.test.tsx`

**Interfaces:**
- Consumes: `Locale`, `L10n`
- Produces:
  - `<I18nProvider>{children}</I18nProvider>`
  - `useI18n(): { locale: Locale; setLocale(l: Locale): void; t(key: StringKey): string; ti(v: L10n): string }`
  - `useUrlState(key: string): [string | null, (v: string | null) => void]` — ghi bằng `history.replaceState`, phát sự kiện `popstate` nội bộ để các hook khác đồng bộ

- [ ] **Step 1: Viết test**

```tsx
// src/hooks/__tests__/useI18n.test.tsx
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider, useI18n } from '../useI18n';

const wrap = ({ children }: { children: React.ReactNode }) => <I18nProvider>{children}</I18nProvider>;

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('useI18n', () => {
  it('mặc định theo ngôn ngữ trình duyệt', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('vi-VN');
    expect(renderHook(() => useI18n(), { wrapper: wrap }).result.current.locale).toBe('vi');
  });

  it('trình duyệt không phải tiếng Việt thì dùng tiếng Anh', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    expect(renderHook(() => useI18n(), { wrapper: wrap }).result.current.locale).toBe('en');
  });

  it('localStorage thắng ngôn ngữ trình duyệt', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    localStorage.setItem('locale', 'vi');
    expect(renderHook(() => useI18n(), { wrapper: wrap }).result.current.locale).toBe('vi');
  });

  it('query param thắng localStorage', () => {
    localStorage.setItem('locale', 'vi');
    window.history.replaceState({}, '', '/?lang=en');
    expect(renderHook(() => useI18n(), { wrapper: wrap }).result.current.locale).toBe('en');
  });

  it('ti() lấy đúng bản dịch theo locale hiện tại', () => {
    const { result } = renderHook(() => useI18n(), { wrapper: wrap });
    act(() => result.current.setLocale('vi'));
    expect(result.current.ti({ vi: 'xin chào', en: 'hello' })).toBe('xin chào');
    act(() => result.current.setLocale('en'));
    expect(result.current.ti({ vi: 'xin chào', en: 'hello' })).toBe('hello');
  });

  it('setLocale ghi localStorage và cập nhật thuộc tính lang của html', () => {
    const { result } = renderHook(() => useI18n(), { wrapper: wrap });
    act(() => result.current.setLocale('en'));
    expect(localStorage.getItem('locale')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
```

- [ ] **Step 2: Chạy, phải FAIL**

Run: `npx vitest run src/hooks/__tests__/useI18n.test.tsx`
Expected: FAIL — không resolve được `../useI18n`.

- [ ] **Step 3: Viết useUrlState.ts rồi useI18n.tsx**

`strings.ts` export `const STRINGS = { ... } as const satisfies Record<string, L10n>` và
`export type StringKey = keyof typeof STRINGS`. Bắt đầu với các khoá:
`nav.work`, `nav.about`, `nav.contact`, `search.placeholder`, `filter.all`, `sort.featured`,
`sort.stars`, `sort.recent`, `sort.name`, `detail.visit`, `detail.source`, `detail.readMore`,
`detail.close`, `detail.next`, `detail.prev`, `stats.stars`, `stats.projects`, `stats.years`,
`stats.followers`, `theme.label`, `lang.label`, `empty.title`, `empty.hint`, `footer.built`,
`story.experience`, `story.education`, `story.skills`, `contact.title`, `contact.copy`,
`contact.copied`, `print.hint`.

- [ ] **Step 4: Chạy test, phải PASS**

Run: `npx vitest run src/hooks/__tests__/useI18n.test.tsx`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/i18n src/hooks
git commit -m "feat(i18n): hook song ngữ VI/EN với thứ tự ưu tiên url > localStorage > trình duyệt

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 6: useCatalog — lọc, tìm kiếm bỏ dấu, sắp xếp

**Files:**
- Create: `src/lib/normalize.ts`, `src/hooks/useCatalog.tsx`
- Test: `src/lib/__tests__/normalize.test.ts`, `src/hooks/__tests__/useCatalog.test.tsx`

**Interfaces:**
- Consumes: `getProjects`, `CATEGORIES`, `useUrlState`
- Produces:
  - `normalize(s: string): string` — lowercase, bỏ dấu tiếng Việt, gộp khoảng trắng
  - `<CatalogProvider>`, `useCatalog(): { query, setQuery, category, setCategory, sort, setSort, projects, all, counts, reset }`
  - `type SortKey = 'featured' | 'stars' | 'recent' | 'name'`
  - `counts: Record<CategoryId | 'all', number>`

- [ ] **Step 1: Viết test normalize**

```ts
// src/lib/__tests__/normalize.test.ts
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
```

- [ ] **Step 2: Viết test useCatalog**

```tsx
// src/hooks/__tests__/useCatalog.test.tsx
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CatalogProvider, useCatalog } from '../useCatalog';

const wrap = ({ children }: { children: React.ReactNode }) => <CatalogProvider>{children}</CatalogProvider>;
const setup = () => renderHook(() => useCatalog(), { wrapper: wrap });

beforeEach(() => window.history.replaceState({}, '', '/'));

describe('useCatalog', () => {
  it('mặc định hiện tất cả dự án', () => {
    const { result } = setup();
    expect(result.current.projects.length).toBe(result.current.all.length);
  });

  it('lọc theo category', () => {
    const { result } = setup();
    act(() => result.current.setCategory('games'));
    expect(result.current.projects.length).toBeGreaterThan(0);
    for (const p of result.current.projects) expect(p.category).toBe('games');
  });

  it('search khớp trên tên dự án', () => {
    const { result } = setup();
    act(() => result.current.setQuery('moba'));
    expect(result.current.projects.some((p) => p.slug === 'moba2d')).toBe(true);
  });

  it('search khớp trên tag công nghệ', () => {
    const { result } = setup();
    act(() => result.current.setQuery('typescript'));
    expect(result.current.projects.length).toBeGreaterThan(3);
  });

  it('search gõ không dấu vẫn ra kết quả có dấu', () => {
    const { result } = setup();
    act(() => result.current.setQuery('tro choi'));
    expect(result.current.projects.length).toBeGreaterThan(0);
  });

  it('sort theo sao thì mục nhiều sao nhất đứng đầu', () => {
    const { result } = setup();
    act(() => result.current.setSort('stars'));
    const stars = result.current.projects.map((p) => p.stats?.stars ?? 0);
    expect([...stars].sort((a, b) => b - a)).toEqual(stars);
  });

  it('sort theo tên là thứ tự bảng chữ cái', () => {
    const { result } = setup();
    act(() => result.current.setSort('name'));
    const names = result.current.projects.map((p) => p.title.toLowerCase());
    expect([...names].sort()).toEqual(names);
  });

  it('counts khớp số lượng thực tế mỗi category', () => {
    const { result } = setup();
    const { all, counts } = result.current;
    expect(counts.all).toBe(all.length);
    expect(counts.games).toBe(all.filter((p) => p.category === 'games').length);
  });

  it('đồng bộ trạng thái lên URL để share được', () => {
    const { result } = setup();
    act(() => { result.current.setCategory('osint'); result.current.setQuery('ip'); });
    expect(window.location.search).toContain('cat=osint');
    expect(window.location.search).toContain('q=ip');
  });

  it('đọc lại trạng thái từ URL lúc khởi tạo', () => {
    window.history.replaceState({}, '', '/?cat=creative');
    const { result } = setup();
    expect(result.current.category).toBe('creative');
  });

  it('reset đưa về mặc định và xoá query param', () => {
    const { result } = setup();
    act(() => { result.current.setCategory('games'); result.current.setQuery('x'); });
    act(() => result.current.reset());
    expect(result.current.category).toBe('all');
    expect(result.current.query).toBe('');
    expect(result.current.projects.length).toBe(result.current.all.length);
  });
});
```

- [ ] **Step 3: Chạy, phải FAIL**

Run: `npx vitest run src/lib/__tests__/normalize.test.ts src/hooks/__tests__/useCatalog.test.tsx`
Expected: FAIL.

- [ ] **Step 4: Viết normalize.ts**

```ts
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
```

- [ ] **Step 5: Viết useCatalog.tsx**

Search khớp trên: `title`, `slug`, `tagline.vi`, `tagline.en`, `tags`, `repo` — tất cả qua `normalize`.
Sort `featured` dùng đúng thứ tự `getProjects()` trả về.

- [ ] **Step 6: Chạy test, phải PASS**

Run: `npx vitest run src/lib src/hooks`
Expected: tất cả xanh.

- [ ] **Step 7: Commit**

```bash
git add src/lib src/hooks
git commit -m "feat(catalog): lọc/tìm/sắp xếp dùng chung cho mọi theme, đồng bộ URL

Search bỏ dấu tiếng Việt nên gõ 'tro choi' vẫn ra 'trò chơi'.

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 7: Theme contract, registry, useTheme, useProjectDetail

**Files:**
- Create: `src/themes/contract.ts`, `src/themes/registry.ts`, `src/hooks/useTheme.tsx`, `src/hooks/useProjectDetail.tsx`
- Test: `src/hooks/__tests__/useTheme.test.tsx`, `src/hooks/__tests__/useProjectDetail.test.tsx`, `src/hooks/__tests__/state-preservation.test.tsx`

**Interfaces:**
- Consumes: `useUrlState`, `useCatalog`
- Produces:
  - `type ThemeId`, `interface Theme/ThemeMeta/ThemeSections` (đúng như spec mục 3.2)
  - `THEME_META: Record<ThemeId, ThemeMeta>` — metadata tĩnh, không lazy, để switcher render được ngay
  - `THEME_LOADERS: Record<ThemeId, () => Promise<{ default: Theme }>>`
  - `useTheme(): { themeId, setTheme(id), preload(id), meta }`
  - `useProjectDetail(): { slug, project, open(slug), close(), next(), prev() }`

- [ ] **Step 1: Viết test useTheme**

```tsx
// src/hooks/__tests__/useTheme.test.tsx
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from '../useTheme';
import { THEME_META } from '../../themes/registry';

const wrap = ({ children }: { children: React.ReactNode }) => <ThemeProvider>{children}</ThemeProvider>;

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('useTheme', () => {
  it('mặc định là editorial', () => {
    expect(renderHook(() => useTheme(), { wrapper: wrap }).result.current.themeId).toBe('editorial');
  });

  it('localStorage thắng mặc định', () => {
    localStorage.setItem('theme', 'arcade');
    expect(renderHook(() => useTheme(), { wrapper: wrap }).result.current.themeId).toBe('arcade');
  });

  it('query param thắng localStorage', () => {
    localStorage.setItem('theme', 'arcade');
    window.history.replaceState({}, '', '/?theme=terminal');
    expect(renderHook(() => useTheme(), { wrapper: wrap }).result.current.themeId).toBe('terminal');
  });

  it('bỏ qua giá trị rác, quay về mặc định', () => {
    window.history.replaceState({}, '', '/?theme=khong-ton-tai');
    expect(renderHook(() => useTheme(), { wrapper: wrap }).result.current.themeId).toBe('editorial');
  });

  it('ghi data-theme lên thẻ html để CSS token đổi theo', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: wrap });
    act(() => result.current.setTheme('bento'));
    expect(document.documentElement.dataset.theme).toBe('bento');
  });

  it('có metadata cho đủ 4 theme', () => {
    expect(Object.keys(THEME_META).sort()).toEqual(['arcade', 'bento', 'editorial', 'terminal']);
    for (const m of Object.values(THEME_META)) {
      expect(m.label.vi).toBeTruthy();
      expect(m.label.en).toBeTruthy();
      expect(m.swatch).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
```

- [ ] **Step 2: Viết test useProjectDetail**

```tsx
// src/hooks/__tests__/useProjectDetail.test.tsx
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CatalogProvider } from '../useCatalog';
import { ProjectDetailProvider, useProjectDetail } from '../useProjectDetail';

const wrap = ({ children }: { children: React.ReactNode }) => (
  <CatalogProvider><ProjectDetailProvider>{children}</ProjectDetailProvider></CatalogProvider>
);
const setup = () => renderHook(() => useProjectDetail(), { wrapper: wrap });

beforeEach(() => window.history.replaceState({}, '', '/'));

describe('useProjectDetail', () => {
  it('mặc định không có gì mở', () => {
    expect(setup().result.current.project).toBeNull();
  });

  it('open ghi slug lên URL để deep-link được', () => {
    const { result } = setup();
    act(() => result.current.open('moba2d'));
    expect(window.location.search).toContain('p=moba2d');
    expect(result.current.project?.slug).toBe('moba2d');
  });

  it('mở sẵn theo URL lúc tải trang', () => {
    window.history.replaceState({}, '', '/?p=lol2d');
    expect(setup().result.current.project?.slug).toBe('lol2d');
  });

  it('slug không tồn tại thì coi như không mở gì', () => {
    window.history.replaceState({}, '', '/?p=khong-co-that');
    expect(setup().result.current.project).toBeNull();
  });

  it('close xoá param', () => {
    const { result } = setup();
    act(() => result.current.open('moba2d'));
    act(() => result.current.close());
    expect(window.location.search).not.toContain('p=');
    expect(result.current.project).toBeNull();
  });

  it('next/prev đi trong danh sách đang lọc và không chạy ra ngoài', () => {
    const { result } = setup();
    act(() => result.current.open('moba2d'));
    const first = result.current.project!.slug;
    act(() => result.current.next());
    expect(result.current.project!.slug).not.toBe(first);
    act(() => result.current.prev());
    expect(result.current.project!.slug).toBe(first);
  });
});
```

- [ ] **Step 3: Viết test bất biến trung tâm — đổi theme không mất state**

```tsx
// src/hooks/__tests__/state-preservation.test.tsx
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '../../App';
import { useCatalog } from '../useCatalog';
import { useI18n } from '../useI18n';
import { useProjectDetail } from '../useProjectDetail';
import { useTheme } from '../useTheme';

const wrap = ({ children }: { children: React.ReactNode }) => <AppProviders>{children}</AppProviders>;

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('đổi theme là bất biến trung tâm của thiết kế', () => {
  it('giữ nguyên filter, search, ngôn ngữ và project đang mở', () => {
    const { result } = renderHook(
      () => ({ catalog: useCatalog(), theme: useTheme(), detail: useProjectDetail(), i18n: useI18n() }),
      { wrapper: wrap },
    );

    act(() => {
      result.current.i18n.setLocale('en');
      result.current.catalog.setCategory('games');
      result.current.catalog.setQuery('moba');
    });
    act(() => result.current.detail.open('moba2d'));

    const before = result.current.catalog.projects.map((p) => p.slug);

    act(() => result.current.theme.setTheme('terminal'));

    expect(result.current.theme.themeId).toBe('terminal');
    expect(result.current.i18n.locale).toBe('en');
    expect(result.current.catalog.category).toBe('games');
    expect(result.current.catalog.query).toBe('moba');
    expect(result.current.detail.project?.slug).toBe('moba2d');
    expect(result.current.catalog.projects.map((p) => p.slug)).toEqual(before);
  });
});
```

- [ ] **Step 4: Chạy cả ba, phải FAIL**

Run: `npx vitest run src/hooks/__tests__`
Expected: FAIL — thiếu module.

- [ ] **Step 5: Viết contract.ts, registry.ts, useTheme.tsx, useProjectDetail.tsx, và AppProviders trong App.tsx**

`AppProviders` xếp thứ tự: `I18nProvider > ThemeProvider > CatalogProvider > ProjectDetailProvider`.
Theme nằm **ngoài** Catalog để đổi theme không remount catalog.

`registry.ts`:

```ts
import type { Theme, ThemeId, ThemeMeta } from './contract';

export const THEME_META: Record<ThemeId, ThemeMeta> = {
  editorial: { id: 'editorial', dark: false, swatch: '#111111',
    label: { vi: 'Tạp chí', en: 'Editorial' },
    hint: { vi: 'Sáng, chữ to, đọc lâu không mỏi — in ra làm CV được', en: 'Light, typographic, prints as a clean CV' } },
  arcade: { id: 'arcade', dark: true, swatch: '#7c3aed',
    label: { vi: 'Arcade', en: 'Arcade' },
    hint: { vi: 'Tối, neon, card nghiêng theo chuột', en: 'Dark, neon, cards that tilt' } },
  bento: { id: 'bento', dark: false, swatch: '#0ea5e9',
    label: { vi: 'Bento', en: 'Bento' },
    hint: { vi: 'Lưới ô to nhỏ, xem được nhiều thứ cùng lúc', en: 'A grid of tiles, everything at a glance' } },
  terminal: { id: 'terminal', dark: true, swatch: '#22c55e',
    label: { vi: 'Terminal', en: 'Terminal' },
    hint: { vi: 'Gõ lệnh mà xem, thử `help`', en: 'Type to browse. Try `help`' } },
};

export const THEME_LOADERS: Record<ThemeId, () => Promise<{ default: Theme }>> = {
  editorial: () => import('./editorial'),
  arcade: () => import('./arcade'),
  bento: () => import('./bento'),
  terminal: () => import('./terminal'),
};

export const DEFAULT_THEME: ThemeId = 'editorial';
```

- [ ] **Step 6: Chạy test, phải PASS**

Run: `npx vitest run src/hooks/__tests__`
Expected: tất cả xanh (test state-preservation cần các theme module tồn tại — tạo 4 file
`src/themes/<id>/index.ts` tạm export một Theme tối thiểu, Task 10 sẽ viết đầy đủ).

- [ ] **Step 7: Commit**

```bash
git add src/themes src/hooks src/App.tsx
git commit -m "feat(theme): contract 6 khối nội dung, registry lazy, và bất biến giữ state khi đổi theme

ThemeProvider đặt ngoài CatalogProvider nên đổi theme không remount catalog.

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 8: Token CSS + primitives dùng chung

**Files:**
- Create: `src/styles/tokens.css`, `src/lib/gradient.ts`, `src/components/ProjectThumb.tsx`, `src/components/ThemeSwitcher.tsx`, `src/components/LangSwitcher.tsx`
- Modify: `src/styles/base.css`
- Test: `src/lib/__tests__/gradient.test.ts`, `src/components/__tests__/ProjectThumb.test.tsx`

**Interfaces:**
- Consumes: `Project`, `useTheme`, `useI18n`, `THEME_META`
- Produces: `gradientFor(slug: string, accent: string): string`, `<ProjectThumb project ratio? />`, `<ThemeSwitcher />`, `<LangSwitcher />`

- [ ] **Step 1: Viết test gradient**

```ts
// src/lib/__tests__/gradient.test.ts
import { describe, expect, it } from 'vitest';
import { gradientFor } from '../gradient';

describe('gradientFor', () => {
  it('cùng slug luôn ra cùng gradient', () => {
    expect(gradientFor('moba2d', '#a855f7')).toBe(gradientFor('moba2d', '#a855f7'));
  });
  it('slug khác nhau ra gradient khác nhau', () => {
    expect(gradientFor('moba2d', '#a855f7')).not.toBe(gradientFor('lol2d', '#a855f7'));
  });
  it('trả về chuỗi CSS gradient hợp lệ', () => {
    expect(gradientFor('x', '#2563eb')).toMatch(/^linear-gradient\(/);
  });
});
```

- [ ] **Step 2: Viết test ProjectThumb**

```tsx
// src/components/__tests__/ProjectThumb.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectThumb } from '../ProjectThumb';
import { getProjects } from '../../lib/merge';

const byslug = (s: string) => getProjects().find((p) => p.slug === s)!;

describe('ProjectThumb', () => {
  it('dùng ảnh thật khi project khai báo shot', () => {
    const p = { ...byslug('moba2d'), shot: '/shots/moba2d.webp' };
    render(<ProjectThumb project={p} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/shots/moba2d.webp');
  });

  it('ảnh có kích thước cố định để không nhảy layout', () => {
    const p = { ...byslug('moba2d'), shot: '/shots/moba2d.webp' };
    render(<ProjectThumb project={p} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width');
    expect(img).toHaveAttribute('height');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('không có ảnh thì vẽ gradient thay vì để trống', () => {
    const p = { ...byslug('reversi-mcts'), shot: undefined };
    const { container } = render(<ProjectThumb project={p} />);
    expect(container.querySelector('[data-fallback="gradient"]')).toBeTruthy();
  });

  it('gradient fallback vẫn có nhãn cho screen reader', () => {
    const p = { ...byslug('reversi-mcts'), shot: undefined };
    render(<ProjectThumb project={p} />);
    expect(screen.getByLabelText(new RegExp(p.title, 'i'))).toBeTruthy();
  });
});
```

- [ ] **Step 3: Chạy, phải FAIL**

Run: `npx vitest run src/lib/__tests__/gradient.test.ts src/components`
Expected: FAIL.

- [ ] **Step 4: Viết tokens.css**

Bộ biến cho mỗi theme, khai báo dưới `[data-theme="..."]`:

```
--bg --surface --surface-2 --ink --ink-muted --line --accent --accent-ink
--radius --shadow --font-display --font-body --font-mono
```

`base.css` map sang Tailwind utility:

```css
@import 'tailwindcss';
@import './tokens.css';

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-ink: var(--ink);
  --color-muted: var(--ink-muted);
  --color-line: var(--line);
  --color-accent: var(--accent);
  --color-accent-ink: var(--accent-ink);
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --font-mono: var(--font-mono);
}
```

Nhờ vậy `bg-surface text-ink border-line` đổi nghĩa theo theme mà không phải viết lại class.

- [ ] **Step 5: Viết gradient.ts, ProjectThumb.tsx, ThemeSwitcher.tsx, LangSwitcher.tsx**

`ThemeSwitcher` là nút mở popover liệt kê 4 theme kèm swatch + hint; `onMouseEnter`/`onFocus` gọi
`preload(id)`. Chỉ dùng token class, không màu cứng, để nó hoà vào theme nào cũng được.

- [ ] **Step 6: Chạy test, phải PASS**

Run: `npx vitest run src/lib src/components`
Expected: 7 passed.

- [ ] **Step 7: Commit**

```bash
git add src/styles src/lib src/components
git commit -m "feat(ui): token CSS theo theme, thumbnail có fallback gradient, switcher theme/ngôn ngữ

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 9: Theme Editorial — 6 khối nội dung

**Files:**
- Create: `src/themes/editorial/index.ts`, `Shell.tsx`, `Identity.tsx`, `Stats.tsx`, `Catalog.tsx`, `ProjectDetail.tsx`, `Story.tsx`, `Contact.tsx`, `editorial.css`
- Modify: `src/App.tsx` (Suspense + render Shell của theme đang bật)
- Test: `src/themes/__tests__/contract.test.tsx`, `src/themes/editorial/__tests__/editorial.test.tsx`

**Interfaces:**
- Consumes: mọi hook ở Task 5–7, `ProjectThumb`, `ThemeSwitcher`, `LangSwitcher`
- Produces: `export default editorialTheme satisfies Theme`

**Hướng thiết kế:** nền `#fbfaf8`, mực `#14110f`, accent lấy từ category. Chữ tiêu đề dùng một serif
hiển thị cỡ lớn (clamp 2.5rem–6rem), thân dùng system sans. Lưới 12 cột, nội dung tối đa 1200px.
Danh sách project là **hàng đánh số** (`01`, `02`…) gồm tên, tagline, tag công nghệ, số sao — hover
thì hiện thumbnail nổi bám theo con trỏ. Trên mobile hàng xếp dọc, thumbnail hiện luôn trong hàng.
Nhóm theo category, mỗi nhóm có tiêu đề dính (`position: sticky`).

- [ ] **Step 1: Viết test contract cho toàn bộ registry**

```tsx
// src/themes/__tests__/contract.test.tsx
import { describe, expect, it } from 'vitest';
import { THEME_LOADERS, THEME_META } from '../registry';
import type { ThemeId } from '../contract';

const SECTIONS = ['Identity', 'Stats', 'Catalog', 'ProjectDetail', 'Story', 'Contact'] as const;
const ids = Object.keys(THEME_LOADERS) as ThemeId[];

describe.each(ids)('theme %s', (id) => {
  it('load được và khai báo đúng id của mình', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    expect(theme.meta.id).toBe(id);
    expect(theme.meta).toEqual(THEME_META[id]);
  });

  it('phủ đủ 6 khối nội dung — thiếu khối nào là đổi theme sẽ mất thông tin', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    for (const s of SECTIONS) expect(typeof theme.sections[s]).toBe('function');
  });

  it('có Shell để App render', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    expect(typeof theme.Shell).toBe('function');
  });
});
```

- [ ] **Step 2: Viết test hành vi cho Editorial**

```tsx
// src/themes/editorial/__tests__/editorial.test.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '../../../App';
import editorial from '../index';
import { PROFILE } from '../../../data/profile';

const renderShell = () => render(<AppProviders><editorial.Shell /></AppProviders>);

beforeEach(() => { localStorage.clear(); window.history.replaceState({}, '', '/'); });

describe('Editorial', () => {
  it('hiện tên và headline của chủ trang', () => {
    renderShell();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(PROFILE.name);
  });

  it('liệt kê dự án và gom theo category', () => {
    renderShell();
    expect(screen.getByRole('heading', { name: /games/i })).toBeInTheDocument();
    expect(screen.getAllByRole('article').length).toBeGreaterThan(30);
  });

  it('gõ vào ô tìm kiếm thì danh sách co lại', async () => {
    renderShell();
    const before = screen.getAllByRole('article').length;
    await userEvent.type(screen.getByRole('searchbox'), 'moba');
    expect(screen.getAllByRole('article').length).toBeLessThan(before);
  });

  it('bấm một dự án thì mở chi tiết có link nguồn', async () => {
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: /moba2d/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('link', { name: /github/i })).toHaveAttribute(
      'href', expect.stringContaining('github.com'));
  });

  it('Esc đóng chi tiết', async () => {
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: /moba2d/i }));
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('không tìm thấy gì thì nói rõ chứ không để màn trắng', async () => {
    renderShell();
    await userEvent.type(screen.getByRole('searchbox'), 'zzzzkhongcogi');
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByText(/không tìm thấy|no match/i)).toBeInTheDocument();
  });

  it('ẩn phần kinh nghiệm khi chưa điền, thay vì hiện tiêu đề rỗng', () => {
    renderShell();
    if (PROFILE.experience.length === 0) {
      expect(screen.queryByRole('heading', { name: /kinh nghiệm|experience/i })).toBeNull();
    }
  });
});
```

- [ ] **Step 3: Chạy, phải FAIL**

Run: `npx vitest run src/themes`
Expected: FAIL.

- [ ] **Step 4: Viết 6 section + Shell + editorial.css**

Yêu cầu bắt buộc:
- Card project là `<article>`, tiêu đề bấm được là `<button>` (mở detail), có `aria-label` chứa tên.
- Ô tìm kiếm là `<input type="search">`.
- Detail là `role="dialog"` `aria-modal="true"`, khoá scroll nền, trả focus về nút đã mở nó khi đóng.
- Section `Story` và `Contact` tự ẩn khi dữ liệu tương ứng rỗng.
- Thumbnail hover chỉ bật khi `(hover: hover)` và không `prefers-reduced-motion`.

- [ ] **Step 5: Cập nhật App.tsx render Shell theo theme đang bật**

`<Suspense fallback={<ThemeSkeleton/>}>` bọc component lazy lấy từ `THEME_LOADERS[themeId]`.

- [ ] **Step 6: Chạy test, phải PASS**

Run: `npm test`
Expected: tất cả xanh, kể cả contract test cho 4 theme (3 theme kia vẫn là bản tối thiểu).

- [ ] **Step 7: Xem thật trên trình duyệt**

Run: `npm run dev`
Kiểm tay: filter, search, mở/đóng detail, đổi ngôn ngữ, thu nhỏ cửa sổ xuống 375px.

- [ ] **Step 8: Commit**

```bash
git add src/themes src/App.tsx
git commit -m "feat(editorial): theme mặc định với đủ 6 khối nội dung

Danh sách project dạng hàng đánh số, hover hiện thumbnail bám con trỏ.

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 10: In CV từ theme Editorial

**Files:**
- Create: `src/themes/editorial/print.css`
- Modify: `src/themes/editorial/Shell.tsx`
- Test: `src/themes/editorial/__tests__/print.test.ts`

**Interfaces:**
- Consumes: `editorial.css`
- Produces: không có API mới; chỉ thêm `@media print`

- [ ] **Step 1: Viết test**

```ts
// src/themes/editorial/__tests__/print.test.ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/themes/editorial/print.css', 'utf8');

describe('CSS in ấn', () => {
  it('có khối @media print', () => {
    expect(css).toMatch(/@media\s+print/);
  });
  it('ẩn phần điều hướng và điều khiển khi in', () => {
    expect(css).toContain('data-print="hide"');
  });
  it('hiện URL sau mỗi link ngoài để bản in vẫn tra được', () => {
    expect(css).toMatch(/content:\s*['"]\s*\(?['"]\s*attr\(href\)/);
  });
  it('đặt khổ giấy và lề', () => {
    expect(css).toMatch(/@page/);
  });
});
```

- [ ] **Step 2: Chạy, phải FAIL**

Run: `npx vitest run src/themes/editorial/__tests__/print.test.ts`
Expected: FAIL — thiếu file.

- [ ] **Step 3: Viết print.css**

- Gắn `data-print="hide"` lên header nav, theme switcher, lang switcher, thumbnail, nút filter.
- `@page { size: A4; margin: 14mm; }`
- Ép 1 cột, bỏ shadow/nền màu, đổi màu chữ về đen.
- `a[href^="http"]::after { content: ' (' attr(href) ')'; font-size: 9pt; color: #555; }`
- `.project-row { break-inside: avoid; }`
- Chỉ in các dự án `featured` + đang được lọc, để bản in không dài 8 trang.

- [ ] **Step 4: Thêm nút "In / Lưu PDF" vào Contact section, chạy test**

Run: `npx vitest run src/themes/editorial`
Expected: PASS.

- [ ] **Step 5: Kiểm bằng mắt**

`npm run dev`, Ctrl+P, xem preview — phải gọn trong 2 trang, không có nút bấm nào lọt vào.

- [ ] **Step 6: Commit**

```bash
git add src/themes/editorial
git commit -m "feat(editorial): Ctrl+P ra CV 2 trang sạch, khỏi cần file PDF riêng

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 11: Workflow deploy + sync

**Files:**
- Create: `.github/workflows/deploy.yml`, `.github/workflows/sync-github.yml`
- Test: `src/__tests__/workflows.test.ts`

**Interfaces:**
- Consumes: `npm run build`, `npm run sync`
- Produces: site chạy thật ở https://hoangtran99.is-a.dev/

- [ ] **Step 1: Viết test**

```ts
// src/__tests__/workflows.test.ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('workflow deploy', () => {
  const y = readFileSync('.github/workflows/deploy.yml', 'utf8');
  it('chạy khi push lên master', () => expect(y).toMatch(/branches:\s*\[?\s*master/));
  it('xin đủ quyền cho Pages', () => {
    expect(y).toContain('pages: write');
    expect(y).toContain('id-token: write');
  });
  it('deploy thư mục dist', () => expect(y).toContain("path: './dist'"));
});

describe('workflow sync', () => {
  const y = readFileSync('.github/workflows/sync-github.yml', 'utf8');
  it('chạy theo lịch và bấm tay được', () => {
    expect(y).toContain('schedule:');
    expect(y).toContain('workflow_dispatch:');
  });
  it('có quyền ghi để commit kết quả sync', () => expect(y).toContain('contents: write'));
});
```

- [ ] **Step 2: Chạy, phải FAIL**

Run: `npx vitest run src/__tests__/workflows.test.ts`
Expected: FAIL — thiếu file.

- [ ] **Step 3: Viết deploy.yml**

`actions/checkout@v4` → `actions/setup-node@v4` (node 20, cache npm) → `npm ci` → `npm run build`
→ `actions/configure-pages@v5` → `actions/upload-pages-artifact@v3` với `path: './dist'`
→ job `deploy` dùng `actions/deploy-pages@v4`. `concurrency: group: pages, cancel-in-progress: false`.

- [ ] **Step 4: Viết sync-github.yml**

`schedule: - cron: '0 0 * * *'` + `workflow_dispatch`. Chạy `npm ci && npm run sync`, rồi
`git diff --quiet || (git config user.name/email; git commit -am 'chore: sync số liệu GitHub'; git push)`.

- [ ] **Step 5: Chạy test, phải PASS**

Run: `npm test`
Expected: tất cả xanh.

- [ ] **Step 6: Commit và push, theo dõi workflow**

```bash
git add .github
git commit -m "ci: build và deploy lên GitHub Pages, sync số liệu GitHub hằng ngày

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
git push origin master
gh run watch
```

- [ ] **Step 7: Đổi Pages source sang GitHub Actions — làm SAU khi workflow xanh**

```bash
gh api -X PUT repos/HoangTran0410/HoangTran0410.github.io/pages \
  -f build_type=workflow
curl -sI https://hoangtran99.is-a.dev/ | head -1   # phải 200
```

Nếu domain đứt: `gh api -X PUT .../pages -f cname=hoangtran99.is-a.dev` để đặt lại.

---

## Phase 2 — Ba theme còn lại

### Task 12: Theme Arcade

**Files:**
- Create: `src/themes/arcade/` (index.ts, Shell.tsx, 6 section, arcade.css, HeroCanvas.tsx)
- Test: `src/themes/arcade/__tests__/arcade.test.tsx`

**Interfaces:**
- Consumes: cùng bộ hook như Editorial
- Produces: `export default arcadeTheme satisfies Theme`

**Hướng thiết kế:** nền `#08070c`, mực `#f2eefb`, accent tím `#7c3aed` pha màu category. Card project
là lưới, hover nghiêng 3D theo con trỏ (`rotateX/rotateY` ±8°) kèm viền glow màu category. Số liệu
đếm tăng dần khi vào viewport. `HeroCanvas` vẽ lưới điểm chuyển động nhẹ, **tự tắt** khi
`prefers-reduced-motion: reduce` hoặc màn < 640px hoặc tab ẩn.

- [ ] **Step 1: Viết test**

Lặp lại đủ bộ test hành vi như Editorial (tên, danh sách, search co lại, mở/đóng detail, Esc,
trạng thái rỗng), cộng thêm:

```tsx
it('tắt hiệu ứng nghiêng khi người dùng yêu cầu giảm chuyển động', () => {
  window.matchMedia = ((q: string) => ({
    matches: q.includes('prefers-reduced-motion'), media: q,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
    onchange: null, dispatchEvent: () => false,
  })) as never;
  const { container } = render(<AppProviders><arcade.Shell /></AppProviders>);
  expect(container.querySelector('[data-tilt="on"]')).toBeNull();
});

it('không dựng canvas hero khi giảm chuyển động', () => {
  // matchMedia như trên
  const { container } = render(<AppProviders><arcade.Shell /></AppProviders>);
  expect(container.querySelector('canvas')).toBeNull();
});
```

- [ ] **Step 2: Chạy, phải FAIL** — Run: `npx vitest run src/themes/arcade`
- [ ] **Step 3: Viết theme**
- [ ] **Step 4: Chạy test, phải PASS** — Run: `npm test`
- [ ] **Step 5: Xem thật, đổi qua lại Editorial ↔ Arcade, xác nhận filter không mất**
- [ ] **Step 6: Commit**

```bash
git add src/themes/arcade
git commit -m "feat(arcade): theme tối neon với card nghiêng 3D và canvas hero

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 13: Theme Bento

**Files:**
- Create: `src/themes/bento/` (index.ts, Shell.tsx, 6 section, bento.css, tiles/)
- Test: `src/themes/bento/__tests__/bento.test.tsx`

**Interfaces:** như Task 12.

**Hướng thiết kế:** nền `#f4f4f5`, ô `#ffffff` bo 20px, viền mảnh. Ô lớn 2×2 cho `featured` có ảnh;
ô 2×1 cho stats; ô 1×1 cho project thường. Desktop `grid-template-columns: repeat(4, 1fr)`,
tablet 2 cột, mobile 1 cột xếp theo ưu tiên (featured → stats → còn lại). Ô identity luôn ở góc trên
trái. Hover ô thì nhấc lên nhẹ.

- [ ] **Step 1: Viết test** — bộ test hành vi chuẩn, cộng:

```tsx
it('mọi dự án featured đều được một ô lớn', () => {
  const { container } = render(<AppProviders><bento.Shell /></AppProviders>);
  const featured = getProjects().filter((p) => p.featured).length;
  expect(container.querySelectorAll('[data-tile="lg"]')).toHaveLength(featured);
});

it('lọc còn ít dự án thì lưới không để lại ô trống', () => {
  // đặt category = 'archive', khẳng định số ô = số project + số ô cố định
});
```

- [ ] **Step 2: Chạy, phải FAIL** — Run: `npx vitest run src/themes/bento`
- [ ] **Step 3: Viết theme**
- [ ] **Step 4: Chạy test, phải PASS** — Run: `npm test`
- [ ] **Step 5: Kiểm ở 375px / 768px / 1440px**
- [ ] **Step 6: Commit**

```bash
git add src/themes/bento
git commit -m "feat(bento): lưới ô to nhỏ, featured chiếm ô lớn, mobile xếp theo ưu tiên

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 14: Theme Terminal

**Files:**
- Create: `src/themes/terminal/` (index.ts, Shell.tsx, 6 section, terminal.css, commands.ts, useTerminal.ts)
- Test: `src/themes/terminal/__tests__/commands.test.ts`, `src/themes/terminal/__tests__/terminal.test.tsx`

**Interfaces:**
- Produces: `runCommand(input: string, ctx: CommandContext): CommandResult`
  - `interface CommandContext { projects: Project[]; profile: Profile; locale: Locale; setTheme(id: ThemeId): void; setLocale(l: Locale): void; open(slug: string): void; clear(): void }`
  - `type CommandResult = { kind: 'text'; lines: string[] } | { kind: 'projects'; items: Project[] } | { kind: 'project'; item: Project } | { kind: 'profile' } | { kind: 'skills' } | { kind: 'contact' } | { kind: 'noop' } | { kind: 'error'; message: string }`

**Lệnh:** `help`, `ls [category]`, `cat <slug>`, `open <slug>`, `whoami`, `skills`, `contact`,
`theme <id>`, `lang <vi|en>`, `clear`.

- [ ] **Step 1: Viết test cho bộ lệnh (test thuần, không React)**

```ts
// src/themes/terminal/__tests__/commands.test.ts
import { describe, expect, it, vi } from 'vitest';
import { runCommand } from '../commands';
import { getProjects } from '../../../lib/merge';
import { PROFILE } from '../../../data/profile';

const ctx = () => ({
  projects: getProjects(), profile: PROFILE, locale: 'vi' as const,
  setTheme: vi.fn(), setLocale: vi.fn(), open: vi.fn(), clear: vi.fn(),
});

describe('runCommand', () => {
  it('help liệt kê mọi lệnh hỗ trợ', () => {
    const r = runCommand('help', ctx());
    expect(r.kind).toBe('text');
    for (const cmd of ['ls', 'cat', 'open', 'whoami', 'skills', 'contact', 'theme', 'lang', 'clear']) {
      expect((r as { lines: string[] }).lines.join('\n')).toContain(cmd);
    }
  });

  it('ls không tham số trả về mọi dự án', () => {
    const r = runCommand('ls', ctx());
    expect(r).toMatchObject({ kind: 'projects' });
    expect((r as { items: unknown[] }).items).toHaveLength(getProjects().length);
  });

  it('ls games chỉ trả về game', () => {
    const r = runCommand('ls games', ctx()) as { items: { category: string }[] };
    expect(r.items.length).toBeGreaterThan(0);
    for (const p of r.items) expect(p.category).toBe('games');
  });

  it('ls với category không tồn tại báo lỗi có ích', () => {
    const r = runCommand('ls khongcogi', ctx());
    expect(r.kind).toBe('error');
    expect((r as { message: string }).message).toMatch(/games/);
  });

  it('cat <slug> trả về đúng dự án', () => {
    const r = runCommand('cat moba2d', ctx()) as { item: { slug: string } };
    expect(r.item.slug).toBe('moba2d');
  });

  it('cat slug sai thì gợi ý slug gần đúng', () => {
    const r = runCommand('cat moba', ctx());
    expect(r.kind).toBe('error');
    expect((r as { message: string }).message).toContain('moba2d');
  });

  it('theme arcade gọi setTheme', () => {
    const c = ctx();
    runCommand('theme arcade', c);
    expect(c.setTheme).toHaveBeenCalledWith('arcade');
  });

  it('theme với id bậy thì không gọi setTheme', () => {
    const c = ctx();
    expect(runCommand('theme bay-ba', c).kind).toBe('error');
    expect(c.setTheme).not.toHaveBeenCalled();
  });

  it('lang en gọi setLocale', () => {
    const c = ctx();
    runCommand('lang en', c);
    expect(c.setLocale).toHaveBeenCalledWith('en');
  });

  it('lệnh không tồn tại báo lỗi và mách dùng help', () => {
    const r = runCommand('sudo rm -rf /', ctx());
    expect(r.kind).toBe('error');
    expect((r as { message: string }).message).toMatch(/help/);
  });

  it('bỏ qua khoảng trắng thừa và không phân biệt hoa thường', () => {
    expect(runCommand('   LS   GAMES  ', ctx()).kind).toBe('projects');
  });

  it('chuỗi rỗng không làm gì', () => {
    expect(runCommand('   ', ctx()).kind).toBe('noop');
  });
});
```

- [ ] **Step 2: Viết test UI terminal**

```tsx
it('mở lên đã có sẵn output chứ không phải màn hình trống', () => { /* whoami + ls chạy sẵn */ });
it('gõ lệnh rồi Enter thì hiện kết quả', async () => { /* userEvent.type + {Enter} */ });
it('mũi tên lên lấy lại lệnh vừa gõ', async () => { /* history */ });
it('Tab gợi ý hoàn thành tên lệnh', async () => { /* autocomplete */ });
it('clear xoá sạch output', async () => {});
it('mobile có hàng nút gợi ý lệnh để khỏi phải gõ', () => {});
```

- [ ] **Step 3: Chạy, phải FAIL** — Run: `npx vitest run src/themes/terminal`
- [ ] **Step 4: Viết commands.ts (thuần, dễ test) rồi mới đến UI**

Gợi ý slug gần đúng: khoảng cách Levenshtein ≤ 3 hoặc slug chứa chuỗi nhập vào.

- [ ] **Step 5: Chạy test, phải PASS** — Run: `npm test`
- [ ] **Step 6: Kiểm thật trên mobile (DevTools 375px): input dính đáy, bàn phím không che output**
- [ ] **Step 7: Commit**

```bash
git add src/themes/terminal
git commit -m "feat(terminal): duyệt portfolio bằng dòng lệnh, có history và autocomplete

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

## Phase 3 — Hoàn thiện

### Task 15: Script chụp ảnh thật

**Files:**
- Create: `scripts/shots.mjs`, `public/shots/.gitkeep`
- Modify: `package.json`, `README.md`

**Interfaces:**
- Consumes: `PROJECTS` (đọc `links.demo`)
- Produces: `public/shots/<slug>.webp`

- [ ] **Step 1: Cài Playwright là devDependency**

```bash
npm i -D playwright sharp && npx playwright install chromium
```

- [ ] **Step 2: Viết scripts/shots.mjs**

- Duyệt `PROJECTS` lấy mục có `links.demo`.
- Chromium headless, viewport 1280×800, `deviceScaleFactor: 2`.
- `page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })`, chờ thêm 1500ms.
- Chụp, `sharp` resize 1280w chất lượng 80 → `public/shots/<slug>.webp`.
- Mặc định bỏ qua slug đã có ảnh; `--force` ghi đè; `--only=<slug>` chỉ chụp một cái.
- URL lỗi: in cảnh báo, đi tiếp, cuối cùng in danh sách thất bại. Không exit khác 0.
- In kích thước từng file, cảnh báo cái nào > 150KB.

- [ ] **Step 3: Chạy thật**

Run: `npm run shots`
Expected: ~25 ảnh trong `public/shots/`, mỗi ảnh < 150KB.

- [ ] **Step 4: Xem lại từng ảnh, xoá cái nào xấu (trang lỗi, cookie banner che hết)**

Ảnh bị xoá thì `ProjectThumb` tự rơi về gradient — không cần sửa code.

- [ ] **Step 5: Ghi cách dùng vào README**
- [ ] **Step 6: Commit**

```bash
git add public/shots scripts/shots.mjs package.json README.md
git commit -m "feat: script chụp ảnh demo thật bằng Playwright

Ảnh commit vào repo; thiếu ảnh thì thumbnail tự rơi về gradient.

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
```

---

### Task 16: SEO, ảnh chia sẻ, favicon, kiểm tra cuối

**Files:**
- Modify: `index.html`
- Create: `public/og.png`, `public/favicon.svg`, `public/robots.txt`, `src/components/Head.tsx`
- Test: `src/__tests__/seo.test.ts`

**Interfaces:**
- Produces: thẻ meta đầy đủ, JSON-LD `Person`

- [ ] **Step 1: Viết test**

```ts
// src/__tests__/seo.test.ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync('index.html', 'utf8');

describe('SEO', () => {
  it('có title và description', () => {
    expect(html).toMatch(/<title>.+<\/title>/);
    expect(html).toMatch(/name="description"\s+content=".{40,}"/);
  });
  it('có thẻ Open Graph để chia sẻ lên Facebook đẹp', () => {
    for (const p of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']) {
      expect(html).toContain(`property="${p}"`);
    }
  });
  it('có thẻ Twitter card', () => expect(html).toContain('twitter:card'));
  it('og:image là URL tuyệt đối vì mạng xã hội không hiểu đường dẫn tương đối', () => {
    expect(html).toMatch(/property="og:image"\s+content="https:\/\//);
  });
  it('có JSON-LD kiểu Person', () => {
    expect(html).toContain('"@type": "Person"');
  });
  it('có canonical trỏ về domain chính', () => {
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('https://hoangtran99.is-a.dev/');
  });
  it('khai báo màu theme cho thanh địa chỉ trên mobile', () => {
    expect(html).toContain('name="theme-color"');
  });
});
```

- [ ] **Step 2: Chạy, phải FAIL** — Run: `npx vitest run src/__tests__/seo.test.ts`
- [ ] **Step 3: Viết meta vào index.html, tạo og.png (1200×630) và favicon.svg**
- [ ] **Step 4: Chạy test, phải PASS** — Run: `npm test`
- [ ] **Step 5: Đo Lighthouse**

```bash
npm run build && npx serve dist -l 4173 &
npx lighthouse http://localhost:4173 --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless"
```

Ngưỡng: performance ≥ 90, accessibility ≥ 95, SEO ≥ 95. Chưa đạt thì sửa rồi đo lại.

- [ ] **Step 6: Kiểm tay lần cuối**

- Bốn theme × hai ngôn ngữ × ba bề rộng (375, 768, 1440).
- Đổi theme khi đang lọc + đang mở detail → không mất gì.
- Điều hướng chỉ bằng bàn phím xuyên suốt một theme.
- Bấm Back sau khi mở detail → đóng detail, không thoát trang.

- [ ] **Step 7: Commit và push**

```bash
git add index.html public src
git commit -m "feat: SEO, ảnh Open Graph, favicon và JSON-LD Person

Claude-Session: https://claude.ai/code/session_01FyHsKsiy4Zvzag3FtGPyC5"
git push origin master
```

---

## Self-review

**Phủ spec:** mục 3 kiến trúc → Task 7,8; mục 4 data → Task 2,3,4; mục 5 logic → Task 5,6,7;
mục 6 bốn theme → Task 9,10,12,13,14; mục 7 thumbnail → Task 8,15; mục 8 sync → Task 4,11;
mục 9 stack → Task 1; mục 10 test → rải khắp; mục 11 thứ tự → cấu trúc phase; mục 12 rủi ro →
Task 1 (CNAME test), Task 11 Step 7 (đổi Pages source sau khi xanh), Task 12/13 (reduced-motion),
Task 14 Step 6 (terminal trên mobile), Task 15 (ngân sách ảnh).

**Nhất quán tên:** `getProjects`, `computeStats`, `normalize`, `gradientFor`, `runCommand`,
`THEME_META`, `THEME_LOADERS`, `DEFAULT_THEME`, `AppProviders`, `categoryMeta` — dùng thống nhất
từ chỗ định nghĩa đến chỗ tiêu thụ.
