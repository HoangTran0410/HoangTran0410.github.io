import type { ComponentType } from 'react';
import type { L10n } from '../data/types';

export type ThemeId = 'editorial' | 'arcade' | 'bento' | 'terminal';

export interface ThemeMeta {
  id: ThemeId;
  /** Tên hiển thị trên nút đổi theme */
  label: L10n;
  /** Mô tả một dòng, hiện khi hover */
  hint: L10n;
  /** Màu đại diện trên nút chọn theme */
  swatch: string;
  /** true nếu theme nền tối — dùng để đặt <meta name="theme-color"> */
  dark: boolean;
}

/**
 * Mỗi theme phải phủ đủ sáu khối nội dung. Theme được tự do sắp xếp, gộp hay
 * biến đổi hình thức của chúng — Terminal biến chúng thành output của lệnh —
 * nhưng không được bỏ khối nào, vì bỏ là đổi theme sẽ mất thông tin.
 */
export interface ThemeSections {
  /** Tên, ảnh đại diện, headline, bio, social */
  Identity: ComponentType;
  /** Số liệu tổng hợp: sao, dự án, số năm */
  Stats: ComponentType;
  /** Bộ lọc, ô tìm kiếm và danh sách dự án */
  Catalog: ComponentType;
  /** Chi tiết một dự án — modal, panel, hay output tuỳ theme */
  ProjectDetail: ComponentType;
  /** Kinh nghiệm, học vấn, kỹ năng */
  Story: ComponentType;
  /** Liên hệ và chân trang */
  Contact: ComponentType;
}

export interface Theme {
  meta: ThemeMeta;
  /** Component gốc, tự bố cục các section theo ý mình */
  Shell: ComponentType;
  sections: ThemeSections;
}
