export const BUILTIN_AVATAR_IDS = [
  'bear',
  'bunny',
  'cat',
  'fox',
  'panda',
  'lion',
  'koala',
  'penguin',
  'frog',
  'puppy',
  'deer',
  'tiger',
  'elephant',
  'pig',
  'cow',
  'sheep',
  'monkey',
  'owl',
  'mouse',
  'hedgehog',
] as const;

export type BuiltInAvatarId = (typeof BUILTIN_AVATAR_IDS)[number];

export const DEFAULT_AVATAR = 'builtin:bear';

const BUILTIN_SET = new Set<string>(BUILTIN_AVATAR_IDS);

export function isBuiltInAvatar(value: string): boolean {
  return value.startsWith('builtin:') && BUILTIN_SET.has(value.slice(8));
}

export function builtInAvatarId(value: string): BuiltInAvatarId | null {
  if (!value.startsWith('builtin:')) return null;
  const id = value.slice(8);
  return BUILTIN_SET.has(id) ? (id as BuiltInAvatarId) : null;
}

export function builtInAvatar(id: BuiltInAvatarId): string {
  return `builtin:${id}`;
}

/** 把旧版本保存的 Emoji 头像迁移到新的内置插画头像。 */
export const LEGACY_AVATAR_MAP: Record<string, string> = {
  '🦌': builtInAvatar('deer'),
  '🐰': builtInAvatar('bunny'),
  '🐼': builtInAvatar('panda'),
  '🦊': builtInAvatar('fox'),
  '🐯': builtInAvatar('tiger'),
  '🐸': builtInAvatar('frog'),
  '🐨': builtInAvatar('koala'),
  '🦄': builtInAvatar('bear'),
  '🐙': builtInAvatar('bear'),
  '🐳': builtInAvatar('bear'),
  '🦖': builtInAvatar('bear'),
  '🐝': builtInAvatar('bear'),
};

export function normalizeAvatar(value: unknown): string {
  if (typeof value !== 'string' || !value) return DEFAULT_AVATAR;
  if (isBuiltInAvatar(value)) return value;
  return LEGACY_AVATAR_MAP[value] ?? DEFAULT_AVATAR;
}
