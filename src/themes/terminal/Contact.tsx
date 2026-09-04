import { useState } from 'react';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { computeStats } from '../../lib/stats';

/** Output của `contact` — email, các kênh khác, và dòng chân trang. */
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
      // Trình duyệt chặn clipboard thì link mailto ngay bên cạnh vẫn dùng được.
    }
  };

  return (
    <section className="term-contact">
      <p className="term-contact-line">
        <span className="term-dim">mail →</span>{' '}
        <a className="term-link term-contact-mail" href={`mailto:${PROFILE.email}`}>
          {PROFILE.email}
        </a>
        <button type="button" className="term-btn" onClick={copy}>
          {copied ? t('contact.copied') : t('contact.copy')}
        </button>
      </p>

      <dl className="term-kv">
        {PROFILE.socials.map((s) => (
          <div key={s.id} className="term-kv-row">
            <dt>{s.id}</dt>
            <dd>
              <a className="term-link" href={s.url} target="_blank" rel="noreferrer">
                {s.url}
              </a>
            </dd>
          </div>
        ))}
      </dl>

      <p className="term-dim term-contact-foot">
        {ti(PROFILE.location)} · {t('footer.built')}
        {lastPushed && ` · ${t('footer.updated')} ${lastPushed}`}
      </p>
    </section>
  );
}
