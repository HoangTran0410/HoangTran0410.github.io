import { useState } from 'react';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { computeStats } from '../../lib/stats';

/**
 * Ba ô cuối lưới: liên hệ (2×2), "tìm ở nơi khác" (2×2) và một dải chân trang
 * chiếm trọn chiều ngang. Hai ô 2×2 đi cùng cặp skills/journey của Story là
 * vừa đúng hai hàng bốn cột, nên đuôi lưới luôn kín.
 */
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
    <>
      <section
        id="contact"
        className="bn-tile justify-between"
        data-cell="contact"
        data-span="2x2"
        data-lift="1"
        style={{ '--tile-accent': 'var(--accent)' } as React.CSSProperties}
      >
        <div>
          <h2 className="bn-label">{t('nav.contact')}</h2>
          <p className="bn-serif mt-3 text-[clamp(2rem,3.6vw,3rem)] leading-[0.98] text-ink">
            {t('contact.title')}
          </p>
        </div>

        <div className="mt-5">
          <a
            href={`mailto:${PROFILE.email}`}
            className="bn-serif block text-lg break-all text-ink underline decoration-line underline-offset-[5px] transition-colors hover:decoration-current sm:text-xl"
          >
            {PROFILE.email}
          </a>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="bn-btn bn-btn-solid" onClick={copy}>
              {copied ? t('contact.copied') : t('contact.copy')}
            </button>
            <a href={`mailto:${PROFILE.email}`} className="bn-btn">
              {ti({ vi: 'Gửi thư', en: 'Write me' })} ↗
            </a>
          </div>
        </div>
      </section>

      <section className="bn-tile justify-between" data-cell="elsewhere" data-span="2x2" data-lift="1">
        <div>
          <h2 className="bn-label">{ti({ vi: 'Ở nơi khác', en: 'Elsewhere' })}</h2>
          <p className="mt-3 max-w-[34ch] text-[0.9rem] leading-relaxed text-muted">
            {ti({
              vi: 'Code, bài viết và mấy thứ nghịch dở dang nằm rải rác ở đây.',
              en: 'Code, writing, and half-finished experiments live in these places.',
            })}
          </p>
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-1.5">
          {PROFILE.socials.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="bn-btn w-full justify-between text-[0.8rem]"
              >
                {s.label}
                <span aria-hidden className="text-muted">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer
        className="bn-tile flex-row flex-wrap items-center justify-between gap-x-6 gap-y-2"
        data-cell="footer"
        data-span="full"
        style={{ minHeight: 0, paddingBlock: '0.9rem' }}
      >
        <p className="bn-label normal-case tracking-[0.06em]">
          {ti(PROFILE.location)} · {t('footer.built')}
          {lastPushed && ` · ${t('footer.updated')} ${lastPushed}`}
        </p>
        <p className="bn-num text-muted">{PROFILE.handle}</p>
      </footer>
    </>
  );
}
