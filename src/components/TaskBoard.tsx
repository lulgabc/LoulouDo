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
}: {
  groups: TaskGroup[];
  doneIds: Set<string>;
  coinsFor: (task: Task) => number;
  noteFor?: (task: Task) => string | undefined;
  onToggle: (task: Task, done: boolean) => void;
  onEdit?: (task: Task) => void;
  onAdd?: () => void;
  addLabel?: string;
  onAddCategory?: (category: Category) => void;
  emptyLabel?: string;
  header?: React.ReactNode;
  emptyNode?: React.ReactNode;
  /** 首页开启点击完成；任务管理页关闭 */
  completionEnabled?: boolean;
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
      {groups.map((group) => {
        const color = colorForCategory(group.category, theme);
        const meta = CATEGORY_MAP[group.category];
        const dashed = group.category === 'weekend';
        const double = group.category === 'special';
        return (
          <View key={group.category}>
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
                const done = doneIds.has(task.id);
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
                      onToggle={completionEnabled ? () => onToggle(task, done) : undefined}
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
