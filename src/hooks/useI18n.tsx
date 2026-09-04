import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { STRINGS } from '../i18n/strings';
import type { StringKey } from '../i18n/strings';
import type { L10n, Locale } from '../data/types';
import { readParam, writeParam } from './useUrlState';

const LOCALES: Locale[] = ['vi', 'en'];
const isLocale = (v: unknown): v is Locale => LOCALES.includes(v as Locale);

/** Thứ tự ưu tiên: query param > localStorage > ngôn ngữ trình duyệt. */
function initialLocale(): Locale {
  const fromUrl = readParam('lang');
  if (isLocale(fromUrl)) return fromUrl;

  const stored = localStorage.getItem('locale');
  if (isLocale(stored)) return stored;

  return navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: StringKey) => string;
  ti: (value: L10n) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
    if (readParam('lang')) writeParam('lang', l);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => STRINGS[key][locale],
      ti: (v) => v[locale],
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n phải nằm trong <I18nProvider>');
  return ctx;
}
