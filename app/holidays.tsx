import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading } from '@/theme/themes';
import { addDays, isISODate, todayISO } from '@/domain/date';
import { Btn, Card, Empty, IconBtn, Pill, Row, Screen, SectionTitle } from '@/components/ui';

export default function HolidaysScreen() {
  const theme = useTheme();
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
      setError('给假期起一个名字吧，例如「寒假」');
      return;
    }
    if (!isISODate(start) || !isISODate(end)) {
      setError('日期格式要像 2027-01-25 这样哦');
      return;
    }
    if (start > end) {
      setError('开始日期不能晚于结束日期');
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
        <View>
          <Text style={heading(20, theme.text)}>假期设置</Text>
          <Text style={{ fontSize: 10, color: theme.textSoft }}>
            这段时间里，假期任务才会出现
          </Text>
        </View>
      </Row>

      <SectionTitle emoji="📅" title="我的假期" />
      {holidays.length === 0 ? (
        <Card style={{ marginBottom: 14 }}>
          <Empty emoji="🏖️" title="还没有假期" hint="添加寒假、暑假或旅行日期，假期任务就会自动出现" />
        </Card>
      ) : (
        <Card style={{ marginBottom: 14, paddingVertical: 4, paddingHorizontal: 14 }}>
          {holidays.map((h, idx) => {
            const status = today < h.start ? '未来' : today > h.end ? '已结束' : '进行中';
            const color =
              status === '进行中' ? theme.secondary : status === '未来' ? theme.primary : theme.textSoft;
            return (
              <View key={h.id}>
                {idx > 0 ? <View style={{ height: 1, backgroundColor: theme.border }} /> : null}
                <Row style={{ paddingVertical: 11, justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Row style={{ gap: 6 }}>
                      <Text style={heading(14, theme.text)}>{h.name}</Text>
                      <View
                        style={{
                          backgroundColor: color + '22',
                          borderRadius: 999,
                          paddingHorizontal: 7,
                          paddingVertical: 1,
                        }}
                      >
                        <Text style={{ fontSize: 8.5, color }}>{status}</Text>
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
                      {confirmId === h.id ? '确认删除' : '删除'}
                    </Text>
                  </Pressable>
                </Row>
              </View>
            );
          })}
        </Card>
      )}

      <SectionTitle emoji="＋" title="添加一段假期" />
      <Card>
        {field(name, setName, '假期名字，例如「寒假」')}
        <Row style={{ gap: 8, marginTop: 8 }}>
          {field(start, setStart, '开始日期')}
          <Text style={{ color: theme.textSoft, alignSelf: 'center' }}>至</Text>
          {field(end, setEnd, '结束日期')}
        </Row>
        <Text style={{ fontSize: 9.5, color: theme.textSoft, marginTop: 6 }}>
          日期格式：YYYY-MM-DD，例如 2026-11-19
        </Text>
        <Row style={{ gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
          <Pill
            label="从今天开始 7 天"
            onPress={() => {
              setStart(today);
              setEnd(addDays(today, 6));
            }}
          />
          <Pill
            label="30 天"
            onPress={() => {
              setStart(today);
              setEnd(addDays(today, 29));
            }}
          />
        </Row>
        {error ? (
          <Text style={{ fontSize: 10.5, color: theme.danger, marginTop: 9 }}>{error}</Text>
        ) : null}
        <Btn label="添加假期" emoji="🎒" onPress={submit} style={{ marginTop: 12 }} small />
        <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 10, lineHeight: 16 }}>
          把假期理解成「允许出现假期任务的日子」：放假、旅行、夏令营都可以加进来。
        </Text>
      </Card>
    </Screen>
  );
}
