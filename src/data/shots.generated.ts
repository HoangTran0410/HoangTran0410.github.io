/**
 * Slug của những dự án đã có ảnh chụp thật trong public/shots/.
 * File này do `npm run shots` ghi — không sửa tay.
 *
 * Có danh sách này thì ProjectThumb biết trước dự án nào có ảnh, nên không
 * bao giờ phải thử tải một file 404 rồi mới rơi về gradient.
 */
export const SHOT_SLUGS: string[] = [];
