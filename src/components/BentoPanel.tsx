import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { heading, shadowStyle, useTheme } from '@/theme/themes';

/**
 * 首页同款分类面板：彩色贴纸头部 + 白色内容区。
 * 报表、钱包、设置、任务管理都用它，保证全 App 的结构一致。
 */
export function BentoPanel({
  color,
  icon,
  title,
  subtitle,
  right,
  onAdd,
  addLabel,
  children,
  style,
  bodyStyle,
  dashed = false,
}: {
  color: string;
  icon: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  bodyStyle?: ViewStyle;
  dashed?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          borderRadius: 20,
          borderWidth: 2,
          borderColor: color + '88',
          borderStyle: dashed ? 'dashed' : 'solid',
          backgroundColor: theme.card,
          overflow: 'hidden',
          ...shadowStyle(theme),
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 10,
          paddingVertical: 8,
          backgroundColor: color + (theme.dark ? '26' : '16'),
          borderBottomWidth: 1,
          borderBottomColor: color + '33',
        }}
      >
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 16 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={heading(13, color)} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ fontSize: 9, color: theme.textSoft, marginTop: 1 }} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
        {onAdd ? (
          <Pressable
            onPress={onAdd}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={addLabel}
            style={({ pressed }) => ({
              width: 28,
              height: 28,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.card,
              borderWidth: 1.5,
              borderColor: color + '66',
              opacity: pressed ? 0.6 : 1,
              flexShrink: 0,
            })}
          >
            <Text style={{ fontSize: 17, color, marginTop: -2 }}>＋</Text>
          </Pressable>
        ) : null}
      </View>
      {children ? <View style={bodyStyle}>{children}</View> : null}
    </View>
  );
}
