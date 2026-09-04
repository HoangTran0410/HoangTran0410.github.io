import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from '../useTheme';
import { THEME_META } from '../../themes/registry';

const wrap = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>;
const setup = () => renderHook(() => useTheme(), { wrapper: wrap });

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('useTheme', () => {
  it('mặc định là editorial', () => {
    expect(setup().result.current.themeId).toBe('editorial');
  });

  it('localStorage thắng mặc định', () => {
    localStorage.setItem('theme', 'arcade');
    expect(setup().result.current.themeId).toBe('arcade');
  });

  it('query param thắng localStorage', () => {
    localStorage.setItem('theme', 'arcade');
    window.history.replaceState({}, '', '/?theme=terminal');
    expect(setup().result.current.themeId).toBe('terminal');
  });

  it('bỏ qua giá trị rác, quay về mặc định', () => {
    window.history.replaceState({}, '', '/?theme=khong-ton-tai');
    expect(setup().result.current.themeId).toBe('editorial');
  });

  it('ghi data-theme lên thẻ html để CSS token đổi theo', () => {
    const { result } = setup();
    act(() => result.current.setTheme('bento'));
    expect(document.documentElement.dataset.theme).toBe('bento');
  });

  it('nhớ lựa chọn vào localStorage', () => {
    const { result } = setup();
    act(() => result.current.setTheme('arcade'));
    expect(localStorage.getItem('theme')).toBe('arcade');
  });

  it('có metadata cho đủ 4 theme', () => {
    expect(Object.keys(THEME_META).sort()).toEqual(['arcade', 'bento', 'editorial', 'terminal']);
    for (const m of Object.values(THEME_META)) {
      expect(m.label.vi).toBeTruthy();
      expect(m.label.en).toBeTruthy();
      expect(m.hint.vi).toBeTruthy();
      expect(m.swatch).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('preload không ném lỗi kể cả gọi nhiều lần', async () => {
    const { result } = setup();
    await act(async () => {
      result.current.preload('arcade');
      result.current.preload('arcade');
    });
    expect(result.current.themeId).toBe('editorial');
  });
});
