import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('workflow deploy', () => {
  const y = readFileSync('.github/workflows/deploy.yml', 'utf8');
  it('chạy khi push lên master', () => expect(y).toMatch(/branches:\s*\[?\s*master/));
  it('xin đủ quyền cho Pages', () => {
    expect(y).toContain('pages: write');
    expect(y).toContain('id-token: write');
  });
  it('deploy đúng thư mục dist', () => expect(y).toMatch(/path:\s*['"]?\.\/dist/));
  it('chạy test trước khi deploy — không đẩy bản hỏng lên', () => {
    expect(y).toContain('npm test');
  });
});

describe('workflow sync', () => {
  const y = readFileSync('.github/workflows/sync-github.yml', 'utf8');
  it('chạy theo lịch và bấm tay được', () => {
    expect(y).toContain('schedule:');
    expect(y).toContain('workflow_dispatch:');
  });
  it('có quyền ghi để commit kết quả sync', () => expect(y).toContain('contents: write'));
});
