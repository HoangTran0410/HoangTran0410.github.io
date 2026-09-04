import type { ReactNode } from 'react';
import { PROFILE } from '../../data/profile';
import { useI18n } from '../../hooks/useI18n';

/** Output của `whoami` — dựng theo kiểu neofetch: ảnh bên trái, khoá/giá trị bên phải. */
export function Identity() {
  const { ti, locale } = useI18n();
  const user = PROFILE.name.toLowerCase().replace(/\s+/g, '');

  const rows: { key: string; value: ReactNode }[] = [
    { key: 'handle', value: `@${PROFILE.handle}` },
    { key: 'role', value: ti(PROFILE.headline) },
    { key: 'location', value: ti(PROFILE.location) },
    {
      key: 'email',
      value: (
        <a className="term-link" href={`mailto:${PROFILE.email}`}>
          {PROFILE.email}
        </a>
      ),
    },
    {
      key: 'uptime',
      value: `${new Date().getFullYear() - PROFILE.codingSince} ${
        locale === 'vi' ? 'năm viết code' : 'years writing code'
      }`,
    },
    {
      key: 'links',
      value: (
        <span className="term-inline-list">
          {PROFILE.socials.map((s) => (
            <a key={s.id} className="term-link" href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </span>
      ),
    },
  ];

  return (
    <section className="term-whoami">
      <img
        className="term-avatar"
        src={PROFILE.avatar}
        alt=""
        width={128}
        height={128}
        loading="eager"
        decoding="async"
      />

      <div className="term-whoami-body">
        <h2 className="term-whoami-title">
          {user}
          <span className="term-dim">@</span>github
        </h2>
        <p className="term-rule" aria-hidden>
          {'─'.repeat(40)}
        </p>

        <dl className="term-kv">
          {rows.map((r) => (
            <div key={r.key} className="term-kv-row">
              <dt>{r.key}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>

        <p className="term-bio">{ti(PROFILE.bio)}</p>
      </div>
    </section>
  );
}
