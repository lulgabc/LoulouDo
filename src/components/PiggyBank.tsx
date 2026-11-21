import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { useTheme, numberStyle } from '@/theme/themes';
import { useI18n } from '@/i18n';

/** 小猪储蓄罐轮廓按钮，余额写在罐身上。 */
export function PiggyBankButton({
  balance,
  onPress,
}: {
  balance: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('wallet.title')} · ${t('wallet.myCoins')} ${balance}`}
      style={({ pressed }) => ({
        width: 80,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Svg width={80} height={56} viewBox="0 0 80 56">
        <Path
          d="M17 26 C17 16 28 11 41 11 C55 11 65 17 65 28 C65 37 57 43 45 43 L29 43 C21 43 17 36 17 26 Z"
          fill={theme.card}
          stroke={theme.primary}
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
        <Path
          d="M27 13 L30 5 L38 12"
          fill={theme.card}
          stroke={theme.primary}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
        <Ellipse
          cx={64.5}
          cy={28}
          rx={7.5}
          ry={6.5}
          fill={theme.card}
          stroke={theme.primary}
          strokeWidth={2.4}
        />
        <Circle cx={62} cy={27} r={1.1} fill={theme.primary} />
        <Circle cx={67} cy={27} r={1.1} fill={theme.primary} />
        <Circle cx={33} cy={23} r={1.7} fill={theme.primary} />
        <Path
          d="M24 43 L24 50 M33 43 L33 50 M51 43 L51 50 M60 43 L60 50"
          stroke={theme.primary}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <Path
          d="M17 25 C10 25 10 18 15 17"
          fill="none"
          stroke={theme.primary}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <Path
          d="M35 11 L45 11"
          stroke={theme.primary}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </Svg>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          top: 23,
          height: 18,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={numberStyle(13, theme.text)} numberOfLines={1}>
          {balance}
        </Text>
      </View>
    </Pressable>
  );
}
