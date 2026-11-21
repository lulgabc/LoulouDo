import type { Category, ThemeId } from '@/types';

export interface CategoryMeta {
  id: Category;
  name: string;
  short: string;
  emoji: string;
  hint: string;
  /** 默认金币奖励 */
  defaultCoins: number;
  colorKey: 'primary' | 'accent' | 'secondary' | 'candy';
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'daily',
    name: '每日任务',
    short: '每日',
    emoji: '☀️',
    hint: '每天都要做的小事，天天有小金币',
    defaultCoins: 2,
    colorKey: 'primary',
  },
  {
    id: 'weekend',
    name: '周末任务',
    short: '周末',
    emoji: '🎈',
    hint: '周六周日出现的加量任务',
    defaultCoins: 5,
    colorKey: 'accent',
  },
  {
    id: 'holiday',
    name: '假期任务',
    short: '假期',
    emoji: '🏖️',
    hint: '只在假期日期里出现',
    defaultCoins: 6,
    colorKey: 'secondary',
  },
  {
    id: 'special',
    name: '特别挑战',
    short: '挑战',
    emoji: '🚀',
    hint: '一次性的超级挑战，奖励最多',
    defaultCoins: 15,
    colorKey: 'candy',
  },
];

export const CATEGORY_MAP: Record<Category, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<Category, CategoryMeta>;



export const THEME_IDS: ThemeId[] = ['candy', 'forest', 'fantasy', 'cute'];

export const STORAGE_KEY = 'louloudou.state.v1';
export const ALL_CLEAR_BONUS = 5;
export const ONBOARDING_BONUS = 5;
