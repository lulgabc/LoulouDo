import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle, shadowStyle } from '@/theme/themes';
import { formatCN, todayISO } from '@/domain/date';
import { coinsToMoney } from '@/domain/logic';
import { CATEGORY_MAP } from '@/domain/constants';
import { Btn, Card, Empty, ProgressBar, Row, Screen, SectionTitle } from '@/components/ui';
import { Ring } from '@/components/charts';
import { Mascot } from '@/components/Mascot';
import { Coin, CoinValue } from '@/components/Coin';

export default function WalletScreen() {
  const theme = useTheme();
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
      <Text style={heading(24, theme.text)}>金币钱包</Text>
      <Text style={{ fontSize: 11, color: theme.textSoft, marginTop: 3, marginBottom: 13 }}>
        {rate} 金币 = ¥1 · 零花钱由爸爸妈妈保管
      </Text>

      <View style={{ borderRadius: theme.radius + 6, overflow: 'hidden', marginBottom: 16, ...shadowStyle(theme) }}>
        <LinearGradient
          colors={theme.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 18,
            borderRadius: theme.radius + 6,
            borderWidth: theme.borderWidth,
            borderColor: theme.border,
          }}
        >
          <Row style={{ justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 11, color: theme.dark ? 'rgba(255,255,255,0.75)' : 'rgba(74,42,60,0.7)' }}>
                我的金币
              </Text>
              <Row style={{ alignItems: 'flex-end', gap: 8 }}>
                <Text style={numberStyle(44, heroInk)}>{balance}</Text>
                <View style={{ marginBottom: 9 }}>
                  <Coin size={20} />
                </View>
              </Row>
              <Text style={{ fontSize: 12, color: heroInk, opacity: 0.8 }}>
                ≈ ¥{value.toFixed(2)} 零花钱
              </Text>
            </View>
            <View style={{ opacity: 0.98 }}>
              <Mascot size={92} mood={balance > 0 ? 'cheer' : 'happy'} />
            </View>
          </Row>

          <Btn
            label="兑换零花钱"
            emoji="💰"
            onPress={() => router.push('/redeem')}
            disabled={balance <= 0}
            style={{ marginTop: 14 }}
          />
        </LinearGradient>
      </View>

      <Card style={{ marginBottom: 14 }}>
        <Row style={{ gap: 14 }}>
          <Ring
            value={Math.min(1, wishPct)}
            size={88}
            thickness={9}
            color={theme.candy}
            center={
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 18 }}>🎁</Text>
                <Text style={numberStyle(12, theme.text)}>{Math.round(Math.min(1, wishPct) * 100)}%</Text>
              </View>
            }
          />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 10, color: theme.textSoft }}>心愿存钱罐</Text>
            <Text style={heading(16, theme.text)}>{activeProfile.wish.title}</Text>
            <ProgressBar value={wishPct} color={theme.candy} height={7} />
            <Text style={{ fontSize: 10, color: theme.textSoft }}>
              已攒 ¥{value.toFixed(2)} / 目标 ¥{activeProfile.wish.target} ·{' '}
              {wishPct >= 1
                ? '目标达成，好厉害！'
                : `还差 ¥${Math.max(0, activeProfile.wish.target - value).toFixed(2)}`}
            </Text>
          </View>
        </Row>
        <Btn
          label="修改心愿"
          variant="ghost"
          small
          onPress={() => router.push('/settings')}
          style={{ marginTop: 10 }}
        />
      </Card>

      <Row style={{ gap: 10, marginBottom: 16 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            borderRadius: theme.radiusSm + 4,
            padding: 12,
            borderWidth: theme.borderWidth,
            borderColor: theme.border,
          }}
        >
          <Text style={{ fontSize: 10, color: theme.textSoft }}>累计赚到</Text>
          <CoinValue value={totals.earned} size={14} color={theme.text} prefix="" style={{ marginTop: 3 }} />
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            borderRadius: theme.radiusSm + 4,
            padding: 12,
            borderWidth: theme.borderWidth,
            borderColor: theme.border,
          }}
        >
          <Text style={{ fontSize: 10, color: theme.textSoft }}>累计兑换</Text>
          <Text style={numberStyle(20, theme.text)}>¥ {totals.spentMoney.toFixed(2)}</Text>
        </View>
      </Row>

      <SectionTitle emoji="📒" title="金币存折" right={<Text style={{ fontSize: 10, color: theme.textSoft }}>最近记录</Text>} />

      {groups.length === 0 ? (
        <Card>
          <Empty emoji="💰" title="存折还是空的" hint="完成第一件任务，就会存进第一枚金币" />
        </Card>
      ) : (
        groups.map(([date, list]) => (
          <View key={date} style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 10, color: theme.textSoft, marginBottom: 5, marginLeft: 4 }}>
              {formatCN(date)}
              {date === todayISO() ? ' · 今天' : ''}
            </Text>
            <Card style={{ paddingVertical: 4, paddingHorizontal: 14 }}>
              {list.map((entry, idx) => (
                <View key={entry.id}>
                  {idx > 0 ? <View style={{ height: 1, backgroundColor: theme.border }} /> : null}
                  <Row style={{ paddingVertical: 10, gap: 10 }}>
                    <Text style={{ fontSize: 22 }}>
                      {entry.type === 'redeem' ? '💰' : entry.type === 'bonus' ? (entry.emoji ?? '🎁') : (entry.emoji ?? '⭐')}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...heading(12.5, theme.text) }}>
                        {entry.type === 'redeem'
                          ? `兑换零花钱 ¥${(entry.money ?? 0).toFixed(2)}`
                          : entry.type === 'bonus'
                            ? entry.label ?? '奖励'
                            : entry.taskTitle ?? '任务完成'}
                      </Text>
                      <Text style={{ fontSize: 9.5, color: theme.textSoft, marginTop: 1 }}>
                        {entry.type === 'redeem'
                          ? `${entry.coins} 金币 · 汇率 ${entry.rate ?? rate}`
                          : entry.type === 'bonus'
                            ? '额外奖励'
                            : entry.category
                              ? `${CATEGORY_MAP[entry.category].emoji} ${CATEGORY_MAP[entry.category].short}任务`
                              : '任务'}
                      </Text>
                    </View>
                    <Text
                      style={numberStyle(
                        15,
                        entry.type === 'redeem' ? theme.danger : theme.secondary,
                      )}
                    >
                      {entry.type === 'redeem' ? '-' : '+'}
                      {entry.coins}
                    </Text>
                  </Row>
                </View>
              ))}
            </Card>
          </View>
        ))
      )}

      <Text style={{ fontSize: 10, color: theme.textSoft, textAlign: 'center', marginTop: 6 }}>
        金币和零花钱都由爸爸妈妈一起管理 💛
      </Text>
    </Screen>
  );
}
