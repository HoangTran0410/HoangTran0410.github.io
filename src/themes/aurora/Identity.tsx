import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { useProjectDetail } from '../../hooks/useProjectDetail';

/**
 * Hero: dòng "mới nhất" dẫn thẳng tới dự án nổi bật gần đây nhất, tên lớn chữ
 * gradient, hai nút hành động, và ảnh đại diện trong vòng sáng xoay chậm.
 */
export function Identity() {
  const { t, ti } = useI18n();
  const { all } = useCatalog();
  const { open } = useProjectDetail();
  const thisYear = new Date().getFullYear();

  // Dự án nổi bật mới nhất — tự đổi khi thêm dự án mới, không phải sửa ở đây.
  const latest = useMemo(() => {
    const pool = all.filter((p) => p.featured);
    return [...(pool.length ? pool : all)].sort(
      (a, b) => b.year * 100 + b.month - (a.year * 100 + a.month),
    )[0];
  }, [all]);

  return (
    <section className="au-hero au-wrap" aria-labelledby="au-name">
      <div className="au-hero-copy">
        {latest && (
          <button type="button" className="au-announce" data-reveal onClick={() => open(latest.slug)}>
            <span className="au-pulse" aria-hidden />
            <span className="au-announce-tag">{ti({ vi: 'Mới', en: 'New' })}</span>
            <span className="au-announce-text">
              {latest.title} — {ti(latest.tagline)}
            </span>
            <ArrowRight aria-hidden size={14} />
          </button>
        )}

        <h1 id="au-name" className="au-name" data-reveal>
          {PROFILE.name}
        </h1>

        <p className="au-headline" data-reveal>
          {ti(PROFILE.headline)}
        </p>

        <p className="au-bio" data-reveal>
          {ti(PROFILE.bio)}
        </p>

        <div className="au-cta" data-reveal>
          <a href="#work" className="au-btn au-btn-primary">
            {ti({ vi: 'Xem dự án', en: 'See the work' })}
            <ArrowRight aria-hidden size={16} />
          </a>
          <a href="#contact" className="au-btn">
            {t('contact.title')}
          </a>
        </div>

        <ul className="au-socials" data-reveal>
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

      <div className="au-hero-visual" data-reveal>
        <div className="au-avatar-ring">
          <img
            src={PROFILE.avatar}
            alt={PROFILE.name}
            width={256}
            height={256}
            className="au-avatar"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="au-float au-float-1">
          <span className="au-mono">@{PROFILE.handle}</span>
        </div>
        <div className="au-float au-float-2">
          <MapPin aria-hidden size={13} />
          <span>
            {ti(PROFILE.location)} · {PROFILE.codingSince}–{thisYear}
          </span>
        </div>
      </div>
    </section>
  );
}
