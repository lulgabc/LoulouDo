import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle, shadowStyle } from '@/theme/themes';
import { todayISO } from '@/domain/date';
import {
  currentStreak,
  dayProgress,
  taskCoinValue,
  tasksDoneOn,
  tasksForDate,
} from '@/domain/logic';
import { CATEGORIES } from '@/domain/constants';
import type { Category, Task } from '@/types';
import { Card, Empty, ProgressBar, Row, Screen, SectionTitle, Segmented } from '@/components/ui';
import { Mascot } from '@/components/Mascot';
import { colorForCategory } from '@/components/TaskCard';
import { TaskBoard } from '@/components/TaskBoard';
import { Confetti } from '@/components/Confetti';
import { Coin } from '@/components/Coin';
import { Avatar } from '@/components/Avatar';
import { greetingKey, useI18n } from '@/i18n';
import { tapFeedback } from '@/utils/feedback';

type Filter = 'all' | Category;


export default function HomeScreen() {
  const theme = useTheme();
  const { t, formatDate } = useI18n();
  const { activeProfile, tasks, entries, balance, toggleTask, state } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [burst, setBurst] = useState(0);
  const today = todayISO();
  const holidays = state.settings.holidays;

  const progressFull = useMemo(
    () => dayProgress(tasks, entries, today, holidays),
    [tasks, entries, today, holidays],
  );
  const todayTasks = useMemo(
    () => tasksForDate(tasks, entries, today, holidays),
    [tasks, entries, today, holidays],
  );
  const doneTasks = useMemo(() => tasksDoneOn(tasks, entries, today), [tasks, entries, today]);
  const pending = useMemo(
    () => todayTasks.filter((t) => !doneTasks.some((d) => d.id === t.id)),
    [todayTasks, doneTasks],
  );

  const visibleTasks =
    filter === 'all' ? todayTasks : todayTasks.filter((t) => t.category === filter);
  const visibleDone = visibleTasks.filter((t) => doneTasks.some((d) => d.id === t.id));
  const groups = CATEGORIES.map((cat) => ({
    category: cat.id,
    tasks: visibleTasks.filter((task) => task.category === cat.id),
  })).filter((group) => group.tasks.length > 0);
  const doneIds = new Set(
    visibleTasks.filter((task) => doneTasks.some((d) => d.id === task.id)).map((t) => t.id),
  );

  const complete = progressFull.allClear;
  const streak = useMemo(() => currentStreak(entries, today), [entries, today]);

  const heroInk = theme.dark ? '#F7F3FF' : theme.text;
  const heroSoft = theme.dark ? 'rgba(247,243,255,0.75)' : 'rgba(74,42,60,0.68)';
  const heroTrack = theme.dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.55)';
  const heroFill = theme.dark ? theme.accent : '#FFFFFF';

  const onToggle = (task: Task, done: boolean) => {
    if (task.kind === 'once' && done && !entries.some((e) => e.type === 'earn' && e.taskId === task.id && e.date === today)) {
      return;
    }
    toggleTask(task.id);
    tapFeedback(done ? 'light' : 'success');
    if (!done && progressFull.pending.length === 1) setBurst((b) => b + 1);
  };

  const percent = progressFull.total === 0 ? 0 : progressFull.done / progressFull.total;
  const cheer =
    progressFull.total === 0
      ? t('home.cheerEmpty')
      : complete
        ? t('home.cheerAll')
        : progressFull.done === 0
          ? t('home.cheerStart')
          : t('home.cheerProgress', {
              done: progressFull.done,
              left: progressFull.pending.length,
            });

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <Row style={{ justifyContent: 'space-between', marginBottom: 14, marginTop: 4 }}>
          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, paddingRight: 8, opacity: pressed ? 0.75 : 1 })}
          >
            <Avatar
              uri={activeProfile.avatarUri}
              emoji={activeProfile.avatar}
              size={46}
              bg={theme.primary}
              borderWidth={theme.borderWidth}
              borderColor={theme.border}
              style={shadowStyle(theme)}
            />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={heading(19, theme.text)} numberOfLines={2}>
                {t(greetingKey())}，{activeProfile.name}
              </Text>
              <Text
                style={{ fontSize: 11, color: theme.textSoft, marginTop: 1 }}
                numberOfLines={2}
              >
                {formatDate(today)} · {t('home.subtitle')}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/wallet')}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
                backgroundColor: theme.card,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: theme.borderWidth,
                borderColor: theme.border,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
              shadowStyle(theme),
            ]}
          >
            <Coin size={18} />
            <Text style={numberStyle(18, theme.text)}>{balance}</Text>
          </Pressable>
        </Row>

        <View style={{ borderRadius: theme.radius + 6, overflow: 'hidden', ...shadowStyle(theme), marginBottom: 16 }}>
          <LinearGradient
            colors={theme.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16, borderWidth: theme.borderWidth, borderColor: theme.border, borderRadius: theme.radius + 6 }}
          >
            <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: theme.dark ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.72)',
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                }}
              >
                <Text style={{ fontSize: 12 }}>🔥</Text>
                <Text style={heading(12, heroInk)}>{t('home.streak', { n: streak })}</Text>
              </View>
            </Row>

            <Row style={{ alignItems: 'center', gap: 10, marginTop: 8 }}>
              <Mascot size={96} mood={complete ? 'cheer' : 'happy'} />
              <View style={{ flex: 1, paddingRight: 4 }}>
                <Text style={{ ...heading(15, heroInk), lineHeight: 23 }}>{cheer}</Text>
              </View>
            </Row>
            <View style={{ marginTop: 10 }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                <Text style={heading(11, heroSoft)}>{t('home.progress')}</Text>
                <Text style={numberStyle(13, heroInk)}>
                  {progressFull.done}
                  <Text style={{ opacity: 0.6 }}> / {progressFull.total}</Text>
                </Text>
              </Row>
              <ProgressBar value={percent} track={heroTrack} color={heroFill} height={12} />
            </View>
          </LinearGradient>
        </View>

        <SectionTitle
          emoji="🌈"
          title={filter === 'all' ? t('home.todayTasks') : t(`category.${filter}.name`)}
          right={
            <Text style={{ fontSize: 11, color: theme.textSoft }}>
              {t('home.completedOf', {
                done: visibleDone.length,
                total: visibleTasks.length,
              })}
            </Text>
          }
        />

        <TaskBoard
          groups={groups}
          doneIds={doneIds}
          coinsFor={(task) => taskCoinValue(task, state.settings)}
          onToggle={(task, done) => onToggle(task, done)}
          onAdd={() => router.push('/task-editor')}
          addLabel={t('home.addTask')}
          header={
            <Segmented
              inline
              value={filter}
              onChange={setFilter}
              items={[
                { id: 'all' as Filter, label: t('home.all'), color: theme.primary },
                ...CATEGORIES.map((cat) => ({
                  id: cat.id as Filter,
                  label: t(`category.${cat.id}.short`),
                  color: colorForCategory(cat.id, theme),
                })),
              ]}
            />
          }
          emptyNode={
            <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
              <Empty emoji="🌱" title={t('home.emptyTitle')} hint={t('home.emptyHint')} />
            </View>
          }
        />

        {complete ? (
          <Card style={{ marginTop: 4, backgroundColor: theme.chip }}>
            <Row style={{ gap: 10 }}>
              <Text style={{ fontSize: 30 }}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={heading(15, theme.text)}>{t('home.allClearTitle')}</Text>
                <Text style={{ fontSize: 11, color: theme.textSoft, marginTop: 2 }}>
                  {t('home.allClearHint')}
                </Text>
              </View>
            </Row>
          </Card>
        ) : null}

      </Screen>

      <Confetti key={burst} visible={burst > 0} onDone={() => setBurst(0)} />
    </View>
  );
}
