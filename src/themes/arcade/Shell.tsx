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
import './arcade.css';

export function Shell() {
  const { t } = useI18n();

  return (
    <div className="ar-shell min-h-dvh bg-bg text-ink">
      <div aria-hidden className="ar-backdrop" />

      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:border focus:border-accent focus:bg-surface focus:px-4 focus:py-2"
      >
        {t('nav.work')}
      </a>

      <header
        className="sticky top-0 z-40 flex h-[3.4rem] items-center justify-between gap-4 border-b border-line px-[var(--gutter)] backdrop-blur-xl"
        style={{ background: 'color-mix(in oklab, var(--bg) 78%, transparent)' }}
      >
        <a href="#top" className="ar-label flex items-center gap-2 text-ink hover:text-accent">
          <span
            aria-hidden
            className="size-2 rounded-full bg-accent"
            style={{ boxShadow: '0 0 10px var(--accent)' }}
          />
          {PROFILE.name}
        </a>

        <nav className="flex items-center gap-2 sm:gap-3">
          <a href="#work" className="ar-label hidden hover:text-ink sm:inline">
            {t('nav.work')}
          </a>
          <a href="#about" className="ar-label hidden hover:text-ink sm:inline">
            {t('nav.about')}
          </a>
          <a href="#contact" className="ar-label mr-1 hidden hover:text-ink sm:inline">
            {t('nav.contact')}
          </a>
          <LangSwitcher />
          <ThemeSwitcher />
        </nav>
      </header>

      <main className="relative mx-auto max-w-[1440px]">
        <Identity />
        <Stats />
        <Catalog />
        <Story />
        <Contact />
      </main>

      <ProjectDetail />
    </div>
  );
}
