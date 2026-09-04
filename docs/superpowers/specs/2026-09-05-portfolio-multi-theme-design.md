# Portfolio đa-theme — Design

**Ngày:** 2026-09-05
**Repo:** `HoangTran0410/HoangTran0410.github.io` (trước đây tên `portfolio`)
**Domain:** https://hoangtran99.is-a.dev/ (CNAME trong repo) và https://hoangtran0410.github.io/

## 1. Mục tiêu

Một trang duy nhất vừa là **CV** vừa là **portfolio sản phẩm**, gom toàn bộ dự án đáng khoe của
Hoang Tran (cá nhân + 5 organization), chia theo category, chạy tốt trên cả desktop lẫn mobile.

Điểm khác biệt: **4 theme render hoàn toàn khác nhau, đổi ngay trên web**, dùng chung một bộ dữ liệu.
Đây là tính năng chính chứ không phải trang trí — nó vừa cho người xem chọn cách đọc hợp gu, vừa tự nó
là một demo kỹ thuật.

### Không làm (YAGNI)
- Không backend, không database, không auth, không CMS.
- Không blog (đã có blog.fbaio.org riêng).
- Không dark/light toggle độc lập — mỗi theme tự quyết định bảng màu của nó.
- Không i18n framework nặng (i18next…); một hook `useI18n` tự viết là đủ cho 2 ngôn ngữ.

## 2. Ràng buộc

- **Phải giữ `public/CNAME` = `hoangtran99.is-a.dev`.** Mất file này là mất domain.
- **Default branch giữ nguyên `master`** (không đổi `main`) — GitHub Pages đang trỏ vào đó.
- Các repo project pages khác (`/ifocus`, `/documorph`, `/github-osint`…) là repo riêng, phục vụ ở
  `hoangtran99.is-a.dev/<repo>/`. Thay repo này **không** ảnh hưởng chúng.
- Code vCard cũ đã được bảo toàn ở nhánh `vcard-template`.
- Khách vào web không được gọi GitHub API (rate limit 60 req/h cho IP chưa auth).

## 3. Kiến trúc

Bốn tầng, phụ thuộc một chiều từ trên xuống:

```
1. data      thuần TypeScript, 0 React
             profile.ts · projects.ts · categories.ts · github.generated.json

2. logic     headless hooks, không biết gì về giao diện
             useI18n · useCatalog · useTheme · useProjectDetail

3. themes    4 renderer độc lập, mỗi cái tự viết JSX
             editorial/ · arcade/ · bento/ · terminal/

   primitives (dùng chung, style theo token của theme đang bật)
             ProjectThumb · Motion helpers · token CSS var theo [data-theme]
```

**Nguyên tắc bất biến:** tầng 1 và 2 không được import bất cứ thứ gì từ tầng 3. Một theme bị xoá đi
thì phần còn lại của app vẫn build được.

### 3.1 Vì sao chọn cách này

Ba hướng đã cân nhắc:

- **CSS-only theming** (một cây React, 4 bộ token): rẻ nhất nhưng Terminal và Bento khác nhau về *cấu
  trúc* chứ không chỉ màu sắc. Không đáp ứng được yêu cầu.
- **Slot-based template** (khung section cố định, theme điền renderer từng section): trung dung, nhưng
  ép Terminal vào khung section thì Terminal mất chất — nó vốn là dòng lệnh nối tiếp, không phải các khối.
- **Theme = component đầy đủ trên hook headless** ← **đã chọn.** Presentation nhân 4 nhưng presentation
  là phần rẻ; logic chỉ viết một lần nên 4 theme không bao giờ lệch hành vi.

Mượn kỷ luật của hướng slot-based: một interface TS bắt mỗi theme phủ đủ 6 khối nội dung, thiếu là
compile error.

### 3.2 ThemeContract

```ts
// src/themes/contract.ts
export type ThemeId = 'editorial' | 'arcade' | 'bento' | 'terminal';

export interface ThemeMeta {
  id: ThemeId;
  /** Tên hiển thị trên nút đổi theme */
  label: { vi: string; en: string };
  /** Mô tả một dòng, hiện khi hover */
  hint: { vi: string; en: string };
  /** Màu đại diện cho nút chọn theme */
  swatch: string;
  /** true nếu theme này nền tối — dùng để set <meta name="theme-color"> */
  dark: boolean;
}

/**
 * Mỗi theme phải phủ đủ 6 khối nội dung. Theme được tự do sắp xếp, gộp, hay
 * biến đổi hình thức (Terminal biến chúng thành output của lệnh), nhưng không
 * được bỏ khối nào — nếu bỏ thì đổi theme sẽ mất thông tin.
 */
export interface ThemeSections {
  Identity: React.ComponentType;    // tên, bio, avatar, social
  Stats: React.ComponentType;       // số liệu GitHub tổng hợp
  Catalog: React.ComponentType;     // filter + search + danh sách project
  ProjectDetail: React.ComponentType; // chi tiết 1 project (modal/panel/output)
  Story: React.ComponentType;       // experience, education, skills
  Contact: React.ComponentType;     // liên hệ + footer
}

export interface Theme {
  meta: ThemeMeta;
  /** Component gốc, tự bố cục các section theo ý mình */
  Shell: React.ComponentType;
  sections: ThemeSections;
}
```

