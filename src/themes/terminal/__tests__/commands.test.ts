import { describe, expect, it, vi } from 'vitest';
import { PROFILE } from '../../../data/profile';
import { getProjects } from '../../../lib/merge';
import type { Locale } from '../../../data/types';
import {
  COMMAND_NAMES,
  levenshtein,
  runCommand,
  suggestSlugs,
  type CommandContext,
} from '../commands';

const PROJECTS = getProjects();

function makeCtx(locale: Locale = 'en') {
  const ctx: CommandContext = {
    projects: PROJECTS,
    profile: PROFILE,
    locale,
    setTheme: vi.fn(),
    setLocale: vi.fn(),
    open: vi.fn(),
    clear: vi.fn(),
  };
  return ctx;
}

describe('runCommand — cú pháp', () => {
  it('chuỗi rỗng hoặc toàn khoảng trắng thì không làm gì', () => {
    const ctx = makeCtx();
    expect(runCommand('', ctx)).toEqual({ kind: 'noop' });
    expect(runCommand('    ', ctx)).toEqual({ kind: 'noop' });
    expect(runCommand('\t \n', ctx)).toEqual({ kind: 'noop' });
  });

  it('bỏ khoảng trắng thừa và không phân biệt hoa thường', () => {
    const ctx = makeCtx();
    const result = runCommand('   LS    Games   ', ctx);
    expect(result.kind).toBe('projects');
    if (result.kind !== 'projects') return;
    expect(result.category).toBe('games');
    expect(result.items.every((p) => p.category === 'games')).toBe(true);
  });

  it('lệnh lạ báo lỗi và nhắc gõ help', () => {
    const result = runCommand('sudo rm -rf /', makeCtx());
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.message).toMatch(/help/);
    expect(result.message).toMatch(/sudo/);
  });
});

describe('help', () => {
  it('liệt kê đủ mọi lệnh', () => {
    const result = runCommand('help', makeCtx());
    expect(result.kind).toBe('text');
    if (result.kind !== 'text') return;
    const body = result.lines.join('\n');
    for (const name of COMMAND_NAMES) expect(body).toContain(name);
  });

  it('nhắc lệnh timeline — nếu không có ở đây thì không ai tìm ra nó', () => {
    const result = runCommand('help', makeCtx());
    expect(result.kind).toBe('text');
    if (result.kind !== 'text') return;
    expect(result.lines.join('\n')).toMatch(/timeline/);
  });

  it('nói tiếng Việt khi locale là vi', () => {
    const result = runCommand('help', makeCtx('vi'));
    expect(result.kind).toBe('text');
    if (result.kind !== 'text') return;
    expect(result.lines[0]).toMatch(/lệnh/i);
  });
});

describe('ls', () => {
  it('không tham số thì trả về mọi dự án', () => {
    const result = runCommand('ls', makeCtx());
    expect(result.kind).toBe('projects');
    if (result.kind !== 'projects') return;
    expect(result.items).toHaveLength(PROJECTS.length);
    expect(result.category).toBe('all');
  });

  it('ls games chỉ trả về nhóm đó', () => {
    const result = runCommand('ls games', makeCtx());
    expect(result.kind).toBe('projects');
    if (result.kind !== 'projects') return;
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.length).toBeLessThan(PROJECTS.length);
    expect(result.items.every((p) => p.category === 'games')).toBe(true);
  });

  it('ls all giống hệt ls', () => {
    const result = runCommand('ls all', makeCtx());
    expect(result.kind).toBe('projects');
    if (result.kind !== 'projects') return;
    expect(result.items).toHaveLength(PROJECTS.length);
  });

  it('category sai thì lỗi, và lỗi phải liệt kê các category hợp lệ', () => {
    const result = runCommand('ls khong-co-nhom-nay', makeCtx());
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.message).toMatch(/games/);
    expect(result.message).toMatch(/products/);
    expect(result.message).toMatch(/osint/);
    expect(result.message).toMatch(/archive/);
  });
});

describe('cat', () => {
  it('slug đúng thì trả về dự án đó', () => {
    const result = runCommand('cat moba2d', makeCtx());
    expect(result.kind).toBe('project');
    if (result.kind !== 'project') return;
    expect(result.item.slug).toBe('moba2d');
  });

  it('cat moba gợi ý moba2d', () => {
    const result = runCommand('cat moba', makeCtx());
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.message).toMatch(/moba2d/);
  });

  it('gõ sai vài ký tự vẫn gợi ý đúng (Levenshtein)', () => {
    const result = runCommand('cat mboa2d', makeCtx());
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.message).toMatch(/moba2d/);
  });

  it('slug không giống gì cả thì nhắc chạy ls', () => {
    const result = runCommand('cat zzzzqqqqwwww', makeCtx());
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.message).toMatch(/ls/);
  });

  it('thiếu tham số thì chỉ luôn cách dùng', () => {
    const result = runCommand('cat', makeCtx());
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.message).toMatch(/cat moba2d/);
  });
});

