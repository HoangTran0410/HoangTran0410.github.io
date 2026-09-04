import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CatalogProvider, useCatalog } from '../useCatalog';
import { useTimeline } from '../useTimeline';

const wrap = ({ children }: { children: ReactNode }) => <CatalogProvider>{children}</CatalogProvider>;
const setup = () => renderHook(() => ({ timeline: useTimeline(), catalog: useCatalog() }), { wrapper: wrap });

beforeEach(() => window.history.replaceState({}, '', '/'));

describe('useTimeline', () => {
  it('năm sắp giảm dần, mới nhất lên đầu', () => {
    const years = setup().result.current.timeline.map((y) => y.year);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
  });

  it('không có năm nào rỗng hoàn toàn', () => {
    for (const y of setup().result.current.timeline) {
      expect(y.jobs.length + y.schools.length + y.projects.length).toBeGreaterThan(0);
    }
  });

  it('mọi dự án đang hiện đều nằm đúng năm của nó', () => {
    const { timeline, catalog } = setup().result.current;
    const flat = timeline.flatMap((y) => y.projects.map((p) => [y.year, p.year]));
    expect(flat.length).toBe(catalog.projects.length);
    for (const [bucket, own] of flat) expect(bucket).toBe(own);
  });

  it('mốc công việc rơi vào đúng năm bắt đầu', () => {
    const y2023 = setup().result.current.timeline.find((y) => y.year === 2023);
    expect(y2023?.jobs.map((j) => j.company)).toContain('MoMo · M_Service');
  });

  it('theo bộ lọc hiện tại chứ không cố định', () => {
    const { result } = setup();
    act(() => result.current.catalog.setCategory('osint'));
    const shown = result.current.timeline.flatMap((y) => y.projects);
    expect(shown.length).toBeGreaterThan(0);
    for (const p of shown) expect(p.category).toBe('osint');
  });

  it('trong một năm, tháng muộn hơn lên trước', () => {
    const year = setup().result.current.timeline.find((y) => y.projects.length > 2)!;
    const months = year.projects.map((p) => p.month || 0);
    expect([...months].sort((a, b) => b - a)).toEqual(months);
  });

  it('lấy tháng từ ngày tạo repo khi curated bỏ trống', () => {
    const all = setup().result.current.timeline.flatMap((y) => y.projects);
    const known = all.filter((p) => p.month > 0);
    // Không mục nào trong projects.ts điền month, nên mọi giá trị > 0 đều là
    // suy ra từ GitHub — chứng tỏ đường fallback có chạy thật.
    expect(known.length).toBeGreaterThan(20);
  });

  it('lọc đến mức không còn gì thì timeline rỗng, không phải năm rỗng', () => {
    const { result } = setup();
    act(() => result.current.catalog.setQuery('zzzkhongcogi'));
    expect(result.current.timeline.every((y) => y.projects.length > 0 || y.jobs.length > 0 || y.schools.length > 0)).toBe(true);
  });
});
