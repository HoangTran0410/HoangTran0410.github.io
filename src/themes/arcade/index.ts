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

const theme: Theme = {
  meta: THEME_META.arcade,
  Shell,
  sections: { Identity, Stats, Catalog, Timeline, ProjectDetail, Story, Contact },
};

export default theme;
