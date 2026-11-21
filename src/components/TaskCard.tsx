import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Category, Task } from '@/types';
import { CATEGORY_MAP } from '@/domain/constants';
import { daysBetween, todayISO } from '@/domain/date';
import { useTheme, heading, numberStyle } from '@/theme/themes';
import { Coin } from '@/components/Coin';
import { DotFill } from '@/components/DotFill';
import { useI18n } from '@/i18n';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

function colorForCategory(category: Category, theme: ReturnType<typeof useTheme>): string {
  switch (category) {
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

export { colorForCategory };

/** 每种类别不同的完成光效 */
const FX: Record<
  Category,
  { emojis: string[]; gradient: [string, string, string, string]; duration: number }
> = {
  daily: {
    emojis: ['✨', '⭐'],
    gradient: [
      'rgba(255,255,255,0)',
      'rgba(255,255,255,0.42)',
      'rgba(255,196,61,0.7)',
      'rgba(255,255,255,0)',
    ],
    duration: 1100,
  },
  weekend: {
    emojis: ['🎈', '✨'],
    gradient: [
      'rgba(255,255,255,0)',
      'rgba(255,255,255,0.42)',
      'rgba(255,145,40,0.7)',
      'rgba(255,255,255,0)',
    ],
    duration: 1150,
  },
  holiday: {
    emojis: ['🌞', '✨'],
    gradient: [
      'rgba(255,255,255,0)',
      'rgba(255,255,255,0.42)',
      'rgba(45,200,160,0.7)',
      'rgba(255,255,255,0)',
    ],
    duration: 1200,
  },
  special: {
    emojis: ['🌟', '⭐', '✨'],
    gradient: [
      'rgba(255,111,165,0.35)',
      'rgba(255,209,102,0.75)',
      'rgba(99,230,190,0.6)',
      'rgba(255,255,255,0)',
    ],
    duration: 1300,
  },
};

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
  onToggle?: () => void;
  onEdit?: () => void;
  note?: string;
  toggleDisabled?: boolean;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const cat = CATEGORY_MAP[task.category];
  const title = task.titleKey ? t(task.titleKey) : task.title;
  const color = colorForCategory(task.category, theme);
  const fx = FX[task.category] ?? FX.daily;
  const native = Platform.OS !== 'web';

  const deadline =
    task.kind === 'once' && task.endDate
      ? Math.max(0, daysBetween(todayISO(), task.endDate))
      : null;

  const sweep = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const coinScale = useRef(new Animated.Value(1)).current;
  const prevDone = useRef(done);

  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const angle = ((-150 + i * 42) * Math.PI) / 180;
        const distance = 26 + (i % 3) * 9;
        return {
          id: i,
          emoji: fx.emojis[i % fx.emojis.length],
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 11 + (i % 3) * 3,
        };
      }),
    [fx.emojis],
  );

  useEffect(() => {
    const newlyDone = done && !prevDone.current;
    prevDone.current = done;
    if (!newlyDone) {
      if (!done) {
        sweep.setValue(0);
        burst.setValue(0);
        coinScale.setValue(1);
      }
      return;
    }

    sweep.setValue(0);
    burst.setValue(0);
    coinScale.setValue(0.6);

    const anim = Animated.parallel([
      Animated.timing(sweep, {
        toValue: 1,
        duration: fx.duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: native,
      }),
      Animated.timing(burst, {
        toValue: 1,
        duration: fx.duration + 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: native,
      }),
      Animated.spring(coinScale, {
        toValue: 1,
        friction: 4,
        tension: 130,
        useNativeDriver: native,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [done, fx.duration, native, sweep, burst, coinScale]);

  const shineOpacity = sweep.interpolate({
    inputRange: [0, 0.15, 0.75, 1],
    outputRange: [0, 1, 0.9, 0],
  });
  const shineX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-160, 620],
  });
  const rewardOpacity = burst.interpolate({
    inputRange: [0, 0.1, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });
  const rewardY = burst.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -24],
  });

  const onceLabel =
    task.kind === 'once'
      ? (note ??
        (done
          ? t('task.challengeDone')
          : deadline !== null
            ? deadline === 0
              ? t('task.dueToday')
              : t('task.daysLeft', { n: deadline })
            : t('task.once')))
      : note;

  const coinRight = onEdit ? 44 : 16;

  return (
    <View
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: done ? color + (theme.dark ? '12' : '08') : 'transparent',
      }}
    >
      {done ? <DotFill color={color} id={`dots-${task.id}`} /> : null}

      <View style={{ flexDirection: 'row', zIndex: 1, alignItems: 'center' }}>
        <Pressable
          onPress={onToggle}
          disabled={!onToggle || toggleDisabled}
          accessibilityRole={onToggle ? 'button' : undefined}
          accessibilityState={onToggle ? { checked: done, disabled: Boolean(toggleDisabled) } : undefined}
          accessibilityLabel={
            onToggle
              ? done
                ? t('task.a11yUndo', { title })
                : t('task.a11yComplete', { title })
              : undefined
          }
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 10,
            paddingLeft: 14,
            paddingRight: onEdit ? 4 : 14,
            opacity: toggleDisabled ? 0.5 : pressed && onToggle ? 0.85 : 1,
          })}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 15,
              backgroundColor: color + (theme.dark ? '2E' : '20'),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 23 }}>{task.emoji}</Text>
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                ...heading(14.5, done ? theme.textSoft : theme.text),
                textDecorationLine: done ? 'line-through' : 'none',
              }}
              numberOfLines={2}
            >
              {title}
            </Text>
            {onceLabel ? (
              <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 3 }}>
                {cat.emoji} {onceLabel}
              </Text>
            ) : null}
          </View>

          <Animated.View style={{ transform: [{ scale: coinScale }] }}>
            <View
              style={{
                minWidth: 50,
                height: 34,
                borderRadius: 17,
                paddingHorizontal: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                backgroundColor: done
                  ? theme.coin + '22'
                  : theme.dark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(122,104,114,0.08)',
                borderWidth: 1,
                borderColor: done ? theme.coin + '66' : theme.border,
              }}
            >
              <Coin size={15} muted={!done} />
              <Text
                style={numberStyle(11.5, done ? theme.coin : theme.textSoft)}
                numberOfLines={1}
              >
                +{coins}
              </Text>
            </View>
          </Animated.View>
        </Pressable>

        {onEdit ? (
          <Pressable
            onPress={onEdit}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t('task.a11yEdit', { title })}
            style={({ pressed }) => ({
              paddingHorizontal: 10,
              paddingVertical: 14,
              opacity: pressed ? 0.5 : 0.75,
            })}
          >
            <Text style={{ fontSize: 13 }}>✏️</Text>
          </Pressable>
        ) : null}
      </View>

      {/* 完成光效：彩色光带从卡片上扫过 */}
      <AnimatedGradient
        pointerEvents="none"
        colors={fx.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: -40,
          height: 200,
          width: 170,
          zIndex: 0,
          opacity: shineOpacity,
          transform: [{ translateX: shineX }, { rotate: '16deg' }],
        }}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -40,
          height: 200,
          width: 3,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.9)',
          zIndex: 0,
          opacity: shineOpacity,
          transform: [{ translateX: shineX }, { rotate: '16deg' }],
        }}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: color,
          zIndex: 2,
          opacity: burst.interpolate({
            inputRange: [0, 0.08, 0.4, 1],
            outputRange: [0, 0.12, 0.04, 0],
          }),
        }}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: coinRight,
          top: 13,
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: theme.coin,
          zIndex: 3,
          opacity: burst.interpolate({
            inputRange: [0, 0.1, 0.7, 1],
            outputRange: [0, 0.85, 0.2, 0],
          }),
          transform: [
            {
              scale: burst.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0.9, 1.7, 1.9],
              }),
            },
          ],
        }}
      />
      {particles.map((p) => (
        <Animated.Text
          key={p.id}
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: coinRight + 2,
            top: 16,
            fontSize: p.size,
            zIndex: 3,
            opacity: burst.interpolate({
              inputRange: [0, 0.12, 0.65, 1],
              outputRange: [0, 1, 1, 0],
            }),
            transform: [
              {
                translateX: burst.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, p.x],
                }),
              },
              {
                translateY: burst.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, p.y],
                }),
              },
            ],
          }}
        >
          {p.emoji}
        </Animated.Text>
      ))}
      <Animated.Text
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: coinRight,
          top: 2,
          ...numberStyle(13, theme.coin),
          zIndex: 3,
          opacity: rewardOpacity,
          transform: [{ translateY: rewardY }],
        }}
      >
        +{coins}
      </Animated.Text>
    </View>
  );
}
