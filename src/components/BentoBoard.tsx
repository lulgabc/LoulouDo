import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import type { Category, Task } from '@/types';
import { CATEGORY_MAP } from '@/domain/constants';
import { colorForCategory } from '@/components/TaskCard';
import { DotFill } from '@/components/DotFill';
import { Coin } from '@/components/Coin';
import { useTheme, heading, numberStyle, shadowStyle } from '@/theme/themes';
import { useI18n } from '@/i18n';

export interface BentoGroup {
  category: Category;
  tasks: Task[];
}

function useDonePop(done: boolean) {
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(done);

  useEffect(() => {
    if (done && !prev.current) {
      scale.setValue(0.92);
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 140,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
    prev.current = done;
  }, [done, scale]);

  return scale;
}

function CheckStamp({ size = 16 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.coin,
        borderWidth: 1.5,
        borderColor: theme.card,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Text style={{ fontSize: size * 0.55, color: '#7A4B00', fontWeight: '800' }}>✓</Text>
    </View>
  );
}

function CoinChip({
  coins,
  done,
  compact = false,
}: {
  coins: number;
  done: boolean;
  compact?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: compact ? 6 : 6,
        paddingVertical: compact ? 2 : 2,
        borderRadius: 999,
        backgroundColor: done ? theme.coin + '22' : theme.chip,
        borderWidth: 1,
        borderColor: done ? theme.coin + '66' : theme.border,
        alignSelf: compact ? 'center' : 'flex-start',
        marginTop: compact ? 0 : 3,
      }}
    >
      <Coin size={compact ? 11 : 11.5} muted={!done} />
      <Text style={numberStyle(9.5, done ? theme.coin : theme.textSoft)}>+{coins}</Text>
    </View>
  );
}