Registry ở `src/themes/index.ts` map `ThemeId → () => Promise<Theme>` (lazy).

## 4. Tầng data

### 4.1 `src/data/types.ts`

```ts
export type Locale = 'vi' | 'en';
export type L10n = Record<Locale, string>;

export type CategoryId =
  | 'products' | 'games' | 'extensions' | 'devtools'
  | 'osint' | 'creative' | 'archive';

export interface Category {
  id: CategoryId;
  label: L10n;
  /** Câu mô tả ngắn hiện ở đầu nhóm */
  blurb: L10n;
  /** Màu accent, dùng cho gradient thumbnail fallback và badge */
  accent: string;
  /** Tên icon (lucide-react) */
  icon: string;
  /** Thứ tự hiển thị, nhỏ ra trước */
  order: number;
}

export type ProjectStatus = 'active' | 'maintained' | 'archived';

/** Dữ liệu curated — viết tay, là nguồn sự thật về nội dung */
export interface CuratedProject {
  slug: string;                 // định danh trong URL: ?p=moba2d
  repo?: string;                // "owner/name"; bỏ trống nếu không có repo public
  title: string;                // tên hiển thị, không dịch
  tagline: L10n;                // 1 câu ngắn, ≤ 70 ký tự
  blurb: L10n;                  // 2-4 câu, hiện trong chi tiết
  category: CategoryId;
  tags: string[];               // tech stack: "React", "TypeScript", "p5.js"…
  links: {
    demo?: string;
    repo?: string;              // tự suy ra từ `repo` nếu bỏ trống
    more?: string;              // bài viết, video, post giới thiệu
  };
  featured?: boolean;           // được ưu tiên ô lớn ở Bento, lên đầu ở các theme khác
  year: number;                 // năm bắt đầu, dùng để sort và hiện timeline
  status: ProjectStatus;
  /** Ghi đè ảnh thumbnail; mặc định tìm public/shots/<slug>.webp */
  shot?: string;
}

/** Dữ liệu sync tự động từ GitHub API — KHÔNG sửa tay, CI ghi đè */
export interface GithubStats {
  repo: string;
  stars: number;
  forks: number;
  language: string | null;
  pushedAt: string;             // ISO date
  topics: string[];
  archived: boolean;
  /** false nếu lần sync gần nhất gọi API repo này bị lỗi; dữ liệu bên trên là của lần sync cũ */
  ok: boolean;
}

/** Model runtime sau khi merge, đây là thứ các theme nhận được */
export interface Project extends CuratedProject {
  stats?: GithubStats;
  categoryMeta: Category;       // đã resolve sẵn, khỏi lookup lại trong lúc render
}
```

### 4.2 `src/data/profile.ts`

Chứa identity + bio + social + skills + timeline experience/education.

Phần **experience** và **education** dựng sẵn khung với comment tiếng Việt hướng dẫn, điền sẵn mục
MoMo (M_Service) lấy từ GitHub profile công khai. Chủ repo sửa lại sau.

Số liệu tổng hợp (tổng sao, số followers, số năm code, số dự án) **tính từ dữ liệu**, không hardcode
— hardcode là sẽ cũ.

### 4.3 `src/data/projects.ts`

Mảng `CuratedProject[]`, ~40 mục, 7 category. Nội dung khởi tạo dựa trên khảo sát toàn bộ 206 repo
public. Chủ repo sẽ chỉnh sau — file này được thiết kế để đọc và sửa dễ, mỗi mục là một object phẳng.

**Lưu ý quan trọng:** 4 dự án thật của chủ repo nằm trong repo GitHub đánh dấu `fork=true`
(`chronoatlas`, `jsdeob-workbench`, `chatgpt-local-coder`, `FckSignups`). Mọi cách lọc tự động theo
`fork === false` đều bỏ sót chúng. Đây là lý do dùng danh sách curated thay vì quét máy móc.

### 4.4 `src/data/github.generated.json`

