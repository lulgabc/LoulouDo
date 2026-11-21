import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Category, Task } from '@/types';
import { CATEGORY_MAP } from '@/domain/constants';
import { TaskCard, colorForCategory } from '@/components/TaskCard';
import { Board } from '@/components/ui';
import { useTheme, heading } from '@/theme/themes';
import { useI18n } from '@/i18n';

export interface TaskGroup {
  category: Category;
  tasks: Task[];
}

export function TaskBoard({
  groups,
  doneIds,
  coinsFor,
  noteFor,
  onToggle,
  onEdit,
  onAdd,
  addLabel,
  onAddCategory,
  emptyLabel,
  header,
  emptyNode,
  completionEnabled = true,
  emphasizeGroups = false,
}: {
  groups: TaskGroup[];
  doneIds: Set<string>;
  coinsFor: (task: Task) => number;
  noteFor?: (task: Task) => string | undefined;
  onToggle?: (task: Task, done: boolean) => void;
  onEdit?: (task: Task) => void;
  onAdd?: () => void;
  addLabel?: string;
  onAddCategory?: (category: Category) => void;
  emptyLabel?: string;
  header?: React.ReactNode;
  emptyNode?: React.ReactNode;
  /** 首页开启点击完成；任务管理页关闭 */
  completionEnabled?: boolean;
  /** 任务管理页：每个类别做成独立的彩色卡片 */
  emphasizeGroups?: boolean;
}) {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <Board>
      {header ? (
        <>
          <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8 }}>
            {header}
          </View>
          <View style={{ height: 1, backgroundColor: theme.border }} />
        </>
      ) : null}
      {groups.length === 0 && emptyNode ? emptyNode : null}
      {groups.map((group, groupIndex) => {
        const color = colorForCategory(group.category, theme);
        const meta = CATEGORY_MAP[group.category];
        const dashed = group.category === 'weekend';
        const double = group.category === 'special';
        const groupCardStyle = emphasizeGroups
          ? {
              marginHorizontal: 9,
              marginTop: 9,
              marginBottom: groupIndex === groups.length - 1 ? 9 : 0,
              borderRadius: 18,
              borderWidth: double ? 2 : 1.5,
              borderColor: color + (double ? '88' : '55'),
              borderStyle: dashed ? ('dashed' as const) : ('solid' as const),
              backgroundColor: color + (theme.dark ? '14' : '0A'),
              overflow: 'hidden' as const,
            }
          : undefined;
        return (
          <View key={group.category} style={groupCardStyle}>
            {emphasizeGroups ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 9,
                  paddingHorizontal: 11,
                  paddingVertical: 10,
                  backgroundColor: color + (theme.dark ? '26' : '16'),
                  borderBottomWidth: 1,
                  borderBottomColor: color + '33',
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    backgroundColor: color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{meta.emoji}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={heading(13.5, color)} numberOfLines={1}>
                    {t(`category.${group.category}.name`)}
                  </Text>
                  <Text style={{ fontSize: 9.5, color: theme.textSoft, marginTop: 1 }}>
                    {t('tasks.taskCount', { n: group.tasks.length })}
                  </Text>
                </View>
                {onAddCategory ? (
                  <Pressable
                    onPress={() => onAddCategory(group.category)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('common.add')} ${t(`category.${group.category}.short`)}`}
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
                    })}
                  >
                    <Text style={{ fontSize: 17, color, marginTop: -2 }}>＋</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  paddingHorizontal: 14,
                  paddingTop: 15,
                  paddingBottom: 5,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 999,
                    backgroundColor: color + (theme.dark ? '26' : '14'),
                    borderWidth: double ? 2 : 1,
                    borderColor: color + (double ? 'AA' : '55'),
                    borderStyle: dashed ? 'dashed' : 'solid',
                  }}
                >
                  <Text style={{ fontSize: 10 }}>{meta.emoji}</Text>
                  <Text style={{ ...heading(10, color), fontWeight: '700' }}>
                    {t(`category.${group.category}.short`)}
                  </Text>
                </View>
                <Text style={{ fontSize: 10, color: theme.textSoft }}>{group.tasks.length}</Text>
                <View style={{ flex: 1 }} />
                {onAddCategory ? (
                  <Pressable
                    onPress={() => onAddCategory(group.category)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('common.add')} ${t(`category.${group.category}.short`)}`}
                  >
                    <Text style={{ fontSize: 10.5, color: theme.textSoft }}>
                      ＋ {t('common.add')}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )}

            {group.tasks.length === 0 ? (
              <Text
                style={{
                  fontSize: 11,
                  color: theme.textSoft,
                  paddingHorizontal: 16,
                  paddingBottom: 14,
                }}
              >
                {emptyLabel ?? t('tasks.emptyTitle')}
              </Text>
            ) : (
              group.tasks.map((task, index) => {
                // 管理页不承载打卡：所有任务一律按未完成展示
                const done = completionEnabled && doneIds.has(task.id);
                return (
                  <View key={task.id}>
                    {index > 0 ? (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: theme.border,
                          marginLeft: 72,
                          marginRight: 14,
                        }}
                      />
                    ) : null}
                    <TaskCard
                      task={task}
                      done={done}
                      coins={coinsFor(task)}
                      note={noteFor?.(task)}
                      onToggle={
                        completionEnabled && onToggle ? () => onToggle(task, done) : undefined
                      }
                      onEdit={onEdit ? () => onEdit(task) : undefined}
                    />
                  </View>
                );
              })
            )}
          </View>
        );
      })}

      {onAdd ? (
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel={addLabel ?? t('home.addTask')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
            paddingHorizontal: 14,
            paddingVertical: 13,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: theme.chip,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16, color: theme.text, marginTop: -1 }}>＋</Text>
          </View>
          <Text style={{ ...heading(12.5, theme.textSoft) }}>{addLabel ?? t('home.addTask')}</Text>
        </Pressable>
      ) : null}
    </Board>
  );
}
