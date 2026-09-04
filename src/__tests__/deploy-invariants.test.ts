import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('bất biến deploy', () => {
  it('public/CNAME trỏ đúng domain — mất file này là mất domain', () => {
    expect(readFileSync('public/CNAME', 'utf8').trim()).toBe('hoangtran99.is-a.dev');
  });

  it('vite base là gốc domain vì đây là user page repo', () => {
    expect(readFileSync('vite.config.ts', 'utf8')).toContain("base: '/'");
  });
});
