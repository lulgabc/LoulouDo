import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import { useTheme, numberStyle } from '@/theme/themes';
import { Coin } from '@/components/Coin';
import { useI18n } from '@/i18n';

/**
 * 重新设计的储蓄罐：圆润的侧面小猪 + 投币口上方的金币，
 * 数字放在旁边，避免把余额塞进罐身造成拥挤。
 */
export function PiggyBankButton({
  balance,
  onPress,
}: {
  balance: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const ink = theme.text;
  const body = '#FFC6D1';
  const belly = '#FF9FB4';
  const gold = '#FFD24D';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('wallet.title')} · ${t('wallet.myCoins')} ${balance}`}
      style={({ pressed }) => ({
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingLeft: 2,
        opacity: pressed ? 0.75 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Svg width={64} height={50} viewBox="0 0 80 60">
        {/* 尾巴 */}
        <Path
          d="M13 34 C6 34 5 27 9 25 C12 23 16 27 12 31"
          fill="none"
          stroke={ink}
          strokeWidth={2.4}
          strokeLinecap="round"
        />

        {/* 四条腿 */}
        <Rect x={23} y={47} width={9} height={13} rx={4} fill={body} stroke={ink} strokeWidth={2.4} />
        <Rect x={45} y={47} width={9} height={13} rx={4} fill={body} stroke={ink} strokeWidth={2.4} />

        {/* 耳朵 */}
        <Path
          d="M47 21 L50 7 L62 14 L61 23"
          fill={body}
          stroke={ink}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />

        {/* 猪鼻（先画，身体会盖住连接处） */}
        <Ellipse
          cx={68}
          cy={35}
          rx={10}
          ry={7.5}
          fill={body}
          stroke={ink}
          strokeWidth={2.4}
        />

        {/* 身体 */}
        <Ellipse cx={38} cy={33} rx={27} ry={20} fill={body} />
        <Defs>
          <ClipPath id="piggyBankBody">
            <Ellipse cx={38} cy={33} rx={27} ry={20} />
          </ClipPath>
        </Defs>
        <G clipPath="url(#piggyBankBody)">
          <Path d="M4 39 C20 55 54 58 74 42 L76 64 L0 64 Z" fill={belly} />
          <Ellipse cx={24} cy={27} rx={11} ry={7} fill="#FFFFFF" opacity={0.16} />
        </G>
        <Ellipse cx={38} cy={33} rx={27} ry={20} fill="none" stroke={ink} strokeWidth={2.6} />

        {/* 投币口、眼睛、鼻孔 */}
        <Rect x={26} y={19} width={17} height={4} rx={2} fill={ink} />
        <Circle cx={54} cy={29} r={2} fill={ink} />
        <Circle cx={65} cy={33} r={1.3} fill={ink} />
        <Circle cx={70} cy={33} r={1.3} fill={ink} />

        {/* 金币 */}
        <Circle cx={34} cy={8} r={7} fill={gold} stroke={ink} strokeWidth={2.4} />
        <Circle cx={31.5} cy={5.5} r={1.6} fill="#FFF5BF" opacity={0.95} />
      </Svg>

      <View style={{ alignItems: 'center', gap: 1, minWidth: 26 }}>
        <Coin size={13} />
        <Text style={numberStyle(14, theme.text)} numberOfLines={1}>
          {balance}
        </Text>
      </View>
    </Pressable>
  );
}
