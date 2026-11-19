export const LOCALES = ['zh', 'en', 'fr', 'de', 'it', 'es', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'zh';

/** 语言在自身语言里的写法 */
export const LOCALE_NAMES: Record<Locale, string> = {
  zh: '中文',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  es: 'Español',
  pt: 'Português',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  zh: '🇨🇳',
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  es: '🇪🇸',
  pt: '🇵🇹',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** 归一化系统语言：pt-BR / zh-Hant / fr-CA 等都落到支持的主语言 */
export function localeFromCode(code: string | undefined | null, fallback: Locale = DEFAULT_LOCALE): Locale {
  if (!code) return fallback;
  const base = code.toLowerCase().split(/[-_]/)[0];
  return isLocale(base) ? base : fallback;
}

export function htmlLang(locale: Locale): string {
  return locale === 'zh' ? 'zh-CN' : locale === 'pt' ? 'pt-BR' : locale;
}
