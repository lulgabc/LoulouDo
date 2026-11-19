import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle } from '@/theme/themes';
import { addDays, formatCN, shortDate, todayISO } from '@/domain/date';
import { coinsToMoney, rangeFor, statsForRange } from '@/domain/logic';
import { CATEGORIES } from '@/domain/constants';
import type { Category } from '@/types';
import { Card, Empty, Pill, Row, Screen, SectionTitle } from '@/components/ui';
import { CoinBars, Donut, Ring } from '@/components/charts';
import { Coin } from '@/components/Coin';

type Mode = 'week' | 'month' | 'all';

const MODE_LABEL: Record<Mode, string> = { week: '本周', month: '本月', all: '全部' };

export default function ReportScreen() {
  const theme = useTheme();
  const { activeProfile, tasks, entries, state } = useApp();
  const [mode, setMode] = useState<Mode>('week');
  const today = todayISO();
  const settings = state.settings;

  const { start, end } = useMemo(() => rangeFor(mode, { ...state }, today), [mode, state, today]);
  const stats = useMemo(
    () => statsForRange(tasks, entries, settings, start, end, today),
    [tasks, entries, settings, start, end, today],
  );
  const last7 = useMemo(
    () => statsForRange(tasks, entries, settings, addDays(today, -6), today, today),
    [tasks, entries, settings, today],
  );

  const catColor = (id: Category) =>
    id === 'daily'
      ? theme.primary
      : id === 'weekend'
        ? theme.accent
        : id === 'holiday'
          ? theme.secondary
          : theme.candy;

  const segments = CATEGORIES.map((cat) => ({
    label: cat.short,
    value: stats.byCategory[cat.id].coins,
    color: catColor(cat.id),
  }));
  const ratePct = Math.round(stats.completionRate * 100);
  const money = coinsToMoney(stats.earnedCoins, settings.rate);

  const summary = useMemo(() => {
    if (stats.earnedCoins === 0) {
      return `${MODE_LABEL[mode]}还没有打卡记录。挑一件最小的事开始，金币和成就感都会慢慢长出来 🌱`;
    }
    const best = stats.bestDay ? ` 最棒的一天是 ${formatCN(stats.bestDay.date)}，赚了 ${stats.bestDay.coins} 金币。` : '';
    const streak =
      stats.streak >= 3 ? ` 已经连续 ${stats.streak} 天打卡，习惯正在发芽！` : '';
    return `${activeProfile.name}${MODE_LABEL[mode]}完成 ${stats.completedChecks} 次打卡，固定任务完成率 ${ratePct}%，共赚到 ${stats.earnedCoins} 金币（约 ¥${money.toFixed(2)}）。${best}${streak}`;
  }, [stats, mode, activeProfile.name, ratePct, money]);

  const tip =
    ratePct >= 80
      ? '完成得很稳！可以试着把难度再提高一点点，或者增加一个特别挑战。'
      : ratePct >= 50
        ? '节奏不错。和孩子一起看看哪几天最容易漏掉，把任务数量调到刚刚好。'
        : '任务可能有点多。先保留 2~3 件最重要的，让成功变得容易发生。';

  const tile = (emoji: string, label: string, value: string, sub?: string) => (
    <View
      style={{
        width: '48%',
        backgroundColor: theme.cardSoft,
        borderRadius: theme.radiusSm + 4,
        padding: 12,
        gap: 2,
      }}
    >
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
      <Text style={numberStyle(19, theme.text)}>{value}</Text>
      <Text style={{ fontSize: 10, color: theme.textSoft }}>{label}</Text>
      {sub ? <Text style={{ fontSize: 9, color: theme.textSoft }}>{sub}</Text> : null}
    </View>
  );

  return (
    <Screen>
      <Text style={heading(24, theme.text)}>成长报表</Text>
      <Text style={{ fontSize: 11, color: theme.textSoft, marginTop: 3, marginBottom: 12 }}>
        每一次打卡，都会变成看得见的成长
      </Text>

      <Row style={{ gap: 8, marginBottom: 14 }}>
        {(['week', 'month', 'all'] as Mode[]).map((m) => (
          <Pill key={m} label={MODE_LABEL[m]} active={mode === m} onPress={() => setMode(m)} />
        ))}
        <Text style={{ fontSize: 10, color: theme.textSoft, marginLeft: 'auto' }}>
          {shortDate(stats.start)} - {shortDate(stats.end)}
        </Text>
      </Row>

      <Card style={{ marginBottom: 14 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 11, color: theme.textSoft }}>{MODE_LABEL[mode]}赚到的金币</Text>
            <Row style={{ alignItems: 'flex-end', gap: 7 }}>
              <Text style={numberStyle(38, theme.text)}>{stats.earnedCoins}</Text>
              <View style={{ marginBottom: 9 }}>
                <Coin size={17} />
              </View>
            </Row>
            <Text style={{ fontSize: 11, color: theme.textSoft }}>
              约 ¥{money.toFixed(2)} · 其中额外奖励 {stats.bonusCoins}
            </Text>
          </View>
          <Ring
            value={stats.completionRate}
            size={94}
            thickness={11}
            color={theme.secondary}
            center={
              <View style={{ alignItems: 'center' }}>
                <Text style={numberStyle(20, theme.text)}>{ratePct}%</Text>
                <Text style={{ fontSize: 9, color: theme.textSoft }}>完成率</Text>
              </View>
            }
          />
        </Row>
        <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Text style={numberStyle(18, theme.text)}>🔥 {stats.streak}</Text>
            <Text style={{ fontSize: 10, color: theme.textSoft }}>连续打卡天数</Text>
          </View>
          <View>
            <Text style={numberStyle(18, theme.text)}>📅 {stats.activeDays}</Text>
            <Text style={{ fontSize: 10, color: theme.textSoft }}>有打卡的天数</Text>
          </View>
          <View>
            <Text style={numberStyle(18, theme.text)}>🚀 {stats.onceCompleted}</Text>
            <Text style={{ fontSize: 10, color: theme.textSoft }}>完成挑战</Text>
          </View>
        </Row>
      </Card>

      <SectionTitle emoji="💰" title="最近 7 天金币" style={{ marginTop: 2 }} />
      <Card style={{ marginBottom: 14 }}>
        <CoinBars points={last7.series} />
      </Card>

      <SectionTitle emoji="🍭" title="金币从哪里来" />
      <Card style={{ marginBottom: 14 }}>
        <Row style={{ gap: 14, alignItems: 'center' }}>
          <Donut
            segments={segments}
            size={128}
            centerTop="总金币"
            centerMain={`${stats.earnedCoins}`}
            centerBottom={`¥${money.toFixed(2)}`}
          />
          <View style={{ flex: 1, gap: 9 }}>
            {CATEGORIES.map((cat) => {
              const value = stats.byCategory[cat.id];
              const max = Math.max(1, ...Object.values(stats.byCategory).map((v) => v.coins));
              return (
                <View key={cat.id}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 11, color: theme.textSoft }}>
                      {cat.emoji} {cat.short}
                    </Text>
                    <Text style={{ ...heading(11, theme.text) }}>
                      {value.coins} 枚 · {value.count}次
                    </Text>
                  </Row>
                  <View
                    style={{
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: theme.chip,
                      marginTop: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${(value.coins / max) * 100}%`,
                        height: '100%',
                        backgroundColor: catColor(cat.id),
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </Row>
        {stats.earnedCoins === 0 ? (
          <Empty emoji="🌤️" title="还没有金币记录" hint="完成第一件任务，这里就会亮起来" />
        ) : null}
      </Card>

      <SectionTitle emoji="📌" title="习惯小档案" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        {tile('🎯', '固定任务完成率', `${ratePct}%`, `${stats.completedFixed}/${stats.expectedChecks} 次`)}
        {tile('🏆', '最棒的一天', stats.bestDay ? shortDate(stats.bestDay.date) : '—', stats.bestDay ? `${stats.bestDay.coins} 金币` : '继续加油')}
        {tile('⭐', '最常完成', stats.topTask ? stats.topTask.title : '—', stats.topTask ? `${stats.topTask.emoji} ${stats.topTask.count} 次` : undefined)}
        {tile('💰', '兑换零花钱', `¥${stats.redeemedMoney.toFixed(2)}`, `${stats.redeemedCoins} 金币已兑换`)}
      </View>

      <Card style={{ backgroundColor: theme.chip, marginBottom: 16 }}>
        <Text style={{ ...heading(14, theme.text), marginBottom: 5 }}>👨‍👩‍👧 家长小报告</Text>
        <Text style={{ fontSize: 11.5, color: theme.textSoft, lineHeight: 19 }}>{summary}</Text>
        <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 9 }} />
        <Text style={{ fontSize: 11, color: theme.text, lineHeight: 18 }}>💡 {tip}</Text>
      </Card>

      <Card onPress={() => router.push('/wallet')} style={{ marginBottom: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Text style={heading(14, theme.text)}>去钱包看看金币余额</Text>
            <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 2 }}>
              可以把金币换成零花钱哦
            </Text>
          </View>
          <Text style={{ fontSize: 22 }}>💰 →</Text>
        </Row>
      </Card>
    </Screen>
  );
}
