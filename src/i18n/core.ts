import { fromISO } from '@/domain/date';
import { DICTS, type TKey } from '@/i18n/translations';
import type { Locale } from '@/i18n/locales';
import { CURRENCY_SYMBOLS, type CurrencyCode } from '@/domain/currency';

export type TParams = Record<string, string | number>;

export function translate(
  locale: Locale,
  key: TKey | string,
  params?: TParams,
): string {
  const dict = DICTS[locale] ?? DICTS.en;
  const fallback = DICTS.en as Record<string, string>;
  let text = (dict as Record<string, string>)[key] ?? fallback[key] ?? String(key);
  if (params) {
    text = text.replace(/\{(\w+)\}/g, (match, name: string) =>
      params[name] === undefined ? match : String(params[name]),
    );
  }
  return text;
}

/** startsIn_one / startsIn_other 这类简易单复数 */
export function translatePlural(
  locale: Locale,
  base: string,
  n: number,
  params?: TParams,
): string {
  const suffix = n === 1 ? 'one' : 'other';
  return translate(locale, `${base}_${suffix}`, { ...params, n });
}

export function intlLocale(locale: Locale): string {
  if (locale === 'zh') return 'zh-CN';
  if (locale === 'pt') return 'pt-BR';
  return locale;
}

function safeFormat(
  locale: Locale,
  date: Date,
  options: Intl.DateTimeFormatOptions,
  fallback: string,
): string {
  try {
    return new Intl.DateTimeFormat(intlLocale(locale), options).format(date);
  } catch {
    return fallback;
  }
}

export function formatDate(locale: Locale, iso: string): string {
  const text = safeFormat(
    locale,
    fromISO(iso),
    { weekday: 'short', month: 'short', day: 'numeric' },
    iso,
  );
  return locale === 'zh' ? text.replace(/(日)(周)/, '$1 $2') : text;
}

export function formatShort(locale: Locale, iso: string): string {
  return safeFormat(locale, fromISO(iso), { month: 'numeric', day: 'numeric' }, iso);
}

export function weekdayShort(locale: Locale, iso: string): string {
  return safeFormat(locale, fromISO(iso), { weekday: 'short' }, '');
}

export function formatMonth(locale: Locale, iso: string, short = false): string {
  return safeFormat(
    locale,
    fromISO(iso),
    { year: 'numeric', month: short ? 'short' : 'long' },
    iso.slice(0, 7),
  );
}

export function formatMoneyShort(
  locale: Locale,
  value: number,
  currency: CurrencyCode = 'CNY',
): string {
  try {
    return new Intl.NumberFormat(intlLocale(locale), {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${CURRENCY_SYMBOLS[currency]}${Math.round(value)}`;
  }
}

export function formatMoney(
  locale: Locale,
  value: number,
  currency: CurrencyCode = 'CNY',
): string {
  try {
    return new Intl.NumberFormat(intlLocale(locale), {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${CURRENCY_SYMBOLS[currency]}${value.toFixed(2)}`;
  }
}

export function greetingKey(now: Date = new Date()): TKey {
  const h = now.getHours();
  if (h < 6) return 'greeting.late';
  if (h < 11) return 'greeting.morning';
  if (h < 14) return 'greeting.noon';
  if (h < 18) return 'greeting.afternoon';
  if (h < 22) return 'greeting.evening';
  return 'greeting.night';
}
