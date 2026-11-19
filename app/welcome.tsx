import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle } from '@/theme/themes';
import { AVATARS } from '@/domain/constants';
import { Btn, Card, Label, Screen } from '@/components/ui';
import { Mascot } from '@/components/Mascot';
import { SkinPicker } from '@/components/SkinPicker';
import { tapFeedback } from '@/utils/feedback';
import { useI18n } from '@/i18n';
import { LanguagePicker } from '@/components/LanguagePicker';

export default function WelcomeScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { state, completeOnboarding, setTheme } = useApp();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦌');

  if (state.onboarded) return <Redirect href="/" />;

  const start = () => {
    tapFeedback('success');
    completeOnboarding(name.trim() || t('welcome.defaultName'), avatar, state.settings.themeId);
    router.replace('/');
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 6 }}>
        <View
          style={{
            width: 194,
            height: 194,
            borderRadius: 97,
            backgroundColor: theme.chip,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mascot size={172} mood="cheer" />
        </View>
        <Text style={{ ...numberStyle(38, theme.text), marginTop: 2 }}>LoulouDo</Text>
        <Text style={{ ...heading(19, theme.text), marginTop: -2 }}>{t('welcome.brandSub')}</Text>
        <Text style={{ fontSize: 11.5, color: theme.textSoft, marginTop: 7, textAlign: 'center', lineHeight: 18 }}>
          {t('welcome.tagline1')}{'\n'}
          {t('welcome.tagline2')}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginVertical: 14 }}>
        {[
          { icon: '✅', text: t('welcome.featureDaily') },
          { icon: '💰', text: t('welcome.featureCoins') },
          { icon: '📊', text: t('welcome.featureReport') },
        ].map((item) => (
          <View
            key={item.text}
            style={{
              backgroundColor: theme.card,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: theme.borderWidth,
              borderColor: theme.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 11 }}>{item.icon}</Text>
            <Text style={{ fontSize: 10, color: theme.text }}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginBottom: 13 }}>
        <Text style={{ fontSize: 10, color: theme.textSoft, marginBottom: 5 }}>
          🌐 {t('welcome.language')}
        </Text>
        <LanguagePicker />
      </View>

      <Card style={{ marginBottom: 13 }}>
        <Label>{t('welcome.nameLabel')}</Label>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('welcome.namePlaceholder')}
          placeholderTextColor={theme.textSoft}
          maxLength={12}
          style={{
            ...heading(15, theme.text),
            backgroundColor: theme.cardSoft,
            borderRadius: theme.radiusSm,
            paddingHorizontal: 13,
            paddingVertical: 10,
            borderWidth: theme.borderWidth,
            borderColor: theme.border,
            marginBottom: 12,
          }}
        />
        <Label>{t('welcome.avatarLabel')}</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {AVATARS.map((a) => (
            <Pressable
              key={a}
              onPress={() => setAvatar(a)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 13,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: avatar === a ? theme.chip : 'transparent',
                borderWidth: avatar === a ? 2 : 0,
                borderColor: theme.primary,
              }}
            >
              <Text style={{ fontSize: 22 }}>{a}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <Label>{t('welcome.skinLabel')}</Label>
        <SkinPicker value={state.settings.themeId} onChange={setTheme} />
      </Card>

      <Btn label={t('welcome.start')} emoji="🚀" onPress={start} />
      <Text style={{ fontSize: 9.5, color: theme.textSoft, textAlign: 'center', marginTop: 10, lineHeight: 15 }}>
        {t('welcome.privacy')}
      </Text>
    </Screen>
  );
}
