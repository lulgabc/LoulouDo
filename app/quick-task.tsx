import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle } from '@/theme/themes';
import { addDays, isISODate, todayISO } from '@/domain/date';
import { BentoPanel } from '@/components/BentoPanel';
import { Btn, IconBtn, Label, Pill, Row, Screen, Stepper } from '@/components/ui';
import { Coin } from '@/components/Coin';
import { tapFeedback } from '@/utils/feedback';
import { useI18n } from '@/i18n';

/** 首页快捷入口：只创建一个“某一天的特别任务”。 */
export default function QuickTaskScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { state, saveTask } = useApp();
  const params = useLocalSearchParams<{ date?: string }>();
  const initialDate =
    typeof params.date === 'string' && isISODate(params.date) ? params.date : todayISO();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate);
  const [coins, setCoins] = useState(state.settings.categoryCoins.special);
  const [error, setError] = useState('');

  const submit = () => {
    if (!title.trim()) {
      setError(t('quickTask.errorTitle'));
      return;
    }
    if (!isISODate(date)) {
      setError(t('quickTask.errorDate'));
      return;
    }
    saveTask({
      title,
      emoji: 'rocket',
      category: 'special',
      kind: 'once',
      coins,
      startDate: date,
      endDate: date,
      createdAt: date,
    });
    tapFeedback('success');
    router.back();
  };

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
        <Row style={{ gap: 10, flex: 1, minWidth: 0 }}>
          <IconBtn emoji="✕" onPress={() => router.back()} size={38} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ ...heading(18, theme.text), lineHeight: 21 }} numberOfLines={2}>
              {t('quickTask.title')}
            </Text>
            <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 1 }} numberOfLines={2}>
              {t('quickTask.subtitle')}
            </Text>
          </View>
        </Row>
        <IconBtn
          emoji="✓"
          size={42}
          onPress={submit}
          label={t('common.save')}
          bg={theme.candy}
          style={{ flexShrink: 0 }}
        />
      </Row>

      <BentoPanel
        color={theme.candy}
        icon="🎯"
        title={t('quickTask.formTitle')}
        subtitle={t('quickTask.subtitle')}
        bodyStyle={{ padding: 14 }}
      >
        <Label>{t('quickTask.nameLabel')}</Label>
        <TextInput
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            setError('');
          }}
          placeholder={t('quickTask.namePlaceholder')}
          placeholderTextColor={theme.textSoft}
          maxLength={24}
          style={{
            ...heading(15, theme.text),
            backgroundColor: theme.cardSoft,
            borderRadius: theme.radiusSm,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: theme.borderWidth,
            borderColor: theme.border,
            marginBottom: 14,
          }}
        />

        <Label>{t('quickTask.dateLabel')}</Label>
        <TextInput
          value={date}
          onChangeText={(value) => {
            setDate(value);
            setError('');
          }}
          placeholder={t('editor.startPlaceholder')}
          placeholderTextColor={theme.textSoft}
          autoCapitalize="none"
          style={{
            ...heading(13.5, theme.text),
            backgroundColor: theme.cardSoft,
            borderRadius: theme.radiusSm,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: theme.borderWidth,
            borderColor: theme.border,
            marginBottom: 8,
          }}
        />
        <Row style={{ gap: 7, marginBottom: 14 }}>
          <Pill
            emoji="☀️"
            label={t('quickTask.today')}
            active={date === todayISO()}
            onPress={() => {
              setDate(todayISO());
              setError('');
            }}
          />
          <Pill
            emoji="🌤️"
            label={t('quickTask.tomorrow')}
            active={date === addDays(todayISO(), 1)}
            onPress={() => {
              setDate(addDays(todayISO(), 1));
              setError('');
            }}
          />
        </Row>

        <Label>{t('quickTask.coinsLabel')}</Label>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            backgroundColor: theme.cardSoft,
            borderRadius: theme.radiusSm,
            borderWidth: theme.borderWidth,
            borderColor: theme.border,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Row style={{ gap: 6 }}>
            <Coin size={22} />
            <Text style={numberStyle(18, theme.text)}>
              {t('editor.rewardValue', { n: coins })}
            </Text>
          </Row>
          <Stepper value={coins} min={1} max={999} onChange={setCoins} compact />
        </View>
        <Text style={{ fontSize: 9.5, color: theme.textSoft, marginTop: 8 }}>
          {t('quickTask.footer')}
        </Text>
      </BentoPanel>

      {error ? (
        <Text style={{ fontSize: 11, color: theme.danger, marginTop: 10 }}>{error}</Text>
      ) : null}

      <Btn label={t('quickTask.create')} emoji="✨" onPress={submit} style={{ marginTop: 14 }} />
      <Pressable onPress={() => router.back()} style={{ marginTop: 10, alignSelf: 'center' }}>
        <Text style={{ fontSize: 10.5, color: theme.textSoft }}>{t('common.cancel')}</Text>
      </Pressable>
    </Screen>
  );
}
