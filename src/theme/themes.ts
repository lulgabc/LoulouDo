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
    name: '糖果星球',
    tagline: '软软的棉花糖配色',
    emoji: '🍬',
    dark: false,
    bg: '#FFF2F8',
    bgGradient: ['#FFF3F9', '#E9FBF4'],
    card: '#FFFFFF',
    cardSoft: '#FFF0F6',
    text: '#4A2A3C',
    textSoft: '#8C6B7B',
    primary: '#FF6FA5',
    onPrimary: '#FFFFFF',
    accent: '#FFB020',
    secondary: '#39C6A3',
    candy: '#9B7BFF',
    danger: '#F2555A',
    coin: '#FFC53D',
    border: 'rgba(255,111,165,0.16)',
    borderWidth: 1,
    cardBorderWidth: 0,
    radius: 28,
    radiusSm: 16,
    shadow: {
      color: '#B0466F',
      opacity: 0.1,
      radius: 24,
      offset: { width: 0, height: 10 },
      elevation: 4,
    },
    heroGradient: ['#FF9FC4', '#FFCFE1'],
    tabBg: '#FFFFFF',
    chip: '#FFE3EF',
    stickers: ['🍬', '🌈', '🍓', '⭐', '🧁'],
    stickerOpacity: 0.16,
  },
  pop: {
    id: 'pop',
    name: '撞色波普',
    tagline: '大胆撞色，能量满满',
    emoji: '⚡',
    dark: false,
    bg: '#FFF8E7',
    bgGradient: ['#FFF6DC', '#E7F5FF'],
    card: '#FFFFFF',
    cardSoft: '#FFF1C9',
    text: '#1E1B4B',
    textSoft: '#5B5780',
    primary: '#FF4D2E',
    onPrimary: '#FFFFFF',
    accent: '#2F5BFF',
    secondary: '#00B884',
    candy: '#FFD400',
    danger: '#E4362C',
    coin: '#FFC800',
    border: '#1E1B4B',
    borderWidth: 3,
    cardBorderWidth: 3,
    radius: 18,
    radiusSm: 12,
    shadow: {
      color: '#1E1B4B',
      opacity: 1,
      radius: 0,
      offset: { width: 4, height: 5 },
      elevation: 7,
    },
    heroGradient: ['#FFD400', '#FF9D2E'],
    tabBg: '#FFFFFF',
    chip: '#FFE7B3',
    stickers: ['⚡', '🎈', '🌟', '🎨', '🚀'],
    stickerOpacity: 0.2,
  },
  sticker: {
    id: 'sticker',
    name: '贴纸手账',
    tagline: '牛皮纸 + 手账贴纸',
    emoji: '📒',
    dark: false,
    bg: '#F8EFDE',
    bgGradient: ['#FBF4E6', '#F1E4CC'],
    card: '#FFFDF8',
    cardSoft: '#F5E8CE',
    text: '#4B382B',
    textSoft: '#8B735C',
    primary: '#E9765B',
    onPrimary: '#FFF9ED',
    accent: '#7FA97F',
    secondary: '#6C9BC4',
    candy: '#D9A441',
    danger: '#C9533F',
    coin: '#E3A82C',
    border: '#DCC3A0',
    borderWidth: 2,
    cardBorderWidth: 0,
    radius: 14,
    radiusSm: 10,
    shadow: {
      color: '#8B735C',
      opacity: 0.16,
      radius: 10,
      offset: { width: 0, height: 6 },
      elevation: 3,
    },
    heroGradient: ['#F7D9B8', '#EAC9A6'],
    tabBg: '#FFFDF8',
    chip: '#F1DFC2',
    stickers: ['🌼', '📎', '🍂', '✏️', '☕'],
    stickerOpacity: 0.22,
  },
  galaxy: {
    id: 'galaxy',
    name: '星空梦想',
    tagline: '安静的深蓝夜空',
    emoji: '🌙',
    dark: true,
    bg: '#151233',
    bgGradient: ['#1D1848', '#0D0B24'],
    card: 'rgba(255,255,255,0.08)',
    cardSoft: 'rgba(255,255,255,0.06)',
    text: '#F5F1FF',
    textSoft: '#B9B2E0',
    primary: '#9B8CFF',
    onPrimary: '#1A1338',
    accent: '#63E6BE',
    secondary: '#FF8FD1',
    candy: '#FFD166',
    danger: '#FF7B7B',
    coin: '#FFD166',
    border: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    cardBorderWidth: 1,
    radius: 24,
    radiusSm: 14,
    shadow: {
      color: '#000000',
      opacity: 0.4,
      radius: 24,
      offset: { width: 0, height: 12 },
      elevation: 5,
    },
    heroGradient: ['#6D5BD0', '#3B2F86'],
    tabBg: 'rgba(28,23,62,0.94)',
    chip: 'rgba(255,255,255,0.12)',
    stickers: ['✨', '🌙', '🪐', '🛸', '⭐'],
    stickerOpacity: 0.24,
  },
};

export const THEME_LIST: Theme[] = [THEMES.candy, THEMES.pop, THEMES.sticker, THEMES.galaxy];

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
