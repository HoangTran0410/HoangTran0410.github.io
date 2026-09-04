import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '../../App';
import { PROFILE } from '../../data/profile';
import { THEME_IDS, THEME_LOADERS, THEME_META } from '../registry';

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
