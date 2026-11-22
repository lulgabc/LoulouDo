import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
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
import type { Task } from '@/types';
import { Card, Empty, ProgressBar, Row, Screen, SectionTitle } from '@/components/ui';
import { BentoBoard } from '@/components/BentoBoard';
import { DayStrip } from '@/components/DayStrip';
import { Confetti } from '@/components/Confetti';
import { Avatar } from '@/components/Avatar';
import { Coin } from '@/components/Coin';
import { greetingKey, useI18n } from '@/i18n';
import { tapFeedback } from '@/utils/feedback';

export default function HomeScreen() {
  const theme = useTheme();
  const { t, formatDate } = useI18n();
  const { activeProfile, tasks, entries, balance, toggleTask, state } = useApp();
  const [burst, setBurst] = useState(0);
  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;
  const holidays = state.settings.holidays;
  const cheerPlayer = useAudioPlayer(require('../../assets/sounds/task-complete.wav'));

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(
      () => {},
    );
  }, []);

  const playCheer = () => {
    try {
      cheerPlayer.seekTo(0).then(
        () => cheerPlayer.play(),
        () => cheerPlayer.play(),
      );
    } catch {
      // 音频不可用时不影响打卡
    }
  };

  const progressFull = useMemo(
    () => dayProgress(tasks, entries, selectedDate, holidays),
    [tasks, entries, selectedDate, holidays],
  );
  const todayTasks = useMemo(
    () => tasksForDate(tasks, entries, selectedDate, holidays),
    [tasks, entries, selectedDate, holidays],
  );
  const doneTasks = useMemo(
    () => tasksDoneOn(tasks, entries, selectedDate),
    [tasks, entries, selectedDate],
  );
  const doneIds = useMemo(() => new Set(doneTasks.map((task) => task.id)), [doneTasks]);
  const groups = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        category: cat.id,
        tasks: todayTasks.filter((task) => task.category === cat.id),
      })),
    [todayTasks],
  );
  const holidayActive = holidays.some((holiday) => holiday.active);
  const hasHolidayTasks = tasks.some((task) => task.category === 'holiday' && !task.archived);

  const complete = isToday && progressFull.allClear;
  const streak = useMemo(() => currentStreak(entries, today), [entries, today]);

  const heroInk = theme.dark ? '#F7F3FF' : theme.text;
  const heroSoft = theme.dark ? 'rgba(247,243,255,0.75)' : 'rgba(74,42,60,0.68)';
  const heroTrack = theme.dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.55)';
  const heroFill = theme.dark ? theme.accent : '#FFFFFF';

  const onToggle = (task: Task, done: boolean) => {
    if (!isToday) return;
    if (task.kind === 'once' && done && !entries.some((e) => e.type === 'earn' && e.taskId === task.id && e.date === today)) {
      return;
    }
    toggleTask(task.id);
    tapFeedback(done ? 'light' : 'success');
    if (!done) playCheer();
    if (!done && progressFull.pending.length === 1) setBurst((b) => b + 1);
  };

  const percent = progressFull.total === 0 ? 0 : progressFull.done / progressFull.total;
  const cheer = !isToday
    ? progressFull.total === 0
      ? t('home.dayEmpty')
      : t('home.dayCheer', { done: progressFull.done, total: progressFull.total })
    : progressFull.total === 0
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
        <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 4 }}>
          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              flex: 1,
              minWidth: 0,
              paddingRight: 10,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Avatar
              uri={activeProfile.avatarUri}
              emoji={activeProfile.avatar}
              size={42}
              bg={theme.primary}
              borderWidth={theme.borderWidth}
              borderColor={theme.border}
            />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={heading(21, theme.text)} numberOfLines={2}>
                {t(greetingKey())}，{activeProfile.name}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/wallet')}
            accessibilityRole="button"
            accessibilityLabel={`${t('wallet.title')} ${balance}`}
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
                borderWidth: theme.cardBorderWidth,
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
              <View>
                <Text style={{ ...heading(16, heroInk) }}>{formatDate(selectedDate)}</Text>
              </View>
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

            <Text
              style={{
                ...heading(16, heroInk),
                lineHeight: 24,
                marginTop: 16,
                paddingRight: 8,
              }}
            >
              {cheer}
            </Text>
            <View style={{ marginTop: 16 }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                <Text style={heading(11, heroSoft)}>
                  {isToday ? t('home.progress') : t('home.progressDay')}
                </Text>
                <Text style={numberStyle(13, heroInk)}>
                  {progressFull.done}
                  <Text style={{ opacity: 0.6 }}> / {progressFull.total}</Text>
                </Text>
              </Row>
              <View style={{ height: 22, justifyContent: 'center', marginTop: 2 }}>
                <ProgressBar value={percent} track={heroTrack} color={heroFill} height={12} />
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: `${Math.max(5, Math.min(95, percent * 100))}%`,
                    top: 0,
                    marginLeft: -11,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: theme.card,
                    borderWidth: 1.5,
                    borderColor: theme.coin,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 13, color: theme.coin, marginTop: -1 }}>★</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <DayStrip
          selectedDate={selectedDate}
          today={today}
          onChange={setSelectedDate}
          tasks={tasks}
          entries={entries}
          holidays={holidays}
        />
        {!isToday ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 6,
              backgroundColor: theme.chip,
              borderRadius: 12,
              paddingHorizontal: 9,
              paddingVertical: 7,
              marginBottom: 8,
            }}
          >
            <Text style={{ flexGrow: 1, flexBasis: 150, fontSize: 9.5, color: theme.textSoft, lineHeight: 14 }}>
              {t('home.viewOnly')}
            </Text>
            <Pressable
              onPress={() => setSelectedDate(today)}
              accessibilityRole="button"
              accessibilityLabel={t('home.backToday')}
              hitSlop={6}
            >
              <Text style={{ fontSize: 10.5, color: theme.primary }}>{t('home.backToday')}</Text>
            </Pressable>
          </View>
        ) : null}

        <SectionTitle
          emoji="🌈"
          title={isToday ? t('home.todayTasks') : t('home.dayTasks')}
          right={
            <Row style={{ alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 11, color: theme.textSoft }}>
                {t('home.completedOf', {
                  done: progressFull.done,
                  total: progressFull.total,
                })}
              </Text>
              <Pressable
                onPress={() => router.push({ pathname: '/quick-task', params: { date: selectedDate } })}
                accessibilityRole="button"
                accessibilityLabel={t('quickTask.add')}
                style={({ pressed }) => ({
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.card,
                  borderWidth: 1.5,
                  borderColor: theme.candy + '88',
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ fontSize: 17, color: theme.candy, marginTop: -2 }}>＋</Text>
              </Pressable>
            </Row>
          }
        />

        <BentoBoard
          groups={groups}
          doneIds={doneIds}
          coinsFor={(task) => taskCoinValue(task, state.settings)}
          onToggle={(task, done) => onToggle(task, done)}
          onAdd={() => router.push({ pathname: '/quick-task', params: { date: selectedDate } })}
          addLabel={t('quickTask.add')}
          holidayActive={holidayActive}
          hasHolidayTasks={hasHolidayTasks}
          onOpenHoliday={() => router.push('/holidays')}
          readOnly={!isToday}
          emptyNode={
            <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
              <Empty
                emoji="🌱"
                title={t('home.emptyTitle')}
                hint={isToday ? t('home.emptyHint') : t('home.dayEmpty')}
              />
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
