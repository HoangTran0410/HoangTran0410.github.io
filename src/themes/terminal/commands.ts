import { CATEGORIES } from '../../data/categories';
import type { Profile } from '../../data/profile';
import type { CategoryId, L10n, Locale, Project } from '../../data/types';
import type { ThemeId } from '../contract';
import { THEME_IDS, isThemeId } from '../registry';

/** Tham số của `ls` — một nhóm cụ thể, hoặc `all` nghĩa là bỏ lọc. */
export type CategoryArg = CategoryId | 'all';

export interface CommandContext {
  /** Danh sách đầy đủ (getProjects()) — lọc theo query là việc của lúc render. */
  projects: Project[];
  profile: Profile;
  locale: Locale;
  setTheme(id: ThemeId): void;
  setLocale(l: Locale): void;
  open(slug: string): void;
  clear(): void;
}

export type CommandResult =
  | { kind: 'text'; lines: string[] }
  /** `category` để Shell đồng bộ ngược lại useCatalog.setCategory */
  | { kind: 'projects'; items: Project[]; category?: CategoryArg }
  | { kind: 'project'; item: Project }
  /** Mốc nghề nghiệp và dự án gom theo năm — khối tự đọc bộ lọc hiện tại. */
  | { kind: 'timeline' }
  | { kind: 'profile' }
  | { kind: 'skills' }
  | { kind: 'contact' }
  | { kind: 'stats' }
  | { kind: 'noop' }
  | { kind: 'error'; message: string };

/** Kiểu tham số của một lệnh — dùng cho gợi ý khi bấm Tab. */
export type ArgKind = 'category' | 'slug' | 'theme' | 'locale';

export interface CommandSpec {
  name: string;
  /** Cú pháp hiện trong `help` */
  usage: string;
  about: L10n;
  arg?: ArgKind;
}

export const COMMANDS: CommandSpec[] = [
  {
    name: 'help',
    usage: 'help',
    about: { vi: 'danh sách lệnh (chính là cái bạn đang đọc)', en: 'list every command (this list)' },
  },
  {
    name: 'ls',
    usage: 'ls [category]',
    about: { vi: 'liệt kê dự án, kèm nhóm thì lọc theo nhóm', en: 'list projects, optionally by category' },
    arg: 'category',
  },
  {
    name: 'cat',
    usage: 'cat <slug>',
    about: { vi: 'đọc chi tiết một dự án ngay tại đây', en: 'read one project inline' },
    arg: 'slug',
  },
  {
    name: 'open',
    usage: 'open <slug>',
    about: { vi: 'mở dự án trong cửa sổ chi tiết', en: 'open a project in the detail window' },
    arg: 'slug',
  },
  {
    name: 'timeline',
    usage: 'timeline',
    about: {
      vi: 'đọc theo năm: mốc công việc và dự án (alias: log)',
      en: 'read by year: career milestones and projects (alias: log)',
    },
  },
  { name: 'whoami', usage: 'whoami', about: { vi: 'chủ trang này là ai', en: 'who runs this place' } },
  { name: 'stats', usage: 'stats', about: { vi: 'số liệu tổng hợp: sao, fork, số năm', en: 'totals: stars, forks, years' } },
  { name: 'skills', usage: 'skills', about: { vi: 'kinh nghiệm, học vấn, kỹ năng', en: 'experience, education, skills' } },
  { name: 'contact', usage: 'contact', about: { vi: 'email và các kênh liên hệ', en: 'email and where else to find me' } },
  {
    name: 'theme',
    usage: 'theme <id>',
    about: { vi: `đổi giao diện (${THEME_IDS.join(' | ')})`, en: `switch theme (${THEME_IDS.join(' | ')})` },
    arg: 'theme',
  },
  {
    name: 'lang',
    usage: 'lang <vi|en>',
    about: { vi: 'đổi ngôn ngữ', en: 'switch language' },
    arg: 'locale',
  },
  { name: 'clear', usage: 'clear', about: { vi: 'dọn sạch màn hình', en: 'wipe the screen' } },
];

export const COMMAND_NAMES: string[] = COMMANDS.map((c) => c.name);

const CATEGORY_IDS: CategoryId[] = CATEGORIES.map((c) => c.id);
export const CATEGORY_ARGS: CategoryArg[] = ['all', ...CATEGORY_IDS];
export const LOCALE_ARGS: Locale[] = ['vi', 'en'];

const pick = (locale: Locale, vi: string, en: string) => (locale === 'vi' ? vi : en);

/** Khoảng cách Levenshtein, dùng để đoán slug người ta định gõ. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = row;
  }
  return prev[b.length];
}

/**
 * Gợi ý slug gần đúng: hoặc chứa nguyên chuỗi đã gõ (`moba` → `moba2d`),
 * hoặc sai lệch không quá 3 ký tự (`mbo2d` → `moba2d`).
 */
export function suggestSlugs(input: string, slugs: string[], limit = 4): string[] {
  const needle = input.toLowerCase();
  return slugs
    .map((slug) => {
      const contains = slug.includes(needle) || needle.includes(slug);
      const distance = levenshtein(needle, slug);
      return { slug, contains, distance };
    })
    .filter((c) => c.contains || c.distance <= 3)
    .sort((a, b) => Number(b.contains) - Number(a.contains) || a.distance - b.distance || a.slug.localeCompare(b.slug))
    .slice(0, limit)
    .map((c) => c.slug);
}

