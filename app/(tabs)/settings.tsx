import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading } from '@/theme/themes';
import { todayISO } from '@/domain/date';
import { CATEGORIES } from '@/domain/constants';
import type { ThemeId } from '@/types';
import { AVATARS } from '@/domain/constants';
import { Board, Btn, IconBtn, Label, Pill, Row, Screen, Stepper } from '@/components/ui';
import { SkinPicker } from '@/components/SkinPicker';
import { LanguageMenu } from '@/components/LanguageMenu';
import { Avatar } from '@/components/Avatar';
import { useI18n } from '@/i18n';

export default function SettingsScreen() {
  const theme = useTheme();
  const { t, formatMoney, localeFlag, localeName } = useI18n();
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
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

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
    setName(t('welcome.defaultName'));
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
        wish: {
          title: wishTitle.trim() || t('seed.wish.default'),
          target: Math.max(0, wishTarget),
        },
      });
    }
    setMode('view');
  };

  const avatarRow = (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {AVATARS.map((a) => (
        <Pressable
          key={a}
          onPress={() => {
            setAvatar(a);
            if (activeProfile.avatarUri) {
              updateProfile(activeProfile.id, { avatarUri: undefined });
            }
          }}
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

  const sectionLabel = (emoji: string, text: string) => (
    <Row style={{ gap: 6, marginBottom: 10 }}>
      <Text style={{ fontSize: 14 }}>{emoji}</Text>
      <Text style={heading(13, theme.text)}>{text}</Text>
    </Row>
  );

  return (
    <Screen>
      <Text style={heading(24, theme.text)}>{t('settings.title')}</Text>

      <Board style={{ marginTop: 14 }}>
        {/* 宝贝资料 */}
        <View style={{ padding: 16, backgroundColor: theme.cardSoft }}>
          {mode === 'view' ? (
            <>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Row style={{ gap: 12, flex: 1, minWidth: 0 }}>
                  <Pressable
                    onPress={() => router.push('/avatar')}
                    accessibilityRole="button"
                    accessibilityLabel={t('avatar.change')}
                    style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                  >
                    <Avatar
                      uri={activeProfile.avatarUri}
                      emoji={activeProfile.avatar}
                      size={54}
                      bg={theme.chip}
                      borderWidth={1}
                      borderColor={theme.border}
                    />
                    <View
                      style={{
                        position: 'absolute',
                        right: -2,
                        bottom: -2,
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: theme.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: theme.cardSoft,
                      }}
                    >
                      <Text style={{ fontSize: 9 }}>📷</Text>
                    </View>
                  </Pressable>
                  <View style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                    <Text style={heading(18, theme.text)} numberOfLines={1}>
                      {activeProfile.name}
                    </Text>
                    <Text
                      style={{ fontSize: 10.5, color: theme.textSoft, marginTop: 4 }}
                      numberOfLines={2}
                    >
                      🎁 {activeProfile.wish.titleKey
                        ? t(activeProfile.wish.titleKey)
                        : activeProfile.wish.title}{' '}
                      · {t('settings.wishTarget', { target: formatMoney(activeProfile.wish.target) })}
                    </Text>
                  </View>
                </Row>
                <IconBtn
                  emoji="✏️"
                  size={34}
                  onPress={startEdit}
                  label={t('settings.edit')}
                  bg={theme.card}
                />
              </Row>

              <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 14, marginBottom: 7 }}>
                {t('settings.family')}
              </Text>
              <Row style={{ gap: 7, flexWrap: 'wrap' }}>
                {profiles.map((p) => {
                  const active = p.id === activeProfile.id;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => switchProfile(p.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        paddingVertical: 4,
                        paddingLeft: 4,
                        paddingRight: 11,
                        borderRadius: 999,
                        backgroundColor: active ? theme.primary : theme.chip,
                      }}
                    >
                      <Avatar
                        uri={p.avatarUri}
                        emoji={p.avatar}
                        size={22}
                        bg={active ? 'rgba(255,255,255,0.35)' : theme.card}
                      />
                      <Text style={heading(11, active ? theme.onPrimary : theme.text)}>
                        {p.name}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pill label={`＋ ${t('settings.add')}`} onPress={startAdd} />
              </Row>
            </>
          ) : (
            <View>
              <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={heading(16, theme.text)}>
                  {mode === 'add' ? t('settings.addKid') : t('settings.editKid')}
                </Text>
                <Pressable
                  onPress={() => {
                    setConfirmRemoveProfile(false);
                    setMode('view');
                  }}
                  hitSlop={8}
                >
                  <Text style={{ fontSize: 11, color: theme.textSoft }}>{t('common.cancel')}</Text>
                </Pressable>
              </Row>
              {input(name, setName, t('settings.name'))}
              <Pressable
                onPress={() => router.push('/avatar')}
                accessibilityRole="button"
                accessibilityLabel={t('avatar.custom')}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 4,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Avatar
                  uri={activeProfile.avatarUri}
                  emoji={avatar}
                  size={42}
                  bg={theme.chip}
                  borderWidth={1}
                  borderColor={theme.border}
                />
                <View>
                  <Text style={{ ...heading(12.5, theme.text) }}>{t('avatar.change')}</Text>
                  <Text style={{ fontSize: 9.5, color: theme.textSoft, marginTop: 1 }}>
                    {t('avatar.custom')}
                  </Text>
                </View>
                <View style={{ flex: 1 }} />
                <Text style={{ fontSize: 14, color: theme.textSoft }}>›</Text>
              </Pressable>
              <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 10 }} />
              {avatarRow}
              {mode === 'edit' ? (
                <View style={{ marginTop: 12 }}>
                  <Label>{t('settings.wishSection')}</Label>
                  {input(wishTitle, setWishTitle, t('settings.wishPlaceholder'))}
                  <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, color: theme.textSoft }}>
                      {t('settings.targetAmount')}
                    </Text>
                    <Stepper
                      value={wishTarget}
                      onChange={setWishTarget}
                      step={10}
                      min={0}
                      max={9999}
                      suffix="¥"
                    />
                  </Row>
                </View>
              ) : null}
              <Btn
                label={mode === 'add' ? t('settings.addKidBtn') : t('settings.saveProfile')}
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
                    {confirmRemoveProfile
                      ? t('settings.confirmDeleteKid')
                      : t('settings.deleteKid')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>

        {/* 语言与外观 */}
        <View style={{ height: 1, backgroundColor: theme.border }} />
        <View style={{ padding: 16 }}>
          {sectionLabel('🎨', t('settings.looks'))}

          <Pressable
            onPress={() => setLanguageMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('settings.language')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 8,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={heading(13, theme.text)}>{t('settings.language')}</Text>
            <Row style={{ gap: 6 }}>
              <Text style={{ fontSize: 16 }}>{localeFlag}</Text>
              <Text style={{ fontSize: 12, color: theme.textSoft }}>{localeName}</Text>
              <Text style={{ fontSize: 13, color: theme.textSoft }}>▾</Text>
            </Row>
          </Pressable>

          <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />

          <SkinPicker
            compact
            value={state.settings.themeId}
            onChange={(id: ThemeId) => setTheme(id)}
          />
        </View>

        {/* 金币与假期 */}
        <View style={{ height: 1, backgroundColor: theme.border }} />
        <View style={{ padding: 16 }}>
          {sectionLabel('💰', t('settings.rules'))}

          <Row style={{ justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
            <Text style={heading(13, theme.text)}>{t('settings.rate')}</Text>
            <Stepper
              value={state.settings.rate}
              onChange={setRate}
              step={10}
              min={10}
              max={2000}
              suffix=":1"
            />
          </Row>

          <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 10 }} />

          {CATEGORIES.map((cat) => (
            <Row
              key={cat.id}
              style={{ justifyContent: 'space-between', paddingVertical: 6, gap: 8 }}
            >
              <Row style={{ gap: 7, flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 15 }}>{cat.emoji}</Text>
                <Text
                  style={{ ...heading(12.5, theme.text), flex: 1, lineHeight: 15 }}
                  numberOfLines={2}
                >
                  {t(`category.${cat.id}.name`)}
                </Text>
              </Row>
              <Stepper
                value={state.settings.categoryCoins[cat.id]}
                onChange={(v) => setCategoryCoins(cat.id, v)}
                min={1}
                max={99}
                compact
              />
            </Row>
          ))}

          <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 10 }} />

          <Pressable
            onPress={() => router.push('/holidays')}
            accessibilityRole="button"
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 4,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={heading(13, theme.text)}>{t('settings.holidays')}</Text>
              <Text
                style={{ fontSize: 10.5, color: theme.textSoft, marginTop: 2 }}
                numberOfLines={1}
              >
                {activeHoliday
                  ? t('settings.inHoliday', {
                      name: activeHoliday.nameKey ? t(activeHoliday.nameKey) : activeHoliday.name,
                    })
                  : t('settings.notHoliday')}
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: theme.textSoft }}>›</Text>
          </Pressable>
        </View>

        {/* 数据 */}
        <View style={{ height: 1, backgroundColor: theme.border }} />
        <View style={{ padding: 16 }}>
          {sectionLabel('🧸', t('settings.dataSection'))}
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ ...heading(12, theme.text) }}>LoulouDo</Text>
            <Text style={{ fontSize: 10, color: theme.textSoft }}>
              v{Constants.expoConfig?.version ?? '1.0.0'}
            </Text>
          </Row>
          <Text style={{ fontSize: 9.5, color: theme.textSoft, marginTop: 3 }}>
            {t('settings.localOnly')}
          </Text>

          <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />

          <Pressable
            onPress={() => {
              if (!confirmReset) {
                setConfirmReset(true);
                return;
              }
              reset();
              setConfirmReset(false);
              router.replace('/welcome');
            }}
            accessibilityRole="button"
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <Text style={{ fontSize: 11.5, color: theme.danger }}>
              {confirmReset ? t('settings.confirmClear') : t('settings.clearData')}
            </Text>
            {confirmReset ? (
              <Pressable onPress={() => setConfirmReset(false)} hitSlop={8}>
                <Text style={{ fontSize: 10.5, color: theme.textSoft }}>{t('common.cancel')}</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </View>
      </Board>

      <LanguageMenu
        visible={languageMenuOpen}
        onClose={() => setLanguageMenuOpen(false)}
      />
    </Screen>
  );
}
