import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle } from '@/theme/themes';
import { coinsToMoney } from '@/domain/logic';
import { Btn, Card, IconBtn, Row, Screen } from '@/components/ui';
import { Confetti } from '@/components/Confetti';
import { Coin } from '@/components/Coin';
import { useI18n } from '@/i18n';
import { tapFeedback } from '@/utils/feedback';

export default function RedeemScreen() {
  const theme = useTheme();
  const { t, formatMoney, formatMoneyShort } = useI18n();
  const { balance, redeem, state } = useApp();
  const rate = state.settings.rate;
  const [raw, setRaw] = useState('');
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ coins: number; money: number } | null>(null);
  const [burst, setBurst] = useState(0);

  const coins = Number.parseInt(raw || '0', 10) || 0;
  const valid = coins > 0 && coins <= balance;
  const money = coinsToMoney(coins, rate);

  const quick = useMemo(() => {
    const items = [
      { label: formatMoneyShort(1), coins: rate },
      { label: formatMoneyShort(5), coins: rate * 5 },
      { label: formatMoneyShort(10), coins: rate * 10 },
      { label: t('redeem.quickAll'), coins: balance },
    ];
    return items.filter((item, i, arr) => item.coins > 0 && arr.findIndex((x) => x.coins === item.coins) === i);
  }, [rate, balance, t, formatMoneyShort]);

  const confirm = () => {
    if (!valid) return;
    redeem(coins);
    setResult({ coins, money });
    setDone(true);
    setBurst((b) => b + 1);
    tapFeedback('success');
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <Row style={{ gap: 10 }}>
            <IconBtn emoji="✕" onPress={() => router.back()} size={38} />
            <View>
              <Text style={heading(20, theme.text)}>{t('redeem.title')}</Text>
              <Text style={{ fontSize: 10, color: theme.textSoft }}>
                {t('redeem.rate', { rate, unit: formatMoneyShort(1) })}
              </Text>
            </View>
          </Row>
        </Row>

        {done && result ? (
          <View>
            <Card style={{ alignItems: 'center', paddingVertical: 26, gap: 8 }}>
              <Text style={{ fontSize: 60 }}>💰</Text>
              <Text style={heading(22, theme.text)}>{t('redeem.success')}</Text>
              <Text style={numberStyle(40, theme.primary)}>
                {formatMoney(result.money)}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textSoft }}>
                {t('redeem.spent', { coins: result.coins, balance })}
              </Text>
              <View style={{ height: 8 }} />
              <Text style={{ fontSize: 12, color: theme.text, textAlign: 'center', lineHeight: 19 }}>
                {t('redeem.receipt')}
              </Text>
            </Card>
            <Btn label={t('common.done')} emoji="✓" onPress={() => router.back()} style={{ marginTop: 14 }} />
            <Btn
              label={t('redeem.again')}
              variant="ghost"
              onPress={() => {
                setDone(false);
                setRaw('');
              }}
              style={{ marginTop: 10 }}
            />
          </View>
        ) : (
          <>
            <Card style={{ marginBottom: 14 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 10, color: theme.textSoft }}>{t('redeem.available')}</Text>
                  <Row style={{ gap: 6 }}>
                    <Text style={numberStyle(32, theme.text)}>{balance}</Text>
                    <Coin size={19} />
                  </Row>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10, color: theme.textSoft }}>{t('redeem.allWorth')}</Text>
                  <Text style={numberStyle(22, theme.secondary)}>
                    {formatMoney(coinsToMoney(balance, rate))}
                  </Text>
                </View>
              </Row>
            </Card>

            <Card style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 11, color: theme.textSoft, marginBottom: 7 }}>
                {t('redeem.howMany')}
              </Text>
              <TextInput
                value={raw}
                onChangeText={(text) => setRaw(text.replace(/[^0-9]/g, '').slice(0, 7))}
                placeholder={t('redeem.placeholder')}
                placeholderTextColor={theme.textSoft}
                keyboardType="number-pad"
                style={{
                  ...heading(26, theme.text),
                  backgroundColor: theme.cardSoft,
                  borderRadius: theme.radiusSm,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: theme.borderWidth,
                  borderColor: theme.border,
                }}
              />
              <Row style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {quick.map((item) => (
                  <Pressable
                    key={item.label}
                    onPress={() => setRaw(String(item.coins))}
                    style={({ pressed }) => ({
                      paddingVertical: 7,
                      paddingHorizontal: 13,
                      borderRadius: 999,
                      backgroundColor: raw === String(item.coins) ? theme.primary : theme.chip,
                      opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    <Text
                      style={heading(
                        12,
                        raw === String(item.coins) ? theme.onPrimary : theme.text,
                      )}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </Row>
              <View
                style={{
                  marginTop: 14,
                  backgroundColor: theme.cardSoft,
                  borderRadius: theme.radiusSm,
                  padding: 14,
                }}
              >
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11, color: theme.textSoft }}>{t('redeem.canGet')}</Text>
                  <Text style={numberStyle(28, valid ? theme.primary : theme.textSoft)}>
                    {valid ? formatMoney(money) : formatMoney(0)}
                  </Text>
                </Row>
                {coins > balance ? (
                  <Text style={{ fontSize: 10, color: theme.danger, marginTop: 4 }}>
                    {t('redeem.notEnough', { balance })}
                  </Text>
                ) : null}
              </View>
            </Card>

            <Btn
              label={
                valid
                  ? t('redeem.confirm', { money: formatMoney(money) })
                  : t('redeem.confirmPrompt')
              }
              emoji={valid ? '🎉' : '💰'}
              onPress={confirm}
              disabled={!valid}
            />
            <Text style={{ fontSize: 10, color: theme.textSoft, textAlign: 'center', marginTop: 12, lineHeight: 16 }}>
              {t('redeem.note')}
            </Text>
          </>
        )}
      </Screen>
      <Confetti key={burst} visible={burst > 0} onDone={() => setBurst(0)} />
    </View>
  );
}
