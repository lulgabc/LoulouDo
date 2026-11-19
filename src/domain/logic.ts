import type {
  AppState,
  Category,
  HolidayRange,
  LedgerEntry,
  Settings,
  Task,
} from '@/types';
import { ALL_CLEAR_BONUS } from '@/domain/constants';
import {
  addDays,
  eachDay,
  isWeekend,
  maxISO,
  minISO,
  startOfMonth,
  startOfWeek,
  todayISO,
} from '@/domain/date';

export function holidayFor(date: string, holidays: HolidayRange[]): HolidayRange | null {
  return holidays.find((h) => date >= h.start && date <= h.end) ?? null;
}

export function isHoliday(date: string, holidays: HolidayRange[]): boolean {
  return holidayFor(date, holidays) !== null;
}

/** 任务在指定日期是否“应该出现”（不含完成状态）。 */
export function taskAppliesOn(task: Task, date: string, holidays: HolidayRange[]): boolean {
  if (task.archived) return false;
  if (task.kind === 'once') {
    const start = task.startDate ?? task.createdAt;
    const end = task.endDate ?? start;
    return date >= start && date <= end;
  }
  switch (task.category) {
    case 'daily':
      return true;
    case 'weekend':
      return isWeekend(date);
    case 'holiday':
      return isHoliday(date, holidays);
    case 'special':
      return false;
    default:
      return false;
  }
}

export function taskCoinValue(task: Task, settings: Settings): number {
  return Math.max(1, Math.round(task.coins ?? settings.categoryCoins[task.category]));
}

export function isTaskDoneOn(entries: LedgerEntry[], taskId: string, date: string): boolean {
  return entries.some(
    (e) => e.type === 'earn' && e.taskId === taskId && e.date === date,
  );
}

export function isTaskCompleted(entries: LedgerEntry[], taskId: string): boolean {
  return entries.some((e) => e.type === 'earn' && e.taskId === taskId);
}

/** 某天仍待打卡的任务（已完成的单次挑战不再出现）。 */
export function pendingTasksForDate(
  tasks: Task[],
  entries: LedgerEntry[],
  date: string,
  holidays: HolidayRange[],
): Task[] {
  return tasks.filter((task) => {
    if (!taskAppliesOn(task, date, holidays)) return false;
    if (task.kind === 'once') return !isTaskCompleted(entries, task.id);
    return !isTaskDoneOn(entries, task.id, date);
  });
}

/** 某天可打卡的全部任务（含已完成）。 */
export function tasksForDate(
  tasks: Task[],
  entries: LedgerEntry[],
  date: string,
  holidays: HolidayRange[],
): Task[] {
  return tasks.filter((task) => {
    if (!taskAppliesOn(task, date, holidays)) return false;
    if (task.kind === 'once' && isTaskCompleted(entries, task.id)) {
      // 已完成的单次挑战只在完成当天展示
      return entries.some(
        (e) => e.type === 'earn' && e.taskId === task.id && e.date === date,
      );
    }
    return true;
  });
}

export function tasksDoneOn(
  tasks: Task[],
  entries: LedgerEntry[],
  date: string,
): Task[] {
  return tasks.filter((task) => isTaskDoneOn(entries, task.id, date));
}

export function balanceOf(entries: LedgerEntry[]): number {
  return entries.reduce((sum, entry) => {
    if (entry.type === 'redeem') return sum - entry.coins;
    return sum + entry.coins;
  }, 0);
}

export function earnedOn(entries: LedgerEntry[], date: string): number {
  return entries
    .filter((e) => e.date === date && e.type !== 'redeem')
    .reduce((sum, e) => sum + e.coins, 0);
}

export function coinsToMoney(coins: number, rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  return Math.round((coins / rate) * 100) / 100;
}

export function moneyToCoins(money: number, rate: number): number {
  return Math.round(money * rate);
}

export function hasAllClearBonus(entries: LedgerEntry[], date: string): boolean {
  return entries.some((e) => e.type === 'bonus' && e.date === date && e.label === '全勤宝箱');
}

/** 今日进度 */
export function dayProgress(
  tasks: Task[],
  entries: LedgerEntry[],
  date: string,
  holidays: HolidayRange[],
): { total: number; done: number; pending: Task[]; percent: number; allClear: boolean } {
  const today = tasksForDate(tasks, entries, date, holidays);
  const pending = pendingTasksForDate(tasks, entries, date, holidays);
  const done = today.length - pending.length;
  return {
    total: today.length,
    done,
    pending,
    percent: today.length === 0 ? 0 : done / today.length,
    allClear: today.length > 0 && pending.length === 0,
  };
}

