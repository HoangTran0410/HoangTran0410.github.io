export type Locale = 'vi' | 'en';

/** Mọi chuỗi hiển thị cho người dùng đều phải có đủ hai ngôn ngữ. */
export type L10n = Record<Locale, string>;

export type CategoryId =
  | 'products'
  | 'games'
  | 'extensions'
  | 'devtools'
  | 'osint'
  | 'creative'
  | 'archive';

export interface Category {
  id: CategoryId;
  label: L10n;
  /** Câu mô tả ngắn hiện ở đầu nhóm */
  blurb: L10n;
  /** Màu accent, dùng cho gradient thumbnail fallback và badge */
  accent: string;
  /** Tên icon trong lucide-react */
  icon: string;
  /** Thứ tự hiển thị, nhỏ ra trước */
  order: number;
}

export type ProjectStatus = 'active' | 'maintained' | 'archived';

export interface ProjectLinks {
  demo?: string;
  repo?: string;
  /** Bài viết, video, post giới thiệu */
  more?: string;
}

/** Dữ liệu curated — viết tay, là nguồn sự thật về nội dung. */
export interface CuratedProject {
  /** Định danh trong URL: ?p=moba2d */
  slug: string;
  /** "owner/name"; bỏ trống nếu không có repo public */
  repo?: string;
  /** Tên hiển thị, không dịch */
  title: string;
  /** Một câu ngắn, tối đa 80 ký tự */
  tagline: L10n;
  /** 2–4 câu, hiện trong phần chi tiết */
  blurb: L10n;
  category: CategoryId;
  /** Tech stack: "React", "TypeScript", "p5.js"… */
  tags: string[];
  links: ProjectLinks;
  /** Được ưu tiên ô lớn ở Bento, lên đầu ở các theme khác */
  featured?: boolean;
  /** Năm bắt đầu, dùng để sắp xếp và hiện timeline */
  year: number;
  status: ProjectStatus;
  /**
   * Ghi đè ảnh thumbnail. Mặc định (bỏ trống) là tìm /shots/<slug>.webp.
   * Đặt `null` nghĩa là cố tình không dùng ảnh chụp — trang demo chụp ra xấu
   * hoặc chỉ là màn hình loading — và luôn dùng bìa gradient.
   */
  shot?: string | null;
}

/** Dữ liệu sync tự động từ GitHub API — KHÔNG sửa tay, CI ghi đè. */
export interface GithubStats {
  repo: string;
  stars: number;
  forks: number;
  language: string | null;
  /** ISO date của lần push gần nhất */
  pushedAt: string;
  topics: string[];
  archived: boolean;
  /** Repo này là fork của người khác */
  fork: boolean;
  /** "owner/name" của repo gốc, null nếu không phải fork */
  parent: string | null;
  /**
   * Số commit do chủ trang viết (đếm tối đa 100). Chỉ cần biết 0 hay khác 0:
   * một fork mà chủ trang không viết dòng nào thì không phải tác phẩm của mình.
   */
  myCommits: number;
  /** false nếu lần sync gần nhất gọi API repo này bị lỗi; dữ liệu bên trên là của lần sync cũ */
  ok: boolean;
}

/** Model runtime sau khi merge — đây là thứ các theme nhận được. */
export interface Project extends CuratedProject {
  stats?: GithubStats;
  /** Đã resolve sẵn, khỏi phải lookup lại trong lúc render */
  categoryMeta: Category;
}
