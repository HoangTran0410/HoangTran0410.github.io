import { useState } from 'react';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { computeStats } from '../../lib/stats';

export function Contact() {
  const { t, ti, locale } = useI18n();
  const { all } = useCatalog();
  const [copied, setCopied] = useState(false);
  const lastPushed = computeStats(all, PROFILE).lastPushed;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Trình duyệt chặn clipboard thì cái link mailto ngay bên cạnh vẫn dùng được.
    }
  };

  return (
    <section id="contact" className="px-[var(--gutter)] pb-12">
      <div className="ar-panel ar-edge relative overflow-hidden px-5 py-12 text-center sm:px-10 sm:py-16">
        <span aria-hidden className="ar-cta-glow" />

        <div className="relative">
          <p className="ar-label">{locale === 'vi' ? 'Còn một nút nữa' : 'One more button'}</p>

          <h2
            className="ar-display mx-auto mt-3 max-w-[14ch] text-4xl uppercase sm:text-6xl"
            style={{ textShadow: '0 0 40px color-mix(in oklab, var(--accent) 55%, transparent)' }}
          >
            {t('contact.title')}
          </h2>

          <a
            href={`mailto:${PROFILE.email}`}
            className="ar-num mt-5 inline-block text-base text-accent underline decoration-accent/40 underline-offset-[6px] transition-colors hover:decoration-accent sm:text-lg"
          >
            {PROFILE.email}
          </a>

          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            <button type="button" onClick={copy} className="ar-btn ar-btn--solid">
              {copied ? t('contact.copied') : t('contact.copy')}
            </button>
            <a href={PROFILE.socials[0].url} target="_blank" rel="noreferrer" className="ar-btn">
              {PROFILE.socials[0].label} ↗
            </a>
          </div>
        </div>
      </div>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-line pt-6 pb-4">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {PROFILE.socials.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="font-meta text-xs tracking-widest text-muted uppercase transition-colors hover:text-ink"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="ar-label normal-case">
          {ti(PROFILE.location)} · {t('footer.built')}
          {lastPushed && ` · ${t('footer.updated')} ${lastPushed}`}
        </p>
      </footer>
    </section>
  );
}
