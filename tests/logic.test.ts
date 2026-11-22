import { describe, expect, it } from 'vitest';
import type { AppState, Category, HolidayRange, LedgerEntry, Task } from '@/types';
import {
  addDays,
  eachDay,
  endOfWeek,
  isISODate,
  isWeekend,
  startOfWeek,
  weekday,
} from '@/domain/date';
import {
  balanceOf,
  coinsToMoney,
  computeAllClearBonus,
  currentStreak,
  dayProgress,
  isTaskCompleted,
  pendingTasksForDate,
  statsForRange,
  taskAppliesOn,
  taskCoinValue,
  tasksForDate,
} from '@/domain/logic';
import { CATEGORIES } from '@/domain/constants';
import { createInitialState } from '@/domain/seed';

const TODAY = '2026-11-19'; // 周四

const HOLIDAYS: HolidayRange[] = [
  { id: 'h1', name: '秋假', start: '2026-11-14', end: '2026-11-30', active: true },
];

const settings: AppState['settings'] = {
  themeId: 'candy',
  locale: 'zh',
  rate: 100,
  currency: 'CNY',
  categoryCoins: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.defaultCoins])) as Record<
    Category,
    number
  >,
  holidays: HOLIDAYS,
};

function makeTask(partial: Partial<Task> & Pick<Task, 'id' | 'title' | 'category' | 'kind'>): Task {
  return {
    profileId: 'kid-1',
    emoji: '⭐',
    createdAt: '2026-01-01',
    ...partial,
  };
}

const dailyTask = makeTask({ id: 'daily-1', title: '刷牙', category: 'daily', kind: 'fixed', coins: 2 });
const dailyTask2 = makeTask({ id: 'daily-2', title: '阅读', category: 'daily', kind: 'fixed', coins: 3 });
const weekendTask = makeTask({ id: 'weekend-1', title: '户外', category: 'weekend', kind: 'fixed' });
const holidayTask = makeTask({ id: 'holiday-1', title: '假期日记', category: 'holiday', kind: 'fixed' });
const onceTask = makeTask({
  id: 'once-1',
  title: '跳绳挑战',
  category: 'special',
  kind: 'once',
  coins: 20,
  startDate: '2026-11-01',
  endDate: '2026-11-30',
});

const ALL_TASKS = [dailyTask, dailyTask2, weekendTask, holidayTask, onceTask];

function earn(
  task: Task,
  date: string,
  coins: number,
  category: Category = task.category,
): LedgerEntry {
  return {
    id: `e-${task.id}-${date}`,
    profileId: 'kid-1',
    type: 'earn',
    date,
    at: `${date}T10:00:00.000Z`,
    coins,
    taskId: task.id,
    taskTitle: task.title,
    emoji: task.emoji,
    category,
    taskKind: task.kind,
  };
}

