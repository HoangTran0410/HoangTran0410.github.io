import type { Theme } from '../contract';
import { THEME_META } from '../registry';
import { Catalog } from './Catalog';
import { Contact } from './Contact';
import { Identity } from './Identity';
import { ProjectDetail } from './ProjectDetail';
import { Shell } from './Shell';
import { Stats } from './Stats';
import { Story } from './Story';

const theme: Theme = {
  meta: THEME_META.editorial,
  Shell,
  sections: { Identity, Stats, Catalog, ProjectDetail, Story, Contact },
};

export default theme;
