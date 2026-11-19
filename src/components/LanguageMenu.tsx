import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LOCALES, LOCALE_FLAGS, LOCALE_NAMES } from '@/i18n/locales';
import { useI18n } from '@/i18n';
import { useTheme, heading } from '@/theme/themes';
import { IconBtn } from '@/components/ui';

export function LanguageMenu({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t, locale, setLocale } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(24,16,28,0.38)', justifyContent: 'flex-end' }}
        onPress={onClose}
        accessibilityLabel={t('common.close')}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: Math.max(insets.bottom, 14) + 8,
            maxHeight: '82%',
          }}
        >
          <View
            style={{
              width: 38,
              height: 4,
              borderRadius: 2,
              backgroundColor: theme.border,
              alignSelf: 'center',
              marginBottom: 10,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <Text style={heading(18, theme.text)}>{t('settings.language')}</Text>
            <IconBtn emoji="✕" size={34} onPress={onClose} label={t('common.close')} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {LOCALES.map((item) => {
              const active = item === locale;
              return (
                <Pressable
                  key={item}
                  onPress={() => {
                    setLocale(item);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={LOCALE_NAMES[item]}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 11,
                    paddingHorizontal: 10,
                    marginVertical: 1,
                    borderRadius: 14,
                    backgroundColor: active ? theme.chip : 'transparent',
                    opacity: pressed ? 0.65 : 1,
                  })}
                >
                  <Text style={{ fontSize: 22 }}>{LOCALE_FLAGS[item]}</Text>
                  <Text style={{ ...heading(14, theme.text), flex: 1 }}>{LOCALE_NAMES[item]}</Text>
                  {active ? (
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: theme.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: theme.onPrimary, fontSize: 12 }}>✓</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
