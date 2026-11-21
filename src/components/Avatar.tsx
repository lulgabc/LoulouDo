import React from 'react';
import { Image, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/themes';
import { builtInAvatarId } from '@/domain/avatars';
import { BuiltInAvatar } from '@/components/BuiltInAvatar';

/** 圆形头像：自定义图片 > 内置插画头像 > 旧数据 Emoji 兜底。 */
export function Avatar({
  uri,
  emoji,
  size,
  bg,
  borderColor,
  borderWidth = 0,
  textColor,
  textStyle,
  style,
}: {
  uri?: string;
  emoji: string;
  size: number;
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  textStyle?: TextStyle;
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
      ) : builtInAvatarId(emoji) ? (
        <BuiltInAvatar id={builtInAvatarId(emoji)!} size={inner} />
      ) : (
        <Text style={[{ fontSize: size * 0.52 }, textColor ? { color: textColor } : null, textStyle]}>
          {emoji}
        </Text>
      )}
    </View>
  );
}
