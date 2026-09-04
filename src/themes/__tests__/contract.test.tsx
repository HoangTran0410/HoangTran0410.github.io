import { describe, expect, it } from 'vitest';
import { THEME_IDS, THEME_LOADERS, THEME_META } from '../registry';

const SECTIONS = ['Identity', 'Stats', 'Catalog', 'ProjectDetail', 'Story', 'Contact'] as const;

describe.each(THEME_IDS)('theme %s', (id) => {
  it('load được và khai báo đúng id của mình', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    expect(theme.meta.id).toBe(id);
    expect(theme.meta).toEqual(THEME_META[id]);
  });

  it('phủ đủ 6 khối nội dung — thiếu khối nào là đổi theme sẽ mất thông tin', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    for (const s of SECTIONS) expect(typeof theme.sections[s], s).toBe('function');
  });

  it('có Shell để App render', async () => {
    const theme = (await THEME_LOADERS[id]()).default;
    expect(typeof theme.Shell).toBe('function');
  });
});
