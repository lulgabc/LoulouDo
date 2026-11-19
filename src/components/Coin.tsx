import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { numberStyle } from '@/theme/themes';

/** 一枚小金币，金色比系统 🪙（银色）更适合糖果风。 */
export function Coin({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill="#F2A93B" />
      <Circle cx={12} cy={12} r={8.6} fill="#FFD469" />
      <Path
        d="M12 6.6 l1.7 3.3 3.6 .5 -2.6 2.6 .6 3.6 -3.3-1.8 -3.3 1.8 .6-3.6 -2.6-2.6 3.6-.5 Z"
        fill="#C9861B"
      />
      <Circle cx={8.1} cy={7.6} r={1.7} fill="#FFF5CC" opacity={0.9} />
    </Svg>
  );
}

export function CoinValue({
  value,
  size = 12,
  color,
  prefix = '+',
  style,
}: {
  value: number | string;
  size?: number;
  color?: string;
  prefix?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <Coin size={size} />
      <Text style={{ ...numberStyle(size + 2, color), marginLeft: 3 }}>
        {prefix}
        {value}
      </Text>
    </View>
  );
}
