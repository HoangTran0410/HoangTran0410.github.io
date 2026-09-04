/**
 * Gradient tất định sinh từ slug. Cùng một dự án luôn ra cùng một hình,
 * nên thumbnail fallback trông có chủ ý chứ không phải ô trống ngẫu nhiên.
 */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function shiftHue(hex: string, degrees: number, lightness: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;

  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  let h = 0;
  if (d !== 0) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }

  return `hsl(${Math.round((h + degrees + 360) % 360)} ${Math.round(s * 100)}% ${Math.round(lightness)}%)`;
}

export function gradientFor(slug: string, accent: string): string {
  const h = hash(slug);
  const angle = h % 360;
  const spread = 24 + (h % 48);
  const from = shiftHue(accent, -spread, 62);
  const via = shiftHue(accent, 0, 46);
  const to = shiftHue(accent, spread, 28);
  return `linear-gradient(${angle}deg, ${from} 0%, ${via} 46%, ${to} 100%)`;
}
