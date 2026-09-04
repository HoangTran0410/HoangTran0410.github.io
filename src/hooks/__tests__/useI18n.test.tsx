import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider, useI18n } from '../useI18n';

const wrap = ({ children }: { children: ReactNode }) => <I18nProvider>{children}</I18nProvider>;
const setup = () => renderHook(() => useI18n(), { wrapper: wrap });

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  vi.restoreAllMocks();
});

describe('useI18n', () => {
  it('mặc định theo ngôn ngữ trình duyệt', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('vi-VN');
    expect(setup().result.current.locale).toBe('vi');
  });

  it('trình duyệt không phải tiếng Việt thì dùng tiếng Anh', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    expect(setup().result.current.locale).toBe('en');
  });

  it('localStorage thắng ngôn ngữ trình duyệt', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    localStorage.setItem('locale', 'vi');
    expect(setup().result.current.locale).toBe('vi');
  });

  it('query param thắng localStorage', () => {
    localStorage.setItem('locale', 'vi');
    window.history.replaceState({}, '', '/?lang=en');
    expect(setup().result.current.locale).toBe('en');
  });

  it('giá trị rác trong url bị bỏ qua', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('vi-VN');
    window.history.replaceState({}, '', '/?lang=klingon');
    expect(setup().result.current.locale).toBe('vi');
  });

  it('ti() lấy đúng bản dịch theo locale hiện tại', () => {
    const { result } = setup();
    act(() => result.current.setLocale('vi'));
    expect(result.current.ti({ vi: 'xin chào', en: 'hello' })).toBe('xin chào');
    act(() => result.current.setLocale('en'));
    expect(result.current.ti({ vi: 'xin chào', en: 'hello' })).toBe('hello');
  });

  it('t() tra được chuỗi UI theo khoá', () => {
    const { result } = setup();
    act(() => result.current.setLocale('vi'));
    expect(result.current.t('filter.all')).toBe('Tất cả');
    act(() => result.current.setLocale('en'));
    expect(result.current.t('filter.all')).toBe('All');
  });

  it('setLocale ghi localStorage và cập nhật thuộc tính lang của html', () => {
    const { result } = setup();
    act(() => result.current.setLocale('en'));
    expect(localStorage.getItem('locale')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
