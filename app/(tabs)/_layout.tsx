import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/store/AppStore';
import { useTheme, heading } from '@/theme/themes';
import { useI18n } from '@/i18n';
import { TabIcon, type TabIconName } from '@/components/TabIcons';

type TabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
  navigateToTab: (routeKey: string) => void;
};

const META: Record<string, { key: TabIconName }> = {
  index: { key: 'today' },
  tasks: { key: 'tasks' },
  report: { key: 'report' },
  wallet: { key: 'wallet' },
  settings: { key: 'settings' },
};

function TabBar({ state, navigateToTab }: TabBarProps) {
  const theme = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.barWrap,
        {
          backgroundColor: theme.tabBg,
          borderTopColor: theme.border,
          borderTopWidth: Math.max(theme.cardBorderWidth, 1),
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
        const focused = state.index === index;
        const meta = META[route.name] ?? { key: 'today' as TabIconName };
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
                width: 46,
                height: 34,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? theme.chip : 'transparent',
                borderWidth: focused ? 2 : 0,
                borderColor: theme.primary,
                transform: [{ rotate: focused ? '-3deg' : '0deg' }],
              }}
            >
              <TabIcon
                name={meta.key}
                size={26}
                color={focused ? theme.primary : theme.textSoft}
                accent={focused ? theme.accent : theme.textSoft}
                cutout={theme.tabBg}
              />
            </View>
            <Text
              style={{
                ...heading(10, focused ? theme.primary : theme.textSoft),
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
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  bar: {
    width: '100%',
    maxWidth: 560,
    height: 64,
    alignSelf: 'center',
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
