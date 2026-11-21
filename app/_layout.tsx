import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ZCOOLKuaiLe_400Regular } from '@expo-google-fonts/zcool-kuaile';
import {
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import { StoreProvider, useApp } from '@/store/AppStore';
import { THEMES, heading, applyLocaleToFonts } from '@/theme/themes';
import { htmlLang } from '@/i18n/locales';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const { state, hydrated } = useApp();
  const theme = THEMES[state.settings.themeId] ?? THEMES.candy;
  applyLocaleToFonts(state.settings.locale);
  const [fontsLoaded, fontError] = useFonts({
    ZCOOLKuaiLe_400Regular,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });
  const ready = hydrated && (fontsLoaded || Boolean(fontError));

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = htmlLang(state.settings.locale);
    }
  }, [state.settings.locale]);

  if (!ready) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <Text style={{ fontSize: 54 }}>🦌</Text>
        <Text style={[styles.loadingText, { color: theme.text }]}>LoulouDo</Text>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
          animation: 'slide_from_bottom',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="task-editor" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="redeem" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="holidays" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="avatar" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    ...heading(26),
  },
});
