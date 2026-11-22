import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { addDays, eachDay, startOfWeek } from '@/domain/date';
import { dayProgress } from '@/domain/logic';
import type { HolidayRange, LedgerEntry, Task } from '@/types';
import { useTheme, numberStyle, shadowStyle } from '@/theme/themes';
import { useI18n } from '@/i18n';
import { tapFeedback } from '@/utils/feedback';

/** 首页日期条：当前周 7 天，支持前后翻周。 */
export function DayStrip({
  selectedDate,
  today,
  onChange,
  tasks,
  entries,
  holidays,
}: {
  selectedDate: string;
  today: string;
  onChange: (date: string) => void;
  tasks: Task[];
  entries: LedgerEntry[];
  holidays: HolidayRange[];
}) {
  const theme = useTheme();
  const { t, formatDate, weekdayShort } = useI18n();

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const days = useMemo(() => eachDay(weekStart, addDays(weekStart, 6)), [weekStart]);
  const summaries = useMemo(
    () =>
      days.map((date) => {
        const progress = dayProgress(tasks, entries, date, holidays);
        return { date, done: progress.done, total: progress.total, allClear: progress.allClear };
      }),
    [days, tasks, entries, holidays],
  );

  const shiftWeek = (delta: number) => {
    tapFeedback('light');
    onChange(addDays(selectedDate, delta));
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        padding: 6,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: theme.border,
        backgroundColor: theme.card,
        marginBottom: 10,
        ...shadowStyle(theme),
      }}
    >
      <Pressable
        onPress={() => shiftWeek(-7)}
        accessibilityRole="button"
        accessibilityLabel={t('home.prevWeek')}
        style={({ pressed }) => ({
          width: 22,
          height: 42,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <Text style={{ fontSize: 20, color: theme.textSoft }}>‹</Text>
      </Pressable>

      {summaries.map(({ date, done, total, allClear }) => {
        const active = date === selectedDate;
        const isToday = date === today;
        return (
          <Pressable
            key={date}
            onPress={() => {
              tapFeedback('light');
              onChange(date);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${formatDate(date)} · ${done}/${total}`}
            style={({ pressed }) => ({
              flex: 1,
              minWidth: 0,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 5,
              borderRadius: 12,
              backgroundColor: active ? theme.primary : 'transparent',
              borderWidth: !active && isToday ? 1.5 : 0,
              borderColor: theme.primary,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 8.5,
                color: active ? theme.onPrimary : theme.textSoft,
                marginBottom: 1,
              }}
              numberOfLines={1}
            >
              {weekdayShort(date)}
            </Text>
            <Text style={numberStyle(15, active ? theme.onPrimary : theme.text)}>
              {Number(date.slice(8, 10))}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 5 }}>
              {isToday ? (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: active ? theme.onPrimary : theme.primary,
                  }}
                />
              ) : null}
              {done > 0 ? (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: active
                      ? allClear
                        ? theme.coin
                        : theme.onPrimary
                      : allClear
                        ? theme.coin
                        : theme.secondary,
                    opacity: active && !allClear ? 0.8 : 1,
                  }}
                />
              ) : null}
            </View>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => shiftWeek(7)}
        accessibilityRole="button"
        accessibilityLabel={t('home.nextWeek')}
        style={({ pressed }) => ({
          width: 22,
          height: 42,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <Text style={{ fontSize: 20, color: theme.textSoft }}>›</Text>
      </Pressable>
    </View>
  );
}
