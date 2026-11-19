import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ThemeId } from '@/types';
import { THEME_LIST, heading } from '@/theme/themes';
import { useI18n } from '@/i18n';

export function SkinPicker({
  value,
  onChange,
  columns = 2,
}: {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
  columns?: number;
}) {
  const { t } = useI18n();
  const width = columns === 2 ? '48%' : '100%';
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {THEME_LIST.map((th) => {
        const active = value === th.id;
        return (
          <Pressable
            key={th.id}
            onPress={() => onChange(th.id)}
            style={({ pressed }) => ({
              width,
              borderRadius: 18,
              overflow: 'hidden',
              borderWidth: active ? 3 : 1.5,
              borderColor: active ? th.primary : th.border,
              transform: [{ scale: pressed ? 0.97 : 1 }],
              backgroundColor: th.card,
            })}
          >
            <LinearGradient colors={th.bgGradient} style={{ padding: 10, minHeight: 100 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  minHeight: 20,
                }}
              >
                <Text style={{ fontSize: 18 }}>{th.emoji}</Text>
                {active ? (
                  <View
                    style={{
                      backgroundColor: th.primary,
                      borderRadius: 999,
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ fontSize: 8, color: '#FFFFFF', fontWeight: '700' }}>
                      {t('skin.active')}
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {[th.primary, th.accent, th.secondary].map((c, i) => (
                      <View
                        key={i}
                        style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c }}
                      />
                    ))}
                  </View>
                )}
              </View>
              <Text style={{ ...heading(14, th.text), marginTop: 8 }} numberOfLines={2}>
                {t(`theme.${th.id}.name`)}
              </Text>
              <Text style={{ fontSize: 9, color: th.textSoft, marginTop: 1 }} numberOfLines={2}>
                {t(`theme.${th.id}.tagline`)}
              </Text>
            </LinearGradient>
          </Pressable>
        );
      })}
    </View>
  );
}
