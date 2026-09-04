import type { L10n } from './types';

export interface ExperienceItem {
  company: string;
  role: L10n;
  /** 'YYYY-MM'. Bỏ trống nếu chưa muốn công bố mốc thời gian. */
  from?: string;
  /** 'YYYY-MM', hoặc null nghĩa là đang làm. */
  to?: string | null;
  summary: L10n;
  /** 2–4 gạch đầu dòng, mỗi cái nêu một việc cụ thể. */
  highlights: L10n[];
}

export interface EducationItem {
  school: string;
  degree: L10n;
  from?: string;
  to?: string | null;
}

export interface SkillGroup {
  label: L10n;
  items: string[];
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  /** Tên icon lucide, hoặc 'github'/'facebook'/'linkedin' cho logo thương hiệu. */
  icon: string;
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
  /** Năm bắt đầu code — dùng để tính số năm kinh nghiệm thay vì viết cứng. */
  codingSince: number;
}

export const PROFILE: Profile = {
  name: 'Hoang Tran',
  handle: 'HoangTran0410',
  avatar: 'https://avatars.githubusercontent.com/u/36368107?v=4',
  headline: {
    vi: 'Kỹ sư phần mềm · Game, web và những công cụ nhỏ có người dùng thật',
    en: 'Software engineer · games, web, and small tools with real users',
  },
  bio: {
    vi: 'Mình xây thứ chạy được. Ban ngày làm ứng dụng di động, ban đêm làm engine game, extension trình duyệt và mấy công cụ sinh ra từ việc tự thấy bực mình. Một trong số đó nuôi được chính nó mỗi tháng; số còn lại chỉ đơn giản là vui. Phần lớn những gì làm gần đây đều đi cùng AI — không phải để gõ hộ, mà để bàn thiết kế, viết spec, dựng test và soi lại code.',
    en: 'I build things that run. Mobile apps by day; game engines, browser extensions and tools born out of my own irritation by night. One of them pays for itself every month; the rest are just fun.',
  },
  location: { vi: 'Việt Nam', en: 'Vietnam' },
  email: '99.hoangtran@gmail.com',
  codingSince: 2018,

  socials: [
    { id: 'github', label: 'GitHub', url: 'https://github.com/HoangTran0410', icon: 'github' },
    { id: 'facebook', label: 'Facebook', url: 'https://fb.com/9999.hoangtran', icon: 'facebook' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/99-hoangtran', icon: 'linkedin' },
    { id: 'stackoverflow', label: 'Stack Overflow', url: 'https://stackoverflow.com/users/11898496', icon: 'stack' },
    { id: 'codepen', label: 'CodePen', url: 'https://codepen.io/hoanghien0410', icon: 'codepen' },
    { id: 'blog', label: 'Blog', url: 'https://blog.fbaio.org/', icon: 'rss' },
  ],

  skills: [
    {
      label: { vi: 'Hằng ngày', en: 'Daily drivers' },
      items: ['TypeScript', 'React', 'Kotlin', 'Compose Multiplatform', 'Node.js'],
    },
    {
      label: { vi: 'Game & đồ hoạ', en: 'Games & graphics' },
      items: ['Canvas 2D', 'p5.js', 'Three.js', 'WebGL', 'Phaser', 'Thiết kế engine'],
    },
    {
      label: { vi: 'Làm việc cùng AI', en: 'Working with AI' },
      items: [
        'Claude Code',
        'Agent skills & MCP',
        'Lập kế hoạch từ spec',
        'Sinh code theo TDD',
        'Review code bằng AI',
        'Dựng agent riêng',
      ],
    },
    {
      label: { vi: 'Nền tảng', en: 'Platform' },
      items: ['Chrome Extension', 'PWA', 'WebRTC', 'Cloudflare Pages', 'GitHub Actions'],
    },
    {
      label: { vi: 'Còn dùng được', en: 'Still in the toolbox' },
      items: ['Java', 'C#', 'PHP', 'Python', 'MySQL', 'React Native'],
    },
  ],

  // ───────────────────────────────────────────────────────────────────────
  // SỬA Ở ĐÂY: kinh nghiệm làm việc.
  //
  //   from / to  dạng 'YYYY-MM'. to = null nghĩa là đang làm.
  //              Bỏ trống cả hai thì UI chỉ hiện tên công ty, không hiện mốc
  //              thời gian — an toàn hơn là điền đại một con số.
  //   highlights 2–4 dòng, mỗi dòng nêu một việc cụ thể đã làm được.
  //
  // Xoá sạch mảng này nếu không muốn hiện phần kinh nghiệm — UI tự ẩn.
  // ───────────────────────────────────────────────────────────────────────
  experience: [
    {
      company: 'MoMo · M_Service',
      role: { vi: 'Kỹ sư phần mềm', en: 'Software Engineer' },
      // from: '2022-01',   ← bỏ dấu comment và điền mốc thật
      to: null,
      summary: {
        vi: 'Làm ứng dụng di động đa nền tảng bằng Kotlin Multiplatform và Compose.',
        en: 'Cross-platform mobile work in Kotlin Multiplatform and Compose.',
      },
      highlights: [
        {
          vi: 'Phát triển tính năng tìm kiếm trong ứng dụng, dùng chung một tầng logic cho cả Android và iOS.',
          en: 'Built in-app search on a single shared logic layer across Android and iOS.',
        },
      ],
    },
  ],

  // ───────────────────────────────────────────────────────────────────────
  // SỬA Ở ĐÂY: học vấn. Cùng quy tắc như trên, để rỗng thì UI tự ẩn.
  //   { school: 'Tên trường',
  //     degree: { vi: 'Cử nhân Công nghệ thông tin', en: 'BSc Information Technology' },
  //     from: '2017-09', to: '2021-06' }
  // ───────────────────────────────────────────────────────────────────────
  education: [],
};
