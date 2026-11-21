import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading } from '@/theme/themes';
import { todayISO, daysBetween } from '@/domain/date';
import {
  dayProgress,
  isTaskCompleted,
  isTaskDoneOn,
  taskAppliesOn,
  taskCoinValue,
} from '@/domain/logic';
import { CATEGORIES } from '@/domain/constants';
import type { Category, Task } from '@/types';
import { Row, Screen } from '@/components/ui';
import { TaskBoard } from '@/components/TaskBoard';
import { Confetti } from '@/components/Confetti';
import { tapFeedback } from '@/utils/feedback';
import { useI18n } from '@/i18n';

export default function TasksScreen() {
  const theme = useTheme();
  const { t, tn } = useI18n();
  const { tasks, entries, state, toggleTask } = useApp();
  const today = todayISO();
  const holidays = state.settings.holidays;
  const [burst, setBurst] = useState(0);
  const progress = useMemo(
    () => dayProgress(tasks, entries, today, holidays),
    [tasks, entries, today, holidays],
  );

  const groups = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        category: cat.id,
        tasks: tasks.filter((task) => task.category === cat.id),
      })),
    [tasks],
  );

  const isEnabled = (task: Task): boolean => {
    const doneToday = isTaskDoneOn(entries, task.id, today);
    const onceDone = task.kind === 'once' && isTaskCompleted(entries, task.id);
    const applies = taskAppliesOn(task, today, holidays);
    const expired =
      task.kind === 'once' && !!task.endDate && task.endDate < today && !onceDone;
    return !expired && applies && !(onceDone && !doneToday);
  };

  const noteFor = (task: Task): string | undefined => {
    const doneToday = isTaskDoneOn(entries, task.id, today);
    const onceDone = task.kind === 'once' && isTaskCompleted(entries, task.id);
    const applies = taskAppliesOn(task, today, holidays);
    const expired =
      task.kind === 'once' && !!task.endDate && task.endDate < today && !onceDone;
    const future = task.kind === 'once' && !!task.startDate && task.startDate > today;

    if (onceDone) return doneToday ? t('task.doneToday') : t('task.challengeDone');
    if (expired) return t('task.ended');
    if (future && task.startDate) return tn('task.startsIn', daysBetween(today, task.startDate));
    if (!applies && task.category === 'weekend') return t('task.weekendOnly');
    if (!applies && task.category === 'holiday') return t('task.holidayOnly');
    if (!applies && task.kind === 'once') return t('task.once');
    return undefined;
  };

  const doneIds = useMemo(() => {
    const ids = new Set<string>();
    for (const task of tasks) {
      if (isTaskDoneOn(entries, task.id, today)) ids.add(task.id);
      if (task.kind === 'once' && isTaskCompleted(entries, task.id)) ids.add(task.id);
    }
    return ids;
  }, [tasks, entries, today]);

  const toggle = (task: Task, done: boolean) => {
    if (!isEnabled(task)) return;
    toggleTask(task.id);
    tapFeedback(done ? 'light' : 'success');
    if (!done && progress.pending.length === 1) setBurst((b) => b + 1);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={heading(24, theme.text)}>{t('tasks.title')}</Text>
            <Text style={{ fontSize: 11, color: theme.textSoft, marginTop: 3 }}>
              {t('tasks.subtitle')}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/task-editor')}
            accessibilityRole="button"
            accessibilityLabel={t('home.addTask')}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.chip,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.9 : 1 }],
            })}
          >
            <Text style={{ fontSize: 21, color: theme.text, marginTop: -2 }}>＋</Text>
          </Pressable>
        </Row>

        <Text style={{ fontSize: 10, color: theme.textSoft, marginBottom: 14 }}>
          {t('tasks.hint')}
        </Text>

        <TaskBoard
          groups={groups}
          doneIds={doneIds}
          coinsFor={(task) => taskCoinValue(task, state.settings)}
          noteFor={noteFor}
          onToggle={toggle}
          onEdit={(task) => router.push({ pathname: '/task-editor', params: { id: task.id } })}
          onAdd={() => router.push('/task-editor')}
          addLabel={t('home.addTask')}
          onAddCategory={(category: Category) =>
            router.push({ pathname: '/task-editor', params: { category } })
          }
          emptyLabel={t('tasks.emptyTitle')}
          completionEnabled={false}
        />

        <View
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: theme.radius,
            backgroundColor: theme.chip,
          }}
        >
          <Text style={{ ...heading(13, theme.text), marginBottom: 4 }}>
            💡 {t('tasks.lessonTitle')}
          </Text>
          <Text style={{ fontSize: 11, color: theme.textSoft, lineHeight: 18 }}>
            {t('tasks.lessonBody')}
          </Text>
        </View>
      </Screen>
      <Confetti key={burst} visible={burst > 0} onDone={() => setBurst(0)} />
    </View>
  );
}
