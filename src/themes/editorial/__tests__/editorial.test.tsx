import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '../../../App';
import editorial from '../index';
import { PROFILE } from '../../../data/profile';
import { CATEGORY_BY_ID } from '../../../data/categories';

const renderShell = () =>
  render(
    <AppProviders>
      <editorial.Shell />
    </AppProviders>,
  );

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('Editorial', () => {
  it('hiện tên chủ trang ở heading cấp 1', () => {
    renderShell();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(PROFILE.name);
  });

  it('liệt kê dự án và gom theo category', () => {
    renderShell();
    const games = CATEGORY_BY_ID.games.label.en;
    expect(screen.getByRole('heading', { name: new RegExp(games, 'i') })).toBeInTheDocument();
    expect(screen.getAllByRole('article').length).toBeGreaterThan(30);
  });

  it('gõ vào ô tìm kiếm thì danh sách co lại', async () => {
    renderShell();
    const before = screen.getAllByRole('article').length;
    await userEvent.type(screen.getByRole('searchbox'), 'moba');
    expect(screen.getAllByRole('article').length).toBeLessThan(before);
  });

  it('bấm một dự án thì mở chi tiết có link mã nguồn', async () => {
    renderShell();
    await userEvent.click(screen.getAllByRole('button', { name: /^moba2d$/i })[0]);
    const dialog = await screen.findByRole('dialog');
    const source = within(dialog).getByRole('link', { name: /github/i });
    expect(source.getAttribute('href')).toContain('github.com');
  });

  it('Esc đóng chi tiết', async () => {
    renderShell();
    await userEvent.click(screen.getAllByRole('button', { name: /^moba2d$/i })[0]);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('không tìm thấy gì thì nói rõ chứ không để màn trắng', async () => {
    renderShell();
    await userEvent.type(screen.getByRole('searchbox'), 'zzzzkhongcogi');
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByText(/no matching projects|không tìm thấy/i)).toBeInTheDocument();
  });

  it('lọc theo category rồi thì chỉ còn nhóm đó', async () => {
    renderShell();
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(CATEGORY_BY_ID.osint.label.en, 'i') }),
    );
    for (const a of screen.getAllByRole('article')) {
      expect(a).toHaveAttribute('data-category', 'osint');
    }
  });

  it('ẩn phần học vấn khi chưa điền, thay vì hiện tiêu đề rỗng', () => {
    renderShell();
    if (PROFILE.education.length === 0) {
      expect(screen.queryByRole('heading', { name: /education|học vấn/i })).toBeNull();
    }
  });

  it('hiện phần kỹ năng, gồm cả nhóm làm việc cùng AI', () => {
    renderShell();
    expect(screen.getByRole('heading', { name: /skills|kỹ năng/i })).toBeInTheDocument();
    expect(screen.getByText('Claude Code')).toBeInTheDocument();
  });

  it('có dòng thời gian gom dự án theo năm, và mốc công việc nằm trong đó', () => {
    renderShell();
    const timeline = document.getElementById('timeline')!;
    expect(timeline).toBeTruthy();
    expect(within(timeline).getByText('MoMo · M_Service')).toBeInTheDocument();
    // Năm phải giảm dần
    const years = [...timeline.querySelectorAll('li > div > span')]
      .map((el) => Number(el.textContent))
      .filter((n) => Number.isFinite(n) && n > 2000);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
  });

  it('lọc thì dòng thời gian co theo, không đứng yên một mình', async () => {
    renderShell();
    const timeline = () => document.getElementById('timeline')!;
    const before = within(timeline()).getAllByRole('button').length;
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(CATEGORY_BY_ID.osint.label.en, 'i') }),
    );
    expect(within(timeline()).getAllByRole('button').length).toBeLessThan(before);
  });

  it('có nút đổi theme và đổi ngôn ngữ', () => {
    renderShell();
    expect(screen.getByRole('button', { name: /theme|giao diện/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });

  it('đổi ngôn ngữ thì chữ trên trang đổi theo', async () => {
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: 'VI' }));
    expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Tìm dự án, công nghệ…');
  });
});
