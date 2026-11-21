import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { BUILTIN_AVATAR_IDS, builtInAvatar, builtInAvatarId } from '@/domain/avatars';
import { BuiltInAvatar } from '@/components/BuiltInAvatar';
import { Avatar } from '@/components/Avatar';
import { useTheme, heading } from '@/theme/themes';
import { useI18n } from '@/i18n';

/** 20 个内置插画头像 + 自定义照片入口。 */
export function AvatarPicker({
  value,
  uri,
  onSelect,
  onCustom,
  size = 46,
}: {
  value: string;
  uri?: string;
  onSelect: (value: string) => void;
  onCustom?: () => void;
  size?: number;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const current = builtInAvatarId(value);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          rowGap: 8,
        }}
      >
        {BUILTIN_AVATAR_IDS.map((id) => {
          const active = !uri && current === id;
          return (
            <Pressable
              key={id}
              onPress={() => onSelect(builtInAvatar(id))}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t(`avatar.name.${id}`)}
              style={({ pressed }) => ({
                width: size,
                height: size,
                borderRadius: size / 2,
                padding: 2,
                borderWidth: active ? 2.5 : 1.5,
                borderColor: active ? theme.primary : theme.border + '66',
                backgroundColor: theme.card,
                opacity: pressed ? 0.72 : 1,
                transform: [{ scale: active ? 1.04 : 1 }],
              })}
            >
              <BuiltInAvatar id={id} size={size - 7} />
              {active ? (
                <View
                  style={{
                    position: 'absolute',
                    right: -1,
                    bottom: -1,
                    width: 15,
                    height: 15,
                    borderRadius: 8,
                    backgroundColor: theme.primary,
                    borderWidth: 1.5,
                    borderColor: theme.card,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: theme.onPrimary, fontSize: 8, fontWeight: '800' }}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {onCustom ? (
        <Pressable
          onPress={onCustom}
          accessibilityRole="button"
          accessibilityLabel={uri ? t('avatar.change') : t('avatar.custom')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
            marginTop: 10,
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderRadius: 14,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: uri ? theme.primary : theme.border,
            backgroundColor: uri ? theme.chip : theme.cardSoft,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          {uri ? (
            <Avatar uri={uri} emoji={value} size={30} />
          ) : (
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: theme.chip,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 17, color: theme.primary, marginTop: -1 }}>＋</Text>
            </View>
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={heading(11.5, theme.text)} numberOfLines={1}>
              {uri ? t('avatar.change') : t('avatar.custom')}
            </Text>
            <Text style={{ fontSize: 9, color: theme.textSoft, marginTop: 1 }} numberOfLines={1}>
              {t('avatar.customHint')}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: theme.textSoft }}>›</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