function PanelHeader({
  category,
  count,
  note,
  onAdd,
}: {
  category: Category;
  count: number;
  note: string;
  onAdd?: () => void;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const color = colorForCategory(category, theme);
  const meta = CATEGORY_MAP[category];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: color + (theme.dark ? '26' : '16'),
        borderBottomWidth: 1,
        borderBottomColor: color + '33',
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: 16 }}>{meta.emoji}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={heading(13, color)} numberOfLines={1}>
          {t(`category.${category}.name`)}
        </Text>
        <Text style={{ fontSize: 9, color: theme.textSoft, marginTop: 1 }} numberOfLines={1}>
          {t('tasks.taskCount', { n: count })} · {note}
        </Text>
      </View>
      {onAdd ? (
        <Pressable
          onPress={onAdd}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${t('common.add')} ${t(`category.${category}.short`)}`}
          style={({ pressed }) => ({
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.card,
            borderWidth: 1.5,
            borderColor: color + '66',
            opacity: pressed ? 0.6 : 1,
            flexShrink: 0,
          })}
        >
          <Text style={{ fontSize: 17, color, marginTop: -2 }}>＋</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function BentoTaskTile({
  task,
  done,
  coins,
  color,
  index,
  total,
  onToggle,
}: {
  task: Task;
  done: boolean;
  coins: number;
  color: string;
  index: number;
  total: number;
  onToggle: (task: Task, done: boolean) => void;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const title = task.titleKey ? t(task.titleKey) : task.title;
  const scale = useDonePop(done);
  const lastOdd = total % 2 === 1 && index === total - 1;

  return (
    <Animated.View
      style={{
        width: lastOdd ? '100%' : '50%',
        minHeight: 60,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: done ? color + (theme.dark ? '12' : '0A') : 'transparent',
        borderTopWidth: index >= 2 ? 1 : 0,
        borderLeftWidth: !lastOdd && index % 2 === 1 ? 1 : 0,
        borderColor: color + '26',
        transform: [{ scale }],
      }}
    >
      {done ? <DotFill color={color} id={`bento-dots-${task.id}`} opacity={0.18} /> : null}
      <Pressable
        onPress={() => onToggle(task, done)}
        accessibilityRole="button"
        accessibilityState={{ checked: done }}
        accessibilityLabel={
          done ? t('task.a11yUndo', { title }) : t('task.a11yComplete', { title })
        }
        style={({ pressed }) => ({
          flex: 1,
          minHeight: 60,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          paddingHorizontal: 8,
          paddingVertical: 7,
          paddingRight: done ? 22 : 8,
          zIndex: 1,
          opacity: pressed ? 0.82 : 1,
        })}
      >
        <View
          style={{
            width: 31,
            height: 31,
            borderRadius: 11,
            backgroundColor: done ? theme.card + 'CC' : color + (theme.dark ? '2E' : '20'),
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 17 }}>{task.emoji}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              ...heading(11.5, done ? theme.textSoft : theme.text),
              lineHeight: 14,
              textDecorationLine: done ? 'line-through' : 'none',
            }}
            numberOfLines={2}
          >
            {title}
          </Text>
          <CoinChip coins={coins} done={done} />
        </View>
        {done ? (
          <View style={{ position: 'absolute', right: 5, top: 5 }}>
            <CheckStamp size={15} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function BentoTaskRow({
  task,
  done,
  coins,
  color,
  onToggle,
}: {
  task: Task;
  done: boolean;
  coins: number;
  color: string;
  onToggle: (task: Task, done: boolean) => void;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const title = task.titleKey ? t(task.titleKey) : task.title;

  return (
    <View
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: done ? color + (theme.dark ? '12' : '0A') : 'transparent',
      }}
    >
      {done ? <DotFill color={color} id={`bento-dots-${task.id}`} opacity={0.18} /> : null}
      <Pressable
        onPress={() => onToggle(task, done)}
        accessibilityRole="button"
        accessibilityState={{ checked: done }}
        accessibilityLabel={
          done ? t('task.a11yUndo', { title }) : t('task.a11yComplete', { title })
        }
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 10,
          paddingVertical: 7,
          zIndex: 1,
          opacity: pressed ? 0.82 : 1,
        })}
      >
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 9,
            backgroundColor: done ? theme.card + 'CC' : color + (theme.dark ? '2E' : '20'),
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 14 }}>{task.emoji}</Text>
        </View>
        <Text
          style={{
            ...heading(11.5, done ? theme.textSoft : theme.text),
            flex: 1,
            textDecorationLine: done ? 'line-through' : 'none',
          }}
          numberOfLines={2}
        >
          {title}
        </Text>
        {done ? <CheckStamp size={14} /> : null}
        <CoinChip coins={coins} done={done} compact />
      </Pressable>
    </View>
  );
}

function ChallengeTicket({
  task,
  done,
  coins,
  color,
  lastOdd,
  onToggle,
}: {
  task: Task;
  done: boolean;
  coins: number;
  color: string;
  lastOdd: boolean;
  onToggle: (task: Task, done: boolean) => void;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const title = task.titleKey ? t(task.titleKey) : task.title;
  const scale = useDonePop(done);

  return (
    <Animated.View
      style={{
        width: lastOdd ? '100%' : '48%',
        minHeight: 78,
        borderRadius: 14,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: done ? theme.coin : color + '88',
        backgroundColor: done ? theme.coin + '0D' : color + (theme.dark ? '12' : '08'),
        overflow: 'hidden',
        position: 'relative',
        transform: [{ scale }],
      }}
    >
      {done ? <DotFill color={color} id={`bento-dots-${task.id}`} opacity={0.18} /> : null}
      <Pressable
        onPress={() => onToggle(task, done)}
        accessibilityRole="button"
        accessibilityState={{ checked: done }}
        accessibilityLabel={
          done ? t('task.a11yUndo', { title }) : t('task.a11yComplete', { title })
        }
        style={({ pressed }) => ({
          flex: 1,
          paddingHorizontal: 9,
          paddingVertical: 7,
          zIndex: 1,
          opacity: pressed ? 0.82 : 1,
        })}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20 }}>{task.emoji}</Text>
          {done ? <CheckStamp size={15} /> : <Text style={{ fontSize: 11 }}>⭐</Text>}
        </View>
        <Text
          style={{
            ...heading(10.5, done ? theme.textSoft : theme.text),
            lineHeight: 13,
            marginTop: 4,
            textDecorationLine: done ? 'line-through' : 'none',
          }}
          numberOfLines={2}
        >
          {title}
        </Text>
        <View style={{ marginTop: 4 }}>
          <CoinChip coins={coins} done={done} compact />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function BentoBoard({
  groups,
  doneIds,
  coinsFor,
  onToggle,
  onAddCategory,
  onAdd,
  addLabel,
  emptyNode,
  holidayActive,
  hasHolidayTasks,
  onOpenHoliday,
}: {
  groups: BentoGroup[];
  doneIds: Set<string>;
  coinsFor: (task: Task) => number;
  onToggle: (task: Task, done: boolean) => void;
  onAddCategory?: (category: Category) => void;
  onAdd?: () => void;
  addLabel?: string;
  emptyNode?: React.ReactNode;
  holidayActive: boolean;
  hasHolidayTasks: boolean;
  onOpenHoliday?: () => void;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const tasksOf = (category: Category) =>
    groups.find((group) => group.category === category)?.tasks ?? [];
  const daily = tasksOf('daily');
  const weekend = tasksOf('weekend');
  const holiday = tasksOf('holiday');
  const challenge = tasksOf('special');
  const showHolidayPrompt = !holidayActive && hasHolidayTasks;
  const hasAny =
    daily.length > 0 ||
    weekend.length > 0 ||
    challenge.length > 0 ||
    (holidayActive && holiday.length > 0);

  return (
    <View>
      {daily.length > 0 ? (
        <View style={panelStyle(theme, 'daily')}>
          <PanelHeader
            category="daily"
            count={daily.length}
            note={t('bento.dailyNote')}
            onAdd={onAddCategory ? () => onAddCategory('daily') : undefined}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {daily.map((task, index) => (
              <BentoTaskTile
                key={task.id}
                task={task}
                done={doneIds.has(task.id)}
                coins={coinsFor(task)}
                color={colorForCategory('daily', theme)}
                index={index}
                total={daily.length}
                onToggle={onToggle}
              />
            ))}
          </View>
        </View>
      ) : null}

      {weekend.length > 0 ? (
        <View style={panelStyle(theme, 'weekend')}>
          <PanelHeader
            category="weekend"
            count={weekend.length}
            note={t('bento.weekendNote')}
            onAdd={onAddCategory ? () => onAddCategory('weekend') : undefined}
          />
          {weekend.map((task, index) => (
            <View key={task.id}>
              {index > 0 ? (
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.border,
                    marginLeft: 42,
                    marginRight: 10,
                  }}
                />
              ) : null}
              <BentoTaskRow
                task={task}
                done={doneIds.has(task.id)}
                coins={coinsFor(task)}
                color={colorForCategory('weekend', theme)}
                onToggle={onToggle}
              />
            </View>
          ))}
        </View>
      ) : null}

      {showHolidayPrompt ? (
        <Pressable
          onPress={onOpenHoliday}
          accessibilityRole="button"
          accessibilityLabel={`${t('category.holiday.name')} · ${t('bento.openHoliday')}`}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 10,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: theme.secondary + '88',
            backgroundColor: theme.secondary + (theme.dark ? '14' : '0C'),
            marginBottom: 10,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              backgroundColor: theme.secondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>🏖️</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={heading(12.5, theme.secondary)} numberOfLines={1}>
              {t('category.holiday.name')}
            </Text>
            <Text style={{ fontSize: 9, color: theme.textSoft, marginTop: 1 }} numberOfLines={1}>
              {t('settings.notHoliday')}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              paddingHorizontal: 9,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.secondary + '66',
            }}
          >
            <Text style={heading(9.5, theme.secondary)}>{t('bento.openHoliday')}</Text>
            <Text style={{ fontSize: 11, color: theme.secondary }}>›</Text>
          </View>
        </Pressable>
      ) : null}

      {holidayActive && holiday.length > 0 ? (
        <View style={panelStyle(theme, 'holiday')}>
          <PanelHeader
            category="holiday"
            count={holiday.length}
            note={t('bento.holidayOn')}
            onAdd={onAddCategory ? () => onAddCategory('holiday') : undefined}
          />
          {holiday.map((task, index) => (
            <View key={task.id}>
              {index > 0 ? (
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.border,
                    marginLeft: 42,
                    marginRight: 10,
                  }}
                />
              ) : null}
              <BentoTaskRow
                task={task}
                done={doneIds.has(task.id)}
                coins={coinsFor(task)}
                color={colorForCategory('holiday', theme)}
                onToggle={onToggle}
              />
            </View>
          ))}
        </View>
      ) : null}

      {challenge.length > 0 ? (
        <View style={panelStyle(theme, 'special')}>
          <PanelHeader
            category="special"
            count={challenge.length}
            note={t('bento.challengeNote')}
            onAdd={onAddCategory ? () => onAddCategory('special') : undefined}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 8 }}>
            {challenge.map((task, index) => (
              <ChallengeTicket
                key={task.id}
                task={task}
                done={doneIds.has(task.id)}
                coins={coinsFor(task)}
                color={colorForCategory('special', theme)}
                lastOdd={challenge.length % 2 === 1 && index === challenge.length - 1}
                onToggle={onToggle}
              />
            ))}
          </View>
        </View>
      ) : null}

      {!hasAny && !showHolidayPrompt && emptyNode ? emptyNode : null}

      {onAdd ? (
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel={addLabel ?? t('home.addTask')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 11,
            borderRadius: theme.radiusSm,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: theme.border,
            backgroundColor: theme.card + '99',
            marginTop: 2,
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <Text style={{ fontSize: 16, color: theme.primary, marginTop: -1 }}>＋</Text>
          <Text style={heading(12, theme.textSoft)}>{addLabel ?? t('home.addTask')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function panelStyle(theme: ReturnType<typeof useTheme>, category: Category) {
  const color = colorForCategory(category, theme);
  return {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: color + '88',
    backgroundColor: theme.card,
    overflow: 'hidden' as const,
    marginBottom: 10,
    ...shadowStyle(theme),
  };
}
