import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/store/AppStore';
import { useTheme, shadowStyle, heading } from '@/theme/themes';

type TabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
  navigateToTab: (routeKey: string) => void;
};

const META: Record<string, { icon: string; label: string }> = {
  index: { icon: '🏡', label: '今日' },
  tasks: { icon: '🗂️', label: '任务' },
  report: { icon: '📊', label: '报表' },
  wallet: { icon: '👛', label: '钱包' },
  settings: { icon: '⚙️', label: '设置' },
};

function TabBar({ state, navigateToTab }: TabBarProps) {
  const theme = useTheme();
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
            borderWidth: theme.borderWidth,
          },
          shadowStyle(theme),
        ]}
      >
        {state.routes.map((route, index) => {
        const focused = state.index === index;
        const meta = META[route.name] ?? { icon: '⭐', label: route.name };
        const onPress = () => {
          if (!focused) navigateToTab(route.key);
        };
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.label}
            style={styles.item}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingHorizontal: focused ? 12 : 6,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor: focused ? theme.chip : 'transparent',
              }}
            >
              <Text style={{ fontSize: focused ? 19 : 17, opacity: focused ? 1 : 0.65 }}>
                {meta.icon}
              </Text>
              {focused ? (
                <Text style={heading(12, theme.text)} numberOfLines={1}>
                  {meta.label}
                </Text>
              ) : null}
            </View>
            {!focused ? (
              <Text style={{ fontSize: 9, color: theme.textSoft, marginTop: 1 }}>{meta.label}</Text>
            ) : null}
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
