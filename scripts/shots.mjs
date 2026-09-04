/**
 * Chụp ảnh thật từng trang demo bằng Playwright, nén sang webp, ghi vào
 * public/shots/<slug>.webp và cập nhật src/data/shots.generated.ts.
 *
 *   npm run shots                  chụp mọi dự án có links.demo, bỏ qua cái đã có ảnh
 *   npm run shots -- --only=moba2d chỉ chụp lại một cái
 *   npm run shots -- --force       chụp lại tất cả
 *
 * Ảnh commit vào repo. Dự án nào chụp hỏng thì bỏ qua — ProjectThumb sẽ tự
 * rơi về bìa gradient, nên trang vẫn đầy đủ.
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { PROJECTS } from '../src/data/projects.ts';

const OUT_DIR = new URL('../public/shots/', import.meta.url);
const MANIFEST = new URL('../src/data/shots.generated.ts', import.meta.url);
const VIEWPORT = { width: 1280, height: 800 };
const SIZE_WARN = 150 * 1024;
// Trang nào nạp chậm thì chờ lâu hơn: SHOT_WAIT=8000 npm run shots -- --only=<slug>
const SETTLE_MS = Number(process.env.SHOT_WAIT ?? 2500);

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith('--only='))?.slice('--only='.length);
const force = args.includes('--force');

mkdirSync(OUT_DIR, { recursive: true });

const OPTED_OUT = new Set(PROJECTS.filter((p) => p.shot === null).map((p) => p.slug));

let targets = PROJECTS.filter((p) => p.links.demo && !OPTED_OUT.has(p.slug));
if (only) targets = targets.filter((p) => p.slug === only);
if (!force && !only) {
  targets = targets.filter((p) => !existsSync(new URL(`${p.slug}.webp`, OUT_DIR)));
}

if (targets.length === 0) {
  console.log('Không có gì để chụp. Dùng --force để chụp lại, hoặc --only=<slug>.');
}

const browser = await chromium.launch();
const failed = [];

for (const p of targets) {
  const dest = new URL(`${p.slug}.webp`, OUT_DIR);
  process.stdout.write(`${p.slug.padEnd(24)} ${p.links.demo} … `);

  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  try {
    await page.goto(p.links.demo, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    // networkidle hay treo trên trang có polling; chờ có giới hạn rồi đi tiếp.
    await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {});
    await page.waitForTimeout(SETTLE_MS);

    const png = await page.screenshot({ type: 'png' });
    await sharp(png).resize({ width: 1280 }).webp({ quality: 78 }).toFile(dest.pathname);

    const bytes = statSync(dest).size;
    const kb = Math.round(bytes / 1024);
    console.log(`${kb}KB${bytes > SIZE_WARN ? '  ⚠ nặng' : ''}`);
  } catch (err) {
    console.log(`hỏng — ${err.message.split('\n')[0]}`);
    failed.push(`${p.slug}: ${err.message.split('\n')[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();

// Manifest liệt kê ảnh thật sự tồn tại trên đĩa, kể cả ảnh chụp từ lần trước.
const slugs = readdirSync(OUT_DIR)
  .filter((f) => f.endsWith('.webp'))
  .map((f) => f.replace(/\.webp$/, ''))
  .filter((slug) => !OPTED_OUT.has(slug))
  .sort();

writeFileSync(
  MANIFEST,
  `/**
 * Slug của những dự án đã có ảnh chụp thật trong public/shots/.
 * File này do \`npm run shots\` ghi — không sửa tay.
 *
 * Có danh sách này thì ProjectThumb biết trước dự án nào có ảnh, nên không
 * bao giờ phải thử tải một file 404 rồi mới rơi về gradient.
 */
export const SHOT_SLUGS: string[] = [
${slugs.map((s) => `  '${s}',`).join('\n')}
];
`,
);

console.log(`\n${slugs.length} ảnh trong public/shots/`);
if (failed.length) {
  console.warn(`\n${failed.length} trang không chụp được (sẽ dùng bìa gradient):`);
  for (const f of failed) console.warn(`  - ${f}`);
}
