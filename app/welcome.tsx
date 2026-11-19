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

export default function WelcomeScreen() {
  const theme = useTheme();
  const { state, completeOnboarding, setTheme } = useApp();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦌');

  if (state.onboarded) return <Redirect href="/" />;

  const start = () => {
    tapFeedback('success');
    completeOnboarding(name, avatar, state.settings.themeId);
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
        <Text style={{ ...heading(19, theme.text), marginTop: -2 }}>鹿鹿打卡</Text>
        <Text style={{ fontSize: 11.5, color: theme.textSoft, marginTop: 7, textAlign: 'center', lineHeight: 18 }}>
          把每天的小事，变成闪闪发光的冒险 ✨{'\n'}打卡赚金币，金币换零花钱
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginVertical: 14 }}>
        {[
          { icon: '✅', text: '每日打卡' },
          { icon: '💰', text: '金币奖励' },
          { icon: '📊', text: '成长报表' },
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

      <Card style={{ marginBottom: 13 }}>
        <Label>怎么称呼你呀？</Label>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="输入昵称，例如：小鹿"
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
        <Label>选一个你的专属小头像</Label>
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
        <Label>挑一个喜欢的皮肤（随时能换）</Label>
        <SkinPicker value={state.settings.themeId} onChange={setTheme} />
      </Card>

      <Btn label="开始我的打卡之旅" emoji="🚀" onPress={start} />
      <Text style={{ fontSize: 9.5, color: theme.textSoft, textAlign: 'center', marginTop: 10, lineHeight: 15 }}>
        数据只保存在这台设备上 · 不登录 · 无广告
      </Text>
    </Screen>
  );
}
