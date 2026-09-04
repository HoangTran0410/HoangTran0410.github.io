import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useTheme } from '../hooks/useTheme';
import { THEME_IDS, THEME_META } from '../themes/registry';

/**
 * Nút đổi theme. Chỉ dùng token màu nên nó hoà vào theme nào cũng được —
 * không có màu cứng ở đây.
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { themeId, setTheme, preload } = useTheme();
  const { t, ti } = useI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={`relative ${className ?? ''}`} data-print="hide">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 border border-line px-3 py-1.5 font-meta text-xs tracking-wide uppercase text-ink transition-colors hover:bg-surface-2"
        style={{ borderRadius: 'var(--radius)' }}
      >
        <span
          aria-hidden
          className="size-2.5 rounded-full"
          style={{ background: THEME_META[themeId].swatch, boxShadow: `0 0 0 2px var(--bg), 0 0 0 3px ${THEME_META[themeId].swatch}55` }}
        />
        {t('theme.label')}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 border border-line bg-surface p-1.5"
          style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}
        >
          {THEME_IDS.map((id) => {
            const m = THEME_META[id];
            const active = id === themeId;
            return (
              <button
                key={id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onMouseEnter={() => preload(id)}
                onFocus={() => preload(id)}
                onClick={() => {
                  setTheme(id);
                  setOpen(false);
                }}
                className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                  active ? 'bg-surface-2' : 'hover:bg-surface-2'
                }`}
                style={{ borderRadius: 'var(--radius)' }}
              >
                <span
                  aria-hidden
                  className="mt-1 size-3 shrink-0 rounded-full"
                  style={{ background: m.swatch, boxShadow: `0 0 0 1px var(--line)` }}
                />
                <span className="min-w-0">
                  <span className="block font-meta text-sm font-semibold text-ink">{ti(m.label)}</span>
                  <span className="mt-0.5 block font-meta text-xs leading-snug text-muted">{ti(m.hint)}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
