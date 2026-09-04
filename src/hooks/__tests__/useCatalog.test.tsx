import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CatalogProvider, useCatalog } from '../useCatalog';

const wrap = ({ children }: { children: ReactNode }) => <CatalogProvider>{children}</CatalogProvider>;
const setup = () => renderHook(() => useCatalog(), { wrapper: wrap });

beforeEach(() => window.history.replaceState({}, '', '/'));

describe('useCatalog', () => {
  it('mặc định hiện tất cả dự án', () => {
    const { result } = setup();
    expect(result.current.projects.length).toBe(result.current.all.length);
  });

  it('lọc theo category', () => {
    const { result } = setup();
    act(() => result.current.setCategory('games'));
    expect(result.current.projects.length).toBeGreaterThan(0);
    for (const p of result.current.projects) expect(p.category).toBe('games');
  });

  it('search khớp trên tên dự án', () => {
    const { result } = setup();
    act(() => result.current.setQuery('moba'));
    expect(result.current.projects.some((p) => p.slug === 'moba2d')).toBe(true);
  });

  it('search khớp trên tag công nghệ', () => {
    const { result } = setup();
    act(() => result.current.setQuery('typescript'));
    expect(result.current.projects.length).toBeGreaterThan(3);
  });

  it('search gõ không dấu vẫn ra kết quả có dấu', () => {
    const { result } = setup();
    act(() => result.current.setQuery('tro choi'));
    expect(result.current.projects.length).toBeGreaterThan(0);
  });

  it('sort theo sao thì mục nhiều sao nhất đứng đầu', () => {
    const { result } = setup();
    act(() => result.current.setSort('stars'));
    const stars = result.current.projects.map((p) => p.stats?.stars ?? 0);
    expect([...stars].sort((a, b) => b - a)).toEqual(stars);
  });

  it('sort theo tên là thứ tự bảng chữ cái', () => {
    const { result } = setup();
    act(() => result.current.setSort('name'));
    const names = result.current.projects.map((p) => p.title.toLowerCase());
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
  });

  it('sort theo mới nhất thì năm giảm dần', () => {
    const { result } = setup();
    act(() => result.current.setSort('recent'));
    const years = result.current.projects.map((p) => p.year);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
  });

  it('counts khớp số lượng thực tế mỗi category', () => {
    const { result } = setup();
    const { all, counts } = result.current;
    expect(counts.all).toBe(all.length);
    expect(counts.games).toBe(all.filter((p) => p.category === 'games').length);
  });

  it('đồng bộ trạng thái lên URL để share được', () => {
    const { result } = setup();
    act(() => result.current.setCategory('osint'));
    act(() => result.current.setQuery('ip'));
    expect(window.location.search).toContain('cat=osint');
    expect(window.location.search).toContain('q=ip');
  });

  it('đọc lại trạng thái từ URL lúc khởi tạo', () => {
    window.history.replaceState({}, '', '/?cat=creative');
    expect(setup().result.current.category).toBe('creative');
  });

  it('category rác trong URL thì coi như tất cả', () => {
    window.history.replaceState({}, '', '/?cat=khong-co-that');
    expect(setup().result.current.category).toBe('all');
  });

  it('reset đưa về mặc định và xoá query param', () => {
    const { result } = setup();
    act(() => result.current.setCategory('games'));
    act(() => result.current.setQuery('x'));
    act(() => result.current.reset());
    expect(result.current.category).toBe('all');
    expect(result.current.query).toBe('');
    expect(result.current.projects.length).toBe(result.current.all.length);
  });
});
