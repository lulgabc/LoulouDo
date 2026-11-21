import { Platform, TextStyle, ViewStyle } from 'react-native';
import { useApp } from '@/store/AppStore';
import type { ThemeId } from '@/types';
import type { Locale } from '@/i18n/locales';

export const HEADING_FONT = 'ZCOOLKuaiLe_400Regular';
export const LATIN_HEADING_FONT = 'Baloo2_700Bold';
export const NUMBER_FONT = 'Baloo2_800ExtraBold';
export const NUMBER_FONT_MEDIUM = 'Baloo2_600SemiBold';

export interface Theme {
  id: ThemeId;
  name: string;
  tagline: string;
  emoji: string;
  dark: boolean;
  bg: string;
  bgGradient: [string, string];
  card: string;
  cardSoft: string;
  text: string;
  textSoft: string;
  primary: string;
  onPrimary: string;
  accent: string;
  secondary: string;
  candy: string;
  danger: string;
  coin: string;
  border: string;
  borderWidth: number;
  /** 大面板（Board/Card）使用的边框宽度；柔和的皮肤为 0 */
  cardBorderWidth: number;
  radius: number;
  radiusSm: number;
  shadow: {
    color: string;
    opacity: number;
    radius: number;
    offset: { width: number; height: number };
    elevation: number;
  };
  heroGradient: [string, string];
  tabBg: string;
  chip: string;
  stickers: string[];
  stickerOpacity: number;
}

export const THEMES: Record<ThemeId, Theme> = {
  candy: {
    id: 'candy',
    name: '糖果贴纸',
    tagline: '糖果色手账贴纸',
    emoji: '🍬',
    dark: false,
    bg: '#FFF2F8',
    bgGradient: ['#FFF5FA', '#E9FBF4'],
    card: '#FFFFFF',
    cardSoft: '#FFF0F6',
    text: '#4A2A3C',
    textSoft: '#8C6B7B',
    primary: '#FF6FA5',
    onPrimary: '#FFFFFF',
    accent: '#FFB020',
    secondary: '#39C6A3',
    candy: '#A78BFA',
    danger: '#F2555A',
    coin: '#FFC53D',
    border: '#F58BB2',
    borderWidth: 2,
    cardBorderWidth: 2,
    radius: 22,
    radiusSm: 14,
    shadow: {
      color: '#A33A66',
      opacity: 0.22,
      radius: 0,
      offset: { width: 2, height: 3 },
      elevation: 4,
    },
    heroGradient: ['#FFB3D0', '#FFDCE9'],
    tabBg: '#FFFDFE',
    chip: '#FFE3EF',
    stickers: ['🍬', '🌈', '🍓', '⭐', '🧁'],
    stickerOpacity: 0.16,
  },
  forest: {
    id: 'forest',
    name: '森林贴纸',
    tagline: '苔藓、奶油和松木',
    emoji: '🌿',
    dark: false,
    bg: '#F3F6EC',
    bgGradient: ['#F8FAEF', '#E6F2E3'],
    card: '#FFFDF7',
    cardSoft: '#EFF5E4',
    text: '#334B37',
    textSoft: '#6E8268',
    primary: '#5F9B6B',
    onPrimary: '#FFFDF7',
    accent: '#D89A4E',
    secondary: '#7FBE9F',
    candy: '#A8C95F',
    danger: '#C05A4B',
    coin: '#E8B34A',
    border: '#A8C49A',
    borderWidth: 2,
    cardBorderWidth: 2,
    radius: 22,
    radiusSm: 14,
    shadow: {
      color: '#536A46',
      opacity: 0.22,
      radius: 0,
      offset: { width: 2, height: 3 },
      elevation: 4,
    },
    heroGradient: ['#C3DEB1', '#EAF4DB'],
    tabBg: '#FFFDF7',
    chip: '#E7F0D9',
    stickers: ['🌿', '🍄', '🐿️', '🌼', '🍃'],
    stickerOpacity: 0.16,
  },
  fantasy: {
    id: 'fantasy',
    name: '奇幻贴纸',
    tagline: '星月、魔法与金色',
    emoji: '🔮',
    dark: false,
    bg: '#F4F1FB',
    bgGradient: ['#F8F2FF', '#E8E7FF'],
    card: '#FFFDFE',
    cardSoft: '#F2EBFF',
    text: '#3B2D5B',
    textSoft: '#7A6A99',
    primary: '#8A6FE8',
    onPrimary: '#FFFFFF',
    accent: '#F0B74E',
    secondary: '#66D6C6',
    candy: '#F08CB9',
    danger: '#D9536B',
    coin: '#F3C351',
    border: '#C3B3EE',
    borderWidth: 2,
    cardBorderWidth: 2,
    radius: 24,
    radiusSm: 15,
    shadow: {
      color: '#5A4A8C',
      opacity: 0.24,
      radius: 0,
      offset: { width: 2, height: 3 },
      elevation: 4,
    },
    heroGradient: ['#CDB9FF', '#EDE1FF'],
    tabBg: '#FFFDFE',
    chip: '#EDE4FF',
    stickers: ['🔮', '✨', '🌙', '⭐', '🪄'],
    stickerOpacity: 0.18,
  },
  cute: {
    id: 'cute',
    name: '可爱贴纸',
    tagline: '奶油桃子和软糖',
    emoji: '🧸',
    dark: false,
    bg: '#FFF7EE',
    bgGradient: ['#FFF8EC', '#FFE9EE'],
    card: '#FFFEFA',
    cardSoft: '#FFEFE3',
    text: '#5A3A37',
    textSoft: '#9B7A70',
    primary: '#FF8B7B',
    onPrimary: '#FFFFFF',
    accent: '#FFC857',
    secondary: '#7FD8C6',
    candy: '#FFA9C7',
    danger: '#E85A65',
    coin: '#FFC94A',
    border: '#F2B7A6',
    borderWidth: 2,
    cardBorderWidth: 2,
    radius: 24,
    radiusSm: 15,
    shadow: {
      color: '#A97363',
      opacity: 0.22,
      radius: 0,
      offset: { width: 2, height: 3 },
      elevation: 4,
    },
    heroGradient: ['#FFC8B4', '#FFE6D9'],
    tabBg: '#FFFEFA',
    chip: '#FFE7D8',
    stickers: ['🧸', '🍑', '🍓', '🎀', '🍬'],
    stickerOpacity: 0.18,
  },
};

export const THEME_LIST: Theme[] = [THEMES.candy, THEMES.forest, THEMES.fantasy, THEMES.cute];

/** 中文用圆润的站酷快乐体；其他语言用带重音符号的 Baloo 2。 */
let activeLocale: Locale = 'zh';

export function applyLocaleToFonts(locale: Locale) {
  activeLocale = locale;
}

export function headingLocale(): Locale {
  return activeLocale;
}

export function useTheme(): Theme {
  const { state } = useApp();
  return THEMES[state.settings.themeId] ?? THEMES.candy;
}

export function shadowStyle(theme: Theme): ViewStyle {
  return {
    shadowColor: theme.shadow.color,
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: theme.shadow.radius,
    shadowOffset: theme.shadow.offset,
    elevation: theme.shadow.elevation,
  };
}

export function heading(size = 20, color?: string): TextStyle {
  return {
    fontFamily: activeLocale === 'zh' ? HEADING_FONT : LATIN_HEADING_FONT,
    fontSize: size,
    color,
    letterSpacing: 0.3,
  };
}

export function numberStyle(size = 24, color?: string): TextStyle {
  return {
    fontFamily: NUMBER_FONT,
    fontSize: size,
    color,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  };
}
