import * as Localization from 'expo-localization';
import { isLocale, type Locale } from '@/i18n/locales';

/** 首次启动时自动识别设备语言，不支持时用英文。仅在 App 运行时调用。 */
export function detectLocale(): Locale {
  try {
    const locales = Localization.getLocales();
    for (const item of locales) {
      const base = item.languageCode?.toLowerCase();
      if (isLocale(base)) return base;
    }
  } catch {
    // ignore
  }
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.language : '';
    const base = nav?.toLowerCase().split(/[-_]/)[0];
    if (isLocale(base)) return base;
  } catch {
    // ignore
  }
  return 'en';
}