describe('日期工具', () => {
  it('识别合法日期', () => {
    expect(isISODate('2026-11-19')).toBe(true);
    expect(isISODate('2026-02-30')).toBe(false);
    expect(isISODate('2026-1-1')).toBe(false);
    expect(isISODate('hello')).toBe(false);
  });

  it('跨月加减日期', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('周一是一周开始', () => {
    expect(weekday('2026-11-19')).toBe(4);
    expect(startOfWeek('2026-11-19')).toBe('2026-11-16');
    expect(endOfWeek('2026-11-19')).toBe('2026-11-22');
    expect(startOfWeek('2026-11-22')).toBe('2026-11-16');
  });

  it('周末判断与区间展开', () => {
    expect(isWeekend('2026-11-21')).toBe(true);
    expect(isWeekend('2026-11-22')).toBe(true);
    expect(isWeekend('2026-11-19')).toBe(false);
    expect(eachDay('2026-11-19', '2026-11-22')).toEqual([
      '2026-11-19',
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
    ]);
    expect(eachDay('2026-11-22', '2026-11-19')).toEqual([]);
  });
});

describe('任务出现规则', () => {
  it('每日任务天天出现', () => {
    expect(taskAppliesOn(dailyTask, '2026-11-19', HOLIDAYS)).toBe(true);
    expect(taskAppliesOn(dailyTask, '2026-11-21', HOLIDAYS)).toBe(true);
  });

  it('周末任务只在周六日出现', () => {
    expect(taskAppliesOn(weekendTask, '2026-11-19', HOLIDAYS)).toBe(false);
    expect(taskAppliesOn(weekendTask, '2026-11-21', HOLIDAYS)).toBe(true);
    expect(taskAppliesOn(weekendTask, '2026-11-22', HOLIDAYS)).toBe(true);
  });

  it('报表按假期的日期区间统计', () => {
    expect(taskAppliesOn(holidayTask, '2026-11-13', HOLIDAYS, 'schedule')).toBe(false);
    expect(taskAppliesOn(holidayTask, '2026-11-14', HOLIDAYS, 'schedule')).toBe(true);
    expect(taskAppliesOn(holidayTask, '2026-12-01', HOLIDAYS, 'schedule')).toBe(false);
  });

  it('假期必须手动开启：开启时首页任何日期都显示，关闭时完全不显示', () => {
    const off = HOLIDAYS.map((h) => ({ ...h, active: false }));
    const on = HOLIDAYS.map((h) => ({ ...h, active: true }));
    expect(taskAppliesOn(holidayTask, '2026-11-19', off)).toBe(false);
    expect(taskAppliesOn(holidayTask, '2026-12-20', off)).toBe(false);
    expect(taskAppliesOn(holidayTask, '2026-11-19', on)).toBe(true);
    // 即使不在日期区间，只要假期模式开启，首页也显示
    expect(taskAppliesOn(holidayTask, '2026-12-20', on)).toBe(true);
    // 报表期望次数仍按日期区间统计，避免激活后历史全变成假期
    expect(taskAppliesOn(holidayTask, '2026-12-20', on, 'schedule')).toBe(false);
    expect(taskAppliesOn(holidayTask, '2026-11-19', on, 'schedule')).toBe(true);
  });

  it('挑战任务支持单日：开始和结束同一天时只在当天出现', () => {
    const singleDay = makeTask({
      id: 'once-day',
      title: '单日挑战',
      category: 'special',
      kind: 'once',
      startDate: '2026-11-20',
      endDate: '2026-11-20',
    });
    expect(taskAppliesOn(singleDay, '2026-11-19', HOLIDAYS)).toBe(false);
    expect(taskAppliesOn(singleDay, '2026-11-20', HOLIDAYS)).toBe(true);
    expect(taskAppliesOn(singleDay, '2026-11-21', HOLIDAYS)).toBe(false);
  });

  it('单次挑战只在时间窗内出现，完成后不再出现', () => {
    expect(taskAppliesOn(onceTask, '2026-10-31', HOLIDAYS)).toBe(false);
    expect(taskAppliesOn(onceTask, '2026-11-19', HOLIDAYS)).toBe(true);
    expect(taskAppliesOn(onceTask, '2026-12-01', HOLIDAYS)).toBe(false);

    const entries = [earn(onceTask, '2026-11-18', 20)];
    expect(pendingTasksForDate(ALL_TASKS, entries, '2026-11-19', HOLIDAYS).some((t) => t.id === onceTask.id)).toBe(false);
    expect(isTaskCompleted(entries, onceTask.id)).toBe(true);
  });

  it('归档任务不出现', () => {
    const archived = { ...dailyTask, archived: true };
    expect(taskAppliesOn(archived, TODAY, HOLIDAYS)).toBe(false);
  });

  it('今日任务数量：2 每日 + 1 假期 + 1 挑战', () => {
    const tasks = tasksForDate(ALL_TASKS, [], TODAY, HOLIDAYS);
    expect(tasks.map((t) => t.id).sort()).toEqual(
      ['daily-1', 'daily-2', 'holiday-1', 'once-1'].sort(),
    );
  });
});

describe('金币计算', () => {
  it('任务自定义金币优先于类别默认值', () => {
    expect(taskCoinValue(dailyTask, settings)).toBe(2);
    expect(taskCoinValue(weekendTask, settings)).toBe(5);
    expect(taskCoinValue(onceTask, settings)).toBe(20);
  });

  it('余额 = 赚取 - 兑换', () => {
    const entries: LedgerEntry[] = [
      earn(dailyTask, TODAY, 2),
      earn(dailyTask2, TODAY, 3),
      { ...earn(dailyTask, TODAY, 4), id: 'bonus', type: 'bonus', taskId: undefined, taskTitle: undefined },
      {
        id: 'r1',
        profileId: 'kid-1',
        type: 'redeem',
        date: TODAY,
        at: `${TODAY}T12:00:00.000Z`,
        coins: 5,
        money: 0.05,
        rate: 100,
      },
    ];
    expect(balanceOf(entries)).toBe(4);
  });

  it('金币换算零花钱保留两位', () => {
    expect(coinsToMoney(100, 100)).toBe(1);
    expect(coinsToMoney(125, 100)).toBe(1.25);
    expect(coinsToMoney(10, 0)).toBe(0);
  });
});

describe('今日进度与全勤宝箱', () => {
  it('完成一半时进度正确', () => {
    const entries = [earn(dailyTask, TODAY, 2), earn(onceTask, TODAY, 20)];
    const p = dayProgress(ALL_TASKS, entries, TODAY, HOLIDAYS);
    expect(p.total).toBe(4);
    expect(p.done).toBe(2);
    expect(p.pending).toHaveLength(2);
    expect(p.allClear).toBe(false);
    expect(computeAllClearBonus(ALL_TASKS, entries, TODAY, HOLIDAYS)).toBe(0);
  });

  it('全部完成时发出 5 金币宝箱，且只发一次', () => {
    const entries = [
      earn(dailyTask, TODAY, 2),
      earn(dailyTask2, TODAY, 3),
      earn(holidayTask, TODAY, 6),
      earn(onceTask, TODAY, 20),
    ];
    const p = dayProgress(ALL_TASKS, entries, TODAY, HOLIDAYS);
    expect(p.allClear).toBe(true);
    expect(computeAllClearBonus(ALL_TASKS, entries, TODAY, HOLIDAYS)).toBe(5);

    const withBonus: LedgerEntry[] = [
      ...entries,
      {
        id: 'bonus',
        profileId: 'kid-1',
        type: 'bonus',
        date: TODAY,
        at: `${TODAY}T10:00:00.000Z`,
        coins: 5,
        label: '全勤宝箱',
      },
    ];
    expect(computeAllClearBonus(ALL_TASKS, withBonus, TODAY, HOLIDAYS)).toBe(0);
  });
});

describe('连续打卡', () => {
  it('从今天往前数连续天数', () => {
    const entries = ['2026-11-17', '2026-11-18', '2026-11-19'].map((d) =>
      earn(dailyTask, d, 2),
    );
    expect(currentStreak(entries, TODAY)).toBe(3);
  });

  it('今天还没打卡时从昨天开始算', () => {
    const entries = ['2026-11-16', '2026-11-17', '2026-11-18'].map((d) =>
      earn(dailyTask, d, 2),
    );
    expect(currentStreak(entries, TODAY)).toBe(3);
  });

  it('断签后重新计数', () => {
    const entries = ['2026-11-15', '2026-11-16', '2026-11-18'].map((d) =>
      earn(dailyTask, d, 2),
    );
    expect(currentStreak(entries, TODAY)).toBe(1);
  });

  it('没有记录时为 0', () => {
    expect(currentStreak([], TODAY)).toBe(0);
  });
});

describe('报表统计', () => {
  const entries: LedgerEntry[] = [
    earn(dailyTask, '2026-11-18', 2),
    earn(dailyTask2, '2026-11-18', 3),
    earn(dailyTask, '2026-11-19', 2),
    earn(holidayTask, '2026-11-19', 6),
    earn(onceTask, '2026-11-19', 20),
  ];

  it('区间金币、完成数与类别分布', () => {
    const stats = statsForRange(ALL_TASKS, entries, settings, '2026-11-16', TODAY, TODAY);
    expect(stats.days).toBe(4);
    expect(stats.earnedCoins).toBe(33);
    expect(stats.completedChecks).toBe(5);
    expect(stats.completedFixed).toBe(4);
    expect(stats.byCategory.daily).toEqual({ coins: 7, count: 3 });
    expect(stats.byCategory.holiday).toEqual({ coins: 6, count: 1 });
    expect(stats.byCategory.special).toEqual({ coins: 20, count: 1 });
    expect(stats.onceCompleted).toBe(1);
    expect(stats.activeDays).toBe(2);
    expect(stats.bestDay?.date).toBe('2026-11-19');
    expect(stats.bestDay?.coins).toBe(28);
    expect(stats.moneyValue).toBeCloseTo(0.33, 5);
  });

  it('完成率只统计固定任务：4 天 × (2 每日 + 1 假期) = 12', () => {
    const stats = statsForRange(ALL_TASKS, entries, settings, '2026-11-16', TODAY, TODAY);
    expect(stats.expectedChecks).toBe(12);
    expect(stats.completionRate).toBeCloseTo(4 / 12, 5);
  });

  it('未来日期被裁剪，统计区间不会超过今天', () => {
    const stats = statsForRange(ALL_TASKS, entries, settings, '2026-11-16', '2026-11-22', TODAY);
    expect(stats.series).toHaveLength(4);
    expect(stats.end).toBe(TODAY);
    expect(stats.series.filter((d) => d.date > TODAY).length).toBe(0);
  });

  it('兑换记录单独统计', () => {
    const withRedeem: LedgerEntry[] = [
      ...entries,
      {
        id: 'r1',
        profileId: 'kid-1',
        type: 'redeem',
        date: TODAY,
        at: `${TODAY}T12:00:00.000Z`,
        coins: 100,
        money: 1,
        rate: 100,
      },
    ];
    const stats = statsForRange(ALL_TASKS, withRedeem, settings, '2026-11-16', TODAY, TODAY);
    expect(stats.redeemedCoins).toBe(100);
    expect(stats.redeemedMoney).toBe(1);
    expect(stats.earnedCoins).toBe(33);
  });

  it('没有记录时返回安全值', () => {
    const stats = statsForRange(ALL_TASKS, [], settings, TODAY, TODAY, TODAY);
    expect(stats.earnedCoins).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.bestDay).toBeNull();
    expect(stats.topTask).toBeNull();
  });
});

describe('初始数据', () => {
  it('种子任务覆盖四个类别，且都有奖励', () => {
    const state = createInitialState();
    const categories = new Set(state.tasks.map((t) => t.category));
    expect(categories.size).toBe(4);
    expect(state.tasks.every((t) => taskCoinValue(t, state.settings) > 0)).toBe(true);
    expect(state.settings.rate).toBeGreaterThan(0);
    expect(state.settings.holidays.length).toBeGreaterThan(0);
  });
});
