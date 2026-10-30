import { useEffect, useRef, useState } from 'react';
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
import { useReveal, useSpotlight } from './motion';
import './aurora.css';

/**
 * Aurora — trang sản phẩm hiện đại: nền tối với dải cực quang trôi chậm, thẻ
 * kính mờ có ánh đèn theo con trỏ, nội dung hiện dần khi cuộn tới.
 *
 * Thứ tự đọc: ai đây → số liệu → dự án → theo năm → kinh nghiệm & kỹ năng →
 * liên hệ. Chi tiết dự án là ngăn kéo trượt từ bên phải.
 */
export function Shell() {
  const { t, ti } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useReveal(root);
  useSpotlight(root);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#work', label: t('nav.work') },
    { href: '#timeline', label: ti({ vi: 'Hành trình', en: 'Journey' }) },
    { href: '#about', label: t('nav.about') },
    { href: '#contact', label: t('nav.contact') },
  ];

  return (
    <div ref={root} className="au-shell">
      <div className="au-sky" aria-hidden>
        <span className="au-blob au-blob-1" />
        <span className="au-blob au-blob-2" />
        <span className="au-blob au-blob-3" />
        <span className="au-gridlines" />
      </div>

      <a href="#work" className="au-skip">
        {t('nav.work')}
      </a>

      <header className="au-nav-wrap" data-scrolled={scrolled ? '1' : undefined}>
        <nav className="au-nav" aria-label={ti({ vi: 'Điều hướng chính', en: 'Main' })}>
          <a href="#top" className="au-brand">
            <img src={PROFILE.avatar} alt="" width={28} height={28} className="au-brand-avatar" />
            <span>{PROFILE.name}</span>
          </a>

          <ul className="au-nav-links">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>

          <div className="au-nav-tools">
            <LangSwitcher />
            <ThemeSwitcher />
          </div>
        </nav>
      </header>

      <main id="top" className="au-main">
        <Identity />
        <Stats />
        <Catalog />
        <Timeline />
        <Story />
        <Contact />
      </main>

      <ProjectDetail />
    </div>
  );
}
