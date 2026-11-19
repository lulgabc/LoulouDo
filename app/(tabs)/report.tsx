import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle } from '@/theme/themes';
import { addDays, todayISO } from '@/domain/date';
import { coinsToMoney, rangeFor, statsForRange } from '@/domain/logic';
import { CATEGORIES } from '@/domain/constants';
import type { Category } from '@/types';
import { Card, Empty, Pill, Row, Screen, SectionTitle } from '@/components/ui';
import { CoinBars, Donut, Ring } from '@/components/charts';
import { Coin } from '@/components/Coin';
import { useI18n } from '@/i18n';

type Mode = 'week' | 'month' | 'all';

export default function ReportScreen() {
  const theme = useTheme();
  const { t, formatDate, formatShort, formatMoney } = useI18n();
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
    label: t(`category.${cat.id}.short`),
    value: stats.byCategory[cat.id].coins,
    color: catColor(cat.id),
  }));
  const ratePct = Math.round(stats.completionRate * 100);
  const money = coinsToMoney(stats.earnedCoins, settings.rate);
  const modeLabel = t(`report.range.${mode}`);

  const summary = useMemo(() => {
    if (stats.earnedCoins === 0) {
      return t('report.summaryEmpty', { range: modeLabel });
    }
    const base = t('report.summaryBase', {
      name: activeProfile.name,
      range: modeLabel,
      checks: stats.completedChecks,
      rate: ratePct,
      coins: stats.earnedCoins,
      money: formatMoney(money),
    });
    const best = stats.bestDay
      ? ` ${t('report.summaryBest', {
          date: formatDate(stats.bestDay.date),
          coins: stats.bestDay.coins,
        })}`
      : '';
    const streak = stats.streak >= 3 ? ` ${t('report.summaryStreak', { n: stats.streak })}` : '';
    return `${base}${best}${streak}`;
  }, [stats, activeProfile.name, ratePct, money, modeLabel, t, formatDate, formatMoney]);

  const tip = t(ratePct >= 80 ? 'report.tipHigh' : ratePct >= 50 ? 'report.tipMid' : 'report.tipLow');

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
      <Text style={heading(24, theme.text)}>{t('report.title')}</Text>
      <Text style={{ fontSize: 11, color: theme.textSoft, marginTop: 3, marginBottom: 12 }}>
        {t('report.subtitle')}
      </Text>

      <Row style={{ gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
        {(['week', 'month', 'all'] as Mode[]).map((m) => (
          <Pill key={m} label={t(`report.range.${m}`)} active={mode === m} onPress={() => setMode(m)} />
        ))}
      </Row>
      <Text style={{ fontSize: 10, color: theme.textSoft, marginBottom: 12 }}>
        {formatShort(stats.start)} - {formatShort(stats.end)}
      </Text>

      <Card style={{ marginBottom: 14 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 11, color: theme.textSoft }}>{t('report.earned')}</Text>
            <Row style={{ alignItems: 'flex-end', gap: 7 }}>
              <Text style={numberStyle(38, theme.text)}>{stats.earnedCoins}</Text>
              <View style={{ marginBottom: 9 }}>
                <Coin size={17} />
              </View>
            </Row>
            <Text style={{ fontSize: 11, color: theme.textSoft }}>
              {t('report.approx', { money: formatMoney(money), n: stats.bonusCoins })}
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
                <Text style={{ fontSize: 9, color: theme.textSoft }}>{t('report.completion')}</Text>
              </View>
            }
          />
        </Row>
        <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Text style={numberStyle(18, theme.text)}>🔥 {stats.streak}</Text>
            <Text style={{ fontSize: 10, color: theme.textSoft }}>{t('report.streakDays')}</Text>
          </View>
          <View>
            <Text style={numberStyle(18, theme.text)}>📅 {stats.activeDays}</Text>
            <Text style={{ fontSize: 10, color: theme.textSoft }}>{t('report.activeDays')}</Text>
          </View>
          <View>
            <Text style={numberStyle(18, theme.text)}>🚀 {stats.onceCompleted}</Text>
            <Text style={{ fontSize: 10, color: theme.textSoft }}>{t('report.challenges')}</Text>
          </View>
        </Row>
      </Card>

      <SectionTitle emoji="💰" title={t('report.last7')} style={{ marginTop: 2 }} />
      <Card style={{ marginBottom: 14 }}>
        <CoinBars points={last7.series} />
      </Card>

      <SectionTitle emoji="🍭" title={t('report.where')} />
      <Card style={{ marginBottom: 14 }}>
        <Row style={{ gap: 14, alignItems: 'center' }}>
          <Donut
            segments={segments}
            size={128}
            centerTop={t('report.totalCoins')}
            centerMain={`${stats.earnedCoins}`}
            centerBottom={`¥${formatMoney(money)}`}
          />
          <View style={{ flex: 1, gap: 9 }}>
            {CATEGORIES.map((cat) => {
              const value = stats.byCategory[cat.id];
              const max = Math.max(1, ...Object.values(stats.byCategory).map((v) => v.coins));
              return (
                <View key={cat.id}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 11, color: theme.textSoft }}>
                      {cat.emoji} {t(`category.${cat.id}.short`)}
                    </Text>
                    <Text style={{ ...heading(11, theme.text) }}>
                      {t('report.categoryValue', { coins: value.coins, count: value.count })}
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
          <Empty emoji="🌤️" title={t('report.emptyTitle')} hint={t('report.emptyHint')} />
        ) : null}
      </Card>

      <SectionTitle emoji="📌" title={t('report.habits')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        {tile('🎯', t('report.fixedRate'), `${ratePct}%`, t('report.checksSub', { done: stats.completedFixed, total: stats.expectedChecks }))}
        {tile(
          '🏆',
          t('report.bestDay'),
          stats.bestDay ? formatShort(stats.bestDay.date) : t('report.none'),
          stats.bestDay
            ? t('report.coinsValue', { n: stats.bestDay.coins })
            : t('report.keepGoing'),
        )}
        {tile(
          '⭐',
          t('report.mostDone'),
          stats.topTask
            ? stats.topTask.taskKey
              ? t(stats.topTask.taskKey)
              : stats.topTask.title
            : t('report.none'),
          stats.topTask
            ? `${stats.topTask.emoji} ${t('report.times', { n: stats.topTask.count })}`
            : undefined,
        )}
        {tile(
          '💰',
          t('report.redeemed'),
          `¥${formatMoney(stats.redeemedMoney)}`,
          t('report.redeemedSub', { n: stats.redeemedCoins }),
        )}
      </View>

      <Card style={{ backgroundColor: theme.chip, marginBottom: 16 }}>
        <Text style={{ ...heading(14, theme.text), marginBottom: 5 }}>👨‍👩‍👧 {t('report.parent')}</Text>
        <Text style={{ fontSize: 11.5, color: theme.textSoft, lineHeight: 19 }}>{summary}</Text>
        <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 9 }} />
        <Text style={{ fontSize: 11, color: theme.text, lineHeight: 18 }}>💡 {tip}</Text>
      </Card>

      <Card onPress={() => router.push('/wallet')} style={{ marginBottom: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Text style={heading(14, theme.text)}>{t('report.goWallet')}</Text>
            <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 2 }}>
              {t('report.goWalletHint')}
            </Text>
          </View>
          <Text style={{ fontSize: 22 }}>💰 →</Text>
        </Row>
      </Card>
    </Screen>
  );
}
