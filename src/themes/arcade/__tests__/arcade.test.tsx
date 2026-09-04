import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '../../../App';
import arcade from '../index';
import { PROFILE } from '../../../data/profile';
import { CATEGORY_BY_ID } from '../../../data/categories';
import { getProjects } from '../../../lib/merge';
import { computeStats } from '../../../lib/stats';

const renderShell = () =>
  render(
    <AppProviders>
      <arcade.Shell />
    </AppProviders>,
  );

/**
 * Giả lập matchMedia. `reduce = true` nghĩa là người dùng đã xin bớt chuyển
 * động — Arcade phải tự tháo hết phần hiệu ứng của mình khi thấy cờ này.
 */
function stubMatchMedia(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    matches: reduce && query.includes('prefers-reduced-motion'),
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Arcade', () => {
  it('hiện tên chủ trang ở heading cấp 1', () => {
    renderShell();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(PROFILE.name);
  });

  it('bày mọi dự án ra lưới card', () => {
    renderShell();
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
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const source = within(dialog).getByRole('link', { name: /github/i });
    expect(source.getAttribute('href')).toContain('github.com');
  });

  it('mở chi tiết thì khoá cuộn nền và đưa focus vào nút đóng', async () => {
    renderShell();
    await userEvent.click(screen.getAllByRole('button', { name: /^moba2d$/i })[0]);
    const dialog = await screen.findByRole('dialog');
    expect(document.body.style.overflow).toBe('hidden');
    expect(within(dialog).getByRole('button', { name: /close|đóng/i })).toHaveFocus();
  });

  it('Esc đóng chi tiết và trả focus về card đã bấm', async () => {
    renderShell();
    const opener = screen.getAllByRole('button', { name: /^moba2d$/i })[0];
    await userEvent.click(opener);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(opener).toHaveFocus();
  });

  it('lọc theo category rồi thì mọi card đều thuộc nhóm đó', async () => {
    renderShell();
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(CATEGORY_BY_ID.osint.label.en, 'i') }),
    );
    const cards = screen.getAllByRole('article');
    expect(cards.length).toBeGreaterThan(0);
    for (const a of cards) expect(a).toHaveAttribute('data-category', 'osint');
  });

  it('không tìm thấy gì thì nói rõ chứ không để màn trắng', async () => {
    renderShell();
    await userEvent.type(screen.getByRole('searchbox'), 'zzzzkhongcogi');
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByText(/no matching projects|không tìm thấy/i)).toBeInTheDocument();
    expect(
      screen.getByText(/try another word|thử từ khoá khác/i),
    ).toBeInTheDocument();
  });

  it('có dòng thời gian, và mốc công việc nằm trong đó', () => {
    renderShell();
    const timeline = document.getElementById('timeline')!;
    expect(timeline).toBeTruthy();
    expect(within(timeline).getByText('MoMo · M_Service')).toBeInTheDocument();
  });

  it('các năm trên dòng thời gian giảm dần', () => {
    renderShell();
    const timeline = document.getElementById('timeline')!;
    const years = [...timeline.querySelectorAll('[data-year]')].map((el) =>
      Number(el.getAttribute('data-year')),
    );
    expect(years.length).toBeGreaterThan(1);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
  });

  it('lọc theo nhóm thì dòng thời gian co theo, không đứng yên một mình', async () => {
    renderShell();
    const timeline = () => document.getElementById('timeline')!;
    const before = within(timeline()).getAllByRole('button').length;
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(CATEGORY_BY_ID.osint.label.en, 'i') }),
    );
    expect(within(timeline()).getAllByRole('button').length).toBeLessThan(before);
  });

  it('ẩn hẳn phần học vấn khi chưa điền, thay vì hiện tiêu đề rỗng', () => {
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

  it('có nút đổi theme và nút đổi ngôn ngữ', () => {
    renderShell();
    expect(screen.getByRole('button', { name: /theme|giao diện/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });

  it('bình thường thì card có bật hiệu ứng nghiêng', () => {
    stubMatchMedia(false);
    const { container } = renderShell();
    expect(container.querySelectorAll('[data-tilt="on"]').length).toBeGreaterThan(30);
  });

  it('prefers-reduced-motion thì tắt hết tilt', () => {
    stubMatchMedia(true);
    const { container } = renderShell();
    expect(screen.getAllByRole('article').length).toBeGreaterThan(30);
    expect(container.querySelectorAll('[data-tilt="on"]')).toHaveLength(0);
  });

  it('prefers-reduced-motion thì không dựng canvas', () => {
    stubMatchMedia(true);
    const { container } = renderShell();
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('prefers-reduced-motion thì số liệu hiện luôn giá trị cuối, không đếm', () => {
    stubMatchMedia(true);
    const { container } = renderShell();
    const s = computeStats(getProjects(), PROFILE);
    // <dl> đầu tiên trên trang là bảng chỉ số.
    const board = container.querySelector('dl') as HTMLElement;
    expect(within(board).getAllByText(s.totalStars.toLocaleString('en-US')).length).toBeGreaterThan(0);
    expect(within(board).getAllByText(String(s.totalProjects)).length).toBeGreaterThan(0);
    expect(within(board).queryAllByText('0')).toHaveLength(0);
  });
});
