import { useI18n } from '../hooks/useI18n';
import type { Locale } from '../data/types';

const OPTIONS: { id: Locale; label: string }[] = [
  { id: 'vi', label: 'VI' },
  { id: 'en', label: 'EN' },
];

export function LangSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={`flex items-center border border-line ${className ?? ''}`}
      style={{ borderRadius: 'var(--radius)' }}
      role="group"
      aria-label={t('lang.label')}
      data-print="hide"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setLocale(o.id)}
          aria-pressed={locale === o.id}
          className={`px-2.5 py-1.5 font-meta text-xs tracking-widest transition-colors ${
            locale === o.id ? 'bg-accent text-accent-ink' : 'text-muted hover:text-ink'
          }`}
          style={{ borderRadius: 'calc(var(--radius) - 1px)' }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