function helpLines(locale: Locale): string[] {
  const width = Math.max(...COMMANDS.map((c) => c.usage.length));
  return [
    pick(locale, 'Các lệnh dùng được:', 'Available commands:'),
    '',
    ...COMMANDS.map((c) => `  ${c.usage.padEnd(width + 2)}${c.about[locale]}`),
    '',
    pick(
      locale,
      '  Tab tự hoàn thành · ↑ ↓ lịch sử · Ctrl+L dọn màn hình',
      '  Tab completes · ↑ ↓ history · Ctrl+L clears',
    ),
  ];
}

function notFound(ctx: CommandContext, command: 'cat' | 'open', slug: string): CommandResult {
  const near = suggestSlugs(
    slug,
    ctx.projects.map((p) => p.slug),
  );
  const tail = near.length
    ? pick(ctx.locale, `Ý bạn là: ${near.join(', ')}?`, `Did you mean: ${near.join(', ')}?`)
    : pick(ctx.locale, 'Gõ `ls` để xem toàn bộ danh sách.', 'Type `ls` to list them all.');
  return {
    kind: 'error',
    message: pick(
      ctx.locale,
      `${command}: không có dự án nào tên "${slug}". ${tail}`,
      `${command}: no project named "${slug}". ${tail}`,
    ),
  };
}

function missingArg(ctx: CommandContext, command: 'cat' | 'open'): CommandResult {
  return {
    kind: 'error',
    message: pick(
      ctx.locale,
      `${command}: thiếu tên dự án. Ví dụ: ${command} moba2d`,
      `${command}: missing project name. Try: ${command} moba2d`,
    ),
  };
}

/**
 * Vòng đời một lệnh: chuỗi thô vào, kết quả thuần ra. Mọi thứ chạm React đều
 * đi qua ctx, nên hàm này test được mà không cần dựng cây component.
 */
export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const line = input.trim().replace(/\s+/g, ' ');
  if (!line) return { kind: 'noop' };

  const [head, ...rest] = line.split(' ');
  const name = head.toLowerCase();
  const arg = (rest[0] ?? '').toLowerCase();

  switch (name) {
    case 'help':
    case '?':
      return { kind: 'text', lines: helpLines(ctx.locale) };

    case 'ls':
    case 'll': {
      if (!arg || arg === 'all' || arg === '.' || arg === '*') {
        return { kind: 'projects', items: ctx.projects, category: 'all' };
      }
      if (!(CATEGORY_IDS as string[]).includes(arg)) {
        return {
          kind: 'error',
          message: pick(
            ctx.locale,
            `ls: không có nhóm "${arg}". Nhóm hợp lệ: ${CATEGORY_ARGS.join(', ')}`,
            `ls: no such category "${arg}". Valid categories: ${CATEGORY_ARGS.join(', ')}`,
          ),
        };
      }
      return {
        kind: 'projects',
        items: ctx.projects.filter((p) => p.category === arg),
        category: arg as CategoryId,
      };
    }

    case 'cat': {
      if (!arg) return missingArg(ctx, 'cat');
      const item = ctx.projects.find((p) => p.slug === arg);
      return item ? { kind: 'project', item } : notFound(ctx, 'cat', arg);
    }

    case 'open': {
      if (!arg) return missingArg(ctx, 'open');
      const item = ctx.projects.find((p) => p.slug === arg);
      if (!item) return notFound(ctx, 'open', arg);
      ctx.open(item.slug);
      return {
        kind: 'text',
        lines: [pick(ctx.locale, `Đang mở ${item.title}…`, `Opening ${item.title}…`)],
      };
    }

    // `log` chứ không phải `history`: trong terminal, `history` là lịch sử
    // dòng lệnh mà ↑ ↓ đang lật, cướp tên đó là nói dối người dùng. `log` thì
    // đúng cả nghĩa lẫn hình — khối này vẽ y như `git log --graph`.
    case 'timeline':
    case 'log':
      return { kind: 'timeline' };

    case 'whoami':
      return { kind: 'profile' };

    case 'stats':
      return { kind: 'stats' };

    case 'skills':
      return { kind: 'skills' };

    case 'contact':
      return { kind: 'contact' };

    case 'theme': {
      if (!isThemeId(arg)) {
        return {
          kind: 'error',
          message: pick(
            ctx.locale,
            `theme: không có giao diện "${arg}". Hợp lệ: ${THEME_IDS.join(', ')}`,
            `theme: no such theme "${arg}". Valid themes: ${THEME_IDS.join(', ')}`,
          ),
        };
      }
      ctx.setTheme(arg);
      return { kind: 'text', lines: [pick(ctx.locale, `Đã đổi giao diện: ${arg}`, `Theme set: ${arg}`)] };
    }

    case 'lang': {
      if (!(LOCALE_ARGS as string[]).includes(arg)) {
        return {
          kind: 'error',
          message: pick(
            ctx.locale,
            `lang: chỉ nhận ${LOCALE_ARGS.join(' hoặc ')}`,
            `lang: expected ${LOCALE_ARGS.join(' or ')}`,
          ),
        };
      }
      ctx.setLocale(arg as Locale);
      return { kind: 'text', lines: [pick(ctx.locale, `Đã đổi ngôn ngữ: ${arg}`, `Language set: ${arg}`)] };
    }

    case 'clear':
      ctx.clear();
      return { kind: 'noop' };

    default:
      return {
        kind: 'error',
        message: pick(
          ctx.locale,
          `${name}: không có lệnh này. Gõ \`help\` để xem danh sách.`,
          `${name}: command not found. Type \`help\` for the list.`,
        ),
      };
  }
}
