import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { AppState, Category, LedgerEntry, Profile, Task, TaskDraft, ThemeId } from '@/types';
import { createInitialState, DEFAULT_HOLIDAYS } from '@/domain/seed';
import { CATEGORIES, ONBOARDING_BONUS, STORAGE_KEY } from '@/domain/constants';
import { balanceOf, computeAllClearBonus, coinsToMoney, isTaskCompleted, taskCoinValue } from '@/domain/logic';
import { todayISO } from '@/domain/date';
import { isLocale, type Locale } from '@/i18n/locales';
import { detectLocale } from '@/i18n/detectLocale';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'toggleTask'; taskId: string; date: string }
  | { type: 'redeem'; coins: number; date: string }
  | { type: 'saveTask'; draft: TaskDraft }
  | { type: 'deleteTask'; id: string }
  | { type: 'setTheme'; themeId: ThemeId }
  | { type: 'setLocale'; locale: Locale }
  | { type: 'setRate'; rate: number }
  | { type: 'setCategoryCoins'; category: Category; coins: number }
  | { type: 'completeOnboarding'; name: string; avatar: string; themeId: ThemeId }
  | { type: 'addProfile'; name: string; avatar: string }
  | { type: 'switchProfile'; id: string }
  | {
      type: 'updateProfile';
      id: string;
      patch: Partial<Pick<Profile, 'name' | 'avatar' | 'avatarUri' | 'avatarHistory' | 'wish'>>;
    }
  | { type: 'removeProfile'; id: string }
  | { type: 'addHoliday'; name: string; start: string; end: string }
  | { type: 'removeHoliday'; id: string }
  | { type: 'reset' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state;

    case 'toggleTask': {
      const task = state.tasks.find((t) => t.id === action.taskId);
      if (!task) return state;
      const existing = state.entries.find(
        (e) => e.type === 'earn' && e.taskId === action.taskId && e.date === action.date,
      );
      if (!existing && task.kind === 'once' && isTaskCompleted(state.entries, task.id)) {
        return state;
      }
      let entries = state.entries;
      if (existing) {
        entries = entries.filter(
          (e) =>
            e.id !== existing.id &&
            !(e.type === 'bonus' && e.date === action.date && e.label === '全勤宝箱'),
        );
        return { ...state, entries };
      }
      const entry: LedgerEntry = {
        id: makeId('earn'),
        profileId: state.activeProfileId,
        type: 'earn',
        date: action.date,
        at: new Date().toISOString(),
        coins: taskCoinValue(task, state.settings),
        taskId: task.id,
        taskTitle: task.title,
        emoji: task.emoji,
        category: task.category,
        taskKind: task.kind,
        taskKey: task.titleKey,
      };
      entries = [...entries, entry];
      const profileTasks = state.tasks.filter((t) => t.profileId === entry.profileId);
      const profileEntries = entries.filter((e) => e.profileId === entry.profileId);
      const bonus = computeAllClearBonus(
        profileTasks,
        profileEntries,
        action.date,
        state.settings.holidays,
      );
      if (bonus > 0) {
        entries = [
          ...entries,
          {
            id: makeId('bonus'),
            profileId: entry.profileId,
            type: 'bonus',
            date: action.date,
            at: new Date().toISOString(),
            coins: bonus,
            label: '全勤宝箱',
            labelKey: 'bonus.allClear',
            emoji: '🎁',
          },
        ];
      }
      return { ...state, entries };
    }

    case 'redeem': {
      if (action.coins <= 0) return state;
      const balance = balanceOf(state.entries.filter((e) => e.profileId === state.activeProfileId));
      if (action.coins > balance) return state;
      const entry: LedgerEntry = {
        id: makeId('redeem'),
        profileId: state.activeProfileId,
        type: 'redeem',
        date: action.date,
        at: new Date().toISOString(),
        coins: action.coins,
        money: coinsToMoney(action.coins, state.settings.rate),
        rate: state.settings.rate,
        emoji: '💰',
        label: '兑换零花钱',
        labelKey: 'wallet.redeemEntry',
      };
      return { ...state, entries: [...state.entries, entry] };
    }

    case 'saveTask': {
      const draft = action.draft;
      if (draft.id) {
        return {
          ...state,
          tasks: state.tasks.map((t) =>
            t.id === draft.id
              ? {
                  ...t,
                  title: draft.title.trim(),
                  emoji: draft.emoji,
                  category: draft.category,
                  kind: draft.kind,
                  coins: draft.coins,
                  titleKey: undefined,
                  startDate: draft.kind === 'once' ? draft.startDate : undefined,
                  endDate: draft.kind === 'once' ? draft.endDate : undefined,
                }
              : t,
          ),
        };
      }
      const task: Task = {
        id: makeId('task'),
        profileId: state.activeProfileId,
        title: draft.title.trim(),
        emoji: draft.emoji,
        category: draft.category,
        kind: draft.kind,
        coins: draft.coins,
        startDate: draft.kind === 'once' ? draft.startDate : undefined,
        endDate: draft.kind === 'once' ? draft.endDate : undefined,
        createdAt: todayISO(),
      };
      return { ...state, tasks: [...state.tasks, task] };
    }

    case 'deleteTask':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.id),
      };

    case 'setLocale':
      return { ...state, settings: { ...state.settings, locale: action.locale } };

    case 'setTheme': {
      if (state.settings.themeId === action.themeId) return state;
      return { ...state, settings: { ...state.settings, themeId: action.themeId } };
    }

    case 'setRate': {
      const rate = Math.min(10000, Math.max(1, Math.round(action.rate)));
      return { ...state, settings: { ...state.settings, rate } };
    }

    case 'setCategoryCoins': {
      const coins = Math.min(999, Math.max(1, Math.round(action.coins)));
      return {
        ...state,
        settings: {
          ...state.settings,
          categoryCoins: { ...state.settings.categoryCoins, [action.category]: coins },
        },
      };
    }

    case 'completeOnboarding': {
      const name = action.name.trim() || '小鹿';
      const profiles = state.profiles.map((p, i) =>
        i === 0 ? { ...p, name, avatar: action.avatar } : p,
      );
      return {
        ...state,
        onboarded: true,
        profiles,
        settings: { ...state.settings, themeId: action.themeId },
        entries: [
          ...state.entries,
          {
            id: makeId('bonus'),
            profileId: state.activeProfileId,
            type: 'bonus',
            date: todayISO(),
            at: new Date().toISOString(),
            coins: ONBOARDING_BONUS,
            label: '新手见面礼',
            labelKey: 'bonus.welcome',
            emoji: '🎉',
          },
        ],
      };
    }

    case 'addProfile': {
      if (state.profiles.length >= 6) return state;
      const profile: Profile = {
        id: makeId('kid'),
        name: action.name.trim() || '宝贝',
        avatar: action.avatar,
        wish: { title: '小小愿望', titleKey: 'seed.wish.default', target: 100 },
      };
      return {
        ...state,
        profiles: [...state.profiles, profile],
        activeProfileId: profile.id,
      };
    }

    case 'switchProfile':
      return state.profiles.some((p) => p.id === action.id)
        ? { ...state, activeProfileId: action.id }
        : state;

    case 'updateProfile':
      return {
        ...state,
        profiles: state.profiles.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)),
      };

    case 'removeProfile': {
      if (state.profiles.length <= 1) return state;
      const profiles = state.profiles.filter((p) => p.id !== action.id);
      return {
        ...state,
        profiles,
        activeProfileId:
          state.activeProfileId === action.id ? profiles[0].id : state.activeProfileId,
        tasks: state.tasks.filter((t) => t.profileId !== action.id),
        entries: state.entries.filter((e) => e.profileId !== action.id),
      };
    }

    case 'addHoliday':
      return {
        ...state,
        settings: {
          ...state.settings,
          holidays: [
            ...state.settings.holidays,
            { id: makeId('holiday'), name: action.name, start: action.start, end: action.end },
          ],
        },
      };

    case 'removeHoliday':
      return {
        ...state,
        settings: {
          ...state.settings,
          holidays: state.settings.holidays.filter((h) => h.id !== action.id),
        },
      };

    case 'reset': {
      const fresh = createInitialState();
      return {
        ...fresh,
        onboarded: false,
        settings: { ...fresh.settings, locale: state.settings.locale },
      };
    }

    default:
      return state;
  }
}

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  activeProfile: Profile;
  profiles: Profile[];
  tasks: Task[];
  entries: LedgerEntry[];
  balance: number;
  toggleTask: (taskId: string, date?: string) => void;
  redeem: (coins: number, date?: string) => void;
  saveTask: (draft: TaskDraft) => void;
  deleteTask: (id: string) => void;
  setTheme: (themeId: ThemeId) => void;
  setLocale: (locale: Locale) => void;
  setRate: (rate: number) => void;
  setCategoryCoins: (category: Category, coins: number) => void;
  completeOnboarding: (name: string, avatar: string, themeId: ThemeId) => void;
  addProfile: (name: string, avatar: string) => void;
  switchProfile: (id: string) => void;
  updateProfile: (
    id: string,
    patch: Partial<Pick<Profile, 'name' | 'avatar' | 'avatarUri' | 'avatarHistory' | 'wish'>>,
  ) => void;
  removeProfile: (id: string) => void;
  addHoliday: (name: string, start: string, end: string) => void;
  removeHoliday: (id: string) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function normalize(raw: unknown): AppState {
  const base = createInitialState();
  if (!raw || typeof raw !== 'object') return base;
  const parsed = raw as Partial<AppState>;
  if (!Array.isArray(parsed.profiles) || parsed.profiles.length === 0) return base;
  const categoryCoins = { ...base.settings.categoryCoins };
  for (const cat of CATEGORIES) {
    const value = parsed.settings?.categoryCoins?.[cat.id];
    if (typeof value === 'number' && value > 0) categoryCoins[cat.id] = value;
  }
  const themeId = parsed.settings?.themeId;

  // 旧版本数据迁移：把内置中文示例标题补上翻译 key
  const legacyTaskKeys: Record<string, string> = {
    自己刷牙洗脸: 'seed.task.brush',
    收拾小书包: 'seed.task.bag',
    '阅读 20 分钟': 'seed.task.read',
    '喝够 8 杯水': 'seed.task.water',
    '练琴 15 分钟': 'seed.task.piano',
    九点前上床睡觉: 'seed.task.sleep',
    '户外运动 1 小时': 'seed.task.outdoor',
    帮家里做一件家务: 'seed.task.chore',
    整理自己的房间: 'seed.task.room',
    写一篇假期日记: 'seed.task.diary',
    学做一道新菜: 'seed.task.cook',
    '游泳练习 45 分钟': 'seed.task.swim',
    '连续跳绳 100 下': 'seed.task.jump',
    '完成 1000 片拼图': 'seed.task.puzzle',
    钢琴小演出登台: 'seed.task.stage',
  };
  const legacyHolidayKeys: Record<string, string> = {
    秋假: 'seed.holiday.autumn',
    寒假: 'seed.holiday.winter',
    暑假: 'seed.holiday.summer',
  };
  const legacyWishKeys: Record<string, string> = {
    乐高小城堡: 'seed.wish.castle',
    小小愿望: 'seed.wish.default',
  };
  const legacyLabelKeys: Record<string, string> = {
    全勤宝箱: 'bonus.allClear',
    新手见面礼: 'bonus.welcome',
    兑换零花钱: 'wallet.redeemEntry',
  };

  const tasks = (Array.isArray(parsed.tasks) ? parsed.tasks : base.tasks).map((task) => ({
    ...task,
    titleKey: task.titleKey ?? legacyTaskKeys[task.title],
  }));
  const taskKeyById = new Map(tasks.map((task) => [task.id, task.titleKey]));
  const profiles = (parsed.profiles as Profile[]).map((profile) => ({
    ...profile,
    avatarUri: typeof profile.avatarUri === 'string' ? profile.avatarUri : undefined,
    avatarHistory: Array.isArray(profile.avatarHistory) ? profile.avatarHistory : undefined,
    wish: {
      ...profile.wish,
      titleKey:
        profile.wish.titleKey ?? legacyWishKeys[profile.wish.title] ?? undefined,
    },
  }));
  const holidays = (Array.isArray(parsed.settings?.holidays)
    ? parsed.settings.holidays
    : DEFAULT_HOLIDAYS
  ).map((holiday) => ({
    ...holiday,
    nameKey: holiday.nameKey ?? legacyHolidayKeys[holiday.name],
  }));
  const entries = (Array.isArray(parsed.entries) ? parsed.entries : []).map((entry) => ({
    ...entry,
    taskKey: entry.taskKey ?? taskKeyById.get(entry.taskId ?? ''),
    labelKey: entry.labelKey ?? legacyLabelKeys[entry.label ?? ''],
  }));

  return {
    ...base,
    ...parsed,
    version: 1,
    activeProfileId:
      parsed.profiles?.some((p) => p.id === parsed.activeProfileId)
        ? (parsed.activeProfileId as string)
        : base.activeProfileId,
    tasks,
    entries,
    settings: {
      locale: isLocale(parsed.settings?.locale) ? parsed.settings.locale : detectLocale(),
      themeId: themeId === 'pop' || themeId === 'sticker' || themeId === 'galaxy' || themeId === 'candy'
        ? themeId
        : base.settings.themeId,
      rate: typeof parsed.settings?.rate === 'number' && parsed.settings.rate > 0
        ? parsed.settings.rate
        : base.settings.rate,
      categoryCoins,
      holidays,
    },
    profiles,
    onboarded: parsed.onboarded === true,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState(detectLocale()));
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (raw) {
          try {
            dispatch({ type: 'hydrate', state: normalize(JSON.parse(raw)) });
          } catch {
            // 损坏数据直接使用初始状态
          }
        }
      })
      .finally(() => {
        if (!mounted) return;
        hydratedRef.current = true;
        setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }, 120);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state]);

  const activeProfile = useMemo(
    () => state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0],
    [state.profiles, state.activeProfileId],
  );
  const tasks = useMemo(
    () => state.tasks.filter((t) => t.profileId === state.activeProfileId),
    [state.tasks, state.activeProfileId],
  );
  const entries = useMemo(
    () => state.entries.filter((e) => e.profileId === state.activeProfileId),
    [state.entries, state.activeProfileId],
  );
  const balance = useMemo(() => balanceOf(entries), [entries]);

  const toggleTask = useCallback(
    (taskId: string, date: string = todayISO()) =>
      dispatch({ type: 'toggleTask', taskId, date }),
    [],
  );
  const redeem = useCallback(
    (coins: number, date: string = todayISO()) => dispatch({ type: 'redeem', coins, date }),
    [],
  );
  const saveTask = useCallback((draft: TaskDraft) => dispatch({ type: 'saveTask', draft }), []);
  const deleteTask = useCallback((id: string) => dispatch({ type: 'deleteTask', id }), []);
  const setTheme = useCallback((themeId: ThemeId) => dispatch({ type: 'setTheme', themeId }), []);
  const setLocale = useCallback((locale: Locale) => dispatch({ type: 'setLocale', locale }), []);
  const setRate = useCallback((rate: number) => dispatch({ type: 'setRate', rate }), []);
  const setCategoryCoins = useCallback(
    (category: Category, coins: number) => dispatch({ type: 'setCategoryCoins', category, coins }),
    [],
  );
  const completeOnboarding = useCallback(
    (name: string, avatar: string, themeId: ThemeId) =>
      dispatch({ type: 'completeOnboarding', name, avatar, themeId }),
    [],
  );
  const addProfile = useCallback(
    (name: string, avatar: string) => dispatch({ type: 'addProfile', name, avatar }),
    [],
  );
  const switchProfile = useCallback((id: string) => dispatch({ type: 'switchProfile', id }), []);
  const updateProfile = useCallback(
    (
      id: string,
      patch: Partial<Pick<Profile, 'name' | 'avatar' | 'avatarUri' | 'avatarHistory' | 'wish'>>,
    ) => dispatch({ type: 'updateProfile', id, patch }),
    [],
  );
  const removeProfile = useCallback((id: string) => dispatch({ type: 'removeProfile', id }), []);
  const addHoliday = useCallback(
    (name: string, start: string, end: string) =>
      dispatch({ type: 'addHoliday', name, start, end }),
    [],
  );
  const removeHoliday = useCallback((id: string) => dispatch({ type: 'removeHoliday', id }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  const value: StoreValue = {
    state,
    hydrated,
    activeProfile,
    profiles: state.profiles,
    tasks,
    entries,
    balance,
    toggleTask,
    redeem,
    saveTask,
    deleteTask,
    setTheme,
    setLocale,
    setRate,
    setCategoryCoins,
    completeOnboarding,
    addProfile,
    switchProfile,
    updateProfile,
    removeProfile,
    addHoliday,
    removeHoliday,
    reset,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useApp(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useApp must be used inside StoreProvider');
  return ctx;
}
