import { useCallback, useMemo } from 'react';
import { useApp } from '@/store/AppStore';
import { applyLocaleToFonts } from '@/theme/themes';
import type { TKey } from '@/i18n/translations';
import { LOCALE_FLAGS, LOCALE_NAMES, type Locale } from '@/i18n/locales';
import {
  formatDate,
  formatMoney,
  formatShort,
  translate,
  translatePlural,
  type TParams,
  weekdayShort,
} from '@/i18n/core';

export * from '@/i18n/core';
export type { TKey, Locale };

export interface I18n {
  locale: Locale;
  localeName: string;
  localeFlag: string;
  setLocale: (locale: Locale) => void;
  t: (key: TKey | string, params?: TParams) => string;
  tn: (base: string, n: number, params?: TParams) => string;
  formatDate: (iso: string) => string;
  formatShort: (iso: string) => string;
  weekdayShort: (iso: string) => string;
  formatMoney: (value: number) => string;
}

export function useI18n(): I18n {
  const { state, setLocale } = useApp();
  const locale = state.settings.locale;
  applyLocaleToFonts(locale);

  const t = useCallback(
    (key: TKey | string, params?: TParams) => translate(locale, key, params),
    [locale],
  );
  const tn = useCallback(
    (base: string, n: number, params?: TParams) => translatePlural(locale, base, n, params),
    [locale],
  );

  return useMemo(
    () => ({
      locale,
      localeName: LOCALE_NAMES[locale],
      localeFlag: LOCALE_FLAGS[locale],
      setLocale,
      t,
      tn,
      formatDate: (iso: string) => formatDate(locale, iso),
      formatShort: (iso: string) => formatShort(locale, iso),
      weekdayShort: (iso: string) => weekdayShort(locale, iso),
      formatMoney: (value: number) => formatMoney(locale, value),
    }),
    [locale, setLocale, t, tn],
  );
}
