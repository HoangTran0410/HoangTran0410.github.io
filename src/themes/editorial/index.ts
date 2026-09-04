import type { Theme } from '../contract';
import { THEME_META } from '../registry';

const stub = () => null;

const theme: Theme = {
  meta: THEME_META['editorial'],
  Shell: stub,
  sections: {
    Identity: stub,
    Stats: stub,
    Catalog: stub,
    ProjectDetail: stub,
    Story: stub,
    Contact: stub,
  },
};

export default theme;
