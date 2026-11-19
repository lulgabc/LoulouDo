import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle, shadowStyle } from '@/theme/themes';
import { formatCN, greeting, todayISO } from '@/domain/date';
import {
  currentStreak,
  dayProgress,
  taskCoinValue,
  tasksDoneOn,
  tasksForDate,
} from '@/domain/logic';
import { CATEGORIES, CATEGORY_MAP } from '@/domain/constants';
import type { Category, Task } from '@/types';
import { Btn, Card, Empty, Pill, ProgressBar, Row, Screen, SectionTitle } from '@/components/ui';
import { Mascot } from '@/components/Mascot';
import { TaskCard } from '@/components/TaskCard';
import { Confetti } from '@/components/Confetti';
import { Coin } from '@/components/Coin';
import { tapFeedback } from '@/utils/feedback';

type Filter = 'all' | Category;

export default function HomeScreen() {
  const theme = useTheme();
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

  const visiblePending = filter === 'all' ? pending : pending.filter((t) => t.category === filter);
  const visibleDone = filter === 'all' ? doneTasks : doneTasks.filter((t) => t.category === filter);

  const counts = useMemo(() => {
    const map = {} as Record<Filter, number>;
    map.all = pending.length;
    for (const cat of CATEGORIES) {
      map[cat.id] = pending.filter((t) => t.category === cat.id).length;
    }
    return map;
  }, [pending]);

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
    if (!done) setBurst((b) => b + 1);
  };

  const percent = progressFull.total === 0 ? 0 : progressFull.done / progressFull.total;
  const cheer =
    progressFull.total === 0
      ? '今天没有任务，去添加一件想挑战的事吧！'
      : complete
        ? '全部完成！你是今天的小英雄，宝箱送你啦 🎁'
        : progressFull.done === 0
          ? '今天想先做哪一件呀？完成一件就有金币哦。'
          : `已经完成 ${progressFull.done} 件啦，还差 ${progressFull.pending.length} 件就全勤咯！`;

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <Row style={{ justifyContent: 'space-between', marginBottom: 14, marginTop: 4 }}>
          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, opacity: pressed ? 0.75 : 1 })}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: theme.borderWidth,
                borderColor: theme.border,
                ...shadowStyle(theme),
              }}
            >
              <Text style={{ fontSize: 24 }}>{activeProfile.avatar}</Text>
            </View>
            <View>
              <Text style={heading(19, theme.text)}>
                {greeting()}，{activeProfile.name}
              </Text>
              <Text style={{ fontSize: 11, color: theme.textSoft, marginTop: 1 }}>
                {formatCN(today)} · 今天也要开心呀
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
                <Text style={heading(12, heroInk)}>连续 {streak} 天</Text>
              </View>
              <Text style={numberStyle(16, heroInk)}>
                {progressFull.done}
                <Text style={{ opacity: 0.65 }}>/{progressFull.total}</Text>
              </Text>
            </Row>

            <Row style={{ alignItems: 'center', gap: 12, marginTop: 6 }}>
              <Mascot size={96} mood={complete ? 'cheer' : 'happy'} />
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.dark ? 'rgba(0,0,0,0.32)' : 'rgba(255,255,255,0.78)',
                  borderRadius: 18,
                  padding: 12,
                  borderTopLeftRadius: 4,
                }}
              >
                <Text style={{ ...heading(14, theme.text), lineHeight: 21 }}>{cheer}</Text>
              </View>
            </Row>

            <View style={{ marginTop: 10 }}>
              <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={heading(12, heroSoft)}>今日进度</Text>
                <Text style={numberStyle(13, heroInk)}>{Math.round(percent * 100)}%</Text>
              </Row>
              <ProgressBar value={percent} track={heroTrack} color={heroFill} height={12} />
            </View>
          </LinearGradient>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 15, flexWrap: 'wrap' }}>
          <Pill label={`全部 ${counts.all}`} emoji="✨" active={filter === 'all'} onPress={() => setFilter('all')} />
          {CATEGORIES.map((cat) => (
            <Pill
              key={cat.id}
              label={`${cat.short}${counts[cat.id] > 0 ? ` ${counts[cat.id]}` : ''}`}
              emoji={cat.emoji}
              active={filter === cat.id}
              onPress={() => setFilter(cat.id)}
            />
          ))}
        </View>

        <SectionTitle
          emoji="🌈"
          title={filter === 'all' ? '今天的任务' : CATEGORY_MAP[filter].name}
          right={
            <Text style={{ fontSize: 11, color: theme.textSoft }}>
              {visibleDone.length}/{visiblePending.length + visibleDone.length} 已完成
            </Text>
          }
        />

        {visiblePending.length === 0 && visibleDone.length === 0 ? (
          <Card>
            <Empty
              emoji="🌱"
              title="这里还是空的"
              hint="今天没有这个类别的任务，去「任务」页添加一件吧"
            />
            <Btn label="添加任务" emoji="＋" variant="soft" onPress={() => router.push('/task-editor')} />
          </Card>
        ) : null}

        {visiblePending.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            done={false}
            coins={taskCoinValue(task, state.settings)}
            onToggle={() => onToggle(task, false)}
            onEdit={() => router.push({ pathname: '/task-editor', params: { id: task.id } })}
          />
        ))}

        {visibleDone.length > 0 ? (
          <View style={{ marginTop: 6 }}>
            <Text style={{ fontSize: 11, color: theme.textSoft, marginBottom: 8 }}>
              ✨ 已完成 {visibleDone.length} 件，真棒
            </Text>
            {visibleDone.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                done
                coins={taskCoinValue(task, state.settings)}
                onToggle={() => onToggle(task, true)}
                onEdit={() => router.push({ pathname: '/task-editor', params: { id: task.id } })}
              />
            ))}
          </View>
        ) : null}

        {complete ? (
          <Card style={{ marginTop: 4, backgroundColor: theme.chip }}>
            <Row style={{ gap: 10 }}>
              <Text style={{ fontSize: 30 }}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={heading(15, theme.text)}>今日全勤宝箱打开啦！</Text>
                <Text style={{ fontSize: 11, color: theme.textSoft, marginTop: 2 }}>
                  额外 +5 金币已经放进你的存钱罐
                </Text>
              </View>
            </Row>
          </Card>
        ) : null}

        <Btn
          label="添加一个新任务"
          emoji="＋"
          variant="ghost"
          onPress={() => router.push('/task-editor')}
          style={{ marginTop: 8 }}
        />
      </Screen>

      <Confetti key={burst} visible={burst > 0} onDone={() => setBurst(0)} />
    </View>
  );
}