`Record<string, GithubStats>` khoá theo `"owner/name"`. Do CI ghi. Commit vào repo. Nếu file thiếu
hoặc một repo thiếu entry, app vẫn chạy — chỗ hiện sao chỉ đơn giản là không hiện.

## 5. Tầng logic

### 5.1 `useI18n`
- Locale mặc định: `navigator.language` bắt đầu bằng `vi` → `vi`, còn lại `en`.
- Ghi đè bằng `localStorage['locale']`, và bằng query param `?lang=vi`.
- Cung cấp `t(key)` cho chuỗi UI (bảng chuỗi ở `src/i18n/strings.ts`) và `ti(l10n)` cho dữ liệu.
- Set `<html lang>` theo locale.

### 5.2 `useCatalog`
Nguồn sự thật duy nhất cho việc lọc, để 4 theme hành xử giống hệt nhau:
- state: `query` (search), `category` (`CategoryId | 'all'`), `sort` (`featured | stars | recent | name`)
- derived: `projects` (đã lọc + sắp), `counts` (số project mỗi category, để hiện badge)
- search khớp trên: title, tagline (cả 2 ngôn ngữ), tags, tên repo. Không phân biệt hoa thường,
  bỏ dấu tiếng Việt (`String.prototype.normalize('NFD')` + strip diacritics) để gõ "the thao" ra "thể thao".
- Đồng bộ 2 chiều với query param (`?q=`, `?cat=`, `?sort=`) để share được link đã lọc.

### 5.3 `useTheme`
- Thứ tự ưu tiên: `?theme=` → `localStorage['theme']` → `'editorial'`.
- Set `document.documentElement.dataset.theme`, và `<meta name="theme-color">` theo `meta.dark`.
- Đổi theme **không được reset** state của `useCatalog`, `useI18n`, `useProjectDetail` — tất cả state
  này nằm ở tầng trên theme nên điều đó là mặc định. Đây là hành vi bắt buộc, phải có test.
- Preload: hover/focus vào một lựa chọn trong theme switcher thì gọi trước hàm lazy import.

### 5.4 `useProjectDetail`
- Project đang mở lưu ở query param `?p=<slug>`. Deep-link được, back button hoạt động đúng.
- `open(slug)`, `close()`, `next()`, `prev()` (đi trong danh sách đã lọc hiện tại).
- Phím tắt: `Esc` đóng, `←`/`→` chuyển. Chỉ gắn khi có project đang mở.

## 6. Bốn theme

Tất cả đều: responsive (mobile-first, breakpoint ở 640/1024/1440), tôn trọng
`prefers-reduced-motion`, và có nút đổi theme + đổi ngôn ngữ.

### 6.1 Editorial (mặc định)
Nền sáng, typography lớn, lưới Swiss, nhiều khoảng trắng. Danh sách project dạng hàng đánh số có
ảnh hiện khi hover. Hướng tới người đọc lâu, đọc kỹ.

**Riêng theme này có `@media print`**: ẩn nav/switcher/thumbnail, đổi sang serif, ép 1 cột, hiện URL
sau mỗi link → Ctrl+P ra CV 2 trang sạch. Khỏi cần maintain file PDF riêng.

### 6.2 Arcade
Nền tối, accent neon, card hover tilt 3D + glow, số liệu đếm tăng dần khi vào viewport. Hero có một
canvas nhẹ (particle/grid), tự tắt khi `prefers-reduced-motion` hoặc màn nhỏ.

### 6.3 Bento
Lưới ô to nhỏ xen kẽ. `featured: true` chiếm ô lớn kèm ảnh; ô nhỏ cho project thường; ô stats xen giữa.
Desktop dùng CSS grid có `grid-template-areas` cố định cho các ô lớn; mobile xếp một cột theo thứ tự
ưu tiên (featured trước).

### 6.4 Terminal
Giả CLI. Lệnh hỗ trợ: `help`, `ls [category]`, `cat <slug>`, `open <slug>`, `whoami`, `skills`,
`contact`, `theme <id>`, `lang <vi|en>`, `clear`. Có autocomplete bằng Tab, history bằng `↑`/`↓`.
Trên mobile: input dính đáy màn hình, kèm hàng nút gợi ý lệnh để không phải gõ.

Vẫn phủ đủ 6 khối: `whoami` → Identity + Stats, `ls`/`cat` → Catalog + ProjectDetail,
`skills` → Story, `contact` → Contact. Chạy sẵn `whoami && ls` lúc mở để không phải đối mặt màn hình trống.

## 7. Thumbnail

`<ProjectThumb project={p} />`:
1. Nếu có `public/shots/<slug>.webp` (hoặc `project.shot`) → `<img loading="lazy">` với width/height
   cố định để không layout shift.
