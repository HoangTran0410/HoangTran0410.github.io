import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '../../../App';
import bento from '../index';
import { PROFILE } from '../../../data/profile';
import { CATEGORY_BY_ID } from '../../../data/categories';
import { getProjects } from '../../../lib/merge';

const renderShell = () =>
  render(
    <AppProviders>
      <bento.Shell />
    </AppProviders>,
  );

const largeTiles = () => document.querySelectorAll('article[data-tile="lg"]');
const smallTiles = () => document.querySelectorAll('article[data-tile="sm"]');

const FEATURED = getProjects().filter((p) => p.featured);

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('Bento', () => {
  it('hiện tên chủ trang ở heading cấp 1', () => {
    renderShell();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(PROFILE.name);
  });

  it('liệt kê toàn bộ dự án, mỗi dự án một ô', () => {
    renderShell();
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBeGreaterThan(30);
    for (const a of articles) {
      expect(a.getAttribute('data-tile')).toMatch(/^(lg|sm)$/);
      expect(a.getAttribute('data-category')).toBeTruthy();
    }
  });

  it('gõ vào ô tìm kiếm thì danh sách co lại', async () => {
    renderShell();
    const before = screen.getAllByRole('article').length;
    await userEvent.type(screen.getByRole('searchbox'), 'moba');
    expect(screen.getAllByRole('article').length).toBeLessThan(before);
  });

  it('bấm một dự án thì mở chi tiết có link mã nguồn', async () => {
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: /^moba2d$/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const source = within(dialog).getByRole('link', { name: /github/i });
    expect(source.getAttribute('href')).toContain('github.com');
  });

  it('mở chi tiết thì khoá scroll nền và đưa focus vào nút đóng', async () => {
    renderShell();
    const opener = screen.getByRole('button', { name: /^moba2d$/i });
    await userEvent.click(opener);
    const dialog = await screen.findByRole('dialog');
    expect(document.body.style.overflow).toBe('hidden');
    expect(within(dialog).getByRole('button', { name: /close|đóng/i })).toHaveFocus();
  });

  it('Esc đóng chi tiết, trả scroll và focus về chỗ cũ', async () => {
    renderShell();
    const opener = screen.getByRole('button', { name: /^moba2d$/i });
    await userEvent.click(opener);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(opener).toHaveFocus();
  });

  it('lọc theo category thì mọi ô còn lại đều thuộc category đó', async () => {
    renderShell();
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(CATEGORY_BY_ID.osint.label.en, 'i') }),
    );
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBeGreaterThan(0);
    for (const a of articles) {
      expect(a).toHaveAttribute('data-category', 'osint');
    }
  });

  it('không tìm thấy gì thì nói rõ chứ không để lưới trắng', async () => {
    renderShell();
    await userEvent.type(screen.getByRole('searchbox'), 'zzzzkhongcogi');
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByText('No matching projects')).toBeInTheDocument();
    expect(screen.getByText('Try another word, or clear the filters.')).toBeInTheDocument();
  });

  it('có nút đổi theme và đổi ngôn ngữ', () => {
    renderShell();
    expect(screen.getByRole('button', { name: /theme|giao diện/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });

  it('mọi dự án featured đều được ô lớn, còn lại là ô nhỏ', () => {
    renderShell();
    expect(FEATURED.length).toBeGreaterThan(0);
    expect(largeTiles()).toHaveLength(FEATURED.length);
    expect(smallTiles()).toHaveLength(screen.getAllByRole('article').length - FEATURED.length);

    const titles = [...largeTiles()].map((el) => el.querySelector('button')?.textContent);
    for (const p of FEATURED) expect(titles).toContain(p.title);
  });

  it('lọc sang nhóm không có dự án nổi bật nào thì không còn ô lớn', async () => {
    renderShell();
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(CATEGORY_BY_ID.devtools.label.en, 'i') }),
    );
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
    expect(largeTiles()).toHaveLength(0);
  });

  it('ẩn hẳn phần học vấn khi chưa điền, thay vì hiện tiêu đề rỗng', () => {
    renderShell();
    if (PROFILE.education.length === 0) {
      expect(screen.queryByRole('heading', { name: /education|học vấn/i })).toBeNull();
    } else {
      expect(screen.getByRole('heading', { name: /education|học vấn/i })).toBeInTheDocument();
    }
    if (PROFILE.experience.length === 0) {
      expect(screen.queryByRole('heading', { name: /experience|kinh nghiệm/i })).toBeNull();
    } else {
      expect(screen.getByRole('heading', { name: /experience|kinh nghiệm/i })).toBeInTheDocument();
    }
  });

  it('hiện ô kỹ năng và ô số liệu ngay trong lưới, không tách khối riêng', () => {
    renderShell();
    expect(screen.getByRole('heading', { name: /skills|kỹ năng/i })).toBeInTheDocument();
    expect(screen.getByText('Claude Code')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-cell="stat"]').length).toBe(4);
    // Ô chrome và ô dự án phải là anh em ruột trong đúng một lưới.
    const grid = document.querySelector('.bn-grid');
    expect(document.querySelector('[data-cell="identity"]')?.parentElement).toBe(grid);
    expect(document.querySelector('article[data-tile="lg"]')?.parentElement).toBe(grid);
    expect(document.querySelector('[data-cell="contact"]')?.parentElement).toBe(grid);
  });

  it('đổi ngôn ngữ thì chữ trên trang đổi theo', async () => {
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: 'VI' }));
    expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Tìm dự án, công nghệ…');
  });
});
