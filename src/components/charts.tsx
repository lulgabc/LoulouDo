import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme, heading, numberStyle } from '@/theme/themes';
import { useI18n } from '@/i18n';

export function CoinBars({
  points,
  height = 118,
  labelMode = 'weekday',
}: {
  points: { date: string; coins: number }[];
  height?: number;
  labelMode?: 'weekday' | 'date';
}) {
  const theme = useTheme();
  const { weekdayShort, formatShort } = useI18n();
  const max = Math.max(1, ...points.map((p) => p.coins));
  const peak = Math.max(...points.map((p) => p.coins));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: height + 42, gap: 5 }}>
      {points.map((p) => {
        const ratio = p.coins / max;
        const isPeak = p.coins > 0 && p.coins === peak;
        return (
          <View key={p.date} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                ...numberStyle(11, p.coins > 0 ? theme.text : theme.textSoft),
                height: 16,
                opacity: p.coins > 0 ? 1 : 0.4,
              }}
            >
              {p.coins > 0 ? p.coins : ''}
            </Text>
            <View
              style={{
                width: '72%',
                height: Math.max(4, ratio * height),
                borderRadius: 9,
                backgroundColor: p.coins > 0 ? (isPeak ? theme.accent : theme.primary) : theme.chip,
                opacity: p.coins > 0 ? 1 : 0.6,
              }}
            />
            <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 6 }}>
              {labelMode === 'weekday' ? weekdayShort(p.date) : formatShort(p.date)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function Donut({
  segments,
  size = 138,
  thickness = 18,
  centerTop,
  centerMain,
  centerBottom,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  thickness?: number;
  centerTop?: string;
  centerMain?: string;
  centerBottom?: string;
}) {
  const theme = useTheme();
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={theme.chip}
          strokeWidth={thickness}
          fill="none"
        />
        {total > 0 &&
          segments.map((seg, i) => {
            const len = (seg.value / total) * c;
            const dashOffset = -offset;
            offset += len;
            if (seg.value <= 0) return null;
            return (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={seg.color}
                strokeWidth={thickness}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${Math.max(0, len - 3)} ${c}`}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
          })}
      </Svg>
      <View style={{ alignItems: 'center' }}>
        {centerTop ? (
          <Text style={{ fontSize: 10, color: theme.textSoft }}>{centerTop}</Text>
        ) : null}
        <Text style={numberStyle(22, theme.text)}>{centerMain ?? total}</Text>
        {centerBottom ? (
          <Text style={{ fontSize: 10, color: theme.textSoft }}>{centerBottom}</Text>
        ) : null}
      </View>
    </View>
  );
}

export function Ring({
  value,
  size = 92,
  thickness = 10,
  color,
  track,
  center,
}: {
  value: number;
  size?: number;
  thickness?: number;
  color?: string;
  track?: string;
  center?: React.ReactNode;
}) {
  const theme = useTheme();
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track ?? theme.chip}
          strokeWidth={thickness}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? theme.primary}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${pct * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {center}
    </View>
  );
}

export function Sparkline({ points }: { points: number[] }) {
  const theme = useTheme();
  const max = Math.max(1, ...points);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 26 }}>
      {points.map((v, i) => (
        <View
          key={i}
          style={{
            width: 4,
            height: Math.max(3, (v / max) * 24),
            borderRadius: 2,
            backgroundColor: theme.primary,
            opacity: 0.35 + (v / max) * 0.65,
          }}
        />
      ))}
    </View>
  );
}

export function ChartLegend({
  items,
}: {
  items: { label: string; color: string; value: string }[];
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {items.map((item) => (
        <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
          <Text style={{ fontSize: 11, color: theme.textSoft }}>{item.label}</Text>
          <Text style={{ ...heading(12, theme.text), marginLeft: 'auto' }}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}
