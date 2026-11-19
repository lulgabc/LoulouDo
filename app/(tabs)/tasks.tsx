import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, shadowStyle } from '@/theme/themes';
import { todayISO, daysBetween } from '@/domain/date';
import {
  isTaskCompleted,
  isTaskDoneOn,
  taskAppliesOn,
  taskCoinValue,
} from '@/domain/logic';
import { CATEGORIES } from '@/domain/constants';
import type { Category } from '@/types';
import { Card, Empty, Row, Screen, SectionTitle } from '@/components/ui';
import { TaskCard } from '@/components/TaskCard';
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

  const grouped = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        cat,
        list: tasks.filter((t) => t.category === cat.id),
      })),
    [tasks],
  );

  const toggle = (taskId: string, done: boolean, enabled: boolean) => {
    if (!enabled) return;
    toggleTask(taskId);
    tapFeedback(done ? 'light' : 'success');
    if (!done) setBurst((b) => b + 1);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <View>
            <Text style={heading(24, theme.text)}>{t('tasks.title')}</Text>
            <Text style={{ fontSize: 11, color: theme.textSoft, marginTop: 3 }}>
              {t('tasks.subtitle')}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/task-editor')}
            style={({ pressed }) => ({
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.9 : 1 }],
              ...shadowStyle(theme),
            })}
          >
            <Text style={{ fontSize: 22, color: theme.onPrimary, marginTop: -2 }}>＋</Text>
          </Pressable>
        </Row>

        <Text style={{ fontSize: 10, color: theme.textSoft, marginBottom: 14 }}>
          {t('tasks.hint')}
        </Text>

        {grouped.map(({ cat, list }) => {
          const color =
            cat.id === 'daily'
              ? theme.primary
              : cat.id === 'weekend'
                ? theme.accent
                : cat.id === 'holiday'
                  ? theme.secondary
                  : theme.candy;
          return (
            <View key={cat.id} style={{ marginBottom: 11 }}>
              <SectionTitle
                emoji={cat.emoji}
                title={`${t(`category.${cat.id}.name`)} · ${list.length}`}
                right={
                  <Pressable
                    onPress={() =>
                      router.push({ pathname: '/task-editor', params: { category: cat.id as Category } })
                    }
                    hitSlop={8}
                  >
                    <Text style={{ ...heading(12, color) }}>＋ {t('common.add')}</Text>
                  </Pressable>
                }
              />
              {list.length === 0 ? (
                <Card style={{ paddingVertical: 4 }}>
                  <Empty emoji={cat.emoji} title={t('tasks.emptyTitle')} hint={t(`category.${cat.id}.hint`)} />
                </Card>
              ) : (
                list.map((task) => {
                  const doneToday = isTaskDoneOn(entries, task.id, today);
                  const onceDone = task.kind === 'once' && isTaskCompleted(entries, task.id);
                  const applies = taskAppliesOn(task, today, holidays);
                  const expired =
                    task.kind === 'once' && !!task.endDate && task.endDate < today && !onceDone;
                  const future =
                    task.kind === 'once' && !!task.startDate && task.startDate > today;

                  let note: string | undefined;
                  if (onceDone) {
                    note = doneToday ? t('task.doneToday') : t('task.challengeDone');
                  } else if (expired) {
                    note = t('task.ended');
                  } else if (future && task.startDate) {
                    note = tn('task.startsIn', daysBetween(today, task.startDate));
                  } else if (!applies && task.category === 'weekend') {
                    note = t('task.weekendOnly');
                  } else if (!applies && task.category === 'holiday') {
                    note = t('task.holidayOnly');
                  } else if (!applies && task.kind === 'once') {
                    note = t('task.once');
                  }

                  const enabled =
                    !expired && applies && !(onceDone && !doneToday);

                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      done={doneToday || onceDone}
                      coins={taskCoinValue(task, state.settings)}
                      onToggle={() => toggle(task.id, doneToday || onceDone, enabled)}
                      onEdit={() =>
                        router.push({ pathname: '/task-editor', params: { id: task.id } })
                      }
                      note={note}
                      toggleDisabled={!enabled}
                    />
                  );
                })
              )}
            </View>
          );
        })}

        <Card style={{ marginTop: 4, backgroundColor: theme.chip }}>
          <Text style={{ ...heading(13, theme.text), marginBottom: 4 }}>💡 {t('tasks.lessonTitle')}</Text>
          <Text style={{ fontSize: 11, color: theme.textSoft, lineHeight: 18 }}>
            {t('tasks.lessonBody')}
          </Text>
        </Card>
      </Screen>
      <Confetti key={burst} visible={burst > 0} onDone={() => setBurst(0)} />
    </View>
  );
}
