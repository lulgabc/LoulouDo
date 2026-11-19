import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LOCALES, LOCALE_FLAGS, LOCALE_NAMES } from '@/i18n/locales';
import { useI18n } from '@/i18n';
import { useTheme, heading } from '@/theme/themes';

/** 七种语言的切换胶囊；horizontal 用于引导页，wrap 用于设置页。 */
export function LanguagePicker({ horizontal = false }: { horizontal?: boolean }) {
  const theme = useTheme();
  const { locale, setLocale } = useI18n();

  const chips = LOCALES.map((item) => {
    const active = item === locale;
    return (
      <Pressable
        key={item}
        onPress={() => setLocale(item)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={LOCALE_NAMES[item]}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 999,
          backgroundColor: active ? theme.primary : theme.chip,
          borderWidth: theme.borderWidth > 1 ? 2 : 1,
          borderColor: active ? theme.primary : theme.border,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text style={{ fontSize: 12 }}>{LOCALE_FLAGS[item]}</Text>
        <Text style={heading(11, active ? theme.onPrimary : theme.text)} numberOfLines={1}>
          {LOCALE_NAMES[item]}
        </Text>
      </Pressable>
    );
  });

  if (horizontal) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 2 }}
      >
        {chips}
      </ScrollView>
    );
  }

  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{chips}</View>;
}
