import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle } from '@/theme/themes';
import { addDays, todayISO } from '@/domain/date';
import { coinsToMoney, rangeFor, statsForRange } from '@/domain/logic';
import { CATEGORIES } from '@/domain/constants';
import type { Category } from '@/types';
import { Board, Empty, Row, Screen, Segmented } from '@/components/ui';
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

  const label = (emoji: string, text: string) => (
    <Row style={{ gap: 6, marginBottom: 10 }}>
      <Text style={{ fontSize: 15 }}>{emoji}</Text>
      <Text style={heading(14, theme.text)}>{text}</Text>
    </Row>
  );

  const statCell = (
    emoji: string,
    value: string,
    text: string,
    sub?: string,
    topBorder = false,
    smallValue = false,
  ) => (
    <View
      style={{
        width: '50%',
        paddingVertical: 8,
        paddingTop: topBorder ? 12 : 4,
        paddingRight: 8,
        borderTopWidth: topBorder ? 1 : 0,
        borderColor: theme.border,
      }}
    >
      <Text style={{ fontSize: 10, color: theme.textSoft }}>
        {emoji} {text}
      </Text>
      <Text style={smallValue ? heading(14, theme.text) : numberStyle(20, theme.text)} numberOfLines={1}>
        {value}
      </Text>
      {sub ? <Text style={{ fontSize: 9.5, color: theme.textSoft }}>{sub}</Text> : null}
    </View>
  );

  return (
    <Screen>
      <Text style={heading(24, theme.text)}>{t('report.title')}</Text>
      <Text style={{ fontSize: 11, color: theme.textSoft, marginTop: 3, marginBottom: 12 }}>
        {t('report.subtitle')}
      </Text>

      <Segmented
        value={mode}
        onChange={setMode}
        items={(['week', 'month', 'all'] as Mode[]).map((m) => ({
          id: m,
          label: t(`report.range.${m}`),
        }))}
        style={{ marginBottom: 6 }}
      />
      <Text style={{ fontSize: 10, color: theme.textSoft, marginBottom: 12 }}>
        {formatShort(stats.start)} - {formatShort(stats.end)}
      </Text>

      <Board style={{ marginBottom: 14 }}>
        <View style={{ padding: 16 }}>
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

          <Row style={{ marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={numberStyle(18, theme.text)}>🔥 {stats.streak}</Text>
              <Text style={{ fontSize: 9.5, color: theme.textSoft }}>{t('report.streakDays')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={numberStyle(18, theme.text)}>📅 {stats.activeDays}</Text>
              <Text style={{ fontSize: 9.5, color: theme.textSoft }}>{t('report.activeDays')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={numberStyle(18, theme.text)}>🚀 {stats.onceCompleted}</Text>
              <Text style={{ fontSize: 9.5, color: theme.textSoft }}>{t('report.challenges')}</Text>
            </View>
          </Row>
        </View>

        <View style={{ height: 1, backgroundColor: theme.border, marginHorizontal: 16 }} />
        <View style={{ padding: 16, paddingBottom: 6 }}>
          {label('💰', t('report.last7'))}
          <CoinBars points={last7.series} height={100} />
        </View>
      </Board>

      <Board style={{ marginBottom: 14 }}>
        <View style={{ padding: 16 }}>
          {label('🍭', t('report.where'))}
          <Row style={{ gap: 14, alignItems: 'center' }}>
            <Donut
              segments={segments}
              size={120}
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
                      <Text style={{ fontSize: 10.5, color: theme.textSoft }}>
                        {cat.emoji} {t(`category.${cat.id}.short`)}
                      </Text>
                      <Text style={{ ...heading(10.5, theme.text) }}>
                        {t('report.categoryValue', {
                          coins: value.coins,
                          count: value.count,
                        })}
                      </Text>
                    </Row>
                    <View
                      style={{
                        height: 4,
                        borderRadius: 2,
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
                          borderRadius: 2,
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
        </View>

        <View style={{ height: 1, backgroundColor: theme.border, marginHorizontal: 16 }} />
        <View style={{ padding: 16 }}>
          {label('📌', t('report.habits'))}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {statCell(
              '🎯',
              `${ratePct}%`,
              t('report.fixedRate'),
              t('report.checksSub', {
                done: stats.completedFixed,
                total: stats.expectedChecks,
              }),
            )}
            {statCell(
              '🏆',
              stats.bestDay ? formatShort(stats.bestDay.date) : t('report.none'),
              t('report.bestDay'),
              stats.bestDay
                ? t('report.coinsValue', { n: stats.bestDay.coins })
                : t('report.keepGoing'),
            )}
            {statCell(
              '⭐',
              stats.topTask
                ? stats.topTask.taskKey
                  ? t(stats.topTask.taskKey)
                  : stats.topTask.title
                : t('report.none'),
              t('report.mostDone'),
              stats.topTask
                ? `${stats.topTask.emoji} ${t('report.times', { n: stats.topTask.count })}`
                : undefined,
              true,
              true,
            )}
            {statCell(
              '💰',
              `¥${formatMoney(stats.redeemedMoney)}`,
              t('report.redeemed'),
              t('report.redeemedSub', { n: stats.redeemedCoins }),
              true,
            )}
          </View>

          <View
            style={{
              backgroundColor: theme.chip,
              borderRadius: 16,
              padding: 13,
              marginTop: 12,
            }}
          >
            <Text style={{ ...heading(12.5, theme.text), marginBottom: 4 }}>
              👨‍👩‍👧 {t('report.parent')}
            </Text>
            <Text style={{ fontSize: 11, color: theme.textSoft, lineHeight: 18 }}>{summary}</Text>
            <Text style={{ fontSize: 10.5, color: theme.text, lineHeight: 17, marginTop: 8 }}>
              💡 {tip}
            </Text>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: theme.border, marginHorizontal: 16 }} />
        <Pressable
          onPress={() => router.push('/wallet')}
          accessibilityRole="button"
          accessibilityLabel={t('report.goWallet')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View>
            <Text style={heading(12.5, theme.text)}>{t('report.goWallet')}</Text>
            <Text style={{ fontSize: 9.5, color: theme.textSoft, marginTop: 1 }}>
              {t('report.goWalletHint')}
            </Text>
          </View>
          <Text style={{ fontSize: 18 }}>💰 →</Text>
        </Pressable>
      </Board>
    </Screen>
  );
}
