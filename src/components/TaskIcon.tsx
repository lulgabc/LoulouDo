import React from 'react';
import { Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { TASK_ICON_SVG, type TaskIconId } from '@/assets/taskIcons';
import { isTaskIconId } from '@/domain/taskIcons';

/** Fluent Emoji Flat 任务图标（MIT）。 */
export function TaskIcon({ id, size = 24 }: { id: TaskIconId; size?: number }) {
  return <SvgXml xml={TASK_ICON_SVG[id]} width={size} height={size} />;
}

/** 新任务显示 SVG 图标，旧数据仍可回退到 Emoji。 */
export function TaskIconOrEmoji({ value, size = 24 }: { value: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isTaskIconId(value) ? (
        <TaskIcon id={value} size={size} />
      ) : (
        <Text style={{ fontSize: size * 0.82, lineHeight: size }}>{value || '⭐'}</Text>
      )}
    </View>
  );
}
