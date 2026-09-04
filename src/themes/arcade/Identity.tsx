import type { CSSProperties } from 'react';
import { PROFILE } from '../../data/profile';
import { useI18n } from '../../hooks/useI18n';
import { HeroCanvas } from './HeroCanvas';

const v = (i: number) => ({ '--i': i }) as CSSProperties;

export function Identity() {
  const { ti, locale } = useI18n();
  const thisYear = new Date().getFullYear();
  const subtitle = locale === 'vi' ? 'Tuyển tập' : 'Selected works';

  return (
    <section id="top" className="relative px-[var(--gutter)] pt-10 pb-14 sm:pt-16 sm:pb-20">
      <HeroCanvas className="ar-hero-canvas" />

      <div className="relative">
        <div className="ar-in flex flex-wrap items-center gap-x-4 gap-y-2" style={v(0)}>
          <span className="ar-label text-accent">
            {PROFILE.handle} <span aria-hidden>//</span> {subtitle} {PROFILE.codingSince}–{thisYear}
          </span>
          <span aria-hidden className="ar-caret" />
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <h1 className="ar-name ar-in" data-text={PROFILE.name} style={v(1)}>
            {PROFILE.name}
          </h1>

          <div className="ar-avatar ar-in order-first size-24 shrink-0 sm:size-32 lg:order-none" style={v(2)}>
            <img
              src={PROFILE.avatar}
              alt=""
              width={128}
              height={128}
              className="size-full object-cover"
            />
          </div>
        </div>

        <p
          className="ar-display ar-in mt-8 max-w-[26ch] text-2xl leading-[1.2] text-ink sm:text-[2.15rem]"
          style={{ ...v(3), textWrap: 'balance' }}
        >
          {ti(PROFILE.headline)}
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-12">
          <p className="ar-in text-[1.02rem] leading-[1.72] text-muted" style={v(4)}>
            {ti(PROFILE.bio)}
          </p>

          <div className="ar-in" style={v(5)}>
            <p className="ar-label">{locale === 'vi' ? 'Tìm mình ở' : 'Find me on'}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {PROFILE.socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ar-pill"
                    style={{ '--pill-accent': 'var(--neon-cyan)' } as CSSProperties}
                  >
                    {s.label}
                    <span aria-hidden className="text-[0.6rem] opacity-60">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
