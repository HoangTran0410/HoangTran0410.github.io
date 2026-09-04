import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '../../../App';
import terminal from '../index';

function renderShell() {
  const view = render(
    <AppProviders>
      <terminal.Shell />
    </AppProviders>,
  );
  return view;
}

const commandLine = () => screen.getByRole('textbox', { name: /command line|dòng lệnh/i });

/** Gõ một lệnh rồi Enter, y như người dùng thật. */
async function type(line: string) {
  await userEvent.type(commandLine(), `${line}{Enter}`);
}

/** Khối output của lệnh vừa chạy — mỗi khối gắn data-cmd là dòng đã gõ. */
function lastEntry(container: HTMLElement): HTMLElement {
  const blocks = container.querySelectorAll<HTMLElement>('[data-cmd]');
  expect(blocks.length).toBeGreaterThan(0);
  return blocks[blocks.length - 1];
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('Terminal', () => {
  it('mở lên đã có sẵn output, không phải màn hình trống', () => {
    const { container } = renderShell();
    const blocks = container.querySelectorAll('[data-cmd]');
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector('[data-cmd="whoami"]')).not.toBeNull();
    expect(screen.getAllByRole('article').length).toBeGreaterThan(30);
  });

  it('có dòng nhắc gõ help', () => {
    renderShell();
    expect(screen.getByText('help', { selector: 'code' })).toBeInTheDocument();
    expect(screen.getByText(/to see every command|xem mọi lệnh/i)).toBeInTheDocument();
  });

  it('ô nhập lệnh có aria-label và bấm vào khung thì tiêu điểm về đó', async () => {
    renderShell();
    const input = commandLine();
    expect(input).toHaveAttribute('aria-label');
    await userEvent.click(screen.getByRole('log'));
    expect(input).toHaveFocus();
  });

  it('gõ `ls games` thì in ra đúng các dự án nhóm games', async () => {
    const { container } = renderShell();
    await type('ls games');

    const block = lastEntry(container);
    expect(block).toHaveAttribute('data-cmd', 'ls games');
    const articles = within(block).getAllByRole('article');
    expect(articles.length).toBeGreaterThan(0);
    for (const a of articles) expect(a).toHaveAttribute('data-category', 'games');
  });

  it('`ls <nhóm>` đẩy bộ lọc vào state chung, để theme khác thấy cùng nhóm', async () => {
    renderShell();
    await type('ls osint');
    expect(new URLSearchParams(window.location.search).get('cat')).toBe('osint');
    await type('ls');
    expect(new URLSearchParams(window.location.search).get('cat')).toBeNull();
  });

  it('gõ lệnh lạ thì báo lỗi và nhắc help', async () => {
    const { container } = renderShell();
    await type('vim');
    expect(lastEntry(container)).toHaveTextContent(/help/i);
    expect(lastEntry(container)).toHaveTextContent(/vim/);
  });

  it('↑ lấy lại lệnh vừa gõ', async () => {
    renderShell();
    await type('ls games');
    expect(commandLine()).toHaveValue('');
    await userEvent.keyboard('{ArrowUp}');
    expect(commandLine()).toHaveValue('ls games');
    await userEvent.keyboard('{ArrowDown}');
    expect(commandLine()).toHaveValue('');
  });

  it('Tab hoàn thành tên lệnh', async () => {
    renderShell();
    await userEvent.type(commandLine(), 'wh');
    await userEvent.keyboard('{Tab}');
    expect(commandLine()).toHaveValue('whoami');
  });

  it('Tab cũng hoàn thành slug cho cat', async () => {
    renderShell();
    await userEvent.type(commandLine(), 'cat mob');
    await userEvent.keyboard('{Tab}');
    expect(commandLine()).toHaveValue('cat moba2d');
  });

  it('clear xoá sạch output, kể cả banner lúc khởi động', async () => {
    const { container } = renderShell();
    await type('clear');
    expect(container.querySelectorAll('[data-cmd]')).toHaveLength(0);
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.queryByText('help', { selector: 'code' })).toBeNull();
  });

  it('Ctrl+L cũng dọn màn hình', async () => {
    const { container } = renderShell();
    await userEvent.click(commandLine());
    await userEvent.keyboard('{Control>}l{/Control}');
    expect(container.querySelectorAll('[data-cmd]')).toHaveLength(0);
  });

  it('bấm tên dự án moba2d thì mở cửa sổ chi tiết có link github', async () => {
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: /^moba2d$/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const source = within(dialog).getByRole('link', { name: /github/i });
    expect(source.getAttribute('href')).toContain('github.com');
  });

  it('lệnh `open <slug>` cũng mở cửa sổ đó', async () => {
    renderShell();
    await type('open pong');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('Esc đóng cửa sổ chi tiết và trả tiêu điểm về nút vừa bấm', async () => {
    renderShell();
    const opener = screen.getByRole('button', { name: /^moba2d$/i });
    await userEvent.click(opener);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opener).toHaveFocus();
  });

  it('có nút đổi theme và nút EN', () => {
    renderShell();
    expect(screen.getByRole('button', { name: /theme|giao diện/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });

  it('lệnh `lang vi` đổi ngôn ngữ cả trang', async () => {
    renderShell();
    await type('lang vi');
    expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Tìm dự án, công nghệ…');
  });

  it('có ô tìm kiếm, gõ vào thì danh sách co lại', async () => {
    renderShell();
    const before = screen.getAllByRole('article').length;
    const search = screen.getByRole('searchbox');
    expect(search).toHaveAttribute('type', 'search');
    await userEvent.type(search, 'moba');
    const after = screen.getAllByRole('article').length;
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
  });

  it('không còn dự án nào khớp thì nói rõ chứ không để màn trống', async () => {
    renderShell();
    await userEvent.type(screen.getByRole('searchbox'), 'zzzzkhongcogi');
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByText(/no matching projects|không tìm thấy/i)).toBeInTheDocument();
  });

  it('có hàng nút gợi ý lệnh cho màn hình hẹp, bấm là chạy lệnh', async () => {
    const { container } = renderShell();
    await userEvent.click(screen.getByRole('button', { name: 'skills' }));
    expect(lastEntry(container)).toHaveAttribute('data-cmd', 'skills');
    expect(within(lastEntry(container)).getByRole('heading', { name: /skills|kỹ năng/i })).toBeInTheDocument();
  });

  it('`cat <slug>` in chi tiết ngay trên màn hình', async () => {
    const { container } = renderShell();
    await type('cat moba2d');
    const block = lastEntry(container);
    expect(within(block).getByRole('heading', { name: 'moba2d' })).toBeInTheDocument();
    expect(within(block).getByRole('link', { name: /github/i })).toBeInTheDocument();
  });

  it('`ls <nhóm sai>` báo lỗi kèm danh sách nhóm hợp lệ', async () => {
    const { container } = renderShell();
    await type('ls khongcogi');
    expect(lastEntry(container)).toHaveTextContent(/games/);
    expect(lastEntry(container)).toHaveTextContent(/osint/);
  });

  it('`theme editorial` đổi theme thật', async () => {
    renderShell();
    await type('theme editorial');
    expect(localStorage.getItem('theme')).toBe('editorial');
  });
});
