import type { Category, CategoryId } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'products',
    order: 1,
    accent: '#2563eb',
    icon: 'Rocket',
    label: { vi: 'Sản phẩm', en: 'Products' },
    blurb: {
      vi: 'Những thứ có người dùng thật, cập nhật đều, và phải chịu trách nhiệm khi hỏng.',
      en: 'The ones with real users, shipped regularly, and my problem when they break.',
    },
  },
  {
    id: 'games',
    order: 2,
    accent: '#a855f7',
    icon: 'Gamepad2',
    label: { vi: 'Game', en: 'Games' },
    blurb: {
      vi: 'Engine, web game, và những thứ chơi được ngay trên trình duyệt không cần cài gì.',
      en: 'Engines, web games, and things playable in the browser with nothing to install.',
    },
  },
  {
    id: 'extensions',
    order: 3,
    accent: '#f97316',
    icon: 'Puzzle',
    label: { vi: 'Tiện ích trình duyệt', en: 'Extensions' },
    blurb: {
      vi: 'Extension và userscript — nơi vài trăm nghìn người dùng đến từ.',
      en: 'Extensions and userscripts — where a few hundred thousand users came from.',
    },
  },
  {
    id: 'devtools',
    order: 4,
    accent: '#14b8a6',
    icon: 'Wrench',
    label: { vi: 'Công cụ lập trình', en: 'Dev Tools' },
    blurb: {
      vi: 'Công cụ tự viết vì không tìm được cái vừa ý, rồi để công khai luôn.',
      en: 'Tools built because nothing fit, then left out in the open.',
    },
  },
  {
    id: 'osint',
    order: 5,
    accent: '#ef4444',
    icon: 'Radar',
    label: { vi: 'OSINT & Bảo mật', en: 'OSINT & Security' },
    blurb: {
      vi: 'Tra cứu, phân tích, và mấy thứ hay ho làm được từ dữ liệu vốn đã công khai.',
      en: 'Lookup, analysis, and the surprising things public data already tells you.',
    },
  },
  {
    id: 'creative',
    order: 6,
    accent: '#ec4899',
    icon: 'Sparkles',
    label: { vi: 'Creative coding', en: 'Creative Coding' },
    blurb: {
      vi: 'Code để vẽ, để nghe, để nghịch. Không giải quyết vấn đề gì cả, và đó là chủ đích.',
      en: 'Code that draws, sounds, and plays. Solves nothing, on purpose.',
    },
  },
  {
    id: 'archive',
    order: 7,
    accent: '#64748b',
    icon: 'Archive',
    label: { vi: 'Kho lưu trữ', en: 'Archive' },
    blurb: {
      vi: 'Đồ án, bài tập lớn và những repo đầu đời — vẫn còn người fork về dùng.',
      en: 'Coursework and early repos that people somehow still fork.',
    },
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;
