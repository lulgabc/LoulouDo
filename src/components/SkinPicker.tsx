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
  compact = false,
}: {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
  columns?: number;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const four = columns >= 4;
  const width = four ? '22%' : columns === 2 ? '48%' : '100%';
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: four ? 'space-between' : 'flex-start',
        gap: four ? 0 : 8,
        rowGap: four ? 6 : 0,
      }}
    >
      {THEME_LIST.map((th) => {
        const active = value === th.id;
        return (
          <Pressable
            key={th.id}
            onPress={() => onChange(th.id)}
            style={({ pressed }) => ({
              width,
              borderRadius: four ? 14 : 18,
              overflow: 'hidden',
              borderWidth: four ? (active ? 2 : 1) : active ? 3 : 1.5,
              borderColor: active ? th.primary : th.border,
              transform: [{ scale: pressed ? 0.97 : 1 }],
              backgroundColor: th.card,
            })}
          >
            <LinearGradient
              colors={th.bgGradient}
              style={{
                paddingVertical: four ? 7 : compact ? 9 : 10,
                paddingHorizontal: four ? 5 : compact ? 9 : 10,
                minHeight: four ? 54 : compact ? 70 : 100,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  minHeight: four ? 16 : 20,
                }}
              >
                <Text style={{ fontSize: four ? 15 : 18 }}>{th.emoji}</Text>
                {active ? (
                  <View
                    style={{
                      width: four ? 14 : compact ? 18 : undefined,
                      height: four ? 14 : compact ? 18 : undefined,
                      borderRadius: four ? 7 : 9,
                      backgroundColor: th.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: compact ? 0 : 7,
                      paddingVertical: compact ? 0 : 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: four ? 8 : compact ? 10 : 8,
                        color: '#FFFFFF',
                        fontWeight: '700',
                      }}
                    >
                      {four || compact ? '✓' : t('skin.active')}
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: four ? 2 : 3 }}>
                    {[th.primary, th.accent, th.secondary].map((c, i) => (
                      <View
                        key={i}
                        style={{
                          width: four ? 5 : 8,
                          height: four ? 5 : 8,
                          borderRadius: four ? 3 : 4,
                          backgroundColor: c,
                        }}
                      />
                    ))}
                  </View>
                )}
              </View>
              <Text
                style={{
                  ...heading(four ? 9.5 : compact ? 11.5 : 14, th.text),
                  lineHeight: four ? 12 : undefined,
                  marginTop: four ? 3 : compact ? 5 : 8,
                }}
                numberOfLines={four ? 1 : 2}
              >
                {t(`theme.${th.id}.${four ? 'short' : 'name'}`)}
              </Text>
              {compact ? null : (
                <Text style={{ fontSize: 9, color: th.textSoft, marginTop: 1 }} numberOfLines={2}>
                  {t(`theme.${th.id}.tagline`)}
                </Text>
              )}
            </LinearGradient>
          </Pressable>
        );
      })}
    </View>
  );
}
