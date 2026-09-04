import { PROFILE } from '../../data/profile';
import { useI18n } from '../../hooks/useI18n';

export function Identity() {
  const { ti, locale } = useI18n();
  const startYear = PROFILE.codingSince;
  const thisYear = new Date().getFullYear();

  return (
    <section id="top" className="px-[var(--gutter)] pt-10 pb-14 sm:pt-16">
      <p className="ed-meta ed-reveal" style={{ '--i': 0 } as React.CSSProperties}>
        {PROFILE.handle} — {locale === 'vi' ? 'Tuyển tập' : 'Selected works'} {startYear}–{thisYear}
      </p>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <h1 className="ed-name ed-reveal" style={{ '--i': 1 } as React.CSSProperties}>
          {PROFILE.name}
        </h1>

        <img
          src={PROFILE.avatar}
          alt=""
          width={112}
          height={112}
          className="ed-portrait ed-reveal order-first size-20 rounded-full border border-line object-cover sm:size-28 lg:order-none"
          style={{ '--i': 2 } as React.CSSProperties}
        />
      </div>

      <hr className="ed-rule mt-7" />

      <div className="mt-7 grid gap-x-12 gap-y-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <p
          className="ed-display ed-reveal text-2xl leading-[1.22] text-ink sm:text-[2rem]"
          style={{ '--i': 3, textWrap: 'balance' } as React.CSSProperties}
        >
          {ti(PROFILE.headline)}
        </p>

        <div className="ed-reveal" style={{ '--i': 4 } as React.CSSProperties}>
          <p className="ed-drop text-[1.05rem] leading-[1.65] text-ink/90">{ti(PROFILE.bio)}</p>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {PROFILE.socials.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-meta text-sm underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
