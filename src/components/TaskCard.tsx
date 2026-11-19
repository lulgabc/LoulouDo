import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Task } from '@/types';
import { CATEGORY_MAP } from '@/domain/constants';
import { daysBetween, todayISO } from '@/domain/date';
import { useTheme, heading, numberStyle } from '@/theme/themes';
import { Card } from '@/components/ui';
import { CoinValue } from '@/components/Coin';
import { useI18n } from '@/i18n';

export function categoryColor(task: Task, theme: ReturnType<typeof useTheme>): string {
  switch (task.category) {
    case 'daily':
      return theme.primary;
    case 'weekend':
      return theme.accent;
    case 'holiday':
      return theme.secondary;
    case 'special':
      return theme.candy;
    default:
      return theme.primary;
  }
}

export function TaskCard({
  task,
  done,
  coins,
  onToggle,
  onEdit,
  note,
  toggleDisabled,
}: {
  task: Task;
  done: boolean;
  coins: number;
  onToggle: () => void;
  onEdit?: () => void;
  note?: string;
  toggleDisabled?: boolean;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const cat = CATEGORY_MAP[task.category];
  const title = task.titleKey ? t(task.titleKey) : task.title;
  const color = categoryColor(task, theme);
  const deadline =
    task.kind === 'once' && task.endDate
      ? Math.max(0, daysBetween(todayISO(), task.endDate))
      : null;

  return (
    <Card
      style={{
        padding: 12,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 18,
            backgroundColor: theme.chip,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 26 }}>{task.emoji}</Text>
        </View>

        <Pressable onPress={onEdit} style={{ flex: 1 }} disabled={!onEdit}>
          <Text
            style={{
              ...heading(15, done ? theme.textSoft : theme.text),
              textDecorationLine: done ? 'line-through' : 'none',
            }}
            numberOfLines={2}
          >
            {title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
            <View
              style={{
                backgroundColor: color + (theme.dark ? '33' : '22'),
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ fontSize: 10, color: color, fontWeight: '700' }}>
                {cat.emoji} {t(`category.${task.category}.short`)}
              </Text>
            </View>
            <CoinValue value={coins} size={11} color={theme.coin} />
            {task.kind === 'once' ? (
              <Text style={{ fontSize: 10, color: theme.textSoft }}>
                {note ??
                  (done
                    ? t('task.challengeDone')
                    : deadline !== null
                      ? deadline === 0
                        ? t('task.dueToday')
                        : t('task.daysLeft', { n: deadline })
                      : t('task.once'))}
              </Text>
            ) : note ? (
              <Text style={{ fontSize: 10, color: theme.textSoft }}>{note}</Text>
            ) : null}
          </View>
        </Pressable>

        <Pressable
          onPress={toggleDisabled ? undefined : onToggle}
          disabled={toggleDisabled}
          accessibilityRole="button"
          accessibilityLabel={done ? t('task.a11yUndo', { title }) : t('task.a11yComplete', { title })}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: done ? theme.secondary : theme.chip,
            borderWidth: theme.borderWidth,
            borderColor: done ? theme.secondary : theme.border,
            transform: [{ scale: pressed ? 0.88 : 1 }],
            opacity: toggleDisabled ? 0.35 : 1,
          })}
        >
          <Text style={{ fontSize: 20, color: done ? '#FFFFFF' : theme.textSoft }}>
            {done ? '✓' : '＋'}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
