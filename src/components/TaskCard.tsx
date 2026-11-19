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
import { CoinValue } from '@/components/Coin';
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

/** 每个类别不同的完成动效：光带颜色、粒子、时长 */
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
  onToggle: () => void;
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
  const checkScale = useRef(new Animated.Value(1)).current;
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
        checkScale.setValue(1);
      }
      return;
    }

    sweep.setValue(0);
    burst.setValue(0);
    checkScale.setValue(0.45);

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
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 130,
        useNativeDriver: native,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [done, fx.duration, native, sweep, burst, checkScale]);

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

  return (
    <View
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: done ? color + (theme.dark ? '14' : '0C') : 'transparent',
      }}
    >
      {/* 内容层：zIndex 保证在光带之上 */}
      <View
        style={{
          position: 'relative',
          zIndex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 10,
          paddingHorizontal: 14,
        }}
      >
        <View
          style={{
            width: 4,
            height: 32,
            borderRadius: 2,
            backgroundColor: color,
            opacity: done ? 0.45 : 1,
          }}
        />
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              marginTop: 3,
              flexWrap: 'wrap',
            }}
          >
            <CoinValue value={coins} size={10} color={theme.coin} />
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
            {onEdit ? (
              <Pressable
                onPress={onEdit}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('task.a11yEdit', { title })}
                style={({ pressed }) => ({
                  paddingHorizontal: 3,
                  paddingVertical: 2,
                  opacity: pressed ? 0.5 : 0.7,
                })}
              >
                <Text style={{ fontSize: 13 }}>✏️</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <Animated.View
          style={{
            transform: [
              { scale: checkScale },
              {
                rotate: checkScale.interpolate({
                  inputRange: [0.45, 1],
                  outputRange: ['-22deg', '0deg'],
                }),
              },
            ],
          }}
        >
          <Pressable
            onPress={toggleDisabled ? undefined : onToggle}
            disabled={toggleDisabled}
            accessibilityRole="button"
            accessibilityState={{ checked: done }}
            accessibilityLabel={done ? t('task.a11yUndo', { title }) : t('task.a11yComplete', { title })}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: done ? color : 'transparent',
              borderWidth: 2,
              borderColor: done ? color : color + '99',
              transform: [{ scale: pressed ? 0.88 : 1 }],
              opacity: toggleDisabled ? 0.35 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 18,
                color: done ? '#FFFFFF' : color,
                fontWeight: '800',
              }}
            >
              ✓
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* 完成光效：在内容层之下 */}
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
          right: 16,
          top: 22,
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: color,
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
            right: 18,
            top: 26,
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
          right: 16,
          top: 6,
          ...numberStyle(13, color),
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
