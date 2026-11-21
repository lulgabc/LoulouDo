import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle, shadowStyle } from '@/theme/themes';
import { todayISO } from '@/domain/date';
import { coinsToMoney } from '@/domain/logic';
import { CATEGORY_MAP } from '@/domain/constants';
import { Btn, Empty, ProgressBar, Row, Screen } from '@/components/ui';
import { BentoPanel } from '@/components/BentoPanel';
import { Ring } from '@/components/charts';
import { Coin } from '@/components/Coin';
import { Avatar } from '@/components/Avatar';
import { TaskIconOrEmoji } from '@/components/TaskIcon';
import { useI18n } from '@/i18n';

export default function WalletScreen() {
  const theme = useTheme();
  const { t, formatDate, formatMoney } = useI18n();
  const { entries, balance, state, activeProfile } = useApp();
  const [showAllLedger, setShowAllLedger] = useState(false);
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

  const flatEntries = useMemo(
    () => [...entries].sort((a, b) => (a.at < b.at ? 1 : -1)),
    [entries],
  );
  const visibleEntries = showAllLedger ? flatEntries : flatEntries.slice(0, 5);
  const groups = useMemo(() => {
    const map = new Map<string, typeof flatEntries>();
    for (const entry of visibleEntries) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    return [...map.entries()];
  }, [visibleEntries, flatEntries]);
  const hasMoreLedger = flatEntries.length > 5;

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
            <Avatar
              uri={activeProfile.avatarUri}
              emoji={activeProfile.avatar}
              size={78}
              bg={theme.dark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.62)'}
              borderWidth={2}
              borderColor={theme.card}
            />
          </Row>

          <Btn
            label={t('wallet.redeem')}
            emoji="💰"
            onPress={() => router.push('/redeem')}
            disabled={balance <= 0}
            style={{ marginTop: 14 }}
          />

          <Row
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: theme.dark ? 'rgba(255,255,255,0.18)' : 'rgba(74,42,60,0.12)',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9.5, color: heroInk, opacity: 0.7 }}>
                {t('wallet.earnedTotal')}
              </Text>
              <Row style={{ alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Coin size={13} />
                <Text style={numberStyle(16, heroInk)}>{totals.earned}</Text>
              </Row>
            </View>
            <View
              style={{
                width: 1,
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.18)' : 'rgba(74,42,60,0.12)',
                marginHorizontal: 14,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9.5, color: heroInk, opacity: 0.7 }}>
                {t('wallet.redeemedTotal')}
              </Text>
              <Text style={numberStyle(16, heroInk)}>¥ {formatMoney(totals.spentMoney)}</Text>
            </View>
          </Row>
        </LinearGradient>
      </View>

      <BentoPanel
        color={theme.candy}
        icon="🎁"
        title={t('wallet.wish')}
        subtitle={activeProfile.wish.titleKey ? t(activeProfile.wish.titleKey) : activeProfile.wish.title}
        style={{ marginBottom: 10 }}
      >
        <View style={{ padding: 14 }}>
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
            <View style={{ flex: 1, gap: 6 }}>
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
      </BentoPanel>

      <BentoPanel
        color={theme.secondary}
        icon="📒"
        title={t('wallet.ledger')}
        subtitle={t('wallet.recent')}
        style={{ marginBottom: 10 }}
      >
        {groups.length === 0 ? (
          <Empty emoji="💰" title={t('wallet.emptyTitle')} hint={t('wallet.emptyHint')} />
        ) : (
          <>
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
                    {entry.type === 'redeem' ? (
                      <Text style={{ fontSize: 20 }}>💰</Text>
                    ) : (
                      <TaskIconOrEmoji value={entry.emoji ?? '⭐'} size={21} />
                    )}
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
          {hasMoreLedger ? (
            <Pressable
              onPress={() => setShowAllLedger((value) => !value)}
              accessibilityRole="button"
              style={({ pressed }) => ({
                borderTopWidth: 1,
                borderTopColor: theme.border,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Text style={{ ...heading(11, theme.primary) }}>
                {showAllLedger
                  ? t('wallet.collapse')
                  : t('wallet.showAll', { n: flatEntries.length })}
              </Text>
            </Pressable>
          ) : null}
          </>
        )}
      </BentoPanel>

      <Text style={{ fontSize: 10, color: theme.textSoft, textAlign: 'center', marginTop: 12 }}>
        {t('wallet.footer')}
      </Text>
    </Screen>
  );
}
