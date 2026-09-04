import { PROFILE } from '../../data/profile';
import { useI18n } from '../../hooks/useI18n';

/**
 * Ô lớn đầu lưới: ai đây, làm gì, tìm ở đâu. Chiếm 2 cột × 2 hàng nên nó
 * cùng bốn ô số liệu bên cạnh lấp kín trọn vẹn hai hàng đầu — không để lỗ
 * nào cho `dense` phải kéo một ô dự án lên trên thanh tìm kiếm.
 */
export function Identity() {
  const { ti } = useI18n();
  const thisYear = new Date().getFullYear();

  return (
    <section className="bn-tile" data-cell="identity" data-span="2x2" data-lift="1">
      <div className="flex items-center gap-3">
        <img
          src={PROFILE.avatar}
          alt=""
          width={112}
          height={112}
          className="bn-avatar"
          loading="eager"
          decoding="async"
        />
        <div className="min-w-0">
          <p className="bn-label">{PROFILE.handle}</p>
          <p className="bn-num mt-1 text-muted">
            {PROFILE.codingSince}–{thisYear} · {ti(PROFILE.location)}
          </p>
        </div>
      </div>

      <h1 className="bn-name mt-4">{PROFILE.name}</h1>

      <p className="bn-headline mt-3">{ti(PROFILE.headline)}</p>

      <p className="bn-clamp-4 mt-3 text-[0.92rem] leading-relaxed text-muted">{ti(PROFILE.bio)}</p>

      <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
        {PROFILE.socials.map((s) => (
          <li key={s.id}>
            <a href={s.url} target="_blank" rel="noreferrer" className="bn-chip hover:text-ink">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
