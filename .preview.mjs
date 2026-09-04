import { chromium } from 'playwright';
const OUT = '/Users/hoangtran/.claude/jobs/8f266411/tmp/shots';
const base = process.argv[2] ?? 'http://localhost:4173';
const shots = [
  { name: 'desktop', url: `${base}/`, vp: { width: 1440, height: 1000 } },
  { name: 'mobile', url: `${base}/`, vp: { width: 390, height: 844 } },
  { name: 'detail', url: `${base}/?p=moba2d`, vp: { width: 1440, height: 1000 } },
];
const b = await chromium.launch();
for (const s of shots) {
  const p = await b.newPage({ viewport: s.vp, deviceScaleFactor: 2 });
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await p.goto(s.url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: false });
  if (errors.length) console.log(`[${s.name}] LỖI:`, errors.slice(0, 5).join(' | '));
  await p.close();
}
await b.close();
console.log('done');
