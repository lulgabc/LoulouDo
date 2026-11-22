import type { AppState, Category, HolidayRange, Task } from '@/types';
import { CATEGORIES } from '@/domain/constants';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/locales';
import { DEFAULT_AVATAR } from '@/domain/avatars';
import { currencyForLocale } from '@/domain/currency';

const CREATED = '2026-01-01';

const categoryCoins = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.defaultCoins]),
) as Record<Category, number>;

function task(
  id: string,
  title: string,
  emoji: string,
  category: Category,
  extra: Partial<Task> = {},
): Task {
  return {
    id,
    profileId: 'kid-1',
    title,
    emoji,
    category,
    kind: category === 'special' ? 'once' : 'fixed',
    createdAt: CREATED,
    ...extra,
  };
}

export const DEFAULT_HOLIDAYS: HolidayRange[] = [
  { id: 'holiday-autumn', name: '秋假', nameKey: 'seed.holiday.autumn', start: '2026-11-14', end: '2026-11-30', active: false },
  { id: 'holiday-winter', name: '寒假', nameKey: 'seed.holiday.winter', start: '2027-01-25', end: '2027-02-20', active: false },
  { id: 'holiday-summer', name: '暑假', nameKey: 'seed.holiday.summer', start: '2026-07-01', end: '2026-08-31', active: false },
];

const SEED_TASKS: Task[] = [
  task('t-brush', '自己刷牙洗脸', 'toothbrush', 'daily', { coins: 2, titleKey: 'seed.task.brush' }),
  task('t-bag', '收拾小书包', 'backpack', 'daily', { coins: 2, titleKey: 'seed.task.bag' }),
  task('t-read', '阅读 20 分钟', 'books', 'daily', { coins: 4, titleKey: 'seed.task.read' }),
  task('t-water', '喝够 8 杯水', 'droplet', 'daily', { coins: 3, titleKey: 'seed.task.water' }),
  task('t-piano', '练琴 15 分钟', 'musical-keyboard', 'daily', { coins: 4, titleKey: 'seed.task.piano' }),
  task('t-sleep', '九点前上床睡觉', 'crescent-moon', 'daily', { coins: 3, titleKey: 'seed.task.sleep' }),
  task('t-outdoor', '户外运动 1 小时', 'bicycle', 'weekend', { coins: 6, titleKey: 'seed.task.outdoor' }),
  task('t-chore', '帮家里做一件家务', 'broom', 'weekend', { coins: 5, titleKey: 'seed.task.chore' }),
  task('t-room', '整理自己的房间', 'teddy-bear', 'weekend', { coins: 4, titleKey: 'seed.task.room' }),
  task('t-diary', '写一篇假期日记', 'pencil', 'holiday', { coins: 6, titleKey: 'seed.task.diary' }),
  task('t-cook', '学做一道新菜', 'cooking', 'holiday', { coins: 8, titleKey: 'seed.task.cook' }),
  task('t-swim', '游泳练习 45 分钟', 'person-swimming', 'holiday', { coins: 6, titleKey: 'seed.task.swim' }),
  task('t-jump', '连续跳绳 100 下', 'person-cartwheeling', 'special', {
    kind: 'once',
    coins: 20,
    titleKey: 'seed.task.jump',
    startDate: '2026-11-01',
    endDate: '2026-12-31',
  }),
  task('t-puzzle', '完成 1000 片拼图', 'puzzle-piece', 'special', {
    kind: 'once',
    coins: 30,
    titleKey: 'seed.task.puzzle',
    startDate: '2026-11-10',
    endDate: '2026-12-20',
  }),
  task('t-stage', '钢琴小演出登台', 'microphone', 'special', {
    kind: 'once',
    coins: 40,
    titleKey: 'seed.task.stage',
    startDate: '2026-12-01',
    endDate: '2027-01-10',
  }),
];

export function createInitialState(locale: Locale = DEFAULT_LOCALE): AppState {
  return {
    version: 1,
    onboarded: false,
    activeProfileId: 'kid-1',
    profiles: [
      {
        id: 'kid-1',
        name: '小鹿',
        avatar: DEFAULT_AVATAR,
        wish: { title: '乐高小城堡', titleKey: 'seed.wish.castle', target: 199 },
      },
    ],
    tasks: SEED_TASKS,
    entries: [],
    settings: {
      themeId: 'candy',
      locale,
      rate: 10,
      currency: currencyForLocale(locale),
      categoryCoins,
      holidays: DEFAULT_HOLIDAYS,
    },
  };
}
