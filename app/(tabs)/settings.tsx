import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle } from '@/theme/themes';
import { todayISO } from '@/domain/date';
import { CATEGORIES } from '@/domain/constants';
import type { ThemeId } from '@/types';
import { AVATARS } from '@/domain/constants';
import { Btn, Card, Label, Pill, Row, Screen, SectionTitle, Stepper } from '@/components/ui';
import { SkinPicker } from '@/components/SkinPicker';

export default function SettingsScreen() {
  const theme = useTheme();
  const {
    state,
    activeProfile,
    profiles,
    setTheme,
    setRate,
    setCategoryCoins,
    updateProfile,
    switchProfile,
    addProfile,
    removeProfile,
    reset,
  } = useApp();

  const [mode, setMode] = useState<'view' | 'edit' | 'add'>('view');
  const [name, setName] = useState(activeProfile.name);
  const [avatar, setAvatar] = useState(activeProfile.avatar);
  const [wishTitle, setWishTitle] = useState(activeProfile.wish.title);
  const [wishTarget, setWishTarget] = useState(activeProfile.wish.target);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmRemoveProfile, setConfirmRemoveProfile] = useState(false);

  const today = todayISO();
  const activeHoliday = state.settings.holidays.find((h) => today >= h.start && today <= h.end);

  const startEdit = () => {
    setName(activeProfile.name);
    setAvatar(activeProfile.avatar);
    setWishTitle(activeProfile.wish.title);
    setWishTarget(activeProfile.wish.target);
    setConfirmRemoveProfile(false);
    setMode('edit');
  };

  const startAdd = () => {
    setName('小宝贝');
    setAvatar('🐰');
    setConfirmRemoveProfile(false);
    setMode('add');
  };

  const saveProfile = () => {
    if (mode === 'add') {
      addProfile(name, avatar);
    } else {
      updateProfile(activeProfile.id, {
        name: name.trim() || activeProfile.name,
        avatar,
        wish: { title: wishTitle.trim() || '小小愿望', target: Math.max(0, wishTarget) },
      });
    }
    setMode('view');
  };

  const avatarRow = (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {AVATARS.map((a) => (
        <Pressable
          key={a}
          onPress={() => setAvatar(a)}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: avatar === a ? theme.chip : 'transparent',
            borderWidth: avatar === a ? 2 : 0,
            borderColor: theme.primary,
          }}
        >
          <Text style={{ fontSize: 21 }}>{a}</Text>
        </Pressable>
      ))}
    </View>
  );

  const input = (value: string, onChange: (v: string) => void, placeholder: string) => (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={theme.textSoft}
      maxLength={20}
      style={{
        ...heading(14, theme.text),
        backgroundColor: theme.cardSoft,
        borderRadius: theme.radiusSm,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderWidth: theme.borderWidth,
        borderColor: theme.border,
        marginBottom: 8,
      }}
    />
  );

  return (
    <Screen>
      <Text style={heading(24, theme.text)}>设置</Text>
      <Text style={{ fontSize: 11, color: theme.textSoft, marginTop: 3, marginBottom: 13 }}>
        把 LoulouDo 调成你家的样子
      </Text>

      <Card style={{ marginBottom: 14 }}>
        {mode === 'view' ? (
          <>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ gap: 12 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: theme.chip,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 30 }}>{activeProfile.avatar}</Text>
                </View>
                <View>
                  <Text style={heading(18, theme.text)}>{activeProfile.name}</Text>
                  <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 3 }}>
                    🎁 {activeProfile.wish.title} · 目标 ¥{activeProfile.wish.target}
                  </Text>
                </View>
              </Row>
              <Pill label="编辑" onPress={startEdit} />
            </Row>

            <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />
            <Text style={{ fontSize: 10, color: theme.textSoft, marginBottom: 7 }}>家里的小宝贝</Text>
            <Row style={{ gap: 7, flexWrap: 'wrap' }}>
              {profiles.map((p) => (
                <Pill
                  key={p.id}
                  emoji={p.avatar}
                  label={p.name}
                  active={p.id === activeProfile.id}
                  onPress={() => switchProfile(p.id)}
                />
              ))}
              <Pill label="＋ 添加" onPress={startAdd} />
            </Row>
          </>
        ) : (
          <View>
            <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={heading(16, theme.text)}>
                {mode === 'add' ? '添加小宝贝' : '编辑小宝贝'}
              </Text>
              <Pill
                label="取消"
                onPress={() => {
                  setConfirmRemoveProfile(false);
                  setMode('view');
                }}
              />
            </Row>
            {input(name, setName, '宝贝的名字')}
            {avatarRow}
            {mode === 'edit' ? (
              <View style={{ marginTop: 12 }}>
                <Label>心愿存钱罐</Label>
                {input(wishTitle, setWishTitle, '例如：乐高小城堡')}
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11, color: theme.textSoft }}>目标金额（元）</Text>
                  <Stepper value={wishTarget} onChange={setWishTarget} step={10} min={0} max={9999} suffix="元" />
                </Row>
              </View>
            ) : null}
            <Btn
              label={mode === 'add' ? '添加宝贝' : '保存资料'}
              onPress={saveProfile}
              small
              style={{ marginTop: 12 }}
            />
            {mode === 'edit' && profiles.length > 1 ? (
              <Pressable
                onPress={() => {
                  if (!confirmRemoveProfile) {
                    setConfirmRemoveProfile(true);
                    return;
                  }
                  removeProfile(activeProfile.id);
                  setConfirmRemoveProfile(false);
                  setMode('view');
                }}
                style={{ marginTop: 10 }}
              >
                <Text style={{ fontSize: 10, color: theme.danger, textAlign: 'center' }}>
                  {confirmRemoveProfile ? '再点一次，确认删除资料和记录' : '删除这位宝贝的资料和记录'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </Card>

      <SectionTitle emoji="🎨" title="换一个皮肤" />
      <Card style={{ marginBottom: 14 }}>
        <SkinPicker value={state.settings.themeId} onChange={(id: ThemeId) => setTheme(id)} />
        <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 9 }}>
          立刻生效。糖果、撞色、手账、星空，今天想住在哪一个世界？
        </Text>
      </Card>

      <SectionTitle emoji="💰" title="金币规则" />
      <Card style={{ marginBottom: 14 }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={heading(14, theme.text)}>兑换汇率</Text>
            <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 2 }}>
              {state.settings.rate} 金币 = ¥1 零花钱
            </Text>
          </View>
          <Stepper
            value={state.settings.rate}
            onChange={setRate}
            step={10}
            min={10}
            max={2000}
            suffix=":1"
          />
        </Row>
        <View style={{ height: 1, backgroundColor: theme.border, marginBottom: 4 }} />
        {CATEGORIES.map((cat) => (
          <Row key={cat.id} style={{ justifyContent: 'space-between', paddingVertical: 7 }}>
            <Row style={{ gap: 7 }}>
              <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
              <View>
                <Text style={{ ...heading(12.5, theme.text) }}>{cat.name}</Text>
                <Text style={{ fontSize: 9, color: theme.textSoft }}>完成一件的默认金币</Text>
              </View>
            </Row>
            <Stepper
              value={state.settings.categoryCoins[cat.id]}
              onChange={(v) => setCategoryCoins(cat.id, v)}
              min={1}
              max={99}
            />
          </Row>
        ))}
        <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 4 }}>
          单个任务也可以单独设置奖励，以任务自己的设置为准。
        </Text>
      </Card>

      <SectionTitle emoji="🏖️" title="假期设置" />
      <Card onPress={() => router.push('/holidays')} style={{ marginBottom: 14 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={heading(14, theme.text)}>
              {activeHoliday ? `正在放「${activeHoliday.name}」` : '现在不是假期'}
            </Text>
            <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 3 }}>
              共 {state.settings.holidays.length} 段假期 · 假期任务只在假期日期出现
            </Text>
          </View>
          <Text style={{ fontSize: 20 }}>→</Text>
        </Row>
      </Card>

      <SectionTitle emoji="🧸" title="关于与数据" />
      <Card>
        <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={heading(14, theme.text)}>LoulouDo 鹿鹿打卡</Text>
          <Text style={numberStyle(12, theme.textSoft)}>
            v{Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </Row>
        <Text style={{ fontSize: 10.5, color: theme.textSoft, lineHeight: 17 }}>
          所有数据都只保存在这台设备上，不上传、不需要登录。用游戏化的小金币，
          陪孩子把好习惯慢慢养出来。
        </Text>
        <View style={{ height: 12 }} />
        <Btn
          label={confirmReset ? '再点一次，清空所有数据' : '清空所有数据'}
          variant="ghost"
          onPress={() => {
            if (!confirmReset) {
              setConfirmReset(true);
              return;
            }
            reset();
            setConfirmReset(false);
            router.replace('/welcome');
          }}
        />
        {confirmReset ? (
          <Pressable onPress={() => setConfirmReset(false)} style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 10, color: theme.textSoft, textAlign: 'center' }}>取消</Text>
          </Pressable>
        ) : null}
        <Text style={{ fontSize: 9.5, color: theme.textSoft, textAlign: 'center', marginTop: 12 }}>
          认真打卡，也认真玩耍 💛
        </Text>
      </Card>
    </Screen>
  );
}
