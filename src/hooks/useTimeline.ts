import { useMemo } from 'react';
import { PROFILE } from '../data/profile';
import type { EducationItem, ExperienceItem } from '../data/profile';
import type { Project } from '../data/types';
import { useCatalog } from './useCatalog';

export interface TimelineYear {
  year: number;
  /** Công việc bắt đầu trong năm này */
  jobs: ExperienceItem[];
  /** Chương trình học bắt đầu trong năm này */
  schools: EducationItem[];
  /** Dự án bắt đầu trong năm này, đã qua bộ lọc hiện tại */
  projects: Project[];
}

function startYear(from: string | undefined): number | null {
  if (!from) return null;
  const y = Number.parseInt(from.slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
}

/**
 * Gom mốc nghề nghiệp và dự án lại theo năm, mới nhất lên đầu.
 *
 * Dùng danh sách đã lọc của useCatalog chứ không phải toàn bộ: lọc sang một
 * nhóm rồi thì timeline cho thấy đúng nhóm đó đi qua các năm thế nào. Năm nào
 * không còn gì thì biến mất hẳn, không để lại đầu mục rỗng.
 */
export function useTimeline(): TimelineYear[] {
  const { projects } = useCatalog();

  return useMemo(() => {
    const byYear = new Map<number, TimelineYear>();

    const bucket = (year: number): TimelineYear => {
      let y = byYear.get(year);
      if (!y) {
        y = { year, jobs: [], schools: [], projects: [] };
        byYear.set(year, y);
      }
      return y;
    };

    for (const job of PROFILE.experience) {
      const y = startYear(job.from);
      if (y !== null) bucket(y).jobs.push(job);
    }

    for (const school of PROFILE.education) {
      const y = startYear(school.from);
      if (y !== null) bucket(y).schools.push(school);
    }

    for (const p of projects) bucket(p.year).projects.push(p);

    for (const y of byYear.values()) {
      // Trong một năm: tháng muộn hơn lên trước (cùng chiều với năm giảm dần).
      // Dự án không biết tháng (month = 0) xuống cuối năm đó.
      y.projects.sort(
        (a, b) =>
          (b.month || 0) - (a.month || 0) ||
          Number(!!b.featured) - Number(!!a.featured) ||
          (b.stats?.stars ?? 0) - (a.stats?.stars ?? 0) ||
          a.title.localeCompare(b.title),
      );
    }

    return [...byYear.values()].sort((a, b) => b.year - a.year);
  }, [projects]);
}
