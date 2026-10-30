import { ArrowUp, ArrowUpRight, Check, Copy, Mail } from 'lucide-react';
import { useState } from 'react';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { computeStats } from '../../lib/stats';

/** Thẻ kêu gọi viền gradient, rồi chân trang. */
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
      <section id="contact" className="au-section au-wrap" aria-labelledby="au-contact-title">
        <div className="au-cta-card" data-reveal>
          <div className="au-cta-inner">
            <p className="au-eyebrow">{t('nav.contact')}</p>
            <h2 id="au-contact-title" className="au-cta-title">
              {t('contact.title')}
            </h2>
            <p className="au-lede">
              {ti({
                vi: 'Có ý tưởng, có việc, hay chỉ muốn hỏi một extension chạy thế nào — cứ gửi thư, mình đọc hết.',
                en: 'An idea, a job, or just curious how one of the extensions works — drop me a line, I read everything.',
              })}
            </p>

            <a href={`mailto:${PROFILE.email}`} className="au-email">
              <Mail aria-hidden size={20} />
              {PROFILE.email}
            </a>

            <div className="au-cta">
              <a href={`mailto:${PROFILE.email}`} className="au-btn au-btn-primary">
                {ti({ vi: 'Gửi thư', en: 'Write me' })}
                <ArrowUpRight aria-hidden size={16} />
              </a>
              <button type="button" className="au-btn" onClick={copy}>
                {copied ? <Check aria-hidden size={16} /> : <Copy aria-hidden size={16} />}
                {copied ? t('contact.copied') : t('contact.copy')}
              </button>
            </div>

            <ul className="au-socials au-socials-center">
              {PROFILE.socials.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="au-social">
                    {s.label}
                    <ArrowUpRight aria-hidden size={13} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="au-footer au-wrap">
        <p>
          © {new Date().getFullYear()} {PROFILE.name} · {ti(PROFILE.location)} · {t('footer.built')}
          {lastPushed && (
            <>
              {' · '}
              {t('footer.updated')} <span className="au-mono">{lastPushed}</span>
            </>
          )}
        </p>
        <a href="#top" className="au-totop">
          <ArrowUp aria-hidden size={14} />
          {ti({ vi: 'Lên đầu trang', en: 'Back to top' })}
        </a>
      </footer>
    </>
  );
}
