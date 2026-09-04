import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

const timeline = () => document.querySelector('#timeline') as HTMLElement;

/**
 * Giả lập breakpoint để useCols() trả về đúng số cột của bề ngang đang xét —
 * jsdom không có matchMedia nên mặc định mọi test chạy ở 4 cột.
 */
function setViewport(width: number) {
  vi.stubGlobal('matchMedia', (query: string) => {
    const min = /min-width:\s*(\d+)px/.exec(query);
    return {
      matches: min ? width >= Number(min[1]) : false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    };
  });
}

interface Box {
  /** số cột chiếm */
  c: number;
  /** số hàng chiếm */
  r: number;
}

/** Đọc kích thước từng ô của .bn-grid đúng theo luật span trong bento.css. */
function boxes(cols: number): Box[] {
  const grid = document.querySelector('.bn-grid');
  return [...grid!.children].map((el) => {
    if (cols === 1) return { c: 1, r: 1 };
    const span = el.getAttribute('data-span');
    if (span === 'full') return { c: cols, r: 1 };
    if (span === '2x2' || el.getAttribute('data-tile') === 'lg') return { c: 2, r: 2 };
    if (el.getAttribute('data-tile') === 'sm' && el.getAttribute('data-wide') === '1')
      return { c: 2, r: 1 };
    return { c: 1, r: 1 };
  });
}

/**
 * Mô phỏng `grid-auto-flow: row dense` rồi đếm ô lưới còn trống. Ô cuối cùng
 * là chân trang chiếm trọn hàng, nên lưới kín đồng nghĩa với 0 ô trống.
 */
function holes(cols: number): number {
  const rows: boolean[][] = [];
  const row = (r: number) => (rows[r] ??= new Array<boolean>(cols).fill(false));

  const free = (r: number, c: number, b: Box) => {
    for (let dr = 0; dr < b.r; dr++) {
      for (let dc = 0; dc < b.c; dc++) if (row(r + dr)[c + dc]) return false;
    }
    return true;
  };

  for (const b of boxes(cols)) {
    let placed = false;
    for (let r = 0; !placed; r++) {
      for (let c = 0; c + b.c <= cols; c++) {
        if (!free(r, c, b)) continue;
        for (let dr = 0; dr < b.r; dr++) {
          for (let dc = 0; dc < b.c; dc++) row(r + dr)[c + dc] = true;
        }
        placed = true;
        break;
      }
    }
  }

  return rows.flat().filter((filled) => !filled).length;
}

const FEATURED = getProjects().filter((p) => p.featured);

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  vi.unstubAllGlobals();
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
    await userEvent.click(screen.getAllByRole('button', { name: /^moba2d$/i })[0]);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const source = within(dialog).getByRole('link', { name: /github/i });
    expect(source.getAttribute('href')).toContain('github.com');
  });

  it('mở chi tiết thì khoá scroll nền và đưa focus vào nút đóng', async () => {
    renderShell();
    const opener = screen.getAllByRole('button', { name: /^moba2d$/i })[0];
    await userEvent.click(opener);
    const dialog = await screen.findByRole('dialog');
    expect(document.body.style.overflow).toBe('hidden');
    expect(within(dialog).getByRole('button', { name: /close|đóng/i })).toHaveFocus();
  });

  it('Esc đóng chi tiết, trả scroll và focus về chỗ cũ', async () => {
    renderShell();
    const opener = screen.getAllByRole('button', { name: /^moba2d$/i })[0];
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

  it('có dòng thời gian, trong đó có mốc công việc thật', () => {
    renderShell();
    expect(timeline()).toBeInTheDocument();
    expect(within(timeline()).getByText('MoMo · M_Service')).toBeInTheDocument();
  });

  it('các năm trong dòng thời gian giảm dần', () => {
    renderShell();
    const years = [...timeline().querySelectorAll('[data-year]')].map((el) =>
      Number(el.getAttribute('data-year')),
    );
    expect(years.length).toBeGreaterThan(1);
    for (let i = 1; i < years.length; i++) expect(years[i]).toBeLessThan(years[i - 1]);
  });

  it('lọc category thì dòng thời gian co lại theo', async () => {
    renderShell();
    const before = within(timeline()).getAllByRole('button').length;
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(CATEGORY_BY_ID.osint.label.en, 'i') }),
    );
    const after = within(timeline()).getAllByRole('button');
    expect(after.length).toBeGreaterThan(0);
    expect(after.length).toBeLessThan(before);
  });

  it('tên dự án trong dòng thời gian là nút mở đúng dự án đó', async () => {
    renderShell();
    await userEvent.click(within(timeline()).getByRole('button', { name: /^moba2d$/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { level: 2 })).toHaveTextContent('moba2d');
  });

  it.each([
    ['1440', 1440, 4],
    ['768', 768, 2],
    ['390', 390, 1],
  ])('lưới không hở lỗ ở %s px', (_label, width, cols) => {
    setViewport(width);
    renderShell();
    expect(boxes(cols).length).toBeGreaterThan(10);
    expect(document.querySelector('#timeline')?.parentElement).toBe(
      document.querySelector('.bn-grid'),
    );
    expect(holes(cols)).toBe(0);
  });

  it('đổi ngôn ngữ thì chữ trên trang đổi theo', async () => {
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: 'VI' }));
    expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Tìm dự án, công nghệ…');
  });
});
