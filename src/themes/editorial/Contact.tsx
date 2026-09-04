import { useState } from 'react';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { computeStats } from '../../lib/stats';

export function Contact() {
  const { t, ti } = useI18n();
  const { all } = useCatalog();
  const [copied, setCopied] = useState(false);
  const lastPushed = computeStats(all, PROFILE).lastPushed;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Trình duyệt chặn clipboard thì link mailto bên cạnh vẫn dùng được.
    }
  };

  return (
    <section id="contact" className="px-[var(--gutter)] pb-16">
      <hr className="ed-rule" />

      <div className="grid gap-8 py-14 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <h2 className="ed-name" style={{ fontSize: 'clamp(2.2rem, 7vw, 4.5rem)' }}>
            {t('contact.title')}
          </h2>
          <a
            href={`mailto:${PROFILE.email}`}
            className="ed-display mt-4 inline-block text-xl underline decoration-line underline-offset-[6px] transition-colors hover:decoration-ink sm:text-2xl"
          >
            {PROFILE.email}
          </a>
        </div>

        <div className="flex flex-wrap gap-3" data-print="hide">
          <button
            type="button"
            onClick={copy}
            className="border border-line px-4 py-2.5 font-meta text-sm transition-colors hover:bg-surface-2"
          >
            {copied ? t('contact.copied') : t('contact.copy')}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="border border-ink bg-ink px-4 py-2.5 font-meta text-sm text-bg transition-opacity hover:opacity-85"
          >
            {t('contact.print')}
          </button>
        </div>
      </div>

      <hr className="ed-rule" />

      <footer className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-6">
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
          {PROFILE.socials.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="font-meta text-sm text-muted underline decoration-transparent underline-offset-4 transition-colors hover:text-ink hover:decoration-line"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="ed-meta">
          {ti(PROFILE.location)} · {t('footer.built')}
          {lastPushed && ` · ${t('footer.updated')} ${lastPushed}`}
        </p>
      </footer>
    </section>
  );
}
