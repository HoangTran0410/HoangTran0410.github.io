import { useEffect, useState } from 'react';
import type { Project } from '../../data/types';

export type Cols = 1 | 2 | 4;

/** Ô lớn chiếm 2×2 = 4 ô lưới, ô nhỏ chiếm 1, ô nhỏ được nới rộng chiếm 2. */
const CELLS_LG = 4;

export interface Cell {
  project: Project;
  /** true = ô lớn 2×2 (dự án featured) */
  big: boolean;
  /** true = ô nhỏ được nới thành 2 cột để khép kín hàng cuối */
  wide: boolean;
}

/**
 * Số cột hiện tại của lưới, đọc thẳng từ cùng hai breakpoint trong bento.css.
 * Cần biết con số này ở JS vì hai việc dưới đây phải khớp với lưới thật:
 * đan xen to/nhỏ, và tính xem hàng cuối còn hở mấy ô.
 *
 * Không có matchMedia (jsdom trong test) thì coi như desktop.
 */
export function useCols(): Cols {
  const [cols, setCols] = useState<Cols>(read);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const queries = [window.matchMedia('(min-width: 600px)'), window.matchMedia('(min-width: 1024px)')];
    const sync = () => setCols(read());
    sync();
    for (const q of queries) q.addEventListener('change', sync);
    return () => {
      for (const q of queries) q.removeEventListener('change', sync);
    };
  }, []);

  return cols;
}

function read(): Cols {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 4;
  if (window.matchMedia('(min-width: 1024px)').matches) return 4;
  if (window.matchMedia('(min-width: 600px)').matches) return 2;
  return 1;
}

/**
 * Xếp danh sách dự án thành các ô của lưới bento.
 *
 * Hai việc:
 *
 * 1. Đan xen. Danh sách mặc định đẩy hết featured lên đầu, dựng nguyên như vậy
 *    thì được một bức tường ô lớn rồi tới một bức tường ô nhỏ — đúng thứ tự
 *    nhưng mất hẳn cái nhịp to/nhỏ vốn là lý do tồn tại của bento. Nên sau một
 *    hàng mở màn toàn ô lớn, cứ mỗi ô lớn lại chèn bốn ô nhỏ (vừa khít một
 *    khối 2 hàng × 4 cột), đổi bên trái/phải cho khỏi thành hai cột cứng đờ.
 *    Chỉ đan khi người xem chưa tự chọn cách sắp xếp — chọn "nhiều sao nhất"
 *    thì phải tôn trọng đúng thứ tự đó.
 *
 * 2. Khép hàng cuối. Tổng số ô lưới mà đám dự án chiếm hiếm khi chia hết cho
 *    số cột, dư ra một hai ô trống lơ lửng ngay trước phần kỹ năng/liên hệ.
 *    Nới đúng bằng ấy ô nhỏ ở cuối thành 2 cột là lưới kín lại — và tiện thể
 *    có thêm một cỡ ô nữa cho đỡ đều.
 *
 * Mọi ô khác trong lưới (identity 2×2, bốn ô số liệu, bốn ô 2×2 ở cuối, thanh
 * lọc và chân trang chiếm trọn hàng) đều đã là bội số của 4 ô lưới, nên chỉ
 * cần lo mỗi đoạn dự án là cả lưới kín.
 */
export function arrange(projects: Project[], cols: Cols, weave: boolean): Cell[] {
  const ordered = weave && cols > 1 ? interleave(projects) : projects;
  const cells: Cell[] = ordered.map((project) => ({
    project,
    big: !!project.featured,
    wide: false,
  }));

  if (cols < 2) return cells;

  const used = cells.reduce((n, c) => n + (c.big ? CELLS_LG : 1), 0);
  let gap = (cols - (used % cols)) % cols;
  for (let i = cells.length - 1; i >= 0 && gap > 0; i--) {
    if (cells[i].big) continue;
    cells[i].wide = true;
    gap -= 1;
  }

  return cells;
}

function interleave(projects: Project[]): Project[] {
  const big = projects.filter((p) => p.featured);
  const small = projects.filter((p) => !p.featured);
  if (big.length === 0 || small.length === 0) return projects;

  const out: Project[] = big.splice(0, Math.min(2, big.length));

  let flip = false;
  while (big.length > 0) {
    const lead = big.shift() as Project;
    const chunk = small.splice(0, 4);
    if (flip && chunk.length >= 2) out.push(...chunk.splice(0, 2), lead, ...chunk);
    else out.push(lead, ...chunk);
    flip = !flip;
  }

  out.push(...small);
  return out;
}
