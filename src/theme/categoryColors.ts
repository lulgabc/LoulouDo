import type { Category } from '@/types';
import type { Theme } from '@/theme/themes';

/** 分类统一色：首页便当、任务管理、报表、图例共用。 */
export function colorForCategory(category: Category, theme: Theme): string {
  switch (category) {
    case 'daily':
      return theme.primary;
    case 'weekend':
      return theme.accent;
    case 'holiday':
      return theme.secondary;
    case 'special':
      return theme.candy;
    default:
      return theme.primary;
  }
}
