import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { PROFILE } from '../../data/profile';
import type { Profile } from '../../data/profile';
import type { Locale, Project } from '../../data/types';
import { useCatalog } from '../../hooks/useCatalog';
import type { CategoryFilter } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';
import { useTheme } from '../../hooks/useTheme';
import { THEME_IDS } from '../registry';
import {
  CATEGORY_ARGS,
  COMMANDS,
  COMMAND_NAMES,
  LOCALE_ARGS,
  runCommand,
} from './commands';
import type { ArgKind, CommandContext, CommandResult } from './commands';

export interface TerminalEntry {
  id: number;
  /** Dòng người dùng đã gõ, in lại sau dấu nhắc */
  input: string;
  result: CommandResult;
}

/** hoangtran@github ~ $ — dựng từ profile chứ không viết cứng. */
export const PROMPT = `${PROFILE.name.toLowerCase().replace(/\s+/g, '')}@github ~ $`;

/**
 * Hàng nút gợi ý trên màn hình hẹp, để không ai phải gõ trên bàn phím ảo.
 * Chuỗi kết thúc bằng dấu cách là lệnh còn thiếu tham số: bấm vào thì điền sẵn
 * vào ô nhập chứ không chạy ngay.
 */
export const QUICK_COMMANDS = ['help', 'ls', 'grep ', 'timeline', 'whoami', 'skills', 'contact'];

function commonPrefix(items: string[]): string {
  if (items.length === 0) return '';
  let prefix = items[0];
  for (const item of items.slice(1)) {
    while (!item.startsWith(prefix)) prefix = prefix.slice(0, -1);
    if (!prefix) break;
  }
  return prefix;
}

/**
 * Hai lệnh chạy sẵn lúc mở trang, để không ai phải nhìn màn hình trống. Chạy
 * qua đúng runCommand như người dùng tự gõ — chỉ khác là các callback gây tác
 * dụng phụ bị bịt lại, vì lúc này chưa có gì để đổi.
 */
function bootEntries(projects: Project[], profile: Profile, locale: Locale, category: CategoryFilter): TerminalEntry[] {
  const inert: CommandContext = {
    projects,
    profile,
    locale,
    category,
    setTheme: () => {},
    setLocale: () => {},
    setQuery: () => {},
    open: () => {},
    clear: () => {},
  };
  const inputs = ['whoami', category === 'all' ? 'ls' : `ls ${category}`];
  return inputs.map((input, id) => ({ id, input, result: runCommand(input, inert) }));
}

