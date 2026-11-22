import type { Locale } from '@/i18n/locales';

export type CurrencyCode = 'CNY' | 'USD' | 'EUR' | 'GBP';

export const CURRENCIES: { code: CurrencyCode; symbol: string }[] = [
  { code: 'CNY', symbol: '¥' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCY_SYMBOLS[code];
}

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === 'CNY' || value === 'USD' || value === 'EUR' || value === 'GBP';
}

/** 首次使用按语言给一个合理默认值，之后可以在设置里改。 */
export function currencyForLocale(locale: Locale): CurrencyCode {
  if (locale === 'zh') return 'CNY';
  if (locale === 'en') return 'USD';
  return 'EUR';
}
