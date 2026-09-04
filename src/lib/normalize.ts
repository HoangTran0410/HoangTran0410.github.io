/**
 * Chuẩn hoá chuỗi để so khớp khi tìm kiếm: bỏ dấu tiếng Việt, về chữ thường,
 * gộp khoảng trắng. Nhờ vậy gõ "tro choi" vẫn ra "trò chơi".
 */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
