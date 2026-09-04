import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CatalogProvider } from '../useCatalog';
import { ProjectDetailProvider, useProjectDetail } from '../useProjectDetail';

const wrap = ({ children }: { children: ReactNode }) => (
  <CatalogProvider>
    <ProjectDetailProvider>{children}</ProjectDetailProvider>
  </CatalogProvider>
);
const setup = () => renderHook(() => useProjectDetail(), { wrapper: wrap });

beforeEach(() => window.history.replaceState({}, '', '/'));

describe('useProjectDetail', () => {
  it('mặc định không có gì mở', () => {
    expect(setup().result.current.project).toBeNull();
  });

  it('open ghi slug lên URL để deep-link được', () => {
    const { result } = setup();
    act(() => result.current.open('moba2d'));
    expect(window.location.search).toContain('p=moba2d');
    expect(result.current.project?.slug).toBe('moba2d');
  });

  it('mở sẵn theo URL lúc tải trang', () => {
    window.history.replaceState({}, '', '/?p=lol2d');
    expect(setup().result.current.project?.slug).toBe('lol2d');
  });

  it('slug không tồn tại thì coi như không mở gì', () => {
    window.history.replaceState({}, '', '/?p=khong-co-that');
    expect(setup().result.current.project).toBeNull();
  });

  it('close xoá param', () => {
    const { result } = setup();
    act(() => result.current.open('moba2d'));
    act(() => result.current.close());
    expect(window.location.search).not.toContain('p=');
    expect(result.current.project).toBeNull();
  });

  it('next/prev đi trong danh sách đang lọc và quay về đúng chỗ cũ', () => {
    const { result } = setup();
    act(() => result.current.open('moba2d'));
    const first = result.current.project!.slug;
    act(() => result.current.next());
    expect(result.current.project!.slug).not.toBe(first);
    act(() => result.current.prev());
    expect(result.current.project!.slug).toBe(first);
  });

  it('next ở cuối danh sách thì quay vòng về đầu', () => {
    const { result } = setup();
    const { projects } = result.current;
    act(() => result.current.open(projects[projects.length - 1].slug));
    act(() => result.current.next());
    expect(result.current.project!.slug).toBe(projects[0].slug);
  });
});
