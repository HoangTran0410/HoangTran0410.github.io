/**
 * Slug của những dự án đã có ảnh chụp thật trong public/shots/.
 * File này do `npm run shots` ghi — không sửa tay.
 *
 * Có danh sách này thì ProjectThumb biết trước dự án nào có ảnh, nên không
 * bao giờ phải thử tải một file 404 rồi mới rơi về gradient.
 */
export const SHOT_SLUGS: string[] = [
  'be-choi',
  'carousel-3d',
  'chat-p2p',
  'cheat-sheets',
  'cipher-breaker',
  'cryptoflow',
  'doan-web1',
  'documorph',
  'face-compare',
  'fbaio',
  'fbaio-ext',
  'gamehub24',
  'github-osint',
  'gungame2',
  'hyper-pong',
  'ifocus',
  'ip-location',
  'kotlin-lab',
  'lenticular',
  'lol2d',
  'lol2d-ver1',
  'minipool',
  'moba2d',
  'motion-extraction',
  'pixel-diff',
  'pong',
  'qr-jigsaw',
  'saoke-yagi',
  'time-horizon',
  'titanbench',
  'visualyze',
];
