import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle, shadowStyle } from '@/theme/themes';
import { todayISO } from '@/domain/date';
import { coinsToMoney } from '@/domain/logic';
import { CATEGORY_MAP } from '@/domain/constants';
import { Board, Btn, Card, Empty, ProgressBar, Row, Screen, SectionTitle } from '@/components/ui';
import { Ring } from '@/components/charts';
import { Coin, CoinValue } from '@/components/Coin';
import { Mascot } from '@/components/Mascot';
import { useI18n } from '@/i18n';

export default function WalletScreen() {
  const theme = useTheme();
  const { t, formatDate, formatMoney } = useI18n();
  const { entries, balance, state, activeProfile } = useApp();
  const rate = state.settings.rate;
  const value = coinsToMoney(balance, rate);

  const totals = useMemo(() => {
    let earned = 0;
    let spentCoins = 0;
    let spentMoney = 0;
    for (const e of entries) {
      if (e.type === 'redeem') {
        spentCoins += e.coins;
        spentMoney += e.money ?? 0;
      } else {
        earned += e.coins;
      }
    }
    return { earned, spentCoins, spentMoney };
  }, [entries]);

  const groups = useMemo(() => {
    const sorted = [...entries].sort((a, b) => (a.at < b.at ? 1 : -1));
    const map = new Map<string, typeof sorted>();
    for (const entry of sorted) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    return [...map.entries()];
  }, [entries]);

  const wishPct = activeProfile.wish.target > 0 ? value / activeProfile.wish.target : 0;
  const heroInk = theme.dark ? '#F7F3FF' : theme.text;

  return (
    <Screen>
      <Text style={heading(24, theme.text)}>{t('wallet.title')}</Text>
      <Text style={{ fontSize: 11, color: theme.textSoft, marginTop: 3, marginBottom: 13 }}>
        {t('wallet.rateNote', { rate })}
      </Text>

      <View
        style={{
          borderRadius: theme.radius + 2,
          overflow: 'hidden',
          marginBottom: 14,
          ...shadowStyle(theme),
        }}
      >
        <LinearGradient
          colors={theme.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 18,
            borderWidth: theme.cardBorderWidth,
            borderColor: theme.border,
            borderRadius: theme.radius + 2,
          }}
        >
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: theme.dark ? 'rgba(255,255,255,0.75)' : 'rgba(74,42,60,0.7)',
                }}
              >
                {t('wallet.myCoins')}
              </Text>
              <Row style={{ alignItems: 'flex-end', gap: 8 }}>
                <Text style={numberStyle(44, heroInk)}>{balance}</Text>
                <View style={{ marginBottom: 9 }}>
                  <Coin size={20} />
                </View>
              </Row>
              <Text style={{ fontSize: 12, color: heroInk, opacity: 0.8 }}>
                {t('wallet.worth', { money: formatMoney(value) })}
              </Text>
            </View>
            <Mascot size={78} mood={balance > 0 ? 'cheer' : 'happy'} />
          </Row>

          <Btn
            label={t('wallet.redeem')}
            emoji="💰"
            onPress={() => router.push('/redeem')}
            disabled={balance <= 0}
            style={{ marginTop: 14 }}
          />
        </LinearGradient>
      </View>

      <Board style={{ marginBottom: 14 }}>
        <View style={{ padding: 16 }}>
          <Row style={{ gap: 14 }}>
            <Ring
              value={Math.min(1, wishPct)}
              size={82}
              thickness={8}
              color={theme.candy}
              center={
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 17 }}>🎁</Text>
                  <Text style={numberStyle(11, theme.text)}>
                    {Math.round(Math.min(1, wishPct) * 100)}%
                  </Text>
                </View>
              }
            />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontSize: 10, color: theme.textSoft }}>{t('wallet.wish')}</Text>
              <Text style={heading(15, theme.text)} numberOfLines={1}>
                {activeProfile.wish.titleKey ? t(activeProfile.wish.titleKey) : activeProfile.wish.title}
              </Text>
              <ProgressBar value={wishPct} color={theme.candy} height={6} />
              <Text style={{ fontSize: 9.5, color: theme.textSoft }}>
                {t('wallet.saved', {
                  saved: formatMoney(value),
                  target: formatMoney(activeProfile.wish.target),
                })}{' '}
                ·{' '}
                {wishPct >= 1
                  ? t('wallet.targetDone')
                  : t('wallet.needMore', {
                      amount: formatMoney(Math.max(0, activeProfile.wish.target - value)),
                    })}
              </Text>
            </View>
          </Row>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel={t('wallet.editWish')}
            style={{ marginTop: 10, alignSelf: 'flex-start' }}
          >
            <Text style={{ fontSize: 10.5, color: theme.primary }}>{t('wallet.editWish')} →</Text>
          </Pressable>
        </View>

        <View style={{ height: 1, backgroundColor: theme.border, marginHorizontal: 16 }} />
        <Row style={{ padding: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9.5, color: theme.textSoft }}>{t('wallet.earnedTotal')}</Text>
            <CoinValue
              value={totals.earned}
              size={13}
              color={theme.text}
              prefix=""
              style={{ marginTop: 2 }}
            />
          </View>
          <View style={{ width: 1, backgroundColor: theme.border, marginHorizontal: 14 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9.5, color: theme.textSoft }}>{t('wallet.redeemedTotal')}</Text>
            <Text style={numberStyle(18, theme.text)}>¥ {formatMoney(totals.spentMoney)}</Text>
          </View>
        </Row>
      </Board>

      <SectionTitle
        emoji="📒"
        title={t('wallet.ledger')}
        right={<Text style={{ fontSize: 10, color: theme.textSoft }}>{t('wallet.recent')}</Text>}
      />

      {groups.length === 0 ? (
        <Card>
          <Empty emoji="💰" title={t('wallet.emptyTitle')} hint={t('wallet.emptyHint')} />
        </Card>
      ) : (
        <Board>
          {groups.map(([date, list], groupIndex) => (
            <View key={date}>
              {groupIndex > 0 ? (
                <View style={{ height: 1, backgroundColor: theme.border }} />
              ) : null}
              <Text
                style={{
                  fontSize: 10,
                  color: theme.textSoft,
                  paddingHorizontal: 16,
                  paddingTop: 12,
                  paddingBottom: 4,
                }}
              >
                {formatDate(date)}
                {date === todayISO() ? ` · ${t('common.today')}` : ''}
              </Text>
              {list.map((entry, idx) => (
                <View key={entry.id}>
                  {idx > 0 ? (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: theme.border,
                        marginHorizontal: 16,
                      }}
                    />
                  ) : null}
                  <Row style={{ paddingHorizontal: 16, paddingVertical: 10, gap: 10 }}>
                    <Text style={{ fontSize: 20 }}>
                      {entry.type === 'redeem'
                        ? '💰'
                        : entry.type === 'bonus'
                          ? (entry.emoji ?? '🎁')
                          : (entry.emoji ?? '⭐')}
                    </Text>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ ...heading(12, theme.text) }} numberOfLines={1}>
                        {entry.type === 'redeem'
                          ? t('wallet.redeemEntry', { money: formatMoney(entry.money ?? 0) })
                          : entry.type === 'bonus'
                            ? entry.labelKey
                              ? t(entry.labelKey)
                              : entry.label ?? t('wallet.bonus')
                            : entry.taskKey
                              ? t(entry.taskKey)
                              : entry.taskTitle ?? t('wallet.taskFallback')}
                      </Text>
                      <Text style={{ fontSize: 9, color: theme.textSoft, marginTop: 1 }}>
                        {entry.type === 'redeem'
                          ? t('wallet.rateSnapshot', {
                              coins: entry.coins,
                              rate: entry.rate ?? rate,
                            })
                          : entry.type === 'bonus'
                            ? t('wallet.bonus')
                            : entry.category
                              ? `${CATEGORY_MAP[entry.category].emoji} ${t(
                                  `category.${entry.category}.name`,
                                )}`
                              : t('wallet.taskFallback')}
                      </Text>
                    </View>
                    <Text
                      style={numberStyle(
                        14,
                        entry.type === 'redeem' ? theme.danger : theme.secondary,
                      )}
                    >
                      {entry.type === 'redeem' ? '-' : '+'}
                      {entry.coins}
                    </Text>
                  </Row>
                </View>
              ))}
            </View>
          ))}
        </Board>
      )}

      <Text style={{ fontSize: 10, color: theme.textSoft, textAlign: 'center', marginTop: 12 }}>
        {t('wallet.footer')}
      </Text>
    </Screen>
  );
}
