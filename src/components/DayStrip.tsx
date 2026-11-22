import React, { useMemo, useRef } from 'react';
import { Animated, PanResponder, Pressable, Text, View } from 'react-native';
import { addDays, eachDay, startOfWeek } from '@/domain/date';
import { dayProgress } from '@/domain/logic';
import type { HolidayRange, LedgerEntry, Task } from '@/types';
import { useTheme, numberStyle, shadowStyle } from '@/theme/themes';
import { useI18n } from '@/i18n';
import { tapFeedback } from '@/utils/feedback';

/** 首页日期条：显示当前周 7 天，支持按天滑动。 */
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
  const { t, formatDate, formatMonth, weekdayShort } = useI18n();

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekEnd = addDays(weekStart, 6);
  const days = useMemo(() => eachDay(weekStart, weekEnd), [weekStart, weekEnd]);
  const summaries = useMemo(
    () =>
      days.map((date) => {
        const progress = dayProgress(tasks, entries, date, holidays);
        return { date, done: progress.done, total: progress.total, allClear: progress.allClear };
      }),
    [days, tasks, entries, holidays],
  );

  const monthLabel = useMemo(() => {
    const startMonth = weekStart.slice(0, 7);
    const endMonth = weekEnd.slice(0, 7);
    if (startMonth === endMonth) return formatMonth(weekStart);
    const startYear = weekStart.slice(0, 4);
    const endYear = weekEnd.slice(0, 4);
    return `${formatMonth(weekStart, true)}${
      startYear !== endYear ? ` ${startYear}` : ''
    } – ${formatMonth(weekEnd, true)} ${endYear}`;
  }, [formatMonth, weekEnd, weekStart]);

  const selectedRef = useRef(selectedDate);
  selectedRef.current = selectedDate;
  const translateX = useRef(new Animated.Value(0)).current;

  const shiftDay = (delta: number) => {
    tapFeedback('light');
    onChange(addDays(selectedRef.current, delta));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4,
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(Math.max(-34, Math.min(34, gesture.dx / 3)));
      },
      onPanResponderRelease: (_, gesture) => {
        translateX.setValue(0);
        const shouldShift = Math.abs(gesture.dx) > 42 || Math.abs(gesture.vx) > 0.5;
        if (!shouldShift) return;
        shiftDay(gesture.dx < 0 ? 1 : -1);
      },
      onPanResponderTerminate: () => {
        translateX.setValue(0);
      },
    }),
  ).current;

  return (
    <View
      style={{
        paddingHorizontal: 6,
        paddingBottom: 6,
        paddingTop: 2,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: theme.border,
        backgroundColor: theme.card,
        marginBottom: 10,
        ...shadowStyle(theme),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 3,
          paddingVertical: 3,
        }}
      >
        <Text style={{ fontSize: 10, color: theme.textSoft, fontWeight: '600' }}>
          {monthLabel}
        </Text>
      </View>
      <View
        {...panResponder.panHandlers}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
      >
      <Pressable
        onPress={() => shiftDay(-1)}
        accessibilityRole="button"
        accessibilityLabel={t('home.prevDay')}
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

      <Animated.View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
          transform: [{ translateX }],
        }}
      >
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
      </Animated.View>

      <Pressable
        onPress={() => shiftDay(1)}
        accessibilityRole="button"
        accessibilityLabel={t('home.nextDay')}
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
    </View>
  );
}
