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
import { Btn, Card, IconBtn, Label, Pill, Row, Screen, SectionTitle, Stepper } from '@/components/ui';
import { SkinPicker } from '@/components/SkinPicker';
import { LanguagePicker } from '@/components/LanguagePicker';
import { useI18n } from '@/i18n';

export default function SettingsScreen() {
  const theme = useTheme();
  const { t, formatMoney } = useI18n();
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
      <Text style={heading(24, theme.text)}>{t('settings.title')}</Text>
      <Text style={{ fontSize: 11, color: theme.textSoft, marginTop: 3, marginBottom: 13 }}>
        {t('settings.subtitle')}
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
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={heading(18, theme.text)} numberOfLines={1}>
                    {activeProfile.name}
                  </Text>
                  <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 3 }} numberOfLines={1}>
                    🎁 {activeProfile.wish.titleKey
                      ? t(activeProfile.wish.titleKey)
                      : activeProfile.wish.title}{' '}
                    · {t('settings.wishTarget', { target: formatMoney(activeProfile.wish.target) })}
                  </Text>
                </View>
              </Row>
              <IconBtn emoji="✏️" size={38} onPress={startEdit} label={t('settings.edit')} />
            </Row>

            <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />
            <Text style={{ fontSize: 10, color: theme.textSoft, marginBottom: 7 }}>
              {t('settings.family')}
            </Text>
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
              <Pill label={`＋ ${t('settings.add')}`} onPress={startAdd} />
            </Row>
          </>
        ) : (
          <View>
            <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={heading(16, theme.text)}>
                {mode === 'add' ? t('settings.addKid') : t('settings.editKid')}
              </Text>
              <Pill
                label={t('common.cancel')}
                onPress={() => {
                  setConfirmRemoveProfile(false);
                  setMode('view');
                }}
              />
            </Row>
            {input(name, setName, t('settings.name'))}
            {avatarRow}
            {mode === 'edit' ? (
              <View style={{ marginTop: 12 }}>
                <Label>{t('settings.wishSection')}</Label>
                {input(wishTitle, setWishTitle, t('settings.wishPlaceholder'))}
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11, color: theme.textSoft }}>{t('settings.targetAmount')}</Text>
                  <Stepper value={wishTarget} onChange={setWishTarget} step={10} min={0} max={9999} suffix="¥" />
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
      </Card>

      <SectionTitle emoji="🌐" title={t('settings.language')} />
      <Card style={{ marginBottom: 14 }}>
        <LanguagePicker />
        <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 9 }}>
          {t('settings.languageNote')}
        </Text>
      </Card>

      <SectionTitle emoji="🎨" title={t('settings.skins')} />
      <Card style={{ marginBottom: 14 }}>
        <SkinPicker value={state.settings.themeId} onChange={(id: ThemeId) => setTheme(id)} />
        <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 9 }}>
          {t('settings.skinsNote')}
        </Text>
      </Card>

      <SectionTitle emoji="💰" title={t('settings.coinsRules')} />
      <Card style={{ marginBottom: 14 }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={heading(14, theme.text)}>{t('settings.rate')}</Text>
            <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 2 }}>
              {t('settings.rateValue', { rate: state.settings.rate })}
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
          <Row key={cat.id} style={{ justifyContent: 'space-between', paddingVertical: 7, gap: 8 }}>
            <Row style={{ gap: 7, flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{ ...heading(12.5, theme.text), lineHeight: 15 }}
                  numberOfLines={2}
                >
                  {t(`category.${cat.id}.name`)}
                </Text>
                <Text style={{ fontSize: 9, color: theme.textSoft }} numberOfLines={1}>
                  {t('settings.categoryDefault')}
                </Text>
              </View>
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
        <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 4 }}>
          {t('settings.rateHint')}
        </Text>
      </Card>

      <SectionTitle emoji="🏖️" title={t('settings.holidays')} />
      <Card onPress={() => router.push('/holidays')} style={{ marginBottom: 14 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={heading(14, theme.text)}>
              {activeHoliday
                ? t('settings.inHoliday', {
                    name: activeHoliday.nameKey ? t(activeHoliday.nameKey) : activeHoliday.name,
                  })
                : t('settings.notHoliday')}
            </Text>
            <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 3 }}>
              {t('settings.holidayCount', { n: state.settings.holidays.length })}
            </Text>
          </View>
          <Text style={{ fontSize: 20 }}>→</Text>
        </Row>
      </Card>

      <SectionTitle emoji="🧸" title={t('settings.about')} />
      <Card>
        <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={heading(14, theme.text)}>LoulouDo</Text>
          <Text style={numberStyle(12, theme.textSoft)}>
            v{Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </Row>
        <Text style={{ fontSize: 10.5, color: theme.textSoft, lineHeight: 17 }}>
          {t('settings.aboutBody')}
        </Text>
        <View style={{ height: 12 }} />
        <Btn
          label={confirmReset ? t('settings.confirmClear') : t('settings.clearData')}
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
            <Text style={{ fontSize: 10, color: theme.textSoft, textAlign: 'center' }}>
              {t('common.cancel')}
            </Text>
          </Pressable>
        ) : null}
        <Text style={{ fontSize: 9.5, color: theme.textSoft, textAlign: 'center', marginTop: 12 }}>
          {t('settings.footer')}
        </Text>
      </Card>
    </Screen>
  );
}
