import type { Theme } from '../contract';
import { THEME_META } from '../registry';
import { Catalog } from './Catalog';
import { Contact } from './Contact';
import { Identity } from './Identity';
import { ProjectDetail } from './ProjectDetail';
import { Shell } from './Shell';
import { Stats } from './Stats';
import { Story } from './Story';
import { Timeline } from './Timeline';

/**
 * Bảy khối nội dung ở đây đều là output của một lệnh: whoami, stats, ls,
 * cat/open, timeline, skills, contact. Shell là vòng lặp đọc-chạy-in ghép
 * chúng lại.
 */
const theme: Theme = {
  meta: THEME_META.terminal,
  Shell,
  sections: { Identity, Stats, Catalog, Timeline, ProjectDetail, Story, Contact },
};

export default theme;
