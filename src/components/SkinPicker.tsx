import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ThemeId } from '@/types';
import { THEME_LIST, heading } from '@/theme/themes';

export function SkinPicker({
  value,
  onChange,
  columns = 2,
}: {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
  columns?: number;
}) {
  const width = columns === 2 ? '48.5%' : '100%';
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
      {THEME_LIST.map((t) => {
        const active = value === t.id;
        return (
          <Pressable
            key={t.id}
            onPress={() => onChange(t.id)}
            style={({ pressed }) => ({
              width,
              borderRadius: 18,
              overflow: 'hidden',
              borderWidth: active ? 3 : 1.5,
              borderColor: active ? t.primary : t.border,
              transform: [{ scale: pressed ? 0.97 : 1 }],
              backgroundColor: t.card,
            })}
          >
            <LinearGradient colors={t.bgGradient} style={{ padding: 11, minHeight: 96 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 19 }}>{t.emoji}</Text>
                <View style={{ flexDirection: 'row', gap: 3 }}>
                  {[t.primary, t.accent, t.secondary].map((c, i) => (
                    <View
                      key={i}
                      style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c }}
                    />
                  ))}
                </View>
              </View>
              <Text style={{ ...heading(14, t.text), marginTop: 10 }}>{t.name}</Text>
              <Text style={{ fontSize: 9, color: t.textSoft, marginTop: 1 }} numberOfLines={1}>
                {t.tagline}
              </Text>
              {active ? (
                <View
                  style={{
                    position: 'absolute',
                    right: 9,
                    bottom: 9,
                    backgroundColor: t.primary,
                    borderRadius: 999,
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ fontSize: 8, color: '#FFFFFF', fontWeight: '700' }}>使用中</Text>
                </View>
              ) : null}
            </LinearGradient>
          </Pressable>
        );
      })}
    </View>
  );
}
