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
import { useI18n } from '@/i18n';

type OnceMode = 'day' | 'range';

export default function TaskEditorScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const params = useLocalSearchParams<{ id?: string; category?: string }>();
  const { tasks, state, saveTask, deleteTask } = useApp();
  const editing = useMemo(
    () => (params.id ? tasks.find((t) => t.id === params.id) : undefined),
    [params.id, tasks],
  );
  const initialCategory: Category =
    editing?.category ??
    (CATEGORIES.some((c) => c.id === params.category) ? (params.category as Category) : 'daily');

  const [title, setTitle] = useState(
    editing ? (editing.titleKey ? t(editing.titleKey) : editing.title) : '',
  );
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
  const [onceMode, setOnceMode] = useState<OnceMode>(
    editing?.kind === 'once' &&
      !!editing.startDate &&
      !!editing.endDate &&
      editing.startDate !== editing.endDate
      ? 'range'
      : editing?.kind === 'once'
        ? 'day'
        : 'range',
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
        setOnceMode('range');
      }
    }
  };

  const pickKind = (next: TaskKind) => {
    if (category === 'special') return;
    setKind(next);
    if (next === 'once' && !editing) {
      setStartDate(todayISO());
      setEndDate(addDays(todayISO(), 7));
      setOnceMode('range');
    }
  };

  const pickOnceMode = (next: OnceMode) => {
    setOnceMode(next);
    if (next === 'day') {
      setEndDate(startDate);
    } else if (endDate <= startDate) {
      setEndDate(addDays(startDate, 7));
    }
    setError('');
  };

  const submit = () => {
    if (!title.trim()) {
      setError(t('editor.errorTitle'));
      return;
    }
    const finalEnd = kind === 'once' && onceMode === 'day' ? startDate : endDate;
    if (kind === 'once') {
      if (!isISODate(startDate) || !isISODate(finalEnd)) {
        setError(t('editor.errorDate'));
        return;
      }
      if (startDate > finalEnd) {
        setError(t('editor.errorOrder'));
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
      endDate: kind === 'once' ? finalEnd : undefined,
    });
    tapFeedback('success');
    router.back();
  };

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
        <Row style={{ gap: 10, flex: 1, minWidth: 0 }}>
          <IconBtn emoji="✕" onPress={() => router.back()} size={38} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={heading(20, theme.text)} numberOfLines={1}>
              {editing ? t('editor.edit') : t('editor.new')}
            </Text>
            <Text style={{ fontSize: 10, color: theme.textSoft }} numberOfLines={2}>
              {editing ? t('editor.subtitleEdit') : t('editor.subtitleNew')}
            </Text>
          </View>
        </Row>
        <IconBtn
          emoji="✓"
          size={42}
          onPress={submit}
          label={t('common.save')}
          bg={theme.primary}
          style={{ flexShrink: 0 }}
        />
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
              {title.trim() || t('editor.previewTitle')}
            </Text>
            <Row style={{ gap: 4, marginTop: 3 }}>
              <Text style={{ fontSize: 10, color: theme.textSoft }}>
                {CATEGORY_MAP[category].emoji} {t(`category.${category}.short`)} ·{' '}
                {kind === 'once' ? t('editor.once') : t('editor.fixed')} ·
              </Text>
              <CoinValue value={coins} size={10} color={theme.textSoft} />
            </Row>
          </View>
        </Row>
      </Card>

      <Label>{t('editor.nameLabel')}</Label>
      <TextInput
        value={title}
        onChangeText={(t) => {
          setTitle(t);
          setError('');
        }}
        placeholder={t('editor.namePlaceholder')}
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

      <Label>{t('editor.emojiLabel')}</Label>
      <Card style={{ padding: 10, marginBottom: 13 }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            rowGap: 7,
          }}
        >
          {TASK_EMOJIS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              accessibilityRole="button"
              accessibilityState={{ selected: emoji === e }}
              accessibilityLabel={e}
              style={{
                width: '12%',
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                backgroundColor: emoji === e ? theme.chip : 'transparent',
                borderWidth: emoji === e ? 2 : 0,
                borderColor: theme.primary,
              }}
            >
              <Text style={{ fontSize: 20 }}>{e}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Label>{t('editor.categoryLabel')}</Label>
      <Row style={{ gap: 7, flexWrap: 'wrap', marginBottom: 5 }}>
        {CATEGORIES.map((cat) => (
          <Pill
            key={cat.id}
            label={t(`category.${cat.id}.short`)}
            emoji={cat.emoji}
            active={category === cat.id}
            onPress={() => pickCategory(cat.id)}
          />
        ))}
      </Row>
      <Text style={{ fontSize: 10, color: theme.textSoft, marginBottom: 13 }}>
        {t(`category.${category}.hint`)}
      </Text>

      <Label>{t('editor.kindLabel')}</Label>
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
          <Text style={heading(13, theme.text)}>🔁 {t('editor.fixed')}</Text>
          <Text style={{ fontSize: 9.5, color: theme.textSoft, marginTop: 3 }}>
            {t('editor.fixedHint')}
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
          <Text style={heading(13, theme.text)}>🎯 {t('editor.once')}</Text>
          <Text style={{ fontSize: 9.5, color: theme.textSoft, marginTop: 3 }}>
            {t('editor.onceHint')}
          </Text>
        </Pressable>
      </Row>

      {kind === 'once' ? (
        <>
          <Label>{t('editor.timeLabel')}</Label>
          <Row style={{ gap: 7, marginBottom: 8, flexWrap: 'wrap' }}>
            <Pill
              emoji="📅"
              label={t('editor.singleDay')}
              active={onceMode === 'day'}
              onPress={() => pickOnceMode('day')}
            />
            <Pill
              emoji="🗓️"
              label={t('editor.dateRange')}
              active={onceMode === 'range'}
              onPress={() => pickOnceMode('range')}
            />
          </Row>

          {onceMode === 'day' ? (
            <>
              <TextInput
                value={startDate}
                onChangeText={(value) => {
                  setStartDate(value);
                  setEndDate(value);
                  setError('');
                }}
                placeholder={t('editor.startPlaceholder')}
                placeholderTextColor={theme.textSoft}
                autoCapitalize="none"
                style={{
                  ...heading(13, theme.text),
                  backgroundColor: theme.card,
                  borderRadius: theme.radiusSm,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderWidth: theme.borderWidth,
                  borderColor: theme.border,
                  marginBottom: 6,
                }}
              />
              <Row style={{ gap: 7, marginBottom: 6 }}>
                <Pill label={t('editor.dayToday')} onPress={() => {
                  const value = todayISO();
                  setStartDate(value);
                  setEndDate(value);
                }} />
                <Pill label={t('editor.dayTomorrow')} onPress={() => {
                  const value = addDays(todayISO(), 1);
                  setStartDate(value);
                  setEndDate(value);
                }} />
              </Row>
            </>
          ) : (
            <>
              <Row style={{ gap: 8, marginBottom: 6 }}>
                <TextInput
                  value={startDate}
                  onChangeText={(value) => {
                    setStartDate(value);
                    setError('');
                  }}
                  placeholder={t('editor.startPlaceholder')}
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
                <Text style={{ color: theme.textSoft, alignSelf: 'center' }}>{t('holidays.to')}</Text>
                <TextInput
                  value={endDate}
                  onChangeText={(value) => {
                    setEndDate(value);
                    setError('');
                  }}
                  placeholder={t('editor.endPlaceholder')}
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
              <Row style={{ gap: 7, marginBottom: 6 }}>
                <Pill label={t('editor.startToday')} onPress={() => setStartDate(todayISO())} />
                <Pill label={t('editor.end7')} onPress={() => setEndDate(addDays(startDate, 7))} />
                <Pill label={t('editor.end30')} onPress={() => setEndDate(addDays(startDate, 30))} />
              </Row>
            </>
          )}
          <Text style={{ fontSize: 9.5, color: theme.textSoft, marginBottom: 13 }}>
            {t('editor.timeHint')}
          </Text>
        </>
      ) : null}

      <Label>{t('editor.rewardLabel')}</Label>
      <Card style={{ paddingVertical: 12, marginBottom: 4 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ gap: 6 }}>
            <Coin size={20} />
            <View>
              <Text style={numberStyle(17, theme.text)}>{t('editor.rewardValue', { n: coins })}</Text>
              <Text style={{ fontSize: 9.5, color: theme.textSoft }}>
                {customCoins === null
                  ? t('editor.followDefault', {
                      category: t(`category.${category}.short`),
                    })
                  : t('editor.customReward')}
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
            <Text style={{ fontSize: 10, color: theme.primary }}>{t('editor.resetDefault')}</Text>
          </Pressable>
        ) : null}
      </Card>

      {error ? (
        <Text style={{ fontSize: 11, color: theme.danger, marginTop: 8 }}>{error}</Text>
      ) : null}

      <Btn label={editing ? t('editor.saveChanges') : t('editor.create')} emoji="✨" onPress={submit} style={{ marginTop: 12 }} />

      {editing ? (
        <Btn
          label={confirmDelete ? t('editor.confirmDelete') : t('editor.delete')}
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
        {t('editor.hint')}
      </Text>
    </Screen>
  );
}
