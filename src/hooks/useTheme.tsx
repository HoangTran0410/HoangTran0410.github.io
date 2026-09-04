import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  DEFAULT_THEME,
  THEME_LOADERS,
  THEME_META,
  isThemeId,
} from '../themes/registry';
import type { Theme, ThemeId, ThemeMeta } from '../themes/contract';
import { readParam, writeParam } from './useUrlState';

/** Thứ tự ưu tiên: query param > localStorage > mặc định. */
function initialTheme(): ThemeId {
  const fromUrl = readParam('theme');
  if (isThemeId(fromUrl)) return fromUrl;

  const stored = localStorage.getItem('theme');
  if (isThemeId(stored)) return stored;

  return DEFAULT_THEME;
}

/** Cache module theme đã tải, để đổi qua lại không tải lại. */
const loaded = new Map<ThemeId, Promise<{ default: Theme }>>();

function load(id: ThemeId): Promise<{ default: Theme }> {
  let p = loaded.get(id);
  if (!p) {
    p = THEME_LOADERS[id]();
    loaded.set(id, p);
  }
  return p;
}

interface ThemeValue {
  themeId: ThemeId;
  meta: ThemeMeta;
  setTheme: (id: ThemeId) => void;
  /** Tải trước một theme, gọi khi người dùng hover vào lựa chọn. */
  preload: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_META[themeId].dark ? '#08070c' : '#fbfaf8');
  }, [themeId]);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem('theme', id);
    if (readParam('theme')) writeParam('theme', id);
  }, []);

  const preload = useCallback((id: ThemeId) => {
    void load(id).catch(() => {
      /* tải trước là tuỳ chọn — hỏng thì lúc bấm sẽ tải lại */
    });
  }, []);

  const value = useMemo<ThemeValue>(
    () => ({ themeId, meta: THEME_META[themeId], setTheme, preload }),
    [themeId, setTheme, preload],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme phải nằm trong <ThemeProvider>');
  return ctx;
}