/** 当前连续打卡天数（今天还没打卡时从昨天往前算）。 */
export function currentStreak(entries: LedgerEntry[], today: string = todayISO()): number {
  const days = new Set(
    entries.filter((e) => e.type === 'earn').map((e) => e.date),
  );
  if (days.size === 0) return 0;
  let cursor = today;
  if (!days.has(cursor)) {
    cursor = addDays(cursor, -1);
    if (!days.has(cursor)) return 0;
  }
  let count = 0;
  while (days.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export interface DayPoint {
  date: string;
  coins: number;
  count: number;
  expected: number;
}

export interface CategoryStat {
  coins: number;
  count: number;
}

export interface RangeStats {
  start: string;
  end: string;
  days: number;
  earnedCoins: number;
  bonusCoins: number;
  redeemedCoins: number;
  redeemedMoney: number;
  completedChecks: number;
  completedFixed: number;
  expectedChecks: number;
  completionRate: number;
  activeDays: number;
  onceCompleted: number;
  bestDay: DayPoint | null;
  series: DayPoint[];
  byCategory: Record<Category, CategoryStat>;
  streak: number;
  topTask: { title: string; emoji: string; count: number; taskKey?: string } | null;
  moneyValue: number;
}

const emptyCategory = (): Record<Category, CategoryStat> => ({
  daily: { coins: 0, count: 0 },
  weekend: { coins: 0, count: 0 },
  holiday: { coins: 0, count: 0 },
  special: { coins: 0, count: 0 },
});

export function statsForRange(
  tasks: Task[],
  entries: LedgerEntry[],
  settings: Settings,
  start: string,
  end: string,
  today: string = todayISO(),
): RangeStats {
  const safeEnd = minISO(end, maxISO(start, today));
  const days = start > safeEnd ? [] : eachDay(start, safeEnd);
  const inRange = entries.filter((e) => e.date >= start && e.date <= safeEnd);

  const byCategory = emptyCategory();
  let earnedCoins = 0;
  let bonusCoins = 0;
  let redeemedCoins = 0;
  let redeemedMoney = 0;
  let completedChecks = 0;
  let completedFixed = 0;
  let onceCompleted = 0;

  const taskCounts = new Map<string, { title: string; emoji: string; count: number; taskKey?: string }>();
  const active = new Set<string>();

  for (const entry of inRange) {
    if (entry.type === 'redeem') {
      redeemedCoins += entry.coins;
      redeemedMoney += entry.money ?? coinsToMoney(entry.coins, entry.rate ?? settings.rate);
      continue;
    }
    if (entry.type === 'bonus') {
      bonusCoins += entry.coins;
      earnedCoins += entry.coins;
      active.add(entry.date);
      continue;
    }
    // earn
    earnedCoins += entry.coins;
    completedChecks += 1;
    if (entry.taskKind !== 'once') completedFixed += 1;
    active.add(entry.date);
    if (entry.category) {
      byCategory[entry.category].coins += entry.coins;
      byCategory[entry.category].count += 1;
      if (entry.category === 'special') onceCompleted += 1;
    }
    if (entry.taskId) {
      const current = taskCounts.get(entry.taskId);
      taskCounts.set(entry.taskId, {
        title: entry.taskTitle ?? '任务',
        emoji: entry.emoji ?? '⭐',
        count: (current?.count ?? 0) + 1,
        taskKey: entry.taskKey ?? current?.taskKey,
      });
    }
  }

  // 期望打卡次数：只统计今天（含）之前的固定任务
  let expectedChecks = 0;
  for (const day of days) {
    if (day > today) continue;
    for (const task of tasks) {
      if (task.kind !== 'fixed') continue;
      if (!taskAppliesOn(task, day, settings.holidays)) continue;
      if (task.createdAt > day) continue;
      expectedChecks += 1;
    }
  }

  const series: DayPoint[] = days.map((date) => {
    const dayEntries = inRange.filter((e) => e.date === date && e.type !== 'redeem');
    const expected =
      date > today
        ? 0
        : tasks.filter(
            (task) =>
              task.kind === 'fixed' &&
              taskAppliesOn(task, date, settings.holidays) &&
              task.createdAt <= date,
          ).length;
    return {
      date,
      coins: dayEntries.reduce((s, e) => s + e.coins, 0),
      count: dayEntries.filter((e) => e.type === 'earn').length,
      expected,
    };
  });

  const bestDay = series.reduce<DayPoint | null>((best, point) => {
    if (point.coins <= 0) return best;
    if (!best || point.coins > best.coins) return point;
    return best;
  }, null);

  const topTask =
    [...taskCounts.values()].sort((a, b) => b.count - a.count)[0] ?? null;

  return {
    start,
    end: safeEnd,
    days: days.length,
    earnedCoins,
    bonusCoins,
    redeemedCoins,
    redeemedMoney,
    completedChecks,
    completedFixed,
    expectedChecks,
    completionRate:
      expectedChecks === 0 ? 0 : Math.min(1, completedFixed / expectedChecks),
    activeDays: active.size,
    onceCompleted,
    bestDay,
    series,
    byCategory,
    streak: currentStreak(entries, today),
    topTask,
    moneyValue: coinsToMoney(earnedCoins, settings.rate),
  };
}

export function computeAllClearBonus(
  tasks: Task[],
  entries: LedgerEntry[],
  date: string,
  holidays: HolidayRange[],
): number {
  const { total, pending } = dayProgress(tasks, entries, date, holidays);
  if (total === 0 || pending.length > 0) return 0;
  if (hasAllClearBonus(entries, date)) return 0;
  return ALL_CLEAR_BONUS;
}

/** 家长报告用：某天应做/已完成数量（不含单次挑战）。 */
export function fixedDayCompletion(
  tasks: Task[],
  entries: LedgerEntry[],
  date: string,
  holidays: HolidayRange[],
): { expected: number; done: number } {
  const expected = tasks.filter(
    (t) => t.kind === 'fixed' && taskAppliesOn(t, date, holidays) && t.createdAt <= date,
  );
  const done = expected.filter((t) => isTaskDoneOn(entries, t.id, date)).length;
  return { expected: expected.length, done };
}

/** 根据页面数据选择报表区间 */
export function rangeFor(
  mode: 'week' | 'month' | 'all',
  state: AppState,
  today: string = todayISO(),
): { start: string; end: string } {
  if (mode === 'week') {
    const start = startOfWeek(today);
    return { start, end: addDays(start, 6) };
  }
  if (mode === 'month') {
    return { start: startOfMonth(today), end: today };
  }
  const firstEntry = state.entries.reduce(
    (min, entry) => (min === '' || entry.date < min ? entry.date : min),
    '',
  );
  const start = firstEntry || addDays(today, -6);
  return { start: start < addDays(today, -89) ? addDays(today, -89) : start, end: today };
}
