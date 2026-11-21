import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Category, Task } from '@/types';
import { CATEGORY_MAP } from '@/domain/constants';
import { BentoPanel } from '@/components/BentoPanel';
import { Coin } from '@/components/Coin';
import { colorForCategory } from '@/theme/categoryColors';
import { heading, numberStyle, useTheme } from '@/theme/themes';
import { useI18n } from '@/i18n';

export interface TaskGroup {
  category: Category;
  tasks: Task[];
}

/**
 * 任务管理面板：沿用首页的分类便当结构，
 * 但所有任务都是未完成状态，只提供铅笔编辑。
 */
export function TaskBoard({
  groups,
  coinsFor,
  noteFor,
  onEdit,
  onAdd,
  addLabel,
  onAddCategory,
  emptyLabel,
  holidayActive = false,
}: {
  groups: TaskGroup[];
  coinsFor: (task: Task) => number;
  noteFor?: (task: Task) => string | undefined;
  onEdit?: (task: Task) => void;
  onAdd?: () => void;
  addLabel?: string;
  onAddCategory?: (category: Category) => void;
  emptyLabel?: string;
  holidayActive?: boolean;
}) {
  const theme = useTheme();
  const { t } = useI18n();

  const categoryNote = (category: Category) => {
    switch (category) {
      case 'daily':
        return t('bento.dailyNote');
      case 'weekend':
        return t('bento.weekendNote');
      case 'holiday':
        return holidayActive ? t('bento.holidayOn') : t('settings.notHoliday');
      case 'special':
        return t('bento.challengeNote');
      default:
        return '';
    }
  };

  return (
    <View>
      {groups.map((group) => {
        const color = colorForCategory(group.category, theme);
        const meta = CATEGORY_MAP[group.category];
        return (
          <BentoPanel
            key={group.category}
            color={color}
            icon={meta.emoji}
            title={t(`category.${group.category}.name`)}
            subtitle={`${t('tasks.taskCount', { n: group.tasks.length })} · ${categoryNote(
              group.category,
            )}`}
            dashed={group.category === 'weekend'}
            onAdd={
              onAddCategory ? () => onAddCategory(group.category) : undefined
            }
            addLabel={`${t('common.add')} ${t(`category.${group.category}.short`)}`}
            style={{ marginBottom: 10 }}
          >
            {group.tasks.length === 0 ? (
              <Text
                style={{
                  fontSize: 10.5,
                  color: theme.textSoft,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
              >
                {emptyLabel ?? t('tasks.emptyTitle')}
              </Text>
            ) : (
              group.tasks.map((task, index) => {
                const title = task.titleKey ? t(task.titleKey) : task.title;
                const note = noteFor?.(task);
                return (
                  <View key={task.id}>
                    {index > 0 ? (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: theme.border,
                          marginLeft: 52,
                          marginRight: 12,
                        }}
                      />
                    ) : null}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 9,
                        paddingHorizontal: 11,
                        paddingVertical: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 33,
                          height: 33,
                          borderRadius: 11,
                          backgroundColor: color + (theme.dark ? '2E' : '20'),
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Text style={{ fontSize: 18 }}>{task.emoji}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={heading(12.5, theme.text)} numberOfLines={2}>
                          {title}
                        </Text>
                        {note ? (
                          <Text style={{ fontSize: 9, color: theme.textSoft, marginTop: 2 }}>
                            {note}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 3,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 999,
                          backgroundColor: theme.chip,
                          borderWidth: 1,
                          borderColor: theme.border,
                          flexShrink: 0,
                        }}
                      >
                        <Coin size={11} muted />
                        <Text style={numberStyle(9.5, theme.textSoft)}>+{coinsFor(task)}</Text>
                      </View>
                      {onEdit ? (
                        <Pressable
                          onPress={() => onEdit(task)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={t('task.a11yEdit', { title })}
                          style={({ pressed }) => ({
                            paddingHorizontal: 4,
                            paddingVertical: 6,
                            opacity: pressed ? 0.5 : 0.7,
                          })}
                        >
                          <Text style={{ fontSize: 13 }}>✏️</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </BentoPanel>
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
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 11,
            borderRadius: theme.radiusSm,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: theme.border,
            backgroundColor: theme.card + '99',
            marginTop: 2,
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <Text style={{ fontSize: 16, color: theme.primary, marginTop: -1 }}>＋</Text>
          <Text style={heading(12, theme.textSoft)}>{addLabel ?? t('home.addTask')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
