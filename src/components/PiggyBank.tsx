import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import { useTheme, numberStyle } from '@/theme/themes';
import { useI18n } from '@/i18n';

const BODY =
  'M14 49 C14 34 26 27 43 27 C54 27 61 31 64 37 C73 39 80 44 80 53 C80 60 75 65 68 66 L68 70 C68 73 65 75 62 74 L57 73 L57 67 L35 67 L34 73 L26 73 C23 73 22 71 22 69 L22 63 C17 60 14 54 14 49 Z';

/** 小猪储蓄罐：参考扁平线性图标风格，余额写在罐身上。 */
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
  const bodyFill = '#FFC2CE';
  const bellyFill = '#FF96AE';
  const coinFill = '#FFD24D';
  const textSize = balance >= 1000 ? 10 : balance >= 100 ? 11.5 : 13;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('wallet.title')} · ${t('wallet.myCoins')} ${balance}`}
      style={({ pressed }) => ({
        width: 86,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Svg width={86} height={70} viewBox="0 0 100 80">
        {/* 尾巴 */}
        <Path
          d="M15 50 C7 50 5 43 9 40 C12 38 16 41 13 45"
          fill="none"
          stroke={ink}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* 后腿 / 前腿 */}
        <Rect x={27} y={58} width={12} height={17} rx={5} fill={bodyFill} stroke={ink} strokeWidth={3} />
        <Rect x={52} y={58} width={12} height={17} rx={5} fill={bodyFill} stroke={ink} strokeWidth={3} />

        {/* 耳朵 */}
        <Path
          d="M65 37 L69 17 L82 24 L81 34"
          fill={bodyFill}
          stroke={ink}
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {/* 猪鼻子（先画，身体轮廓会盖住根部） */}
        <Rect x={74} y={42} width={25} height={21} rx={7} fill={bodyFill} stroke={ink} strokeWidth={3.2} />
        <Ellipse cx={91.5} cy={51} rx={2} ry={2.8} fill={ink} />

        {/* 身体与肚皮 */}
        <Path d={BODY} fill={bodyFill} />
        <Defs>
          <ClipPath id="piggyBodyClip">
            <Path d={BODY} />
          </ClipPath>
        </Defs>
        <G clipPath="url(#piggyBodyClip)">
          <Path d="M8 53 C28 71 62 75 98 54 L100 86 L0 86 Z" fill={bellyFill} />
          <Circle cx={30} cy={36} r={13} fill="#FFFFFF" opacity={0.16} />
        </G>
        <Path d={BODY} fill="none" stroke={ink} strokeWidth={3.2} strokeLinejoin="round" />

        {/* 投币口和眼睛 */}
        <Rect x={42} y={32} width={18} height={5} rx={2.5} fill={ink} />
        <Ellipse cx={73} cy={43} rx={2.2} ry={3} fill={ink} />

        {/* 金币 */}
        <Circle cx={51} cy={12} r={8.5} fill={coinFill} stroke={ink} strokeWidth={3.2} />
        <Circle cx={47.8} cy={9} r={1.8} fill="#FFF3B0" opacity={0.95} />
      </Svg>

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 20,
          width: 44,
          top: 40,
          height: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={numberStyle(textSize, theme.text)} numberOfLines={1}>
          {balance}
        </Text>
      </View>
    </Pressable>
  );
}
