import { TASK_ICON_IDS, type TaskIconId } from '@/assets/taskIcons';

export { TASK_ICON_IDS };
export type { TaskIconId };

export const DEFAULT_TASK_ICON: TaskIconId = 'glowing-star';

const ICON_SET = new Set<string>(TASK_ICON_IDS);

export function isTaskIconId(value: string): value is TaskIconId {
  return ICON_SET.has(value);
}

/**
 * 旧版本任务和打卡记录里保存的是 Emoji；
 * 载入时尽量映射到新的 Fluent Emoji Flat 图标。
 */
export const LEGACY_TASK_ICON_MAP: Record<string, TaskIconId> = {
  '🪥': 'toothbrush',
  '🛏️': 'bed',
  '📚': 'books',
  '✏️': 'pencil',
  '🎹': 'musical-keyboard',
  '🎨': 'artist-palette',
  '🏃': 'person-running',
  '🚴': 'bicycle',
  '🏊': 'person-swimming',
  '🧹': 'broom',
  '🧸': 'teddy-bear',
  '🍎': 'red-apple',
  '🥕': 'carrot',
  '💧': 'droplet',
  '🧦': 'socks',
  '🎒': 'backpack',
  '🌱': 'potted-plant',
  '🐶': 'dog-face',
  '🧩': 'puzzle-piece',
  '🎯': 'glowing-star',
  '🧘': 'person-in-lotus-position',
  '🍽️': 'fork-and-knife-with-plate',
  '🪴': 'potted-plant',
  '🪄': 'glowing-star',
  '🦷': 'tooth',
  '🧼': 'soap',
  '📖': 'closed-book',
  '🗣️': 'microphone',
  '🎻': 'musical-keyboard',
  '⚽': 'soccer-ball',
  '🏀': 'basketball',
  '🤸': 'person-cartwheeling',
  '🚀': 'rocket',
  '🌟': 'glowing-star',
  '🏆': 'trophy',
  '🎁': 'trophy',
  '🎤': 'microphone',
  '🍳': 'cooking',
  '✍️': 'pencil',
  '🌙': 'crescent-moon',
  '🏖️': 'beach-with-umbrella',
  '🥇': 'trophy',
};

export function normalizeTaskIcon(value: unknown): string {
  if (typeof value !== 'string' || !value) return DEFAULT_TASK_ICON;
  if (isTaskIconId(value)) return value;
  return LEGACY_TASK_ICON_MAP[value] ?? value;
}