describe('open', () => {
  it('slug đúng thì gọi ctx.open', () => {
    const ctx = makeCtx();
    const result = runCommand('open moba2d', ctx);
    expect(ctx.open).toHaveBeenCalledWith('moba2d');
    expect(result.kind).toBe('text');
  });

  it('slug sai thì báo lỗi và không mở gì', () => {
    const ctx = makeCtx();
    const result = runCommand('open khong-ton-tai', ctx);
    expect(ctx.open).not.toHaveBeenCalled();
    expect(result.kind).toBe('error');
  });
});

describe('các lệnh trả về một khối nội dung', () => {
  it.each([
    ['whoami', 'profile'],
    ['stats', 'stats'],
    ['skills', 'skills'],
    ['contact', 'contact'],
    ['timeline', 'timeline'],
  ])('%s → %s', (input, kind) => {
    expect(runCommand(input, makeCtx()).kind).toBe(kind);
  });
});

describe('timeline', () => {
  it('trả về đúng khối timeline, không kèm gì khác', () => {
    expect(runCommand('timeline', makeCtx())).toEqual({ kind: 'timeline' });
  });

  it('`log` là alias — nhưng `history` thì không, vì ↑ ↓ đang giữ nghĩa đó', () => {
    expect(runCommand('log', makeCtx())).toEqual({ kind: 'timeline' });
    expect(runCommand('history', makeCtx()).kind).toBe('error');
  });

  it('Tab hoàn thành `time` → `timeline`: chỉ đúng một lệnh khớp tiền tố', () => {
    expect(COMMAND_NAMES.filter((n) => n.startsWith('time'))).toEqual(['timeline']);
  });
});

describe('theme', () => {
  it('id hợp lệ thì đổi theme', () => {
    const ctx = makeCtx();
    const result = runCommand('theme bento', ctx);
    expect(ctx.setTheme).toHaveBeenCalledWith('bento');
    expect(result.kind).toBe('text');
  });

  it('id sai thì lỗi và KHÔNG đổi theme', () => {
    const ctx = makeCtx();
    const result = runCommand('theme vaporwave', ctx);
    expect(ctx.setTheme).not.toHaveBeenCalled();
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.message).toMatch(/terminal/);
    expect(result.message).toMatch(/editorial/);
  });

  it('thiếu tham số cũng là lỗi, không đổi theme', () => {
    const ctx = makeCtx();
    expect(runCommand('theme', ctx).kind).toBe('error');
    expect(ctx.setTheme).not.toHaveBeenCalled();
  });
});

describe('lang', () => {
  it('lang en đổi sang tiếng Anh', () => {
    const ctx = makeCtx('vi');
    runCommand('lang en', ctx);
    expect(ctx.setLocale).toHaveBeenCalledWith('en');
  });

  it('lang vi đổi sang tiếng Việt', () => {
    const ctx = makeCtx();
    runCommand('lang vi', ctx);
    expect(ctx.setLocale).toHaveBeenCalledWith('vi');
  });

  it('ngôn ngữ lạ thì lỗi và không đổi', () => {
    const ctx = makeCtx();
    const result = runCommand('lang jp', ctx);
    expect(ctx.setLocale).not.toHaveBeenCalled();
    expect(result.kind).toBe('error');
  });
});

describe('clear', () => {
  it('gọi ctx.clear và không in thêm gì', () => {
    const ctx = makeCtx();
    const result = runCommand('clear', ctx);
    expect(ctx.clear).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ kind: 'noop' });
  });
});

describe('gợi ý slug', () => {
  it('levenshtein đếm đúng số ký tự sai lệch', () => {
    expect(levenshtein('moba2d', 'moba2d')).toBe(0);
    expect(levenshtein('moba', 'moba2d')).toBe(2);
    expect(levenshtein('', 'abc')).toBe(3);
  });

  it('ưu tiên slug chứa chuỗi đã gõ', () => {
    const near = suggestSlugs('moba', ['pong', 'moba2d', 'moba2d-lol']);
    expect(near[0]).toBe('moba2d');
  });

  it('bỏ qua slug lệch quá 3 ký tự', () => {
    expect(suggestSlugs('pong', ['cipher-breaker', 'smartphone-store'])).toHaveLength(0);
  });
});
