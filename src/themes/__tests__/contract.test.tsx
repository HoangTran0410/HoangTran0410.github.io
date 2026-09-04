import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '../../App';
import { PROFILE } from '../../data/profile';
import { THEME_IDS, THEME_LOADERS, THEME_META } from '../registry';
import type { ThemeSections } from '../contract';

const SECTIONS = ['Identity', 'Stats', 'Catalog', 'Timeline', 'ProjectDetail', 'Story', 'Contact'] as const;

describe.each(THEME_IDS)('theme %s', (id) => {
  it('load được và khai báo đúng id của mình', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    expect(theme.meta.id).toBe(id);
    expect(theme.meta).toEqual(THEME_META[id]);
  });

  it('phủ đủ 7 khối nội dung — thiếu khối nào là đổi theme sẽ mất thông tin', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    for (const s of SECTIONS) expect(typeof theme.sections[s], s).toBe('function');
  });

  it('có Shell để App render', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    expect(typeof theme.Shell).toBe('function');
  });
});

/**
 * Bài học từ một sự cố thật trên production: bốn theme từng được tạo dưới dạng
 * stub có `Shell: () => null` để contract test có cái mà kiểm. Stub thoả contract
 * hoàn hảo — đủ 7 khối, đúng meta, không lỗi TypeScript, không lỗi console —
 * nhưng bấm sang là trắng màn hình. Contract chỉ kiểm hình dạng, không kiểm
 * xem có gì hiện ra hay không.
 *
 * Những test dưới đây render thật từng Shell và đòi phải thấy nội dung.
 */
describe.each(THEME_IDS)('theme %s render ra nội dung thật', (id) => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('không phải màn hình trắng', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    const { container } = render(
      <AppProviders>
        <theme.Shell />
      </AppProviders>,
    );
    expect(container.textContent?.trim().length ?? 0).toBeGreaterThan(400);
  });

  it('cho biết đây là trang của ai', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    const { container } = render(
      <AppProviders>
        <theme.Shell />
      </AppProviders>,
    );
    // Tên hoặc handle đều được: Terminal vẽ tên bằng banner ASCII nên chuỗi
    // "Hoang Tran" không tồn tại dưới dạng chữ, nhưng @HoangTran0410 thì có.
    const text = container.textContent ?? '';
    expect(
      text.includes(PROFILE.name) || text.toLowerCase().includes(PROFILE.handle.toLowerCase()),
    ).toBe(true);
  });

  it('liệt kê dự án chứ không chỉ có phần đầu trang', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    render(
      <AppProviders>
        <theme.Shell />
      </AppProviders>,
    );
    expect(screen.getAllByRole('article').length).toBeGreaterThan(20);
  });

  it('có nút đổi sang mọi theme khác, nếu không người dùng sẽ kẹt lại', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    render(
      <AppProviders>
        <theme.Shell />
      </AppProviders>,
    );
    expect(screen.getAllByRole('button', { name: /theme|giao diện/i }).length).toBeGreaterThan(0);
  });
});

/**
 * Khai báo một khối trong `sections` là một chuyện, thật sự render nó ra lại
 * là chuyện khác — `sections` chỉ là bản kê khai, các Shell import component
 * trực tiếp. Một theme hoàn toàn có thể liệt kê `Timeline` rồi quên cắm nó
 * vào Shell, và không gì báo động cả.
 *
 * Nên chỗ này không tin lời khai. Nó render Shell rồi tìm dấu vết chỉ có thể
 * đến từ đúng khối đó. Thêm khối mới thì thêm một dòng vào bảng dưới đây, và
 * ba theme quên cắm sẽ đỏ ngay với tên khối nói rõ ràng.
 */
const FINGERPRINTS: { section: keyof ThemeSections; why: string; find: (text: string) => boolean }[] = [
  {
    section: 'Identity',
    why: 'bio của chủ trang',
    find: (t) => t.includes('Mobile apps by day') || t.includes('ban ngày làm ứng dụng di động'),
  },
  {
    section: 'Stats',
    why: 'số liệu tổng hợp từ GitHub',
    find: (t) => /1[,.]?\d{3}/.test(t),
  },
  {
    section: 'Catalog',
    why: 'một dự án bất kỳ trong danh sách',
    find: (t) => t.includes('moba2d'),
  },
  {
    section: 'Timeline',
    why: 'mốc công việc gắn với năm',
    find: (t) => t.includes(PROFILE.experience[0]?.company ?? '—'),
  },
  {
    section: 'Story',
    why: 'một kỹ năng đã khai',
    find: (t) => t.includes('Claude Code'),
  },
  {
    section: 'Contact',
    why: 'địa chỉ email',
    find: (t) => t.includes(PROFILE.email),
  },
];

/**
 * Terminal cố ý không in mọi thứ ra ngay: `timeline` và `skills` là lệnh phải
 * gõ. Yêu cầu thật không phải "hiện ngay khi mở" mà là "tới được" — nên với
 * theme này, test gõ đúng lệnh rồi mới soi. Khối nào không có đường tới thì
 * vẫn đỏ.
 */
const REACH: Partial<Record<keyof ThemeSections, string>> = {
  Timeline: 'timeline',
  Story: 'skills',
  Contact: 'contact',
};

describe.each(THEME_IDS)('theme %s có đường tới mọi khối, không chỉ khai báo', (id) => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it.each(FINGERPRINTS)('tới được khối $section ($why)', async ({ section, find }) => {
    const theme = (await THEME_LOADERS[id]()).default;
    const { container } = render(
      <AppProviders>
        <theme.Shell />
      </AppProviders>,
    );

    const command = id === 'terminal' ? REACH[section] : undefined;
    if (command && !find(container.textContent ?? '')) {
      const input = screen.getByRole('textbox');
      await userEvent.type(input, `${command}{Enter}`);
    }

    expect(
      find(container.textContent ?? ''),
      command
        ? `theme "${id}": gõ "${command}" rồi mà vẫn không thấy ${section}`
        : `theme "${id}" khai báo ${section} nhưng không render ra`,
    ).toBe(true);
  });
});
