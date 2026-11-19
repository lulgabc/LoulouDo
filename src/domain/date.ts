/** 本地日期工具：统一使用 YYYY-MM-DD 字符串。 */

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isISODate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_RE.test(value)) return false;
  const d = fromISO(value);
  return toISO(d) === value;
}

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 使用本地中午构造，避开夏令时切换。 */
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

export function todayISO(now: Date = new Date()): string {
  return toISO(now);
}

export function addDays(iso: string, days: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/** 0 = 周日, 1 = 周一 ... 6 = 周六 */
export function weekday(iso: string): number {
  return fromISO(iso).getDay();
}

export function isWeekend(iso: string): boolean {
  const w = weekday(iso);
  return w === 0 || w === 6;
}

export function daysBetween(from: string, to: string): number {
  const a = fromISO(from).getTime();
  const b = fromISO(to).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  if (start > end) return out;
  let cursor = start;
  let guard = 0;
  while (cursor <= end && guard < 1000) {
    out.push(cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return out;
}

/** 周一为一周的开始 */
export function startOfWeek(iso: string): string {
  const w = weekday(iso);
  const diff = w === 0 ? -6 : 1 - w;
  return addDays(iso, diff);
}

export function endOfWeek(iso: string): string {
  return addDays(startOfWeek(iso), 6);
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function endOfMonth(iso: string): string {
  const d = fromISO(iso);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0, 12);
  return toISO(last);
}

export function minISO(a: string, b: string): string {
  return a <= b ? a : b;
}

export function maxISO(a: string, b: string): string {
  return a >= b ? a : b;
}

const WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];

export function formatCN(iso: string): string {
  const d = fromISO(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日 周${WEEK_CN[d.getDay()]}`;
}

export function weekdayCN(iso: string): string {
  return `周${WEEK_CN[weekday(iso)]}`;
}

export function shortDate(iso: string): string {
  const d = fromISO(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 6) return '夜猫子，早点睡哦';
  if (h < 11) return '早上好呀';
  if (h < 14) return '中午好呀';
  if (h < 18) return '下午好呀';
  if (h < 22) return '晚上好呀';
  return '该休息啦';
}
