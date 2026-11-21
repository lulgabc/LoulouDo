import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { numberStyle } from '@/theme/themes';

/** 一枚小金币，金色比系统 🪙（银色）更适合糖果风。 */
export function Coin({ size = 16, muted = false }: { size?: number; muted?: boolean }) {
  const outer = muted ? '#BFB7BC' : '#F2A93B';
  const inner = muted ? '#E4DEE1' : '#FFD469';
  const mark = muted ? '#9C9299' : '#C9861B';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill={outer} />
      <Circle cx={12} cy={12} r={8.6} fill={inner} />
      <Path
        d="M12 6.6 l1.7 3.3 3.6 .5 -2.6 2.6 .6 3.6 -3.3-1.8 -3.3 1.8 .6-3.6 -2.6-2.6 3.6-.5 Z"
        fill={mark}
      />
      <Circle cx={8.1} cy={7.6} r={1.7} fill="#FFFFFF" opacity={muted ? 0.7 : 0.9} />
    </Svg>
  );
}

export function CoinValue({
  value,
  size = 12,
  color,
  prefix = '+',
  style,
  muted,
}: {
  value: number | string;
  size?: number;
  color?: string;
  prefix?: string;
  style?: ViewStyle;
  muted?: boolean;
}) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <Coin size={size} muted={muted} />
      <Text style={{ ...numberStyle(size + 2, color), marginLeft: 3 }}>
        {prefix}
        {value}
      </Text>
    </View>
  );
}
