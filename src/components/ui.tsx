import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, shadowStyle, heading } from '@/theme/themes';

export const isWeb = Platform.OS === 'web';

export function Screen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}) {
  const theme = useTheme();
  const stickers = useMemo(
    () =>
      [
        { top: '6%', left: '4%', size: 40, rotate: '-14deg' },
        { top: '18%', right: '5%', size: 34, rotate: '12deg' },
        { top: '46%', left: '2%', size: 28, rotate: '8deg' },
        { top: '62%', right: '3%', size: 44, rotate: '-10deg' },
        { top: '82%', left: '7%', size: 30, rotate: '16deg' },
      ].map((pos, i) => ({
        ...pos,
        emoji: theme.stickers[i % theme.stickers.length],
      })),
    [theme],
  );

  const inner = (
    <View style={[styles.content, { width: '100%', maxWidth: 560, alignSelf: 'center' }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.bgGradient} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {stickers.map((s, i) => (
          <Text
            key={i}
            style={{
              position: 'absolute',
              top: s.top as never,
              left: (s as { left?: string }).left as never,
              right: (s as { right?: string }).right as never,
              fontSize: s.size,
              opacity: theme.stickerOpacity,
              transform: [{ rotate: s.rotate }],
            }}
          >
            {s.emoji}
          </Text>
        ))}
      </View>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 132 }}
          >
            {inner}
          </ScrollView>
        ) : (
          inner
        )}
      </SafeAreaView>
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
  tone = 'card',
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  tone?: 'card' | 'soft';
}) {
  const theme = useTheme();
  const base: ViewStyle = {
    backgroundColor: tone === 'soft' ? theme.cardSoft : theme.card,
    borderRadius: theme.radius,
    borderWidth: theme.borderWidth,
    borderColor: theme.border,
    padding: 16,
    ...shadowStyle(theme),
  };
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [base, style as ViewStyle, pressed && { transform: [{ scale: 0.985 }] }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style as ViewStyle]}>{children}</View>;
}

type BtnVariant = 'primary' | 'soft' | 'ghost' | 'accent';

export function Btn({
  label,
  onPress,
  variant = 'primary',
  emoji,
  disabled,
  style,
  small,
}: {
  label: string;
  onPress: () => void;
  variant?: BtnVariant;
  emoji?: string;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  small?: boolean;
}) {
  const theme = useTheme();
  const bg =
    variant === 'primary'
      ? theme.primary
      : variant === 'accent'
        ? theme.accent
        : variant === 'soft'
          ? theme.chip
          : 'transparent';
  const fg = variant === 'primary' ? theme.onPrimary : variant === 'accent' ? theme.text : theme.text;
  const borderW = variant === 'ghost' ? (theme.borderWidth > 1 ? 2 : 1) : 0;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: theme.radiusSm + 4,
          borderWidth: borderW,
          borderColor: variant === 'ghost' ? theme.border : 'transparent',
          paddingVertical: small ? 9 : 14,
          paddingHorizontal: small ? 14 : 20,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed && !disabled ? 0.96 : 1 }],
        },
        variant === 'primary' && shadowStyle(theme),
        style as ViewStyle,
      ]}
    >
      {emoji ? <Text style={{ fontSize: small ? 15 : 18 }}>{emoji}</Text> : null}
      <Text
        style={{
          ...heading(small ? 14 : 17, fg),
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function IconBtn({
  emoji,
  onPress,
  size = 42,
  bg,
  style,
  label,
}: {
  emoji: string;
  onPress: () => void;
  size?: number;
  bg?: string;
  style?: ViewStyle;
  label?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ?? emoji}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg ?? theme.card,
          borderWidth: theme.borderWidth,
          borderColor: theme.border,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.46 }}>{emoji}</Text>
    </Pressable>
  );
}

export function Pill({
  label,
  emoji,
  active,
  onPress,
  color,
}: {
  label: string;
  emoji?: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  const theme = useTheme();
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: active
          ? (color ?? theme.primary)
          : color
            ? color + (theme.dark ? '2A' : '18')
            : theme.chip,
        borderWidth: theme.borderWidth > 1 ? 2 : 1,
        borderColor: active
          ? (color ?? theme.primary)
          : color
            ? color + '66'
            : theme.border,
      }}
    >
      {emoji ? <Text style={{ fontSize: 13 }}>{emoji}</Text> : null}
      <Text
        style={{
          ...heading(
            13,
            active
              ? color
                ? theme.dark
                  ? '#1A1338'
                  : theme.text
                : theme.onPrimary
              : color
                ? theme.text
                : theme.textSoft,
          ),
        }}
      >
        {label}
      </Text>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {content}
    </Pressable>
  );
}

export function SectionTitle({
  emoji,
  title,
  right,
  style,
}: {
  emoji?: string;
  title: string;
  right?: React.ReactNode;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {emoji ? <Text style={{ fontSize: 18 }}>{emoji}</Text> : null}
        <Text style={heading(18, theme.text)}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function ProgressBar({
  value,
  color,
  height = 12,
  track,
  style,
}: {
  value: number;
  color?: string;
  height?: number;
  track?: string;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      style={[
        {
          height,
          borderRadius: height,
          backgroundColor: track ?? theme.chip,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          borderRadius: height,
          backgroundColor: color ?? theme.primary,
        }}
      />
    </View>
  );
}

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  suffix,
  compact,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  compact?: boolean;
}) {
  const theme = useTheme();
  const btn = (label: string, delta: number, disabled: boolean) => (
    <Pressable
      onPress={() => onChange(Math.min(max, Math.max(min, value + delta)))}
      disabled={disabled}
      style={({ pressed }) => ({
        width: compact ? 30 : 36,
        height: compact ? 30 : 36,
        borderRadius: compact ? 15 : 18,
        backgroundColor: theme.chip,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.35 : pressed ? 0.6 : 1,
        borderWidth: theme.borderWidth > 1 ? 2 : 0,
        borderColor: theme.border,
      })}
    >
      <Text style={{ ...heading(compact ? 16 : 18, theme.text), lineHeight: 22 }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 6 : 10 }}>
      {btn('−', -step, value <= min)}
      <Text
        style={{
          ...heading(compact ? 15 : 17, theme.text),
          minWidth: compact ? 30 : 58,
          textAlign: 'center',
        }}
      >
        {value}
        {suffix ? <Text style={{ fontSize: 12 }}>{suffix}</Text> : null}
      </Text>
      {btn('＋', step, value >= max)}
    </View>
  );
}

export function Row({
  children,
  style,
  gap = 10,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  gap?: number;
}) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>
  );
}

export function Empty({
  emoji = '🌱',
  title,
  hint,
}: {
  emoji?: string;
  title: string;
  hint?: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 26, gap: 6 }}>
      <Text style={{ fontSize: 40 }}>{emoji}</Text>
      <Text style={{ ...heading(15, theme.text), textAlign: 'center' }}>{title}</Text>
      {hint ? (
        <Text style={{ fontSize: 12, color: theme.textSoft, textAlign: 'center', lineHeight: 18 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function Divider() {
  const theme = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 10 }} />;
}

export function Label({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const theme = useTheme();
  return (
    <Text style={[{ fontSize: 12, color: theme.textSoft, marginBottom: 6 }, style]}>{children}</Text>
  );
}

export const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 10 },
});
