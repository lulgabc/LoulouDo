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
import { Card } from '@/components/ui';
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

export function categoryColor(
  task: Task,
  theme: ReturnType<typeof useTheme>,
): string {
  return colorForCategory(task.category, theme);
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
      'rgba(255,255,255,0.55)',
      'rgba(255,196,61,0.95)',
      'rgba(255,255,255,0)',
    ],
    duration: 1100,
  },
  weekend: {
    emojis: ['🎈', '✨'],
    gradient: [
      'rgba(255,255,255,0)',
      'rgba(255,255,255,0.55)',
      'rgba(255,145,40,0.95)',
      'rgba(255,255,255,0)',
    ],
    duration: 1150,
  },
  holiday: {
    emojis: ['🌞', '✨'],
    gradient: [
      'rgba(255,255,255,0)',
      'rgba(255,255,255,0.55)',
      'rgba(45,200,160,0.95)',
      'rgba(255,255,255,0)',
    ],
    duration: 1200,
  },
  special: {
    emojis: ['🌟', '⭐', '✨'],
    gradient: [
      'rgba(255,111,165,0.45)',
      'rgba(255,209,102,0.95)',
      'rgba(99,230,190,0.85)',
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
  const flashOpacity = burst.interpolate({
    inputRange: [0, 0.18, 0.55, 1],
    outputRange: [0, 0.9, 0.35, 0],
  });
  const rewardOpacity = burst.interpolate({
    inputRange: [0, 0.1, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });
  const rewardY = burst.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -26],
  });

  const borderStyle =
    task.category === 'weekend' ? ('dashed' as const) : ('solid' as const);

  return (
    <Card
      style={{
        padding: 0,
        marginBottom: 10,
        borderColor: color,
        borderWidth: Math.max(theme.borderWidth, 2),
        borderStyle,
        borderLeftWidth: 8,
        borderLeftColor: color,
      }}
    >
      <View style={{ borderRadius: theme.radius, overflow: 'hidden' }}>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: color,
            opacity: task.category === 'special' ? 0.12 : 0.07,
          }}
        />
        {task.category === 'special' ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 4,
              right: 4,
              top: 4,
              bottom: 4,
              borderRadius: theme.radius - 5,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: color + '88',
            }}
          />
        ) : null}

        {/* 内容层：zIndex 保证在光带之上 */}
        <View
          style={{
            position: 'relative',
            zIndex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            paddingLeft: 12,
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 18,
              backgroundColor: color + (theme.dark ? '2E' : '24'),
              borderWidth: 1,
              borderColor: color + '55',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 26 }}>{task.emoji}</Text>
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                ...heading(15, done ? theme.textSoft : theme.text),
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
                gap: 6,
                marginTop: 5,
                flexWrap: 'wrap',
              }}
            >
              <View
                style={{
                  backgroundColor: color + (theme.dark ? '33' : '24'),
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 10, color, fontWeight: '700' }}>
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
              {onEdit ? (
                <Pressable
                  onPress={onEdit}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('task.a11yEdit', { title })}
                  style={({ pressed }) => ({
                    paddingHorizontal: 3,
                    paddingVertical: 2,
                    opacity: pressed ? 0.5 : 0.8,
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
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: done ? color : theme.card,
                borderWidth: 2,
                borderColor: done ? color : color + 'AA',
                transform: [{ scale: pressed ? 0.88 : 1 }],
                opacity: toggleDisabled ? 0.35 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: done ? '#FFFFFF' : color,
                  fontWeight: '800',
                }}
              >
                ✓
              </Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* 完成光效：在内容层之下的彩色光带 */}
        <AnimatedGradient
          pointerEvents="none"
          colors={fx.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: -40,
            height: 220,
            width: 175,
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
            height: 220,
            width: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.98)',
            zIndex: 0,
            opacity: shineOpacity,
            shadowColor: color,
            shadowOpacity: 1,
            shadowRadius: 10,
            transform: [{ translateX: shineX }, { rotate: '16deg' }],
          }}
        />

        {/* 卡片整体闪光 + 边框闪光 + 圆环 + 粒子 */}
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
              outputRange: [0, 0.16, 0.05, 0],
            }),
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
            borderRadius: theme.radius,
            borderWidth: 3,
            borderColor: color,
            zIndex: 2,
            opacity: flashOpacity,
          }}
        />
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 14,
            top: 24,
            width: 44,
            height: 44,
            borderRadius: 22,
            borderWidth: 2,
            borderColor: color,
            zIndex: 3,
            opacity: burst.interpolate({
              inputRange: [0, 0.1, 0.7, 1],
              outputRange: [0, 0.9, 0.25, 0],
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
              right: 16,
              top: 28,
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
            right: 12,
            top: 10,
            ...numberStyle(14, color),
            zIndex: 3,
            opacity: rewardOpacity,
            transform: [{ translateY: rewardY }],
          }}
        >
          +{coins}
        </Animated.Text>
      </View>
    </Card>
  );
}
