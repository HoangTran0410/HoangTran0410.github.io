import type { Theme, ThemeId, ThemeMeta } from './contract';

export const THEME_META: Record<ThemeId, ThemeMeta> = {
  aurora: {
    id: 'aurora',
    dark: true,
    swatch: '#8b5cf6',
    label: { vi: 'Aurora', en: 'Aurora' },
    hint: {
      vi: 'Tối, kính mờ, ánh cực quang — kiểu trang sản phẩm hiện đại',
      en: 'Dark glass and northern lights — a modern product page',
    },
  },
  editorial: {
    id: 'editorial',
    dark: false,
    swatch: '#14110f',
    label: { vi: 'Tạp chí', en: 'Editorial' },
    hint: {
      vi: 'Sáng, chữ to, đọc lâu không mỏi — Ctrl+P ra CV luôn',
      en: 'Light, typographic, easy on the eyes — Ctrl+P prints a CV',
    },
  },
  arcade: {
    id: 'arcade',
    dark: true,
    swatch: '#7c3aed',
    label: { vi: 'Arcade', en: 'Arcade' },
    hint: {
      vi: 'Tối, neon, card nghiêng theo con trỏ',
      en: 'Dark, neon, cards that tilt toward the cursor',
    },
  },
  bento: {
    id: 'bento',
    dark: false,
    swatch: '#0ea5e9',
    label: { vi: 'Bento', en: 'Bento' },
    hint: {
      vi: 'Lưới ô to nhỏ, thấy được nhiều thứ cùng lúc',
      en: 'A grid of tiles, everything at a glance',
    },
  },
  terminal: {
    id: 'terminal',
    dark: true,
    swatch: '#22c55e',
    label: { vi: 'Terminal', en: 'Terminal' },
    hint: {
      vi: 'Gõ lệnh mà xem. Thử `help` trước đi',
      en: 'Type to browse. Start with `help`',
    },
  },
};

export const THEME_IDS = Object.keys(THEME_META) as ThemeId[];

export const DEFAULT_THEME: ThemeId = 'aurora';

export const THEME_LOADERS: Record<ThemeId, () => Promise<{ default: Theme }>> = {
  aurora: () => import('./aurora'),
  editorial: () => import('./editorial'),
  arcade: () => import('./arcade'),
  bento: () => import('./bento'),
  terminal: () => import('./terminal'),
};

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === 'string' && v in THEME_META;
}
