import { LangSwitcher } from '../../components/LangSwitcher';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { PROFILE } from '../../data/profile';
import { useI18n } from '../../hooks/useI18n';
import { Catalog } from './Catalog';
import { Contact } from './Contact';
import { Identity } from './Identity';
import { ProjectDetail } from './ProjectDetail';
import { Stats } from './Stats';
import { Story } from './Story';
import { Timeline } from './Timeline';
import './editorial.css';
import './print.css';

export function Shell() {
  const { t } = useI18n();

  return (
    <div className="ed-shell min-h-dvh">
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:border focus:border-ink focus:bg-surface focus:px-4 focus:py-2"
      >
        {t('nav.work')}
      </a>

      <header
        className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-line bg-bg/90 px-[var(--gutter)] py-2.5 backdrop-blur"
        data-print="hide"
      >
        <a href="#top" className="ed-meta hover:text-ink">
          {PROFILE.name}
        </a>

        <nav className="flex items-center gap-4">
          <a href="#work" className="ed-meta hidden hover:text-ink sm:inline">
            {t('nav.work')}
          </a>
          <a href="#about" className="ed-meta hidden hover:text-ink sm:inline">
            {t('nav.about')}
          </a>
          <a href="#contact" className="ed-meta hidden hover:text-ink sm:inline">
            {t('nav.contact')}
          </a>
          <LangSwitcher />
          <ThemeSwitcher />
        </nav>
      </header>

      <main className="mx-auto max-w-[1400px]">
        <Identity />
        <Stats />
        <Timeline />
        <Catalog />
        <Story />
        <Contact />
      </main>

      <ProjectDetail />
    </div>
  );
}
