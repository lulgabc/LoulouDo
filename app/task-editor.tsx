import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle } from '@/theme/themes';
import { addDays, isISODate, todayISO } from '@/domain/date';
import { CATEGORIES, CATEGORY_MAP, TASK_EMOJIS } from '@/domain/constants';
import type { Category, TaskKind } from '@/types';
import { Btn, Card, IconBtn, Label, Pill, Row, Screen, Stepper } from '@/components/ui';
import { tapFeedback } from '@/utils/feedback';
import { Coin, CoinValue } from '@/components/Coin';

export default function TaskEditorScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string; category?: string }>();
  const { tasks, state, saveTask, deleteTask } = useApp();
  const editing = useMemo(
    () => (params.id ? tasks.find((t) => t.id === params.id) : undefined),
    [params.id, tasks],
  );
  const initialCategory: Category =
    editing?.category ??
    (CATEGORIES.some((c) => c.id === params.category) ? (params.category as Category) : 'daily');

  const [title, setTitle] = useState(editing?.title ?? '');
  const [emoji, setEmoji] = useState(editing?.emoji ?? '🌟');
  const [category, setCategory] = useState<Category>(initialCategory);
  const [kind, setKind] = useState<TaskKind>(editing?.kind ?? 'fixed');
  const [customCoins, setCustomCoins] = useState<number | null>(editing?.coins ?? null);
  const [startDate, setStartDate] = useState(
    editing?.startDate ?? (editing?.kind === 'once' ? editing.startDate ?? todayISO() : todayISO()),
  );
  const [endDate, setEndDate] = useState(
    editing?.endDate ?? (editing?.kind === 'once' ? editing.endDate ?? addDays(todayISO(), 7) : addDays(todayISO(), 7)),
  );
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const defaultCoins = state.settings.categoryCoins[category];
  const coins = customCoins ?? defaultCoins;

  const pickCategory = (next: Category) => {
    setCategory(next);
    if (next === 'special') {
      setKind('once');
      if (!editing) {
        setStartDate(todayISO());
        setEndDate(addDays(todayISO(), 30));
      }
    }
  };

  const pickKind = (next: TaskKind) => {
    if (category === 'special') return;
    setKind(next);
    if (next === 'once' && !editing) {
      setStartDate(todayISO());
      setEndDate(addDays(todayISO(), 7));
    }
  };

  const submit = () => {
    if (!title.trim()) {
      setError('给任务起一个名字吧');
      return;
    }
    if (kind === 'once') {
      if (!isISODate(startDate) || !isISODate(endDate)) {
        setError('日期格式要像 2026-11-19 这样哦');
        return;
      }
      if (startDate > endDate) {
        setError('开始日期不能晚于结束日期');
        return;
      }
    }
    saveTask({
      id: editing?.id,
      title,
      emoji,
      category,
      kind,
      coins: customCoins ?? undefined,
      startDate: kind === 'once' ? startDate : undefined,
      endDate: kind === 'once' ? endDate : undefined,
    });
    tapFeedback('success');
    router.back();
  };

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <Row style={{ gap: 10 }}>
          <IconBtn emoji="✕" onPress={() => router.back()} size={38} />
          <View>
            <Text style={heading(20, theme.text)}>{editing ? '编辑任务' : '新任务'}</Text>
            <Text style={{ fontSize: 10, color: theme.textSoft }}>
              {editing ? '改完记得保存' : '给今天加一点小挑战'}
            </Text>
          </View>
        </Row>
        <Btn label="保存" small onPress={submit} />
      </Row>

      <Card style={{ marginBottom: 13 }}>
        <Row style={{ gap: 12 }}>
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 19,
              backgroundColor: theme.chip,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 28 }}>{emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={heading(16, title ? theme.text : theme.textSoft)} numberOfLines={1}>
              {title.trim() || '任务名字'}
            </Text>
            <Row style={{ gap: 4, marginTop: 3 }}>
              <Text style={{ fontSize: 10, color: theme.textSoft }}>
                {CATEGORY_MAP[category].emoji} {CATEGORY_MAP[category].short} ·{' '}
                {kind === 'once' ? '单次挑战' : '固定任务'} ·
              </Text>
              <CoinValue value={coins} size={10} color={theme.textSoft} />
            </Row>
          </View>
        </Row>
      </Card>

      <Label>任务名字</Label>
      <TextInput
        value={title}
        onChangeText={(t) => {
          setTitle(t);
          setError('');
        }}
        placeholder="例如：自己整理床铺"
        placeholderTextColor={theme.textSoft}
        maxLength={24}
        style={{
          ...heading(15, theme.text),
          backgroundColor: theme.card,
          borderRadius: theme.radiusSm,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderWidth: theme.borderWidth,
          borderColor: theme.border,
          marginBottom: 13,
        }}
      />

      <Label>选一个小图标</Label>
      <Card style={{ padding: 10, marginBottom: 13 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {TASK_EMOJIS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              style={{
                width: 38,
                height: 38,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                backgroundColor: emoji === e ? theme.chip : 'transparent',
                borderWidth: emoji === e ? 2 : 0,
                borderColor: theme.primary,
              }}
            >
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Label>任务类别</Label>
      <Row style={{ gap: 7, flexWrap: 'wrap', marginBottom: 5 }}>
        {CATEGORIES.map((cat) => (
          <Pill
            key={cat.id}
            label={cat.short}
            emoji={cat.emoji}
            active={category === cat.id}
            onPress={() => pickCategory(cat.id)}
          />
        ))}
      </Row>
      <Text style={{ fontSize: 10, color: theme.textSoft, marginBottom: 13 }}>
        {CATEGORY_MAP[category].hint}
      </Text>

      <Label>重复方式</Label>
      <Row style={{ gap: 8, marginBottom: 13 }}>
        <Pressable
          onPress={() => pickKind('fixed')}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: theme.radiusSm,
            backgroundColor: kind === 'fixed' ? theme.chip : theme.card,
            borderWidth: kind === 'fixed' ? 2 : theme.borderWidth,
            borderColor: kind === 'fixed' ? theme.primary : theme.border,
            opacity: category === 'special' ? 0.4 : 1,
          }}
        >
          <Text style={heading(13, theme.text)}>🔁 固定任务</Text>
          <Text style={{ fontSize: 9.5, color: theme.textSoft, marginTop: 3 }}>
            按类别自动重复出现
          </Text>
        </Pressable>
        <Pressable
          onPress={() => pickKind('once')}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: theme.radiusSm,
            backgroundColor: kind === 'once' ? theme.chip : theme.card,
            borderWidth: kind === 'once' ? 2 : theme.borderWidth,
            borderColor: kind === 'once' ? theme.primary : theme.border,
          }}
        >
          <Text style={heading(13, theme.text)}>🎯 单次挑战</Text>
          <Text style={{ fontSize: 9.5, color: theme.textSoft, marginTop: 3 }}>
            只能完成一次的大任务
          </Text>
        </Pressable>
      </Row>

      {kind === 'once' ? (
        <>
          <Label>挑战时间</Label>
          <Row style={{ gap: 8, marginBottom: 6 }}>
            <TextInput
              value={startDate}
              onChangeText={(t) => {
                setStartDate(t);
                setError('');
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSoft}
              autoCapitalize="none"
              style={{
                flex: 1,
                ...heading(13, theme.text),
                backgroundColor: theme.card,
                borderRadius: theme.radiusSm,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: theme.borderWidth,
                borderColor: theme.border,
              }}
            />
            <Text style={{ color: theme.textSoft, alignSelf: 'center' }}>至</Text>
            <TextInput
              value={endDate}
              onChangeText={(t) => {
                setEndDate(t);
                setError('');
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSoft}
              autoCapitalize="none"
              style={{
                flex: 1,
                ...heading(13, theme.text),
                backgroundColor: theme.card,
                borderRadius: theme.radiusSm,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: theme.borderWidth,
                borderColor: theme.border,
              }}
            />
          </Row>
          <Row style={{ gap: 7, marginBottom: 13 }}>
            <Pill label="从今天开始" onPress={() => setStartDate(todayISO())} />
            <Pill label="7 天后结束" onPress={() => setEndDate(addDays(startDate, 7))} />
            <Pill label="30 天后结束" onPress={() => setEndDate(addDays(startDate, 30))} />
          </Row>
        </>
      ) : null}

      <Label>完成奖励</Label>
      <Card style={{ paddingVertical: 12, marginBottom: 4 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ gap: 6 }}>
            <Coin size={20} />
            <View>
              <Text style={numberStyle(17, theme.text)}>{coins} 金币</Text>
              <Text style={{ fontSize: 9.5, color: theme.textSoft }}>
                {customCoins === null
                  ? `跟随「${CATEGORY_MAP[category].short}」默认奖励`
                  : '自定义奖励'}
              </Text>
            </View>
          </Row>
          <Stepper
            value={coins}
            min={1}
            max={999}
            onChange={(value) => setCustomCoins(value)}
          />
        </Row>
        {customCoins !== null ? (
          <Pressable onPress={() => setCustomCoins(null)} style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 10, color: theme.primary }}>恢复类别默认奖励</Text>
          </Pressable>
        ) : null}
      </Card>

      {error ? (
        <Text style={{ fontSize: 11, color: theme.danger, marginTop: 8 }}>{error}</Text>
      ) : null}

      <Btn label={editing ? '保存修改' : '创建任务'} emoji="✨" onPress={submit} style={{ marginTop: 12 }} />

      {editing ? (
        <Btn
          label={confirmDelete ? '再点一次，确认删除' : '删除这个任务'}
          variant="ghost"
          onPress={() => {
            if (!confirmDelete) {
              setConfirmDelete(true);
              return;
            }
            deleteTask(editing.id);
            router.back();
          }}
          style={{ marginTop: 10 }}
        />
      ) : null}

      <Text style={{ fontSize: 10, color: theme.textSoft, textAlign: 'center', marginTop: 12 }}>
        任务金币可以在「设置」里调整类别默认值
      </Text>
    </Screen>
  );
}
