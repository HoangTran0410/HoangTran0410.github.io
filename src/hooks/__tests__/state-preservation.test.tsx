import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '../../App';
import { useCatalog } from '../useCatalog';
import { useI18n } from '../useI18n';
import { useProjectDetail } from '../useProjectDetail';
import { useTheme } from '../useTheme';

const wrap = ({ children }: { children: ReactNode }) => <AppProviders>{children}</AppProviders>;

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('đổi theme là bất biến trung tâm của thiết kế', () => {
  it('giữ nguyên filter, search, ngôn ngữ và dự án đang mở', () => {
    const { result } = renderHook(
      () => ({
        catalog: useCatalog(),
        theme: useTheme(),
        detail: useProjectDetail(),
        i18n: useI18n(),
      }),
      { wrapper: wrap },
    );

    act(() => {
      result.current.i18n.setLocale('en');
      result.current.catalog.setCategory('games');
      result.current.catalog.setQuery('moba');
    });
    act(() => result.current.detail.open('moba2d'));

    const before = result.current.catalog.projects.map((p) => p.slug);
    expect(before.length).toBeGreaterThan(0);

    act(() => result.current.theme.setTheme('terminal'));

    expect(result.current.theme.themeId).toBe('terminal');
    expect(result.current.i18n.locale).toBe('en');
    expect(result.current.catalog.category).toBe('games');
    expect(result.current.catalog.query).toBe('moba');
    expect(result.current.detail.project?.slug).toBe('moba2d');
    expect(result.current.catalog.projects.map((p) => p.slug)).toEqual(before);
  });

  it('đi qua cả bốn theme vẫn không mất gì', () => {
    const { result } = renderHook(
      () => ({ catalog: useCatalog(), theme: useTheme() }),
      { wrapper: wrap },
    );
    act(() => result.current.catalog.setCategory('creative'));
    for (const id of ['arcade', 'bento', 'terminal', 'editorial'] as const) {
      act(() => result.current.theme.setTheme(id));
      expect(result.current.catalog.category).toBe('creative');
    }
  });
});
