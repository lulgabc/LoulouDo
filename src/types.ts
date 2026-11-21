import type { Locale } from '@/i18n/locales';

/**
 * LoulouDo — 核心数据模型
 * 所有日期使用本地时区的 YYYY-MM-DD 字符串，避免时区漂移。
 */

export type Category = 'daily' | 'weekend' | 'holiday' | 'special';
export type TaskKind = 'fixed' | 'once';
export type ThemeId = 'candy' | 'pop' | 'sticker' | 'galaxy';
export type EntryType = 'earn' | 'bonus' | 'redeem';

export interface Task {
  id: string;
  profileId: string;
  title: string;
  /** 示例任务的翻译 key；用户编辑后清空，显示用户自己写的标题 */
  titleKey?: string;
  emoji: string;
  category: Category;
  /** fixed: 按类别重复；once: 在 startDate~endDate 内可完成一次 */
  kind: TaskKind;
  /** 覆盖类别默认金币 */
  coins?: number;
  startDate?: string;
  endDate?: string;
  /** 创建日期（用于报表避免统计到创建之前） */
  createdAt: string;
  archived?: boolean;
}

export interface AvatarRecord {
  id: string;
  /** 本地保存的 data URI（裁剪后的方形小图） */
  uri: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  /** Emoji 兜底头像 */
  avatar: string;
  /** 当前自定义图片头像（data URI） */
  avatarUri?: string;
  /** 最近使用的自定义头像，保存在本机 */
  avatarHistory?: AvatarRecord[];
  /** 心愿存钱罐（金额单位：元） */
  wish: {
    title: string;
    titleKey?: string;
    target: number;
  };
}

export interface LedgerEntry {
  id: string;
  profileId: string;
  type: EntryType;
  /** 发生的本地日期 */
  date: string;
  /** ISO 时间戳 */
  at: string;
  /** earn/bonus 为获得的金币；redeem 为花掉的金币 */
  coins: number;
  taskId?: string;
  taskTitle?: string;
  taskKey?: string;
  emoji?: string;
  category?: Category;
  taskKind?: TaskKind;
  /** 兑换得到的钱（元） */
  money?: number;
  /** 兑换时的汇率快照（多少金币 = 1 元） */
  rate?: number;
  /** 奖励说明，例如「全勤宝箱」 */
  label?: string;
  labelKey?: string;
}

export interface HolidayRange {
  id: string;
  name: string;
  nameKey?: string;
  start: string;
  end: string;
}

export interface Settings {
  themeId: ThemeId;
  locale: Locale;
  /** 多少金币兑换 1 元 */
  rate: number;
  categoryCoins: Record<Category, number>;
  holidays: HolidayRange[];
}

export interface AppState {
  version: 1;
  onboarded: boolean;
  activeProfileId: string;
  profiles: Profile[];
  tasks: Task[];
  entries: LedgerEntry[];
  settings: Settings;
}

export interface TaskDraft {
  id?: string;
  title: string;
  /** 示例任务的翻译 key；用户编辑后清空，显示用户自己写的标题 */
  titleKey?: string;
  emoji: string;
  category: Category;
  kind: TaskKind;
  coins?: number;
  startDate?: string;
  endDate?: string;
}
