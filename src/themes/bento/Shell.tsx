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
import './bento.css';

/**
 * Một lưới duy nhất cho toàn trang. Mỗi section trả về các ô rời (Fragment),
 * nên chúng trở thành con trực tiếp của .bn-grid và cùng chịu một luật xếp:
 * identity → số liệu → thanh lọc → dự án → dòng thời gian → kỹ năng/chặng
 * đường → liên hệ.
 * Trên mobile lưới co về một cột, và đúng thứ tự ưu tiên đó luôn.
 */
export function Shell() {
  const { t } = useI18n();

  return (
    <div className="bn-shell min-h-dvh bg-bg">
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:rounded-full focus:border focus:border-line focus:bg-surface focus:px-4 focus:py-2"
      >
        {t('nav.work')}
      </a>

      <header className="bn-topbar">
        <div className="bn-topbar-inner">
          <a href="#top" className="bn-brand">
            {PROFILE.name}
          </a>
          <div className="flex items-center gap-2">
            <a href="#work" className="bn-link hidden font-meta text-sm sm:inline">
              {t('nav.work')}
            </a>
            <a href="#contact" className="bn-link mr-1 hidden font-meta text-sm sm:inline">
              {t('nav.contact')}
            </a>
            <LangSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main id="top" className="bn-main">
        <div className="bn-grid">
          <Identity />
          <Stats />
          <Catalog />
          <Timeline />
          <Story />
          <Contact />
        </div>
      </main>

      <ProjectDetail />
    </div>
  );
}
