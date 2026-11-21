import React from 'react';
import { Image, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/themes';

/** 圆形头像：优先显示自定义图片，否则回退到 Emoji。 */
export function Avatar({
  uri,
  emoji,
  size,
  bg,
  borderColor,
  borderWidth = 0,
  style,
}: {
  uri?: string;
  emoji: string;
  size: number;
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const inner = Math.max(0, size - borderWidth * 2);
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg ?? theme.chip,
          borderWidth,
          borderColor: borderColor ?? theme.border,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: inner, height: inner, borderRadius: inner / 2 }}
          resizeMode="cover"
        />
      ) : (
        <Text style={{ fontSize: size * 0.52 }}>{emoji}</Text>
      )}
    </View>
  );
}
