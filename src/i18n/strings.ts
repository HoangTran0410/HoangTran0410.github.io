import type { L10n } from '../data/types';

/** Chuỗi giao diện. Dữ liệu dự án nằm ở src/data, không phải ở đây. */
export const STRINGS = {
  'nav.work': { vi: 'Dự án', en: 'Work' },
  'nav.about': { vi: 'Giới thiệu', en: 'About' },
  'nav.contact': { vi: 'Liên hệ', en: 'Contact' },

  'search.placeholder': { vi: 'Tìm dự án, công nghệ…', en: 'Search projects, tech…' },
  'search.label': { vi: 'Tìm dự án', en: 'Search projects' },
  'filter.all': { vi: 'Tất cả', en: 'All' },
  'filter.label': { vi: 'Lọc theo nhóm', en: 'Filter by category' },
  'filter.reset': { vi: 'Bỏ lọc', en: 'Clear filters' },

  'sort.label': { vi: 'Sắp xếp', en: 'Sort' },
  'sort.featured': { vi: 'Nổi bật', en: 'Featured' },
  'sort.stars': { vi: 'Nhiều sao', en: 'Most starred' },
  'sort.recent': { vi: 'Mới nhất', en: 'Newest' },
  'sort.name': { vi: 'Tên A→Z', en: 'Name A→Z' },

  'detail.visit': { vi: 'Mở thử', en: 'Open it' },
  'detail.source': { vi: 'Mã nguồn trên GitHub', en: 'Source on GitHub' },
  'detail.readMore': { vi: 'Đọc thêm', en: 'Read more' },
  'detail.close': { vi: 'Đóng', en: 'Close' },
  'detail.next': { vi: 'Dự án sau', en: 'Next project' },
  'detail.prev': { vi: 'Dự án trước', en: 'Previous project' },
  'detail.tech': { vi: 'Công nghệ', en: 'Built with' },

  'stats.stars': { vi: 'sao trên GitHub', en: 'GitHub stars' },
  'stats.projects': { vi: 'dự án công khai', en: 'public projects' },
  'stats.years': { vi: 'năm viết code', en: 'years writing code' },
  'stats.forks': { vi: 'lượt fork', en: 'forks' },
  'stats.categories': { vi: 'nhóm sản phẩm', en: 'categories' },

  'theme.label': { vi: 'Giao diện', en: 'Theme' },
  'lang.label': { vi: 'Ngôn ngữ', en: 'Language' },

  'empty.title': { vi: 'Không tìm thấy dự án nào', en: 'No matching projects' },
  'empty.hint': { vi: 'Thử từ khoá khác hoặc bỏ bộ lọc đi.', en: 'Try another word, or clear the filters.' },

  'story.experience': { vi: 'Kinh nghiệm', en: 'Experience' },
  'story.education': { vi: 'Học vấn', en: 'Education' },
  'story.skills': { vi: 'Kỹ năng', en: 'Skills' },
  'story.present': { vi: 'nay', en: 'present' },

  'contact.title': { vi: 'Nói chuyện nhé', en: 'Say hello' },
  'contact.copy': { vi: 'Sao chép email', en: 'Copy email' },
  'contact.copied': { vi: 'Đã sao chép', en: 'Copied' },
  'contact.print': { vi: 'In / Lưu PDF', en: 'Print / Save PDF' },

  'footer.built': { vi: 'Tự viết, mã nguồn mở', en: 'Hand-built, source open' },
  'footer.updated': { vi: 'Số liệu cập nhật', en: 'Stats updated' },
} as const satisfies Record<string, L10n>;

export type StringKey = keyof typeof STRINGS;
