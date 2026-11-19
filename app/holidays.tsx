import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading } from '@/theme/themes';
import { addDays, isISODate, todayISO } from '@/domain/date';
import { Btn, Card, Empty, IconBtn, Pill, Row, Screen, SectionTitle } from '@/components/ui';
import { useI18n } from '@/i18n';

export default function HolidaysScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { state, addHoliday, removeHoliday } = useApp();
  const today = todayISO();
  const [name, setName] = useState('');
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addDays(today, 6));
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const holidays = [...state.settings.holidays].sort((a, b) => (a.start < b.start ? -1 : 1));

  const submit = () => {
    if (!name.trim()) {
      setError(t('holidays.errorName'));
      return;
    }
    if (!isISODate(start) || !isISODate(end)) {
      setError(t('holidays.errorDate'));
      return;
    }
    if (start > end) {
      setError(t('holidays.errorOrder'));
      return;
    }
    addHoliday(name.trim(), start, end);
    setName('');
    setStart(today);
    setEnd(addDays(today, 6));
    setError('');
  };

  const field = (
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    flex = 1,
  ) => (
    <TextInput
      value={value}
      onChangeText={(t) => {
        onChange(t);
        setError('');
      }}
      placeholder={placeholder}
      placeholderTextColor={theme.textSoft}
      autoCapitalize="none"
      style={{
        flex,
        minWidth: 0,
        ...heading(12.5, theme.text),
        backgroundColor: theme.cardSoft,
        borderRadius: theme.radiusSm,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderWidth: theme.borderWidth,
        borderColor: theme.border,
      }}
    />
  );

  return (
    <Screen>
      <Row style={{ gap: 10, marginBottom: 14 }}>
        <IconBtn emoji="✕" onPress={() => router.back()} size={38} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={heading(20, theme.text)} numberOfLines={1}>
            {t('holidays.title')}
          </Text>
          <Text style={{ fontSize: 10, color: theme.textSoft }} numberOfLines={2}>
            {t('holidays.subtitle')}
          </Text>
        </View>
      </Row>

      <SectionTitle emoji="📅" title={t('holidays.mine')} />
      {holidays.length === 0 ? (
        <Card style={{ marginBottom: 14 }}>
          <Empty emoji="🏖️" title={t('holidays.emptyTitle')} hint={t('holidays.emptyHint')} />
        </Card>
      ) : (
        <Card style={{ marginBottom: 14, paddingVertical: 4, paddingHorizontal: 14 }}>
          {holidays.map((h, idx) => {
            const statusKey =
              today < h.start
                ? 'holidays.statusFuture'
                : today > h.end
                  ? 'holidays.statusPast'
                  : 'holidays.statusActive';
            const color =
              statusKey === 'holidays.statusActive'
                ? theme.secondary
                : statusKey === 'holidays.statusFuture'
                  ? theme.primary
                  : theme.textSoft;
            return (
              <View key={h.id}>
                {idx > 0 ? <View style={{ height: 1, backgroundColor: theme.border }} /> : null}
                <Row style={{ paddingVertical: 11, justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Row style={{ gap: 6 }}>
                      <Text style={heading(14, theme.text)}>
                        {h.nameKey ? t(h.nameKey) : h.name}
                      </Text>
                      <View
                        style={{
                          backgroundColor: color + '22',
                          borderRadius: 999,
                          paddingHorizontal: 7,
                          paddingVertical: 1,
                        }}
                      >
                        <Text style={{ fontSize: 8.5, color }}>{t(statusKey)}</Text>
                      </View>
                    </Row>
                    <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 2 }}>
                      {h.start} → {h.end}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      if (confirmId === h.id) {
                        removeHoliday(h.id);
                        setConfirmId(null);
                      } else {
                        setConfirmId(h.id);
                      }
                    }}
                    hitSlop={8}
                  >
                    <Text style={{ fontSize: 10, color: confirmId === h.id ? theme.danger : theme.textSoft }}>
                      {confirmId === h.id ? t('holidays.confirmDelete') : t('holidays.delete')}
                    </Text>
                  </Pressable>
                </Row>
              </View>
            );
          })}
        </Card>
      )}

      <SectionTitle emoji="＋" title={t('holidays.addSection')} />
      <Card>
        {field(name, setName, t('holidays.namePlaceholder'))}
        <Row style={{ gap: 8, marginTop: 8 }}>
          {field(start, setStart, t('holidays.startPlaceholder'))}
          <Text style={{ color: theme.textSoft, alignSelf: 'center' }}>{t('holidays.to')}</Text>
          {field(end, setEnd, t('holidays.endPlaceholder'))}
        </Row>
        <Text style={{ fontSize: 9.5, color: theme.textSoft, marginTop: 6 }}>
          {t('holidays.formatHint')}
        </Text>
        <Row style={{ gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
          <Pill
            label={t('holidays.quick7')}
            onPress={() => {
              setStart(today);
              setEnd(addDays(today, 6));
            }}
          />
          <Pill
            label={t('holidays.quick30')}
            onPress={() => {
              setStart(today);
              setEnd(addDays(today, 29));
            }}
          />
        </Row>
        {error ? (
          <Text style={{ fontSize: 10.5, color: theme.danger, marginTop: 9 }}>{error}</Text>
        ) : null}
        <Btn label={t('holidays.addBtn')} emoji="🎒" onPress={submit} style={{ marginTop: 12 }} small />
        <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 10, lineHeight: 16 }}>
          {t('holidays.explainer')}
        </Text>
      </Card>
    </Screen>
  );
}
