import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/store/AppStore';
import { useTheme, shadowStyle, heading } from '@/theme/themes';
import { useI18n } from '@/i18n';

type TabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
  navigateToTab: (routeKey: string) => void;
};

const META: Record<string, { icon: string; key: string }> = {
  index: { icon: '🏡', key: 'today' },
  tasks: { icon: '🗂️', key: 'tasks' },
  report: { icon: '📊', key: 'report' },
  wallet: { icon: '👛', key: 'wallet' },
  settings: { icon: '⚙️', key: 'settings' },
};

function TabBar({ state, navigateToTab }: TabBarProps) {
  const theme = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.barWrap, { bottom: Math.max(insets.bottom, 10) }]}
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.tabBg,
            borderColor: theme.border,
            borderWidth: theme.cardBorderWidth,
          },
          shadowStyle(theme),
        ]}
      >
        {state.routes.map((route, index) => {
        const focused = state.index === index;
        const meta = META[route.name] ?? { icon: '⭐', key: route.name };
        const label = t(`tab.${meta.key}`);
        const onPress = () => {
          if (!focused) navigateToTab(route.key);
        };
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            style={styles.item}
          >
            <View
              style={{
                width: 42,
                height: 30,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? theme.chip : 'transparent',
                borderWidth: focused && theme.borderWidth > 1 ? 2 : 0,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.7 }}>{meta.icon}</Text>
            </View>
            <Text
              style={{
                ...heading(9.5, focused ? theme.text : theme.textSoft),
                marginTop: 2,
                opacity: focused ? 1 : 0.9,
              }}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { hydrated, state } = useApp();
  if (!hydrated) return null;
  if (!state.onboarded) return <Redirect href="/welcome" />;

  return (
    <Tabs
      tabBar={(props) => <TabBar {...(props as unknown as TabBarProps)} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="report" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 50,
  },
  bar: {
    width: '100%',
    maxWidth: 560,
    height: 64,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
  },
});
