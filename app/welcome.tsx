import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useApp } from '@/store/AppStore';
import { useTheme, heading, numberStyle, shadowStyle } from '@/theme/themes';
import { DEFAULT_AVATAR, builtInAvatarId } from '@/domain/avatars';
import { Btn, Screen } from '@/components/ui';
import { BentoPanel } from '@/components/BentoPanel';
import { Avatar } from '@/components/Avatar';
import { AvatarPicker } from '@/components/AvatarPicker';
import { BuiltInAvatar } from '@/components/BuiltInAvatar';
import { SkinPicker } from '@/components/SkinPicker';
import { tapFeedback } from '@/utils/feedback';
import { useI18n } from '@/i18n';
import { LanguagePicker } from '@/components/LanguagePicker';

function StepBar({ step }: { step: number }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, marginBottom: 12 }}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: 5,
            borderRadius: 3,
            backgroundColor:
              index < step ? theme.primary + '99' : index === step ? theme.primary : theme.chip,
          }}
        />
      ))}
    </View>
  );
}

export default function WelcomeScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { state, activeProfile, completeOnboarding, setTheme, updateProfile } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);

  if (state.onboarded) return <Redirect href="/" />;

  const selectedId = builtInAvatarId(avatar);
  const customAvatar = activeProfile.avatarUri;
  const avatarName = customAvatar
    ? t('avatar.custom')
    : t(`avatar.name.${selectedId ?? 'bear'}`);

  const pickAvatar = (value: string) => {
    setAvatar(value);
    if (activeProfile.avatarUri) {
      updateProfile(activeProfile.id, { avatarUri: undefined });
    }
    tapFeedback('light');
  };

  const next = () => {
    tapFeedback('light');
    setStep((current) => Math.min(2, current + 1));
  };

  const start = () => {
    tapFeedback('success');
    completeOnboarding(name.trim() || t('welcome.defaultName'), avatar, state.settings.themeId);
    router.replace('/');
  };

  const back = (target: number) => (
    <Pressable
      onPress={() => setStep(target)}
      accessibilityRole="button"
      accessibilityLabel={t('welcome.back')}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        alignSelf: 'flex-start',
        paddingVertical: 5,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ fontSize: 17, color: theme.textSoft, marginTop: -1 }}>‹</Text>
      <Text style={{ fontSize: 11, color: theme.textSoft }}>{t('welcome.back')}</Text>
    </Pressable>
  );

  if (step === 0) {
    return (
      <Screen>
        <StepBar step={0} />

        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
            <View style={{ transform: [{ rotate: '-9deg' }], marginRight: -12, opacity: 0.95 }}>
              <BuiltInAvatar id="bunny" size={68} />
            </View>
            <View
              style={{
                zIndex: 2,
                borderRadius: 58,
                borderWidth: 3,
                borderColor: theme.card,
                overflow: 'hidden',
                ...shadowStyle(theme),
              }}
            >
              <BuiltInAvatar id="bear" size={108} />
            </View>
            <View style={{ transform: [{ rotate: '9deg' }], marginLeft: -12, opacity: 0.95 }}>
              <BuiltInAvatar id="cat" size={68} />
            </View>
          </View>

          <Text style={{ ...numberStyle(38, theme.text), marginTop: 10 }}>LoulouDo</Text>
          <Text style={{ ...heading(19, theme.text), marginTop: -2 }}>{t('welcome.brandSub')}</Text>
          <Text
            style={{
              fontSize: 11.5,
              color: theme.textSoft,
              marginTop: 8,
              textAlign: 'center',
              lineHeight: 18,
              paddingHorizontal: 12,
            }}
          >
            {t('welcome.tagline1')}
            {'\n'}
            {t('welcome.tagline2')}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginVertical: 16 }}>
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
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderWidth: theme.borderWidth,
                borderColor: theme.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 10 }}>{item.icon}</Text>
              <Text style={{ fontSize: 9.5, color: theme.text }}>{item.text}</Text>
            </View>
          ))}
        </View>

        <BentoPanel
          color={theme.secondary}
          icon="🌐"
          title={t('welcome.language')}
          subtitle={t('welcome.languageHint')}
          bodyStyle={{ padding: 10 }}
          style={{ marginBottom: 16 }}
        >
          <LanguagePicker />
        </BentoPanel>

        <Btn label={t('welcome.startSetup')} emoji="✨" onPress={next} />
        <Text
          style={{
            fontSize: 9.5,
            color: theme.textSoft,
            textAlign: 'center',
            marginTop: 12,
            lineHeight: 15,
          }}
        >
          {t('welcome.privacy')}
        </Text>
      </Screen>
    );
  }

  if (step === 1) {
    return (
      <Screen>
        <StepBar step={1} />
        {back(0)}

        <Text style={{ ...heading(24, theme.text), marginTop: 6 }}>{t('welcome.nameLabel')}</Text>

        <View style={{ alignItems: 'center', marginVertical: 14 }}>
          <Avatar
            uri={customAvatar}
            emoji={avatar}
            size={88}
            bg={theme.card}
            borderWidth={3}
            borderColor={theme.primary}
            textColor={theme.primary}
            textStyle={heading(36, theme.primary)}
          />
          <Text style={{ ...heading(13, theme.text), marginTop: 6 }}>{avatarName}</Text>
        </View>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('welcome.namePlaceholder')}
          placeholderTextColor={theme.textSoft}
          maxLength={12}
          style={{
            ...heading(15, theme.text),
            backgroundColor: theme.card,
            borderRadius: theme.radiusSm,
            paddingHorizontal: 13,
            paddingVertical: 11,
            borderWidth: theme.borderWidth,
            borderColor: theme.border,
            marginBottom: 12,
          }}
        />

        <BentoPanel
          color={theme.primary}
          icon="🧸"
          title={t('welcome.avatarLabel')}
          subtitle={t('welcome.avatarHint')}
          bodyStyle={{ padding: 12 }}
          style={{ marginBottom: 14 }}
        >
          <AvatarPicker
            value={avatar}
            uri={customAvatar}
            onSelect={pickAvatar}
            onCustom={() => router.push('/avatar')}
            size={44}
          />
        </BentoPanel>

        <Btn label={t('welcome.next')} emoji="→" onPress={next} />
      </Screen>
    );
  }

  return (
    <Screen>
      <StepBar step={2} />
      {back(1)}

      <Text style={{ ...heading(24, theme.text), marginTop: 6, marginBottom: 12 }}>
        {t('welcome.skinLabel')}
      </Text>

      <BentoPanel
        color={theme.accent}
        icon="🎨"
        title={t('settings.skins')}
        subtitle={t('welcome.themeHint')}
        bodyStyle={{ padding: 12 }}
        style={{ marginBottom: 16 }}
      >
        <SkinPicker value={state.settings.themeId} onChange={setTheme} />
      </BentoPanel>

      <Btn label={t('welcome.start')} emoji="🚀" onPress={start} />
      <Text
        style={{
          fontSize: 9.5,
          color: theme.textSoft,
          textAlign: 'center',
          marginTop: 12,
          lineHeight: 15,
        }}
      >
        {t('welcome.privacy')}
      </Text>
    </Screen>
  );
}