export function useTerminal() {
  const { all, category, setCategory, setQuery } = useCatalog();
  const { locale, setLocale } = useI18n();
  const { setTheme } = useTheme();
  const { open } = useProjectDetail();

  const [entries, setEntries] = useState<TerminalEntry[]>(() =>
    bootEntries(all, PROFILE, locale, category),
  );
  const [value, setValue] = useState('');
  // `clear` dọn cả banner lúc khởi động, đúng như terminal thật.
  const [cleared, setCleared] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const nextId = useRef(entries.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const print = useCallback((input: string, result: CommandResult) => {
    setEntries((prev) => [...prev, { id: nextId.current++, input, result }]);
  }, []);

  /**
   * Ở theme này ô nhập là chỗ duy nhất người dùng cần đứng, nên tiêu điểm luôn
   * được kéo về đây. preventScroll để việc kéo đó không giật màn hình đang cuộn.
   */
  const focusInput = useCallback(() => inputRef.current?.focus({ preventScroll: true }), []);

  const ctx = useMemo<CommandContext>(
    () => ({
      projects: all,
      profile: PROFILE,
      locale,
      category,
      setTheme,
      setLocale,
      setQuery,
      open,
      clear: () => {
        setEntries([]);
        setCleared(true);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      },
    }),
    [all, locale, category, setTheme, setLocale, setQuery, open],
  );

  const run = useCallback(
    (raw: string) => {
      const line = raw.trim();
      const result = runCommand(line, ctx);

      if (line) setHistory((h) => (h[h.length - 1] === line ? h : [...h, line]));
      setHistoryIndex(null);
      setValue('');

      // `ls games` phải kéo theo bộ lọc chung, để đổi sang theme khác vẫn thấy
      // đúng nhóm đó đang được chọn.
      if (result.kind === 'projects' && result.category) setCategory(result.category);
      // noop = dòng trống hoặc `clear`; cả hai đều không để lại vết trên màn hình.
      if (result.kind !== 'noop') print(line, result);

      // Lệnh có thể đến từ một cái nút (hàng gợi ý, chữ `timeline` ở dòng hint).
      // Nếu tiêu điểm nằm lại trên nút đó thì lệnh gõ tiếp theo rơi vào hư không.
      focusInput();
    },
    [ctx, print, setCategory, focusInput],
  );

  /** Nút gợi ý: lệnh đủ nghĩa thì chạy luôn, lệnh còn thiếu tham số thì điền sẵn. */
  const quick = useCallback(
    (cmd: string) => {
      if (!cmd.endsWith(' ')) {
        run(cmd);
        return;
      }
      setValue(cmd);
      focusInput();
    },
    [run, focusInput],
  );

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      run(value);
    },
    [run, value],
  );

  const recall = useCallback(
    (delta: number) => {
      if (history.length === 0) return;
      const from = historyIndex === null ? history.length : historyIndex;
      const next = from + delta;
      if (next >= history.length) {
        setHistoryIndex(null);
        setValue('');
        return;
      }
      const index = Math.max(0, next);
      setHistoryIndex(index);
      setValue(history[index]);
    },
    [history, historyIndex],
  );

  const optionsFor = useCallback(
    (arg: ArgKind): string[] => {
      if (arg === 'slug') return all.map((p) => p.slug);
      if (arg === 'category') return CATEGORY_ARGS;
      if (arg === 'theme') return [...THEME_IDS];
      if (arg === 'locale') return LOCALE_ARGS;
      // `grep <chữ>`: tham số là chữ tự do, không có gì để gợi ý.
      return [];
    },
    [all],
  );

  /** Tab: hoàn thành tên lệnh, hoặc tham số của lệnh đó (slug, nhóm, theme…). */
  const complete = useCallback(() => {
    const parts = value.trimStart().split(' ');

    if (parts.length <= 1) {
      const prefix = parts[0].toLowerCase();
      const matches = COMMAND_NAMES.filter((n) => n.startsWith(prefix));
      if (matches.length === 0) return;
      if (matches.length === 1) {
        const spec = COMMANDS.find((c) => c.name === matches[0]);
        setValue(spec?.arg ? `${matches[0]} ` : matches[0]);
        return;
      }
      const prefixed = commonPrefix(matches);
      if (prefixed.length > prefix.length) setValue(prefixed);
      else print(value, { kind: 'text', lines: [matches.join('   ')] });
      return;
    }

    const spec = COMMANDS.find((c) => c.name === parts[0].toLowerCase());
    if (!spec?.arg) return;

    const prefix = parts[1].toLowerCase();
    const matches = optionsFor(spec.arg).filter((o) => o.startsWith(prefix));
    if (matches.length === 0) return;

    const completion = matches.length === 1 ? matches[0] : commonPrefix(matches);
    if (completion.length > prefix.length) setValue(`${spec.name} ${completion}`);
    else print(value, { kind: 'text', lines: [matches.slice(0, 30).join('   ')] });
  }, [value, optionsFor, print]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        complete();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        recall(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        recall(1);
      } else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        run('clear');
      }
    },
    [complete, recall, run],
  );

  // Mở trang là gõ được ngay, không phải bấm chuột một phát mở màn.
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  /**
   * Tiêu điểm vẫn có thể trôi đi: bấm ra ngoài, đóng một cửa sổ, Tab lung tung.
   * Gõ một ký tự in được lúc đó là ý muốn gõ lệnh — kéo tiêu điểm về ô nhập và
   * để nguyên phím vừa bấm chạy tiếp vào đó (không preventDefault).
   * Trừ khi người dùng đang đứng ở một chỗ gõ được hoặc bấm được thật.
   */
  useEffect(() => {
    // KeyboardEvent ở file này đang là bản của React (import type ở trên).
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === inputRef.current) return;
      if (el.closest?.('a, button, input, select, textarea, [contenteditable=""], [contenteditable="true"], [role="dialog"]')) return;
      focusInput();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusInput]);

  /**
   * Bàn phím ảo trên điện thoại không làm 100dvh co lại, nên dòng lệnh dễ bị
   * che mất. Bám theo visualViewport là cách duy nhất biết được phần màn hình
   * còn thật sự nhìn thấy.
   */
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const apply = () => document.documentElement.style.setProperty('--term-vh', `${vv.height}px`);
    apply();
    vv.addEventListener('resize', apply);
    return () => {
      vv.removeEventListener('resize', apply);
      document.documentElement.style.removeProperty('--term-vh');
    };
  }, []);

  // Màn hình dán đáy sau mỗi lệnh, y như terminal thật — trừ lần đầu, vì lúc
  // mở trang người ta nên thấy banner và `whoami` trước chứ không phải đáy
  // danh sách dự án.
  const printed = useRef(entries.length);
  useEffect(() => {
    const el = scrollRef.current;
    if (el && entries.length > printed.current) el.scrollTop = el.scrollHeight;
    printed.current = entries.length;
  }, [entries]);

  return {
    entries,
    cleared,
    value,
    setValue,
    history,
    run,
    quick,
    submit,
    onKeyDown,
    focusInput,
    inputRef,
    scrollRef,
    prompt: PROMPT,
  };
}