2. Nếu không → gradient tất định sinh từ hash của slug, tông màu lấy từ `category.accent`, phủ icon
   category ở giữa. Cùng một slug luôn ra cùng một gradient.

`scripts/shots.mjs` (Playwright, devDependency, chạy local):
- Duyệt `projects.ts`, lấy các mục có `links.demo`.
- Mở chromium 1280×800, chờ `networkidle` + 1.5s cho animation ổn định, chụp, nén webp
  (1280w và 640w) vào `public/shots/`.
- Cờ: `--only=<slug>` chụp lại một cái, `--force` ghi đè ảnh đã có (mặc định bỏ qua ảnh đã tồn tại).
- Không chạy trong CI — ảnh commit vào repo.

## 8. Sync GitHub

`scripts/sync-github.mjs`:
- Import `projects.ts` (qua `tsx`) để lấy danh sách `repo` cần sync.
- Gọi `GET /repos/{owner}/{name}` cho từng repo, dùng `GITHUB_TOKEN` (5000 req/h).
- Repo lỗi (404, đã xoá, chuyển private): giữ nguyên entry cũ, đặt `ok: false`, in cảnh báo — **không**
  làm fail workflow, vì mất một repo không đáng để hỏng cả lần sync.
- Ghi `src/data/github.generated.json` với key sắp xếp để diff sạch.

`.github/workflows/sync-github.yml`: cron hằng ngày 00:00 UTC + `workflow_dispatch`. Commit khi có
thay đổi, message `chore: sync github stats`.

`.github/workflows/deploy.yml`: push lên `master` → `npm ci && npm run build` → `actions/deploy-pages`.
Cần đổi Pages source trong repo settings từ "branch master" sang "GitHub Actions".

## 9. Stack

- **Vite + React + TypeScript** — nhất quán với các dự án khác của chủ repo.
- **Tailwind CSS v4** — cấu hình CSS-first (`@theme`), map utility sang CSS variable. Mỗi theme override
  bộ biến dưới selector `[data-theme="..."]`, nên `bg-surface text-ink` đổi nghĩa theo theme mà không
  phải viết lại class.
- **motion** (Framer Motion) — animation, có `MotionConfig reducedMotion="user"`.
- **lucide-react** — icon.
- **Vitest + Testing Library** — test tầng logic và contract của theme.
- **Playwright** — chỉ dùng cho script chụp ảnh, không dùng để test.

Code-splitting: mỗi theme một chunk qua `React.lazy`. Editorial nằm trong bundle chính.

## 10. Chiến lược test

Chỉ test những gì dễ vỡ mà mắt không bắt được:
- `useCatalog`: lọc, search bỏ dấu, sort, đồng bộ query param.
- `useI18n`: chọn locale mặc định, thứ tự ưu tiên override.
- `useTheme`: thứ tự ưu tiên, ghi `data-theme`.
- **Đổi theme giữ nguyên state** — render, đặt filter + mở project, đổi theme, khẳng định filter và
  project vẫn nguyên. Đây là bất biến trung tâm của thiết kế.
- **Contract**: với mỗi theme trong registry, khẳng định export đủ 6 section và `meta` hợp lệ.
- Tính toàn vẹn dữ liệu: slug không trùng, `category` tồn tại, `repo` đúng dạng `owner/name`, mọi
  `featured` đều có `links.demo` hoặc `links.repo`.

## 11. Thứ tự triển khai

Bốn giai đoạn, giai đoạn 1 đã ship được:

1. **Nền móng + Editorial** — scaffold, token, data layer, 4 hook, sync workflow, deploy workflow,
   Editorial đầy đủ 6 section, print CV.
2. **Arcade**.
3. **Bento** + **Terminal**.
4. **Hoàn thiện** — chụp ảnh thật, OG image, SEO, kiểm Lighthouse, kiểm tra thật trên mobile.

## 12. Rủi ro

| Rủi ro | Cách xử lý |
|---|---|
| Mất CNAME → mất domain | `public/CNAME` được commit; deploy workflow copy nguyên `public/`; có test khẳng định file tồn tại |
| Đổi Pages source làm site chết một lúc | Đổi sau khi workflow deploy chạy xanh lần đầu |
| 4 theme làm bundle phình | Lazy từng theme; ngân sách: chunk đầu < 200KB gzip |
| Terminal khó dùng trên mobile | Hàng nút gợi ý lệnh + input dính đáy; nếu vẫn tệ thì hiện gợi ý đổi theme |
| Ảnh chụp làm repo nặng | webp, giới hạn 1280w, ngân sách 150KB/ảnh |
