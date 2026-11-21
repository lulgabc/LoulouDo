import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '@/store/AppStore';
import { useTheme, heading } from '@/theme/themes';
import { avatarCropRect, avatarDisplayScale, clampAvatarOffset } from '@/domain/avatar';
import type { AvatarRecord } from '@/types';
import { Avatar } from '@/components/Avatar';
import { Board, Btn, IconBtn, Label, Row, Screen, Stepper } from '@/components/ui';
import { useI18n } from '@/i18n';

type Source = { uri: string; width: number; height: number };

const MAX_HISTORY = 12;

export default function AvatarEditorScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { activeProfile, updateProfile } = useApp();
  const { width } = useWindowDimensions();
  const frame = Math.min(Math.max(220, width - 64), 300);

  const [source, setSource] = useState<Source | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const offsetRef = useRef(offset);
  const zoomRef = useRef(zoom);
  const startRef = useRef(offset);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const displayScale = source ? avatarDisplayScale({
    imageWidth: source.width,
    imageHeight: source.height,
    frame,
    zoom,
  }) : 1;
  const displayW = source ? source.width * displayScale : frame;
  const displayH = source ? source.height * displayScale : frame;

  const resetView = (next: Source) => {
    setSource(next);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    offsetRef.current = { x: 0, y: 0 };
    zoomRef.current = 1;
    setError('');
  };

  const changeZoom = (value: number) => {
    if (!source) return;
    const next = Math.round(Math.min(3, Math.max(1, value)) * 10) / 10;
    setZoom(next);
    zoomRef.current = next;
    const clamped = clampAvatarOffset(offsetRef.current.x, offsetRef.current.y, {
      imageWidth: source.width,
      imageHeight: source.height,
      frame,
      zoom: next,
    });
    setOffset(clamped);
    offsetRef.current = clamped;
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => Boolean(source),
        onMoveShouldSetPanResponder: () => Boolean(source),
        onPanResponderGrant: () => {
          startRef.current = offsetRef.current;
        },
        onPanResponderMove: (_, gesture) => {
          if (!source) return;
          const clamped = clampAvatarOffset(
            startRef.current.x + gesture.dx,
            startRef.current.y + gesture.dy,
            {
              imageWidth: source.width,
              imageHeight: source.height,
              frame,
              zoom: zoomRef.current,
            },
          );
          setOffset(clamped);
          offsetRef.current = clamped;
        },
      }),
    [source, frame],
  );

  const pickPhoto = async () => {
    setError('');
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setError(t('avatar.photoError'));
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: false,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      let w = asset.width ?? 0;
      let h = asset.height ?? 0;
      if (!w || !h) {
        await new Promise<void>((resolve) => {
          Image.getSize(
            asset.uri,
            (iw, ih) => {
              w = iw;
              h = ih;
              resolve();
            },
            () => resolve(),
          );
        });
      }
      if (!w || !h) {
        setError(t('avatar.loadError'));
        return;
      }
      resetView({ uri: asset.uri, width: w, height: h });
    } catch {
      setError(t('avatar.photoError'));
    }
  };

  const useImageUrl = () => {
    const value = url.trim();
    if (!/^https?:\/\//i.test(value)) {
      setError(t('avatar.urlInvalid'));
      return;
    }
    setBusy(true);
    setError('');
    Image.getSize(
      value,
      (w, h) => {
        setBusy(false);
        if (!w || !h) {
          setError(t('avatar.loadError'));
          return;
        }
        resetView({ uri: value, width: w, height: h });
      },
      () => {
        setBusy(false);
        setError(t('avatar.loadError'));
      },
    );
  };

  const applyAvatar = (record: AvatarRecord) => {
    const history = [
      record,
      ...(activeProfile.avatarHistory ?? []).filter((item) => item.uri !== record.uri),
    ].slice(0, MAX_HISTORY);
    updateProfile(activeProfile.id, {
      avatarUri: record.uri,
      avatarHistory: history,
    });
    router.back();
  };

  const save = async () => {
    if (!source) {
      setError(t('avatar.selectHint'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const crop = avatarCropRect({
        imageWidth: source.width,
        imageHeight: source.height,
        frame,
        zoom,
        offsetX: offset.x,
        offsetY: offset.y,
      });

      let uri = source.uri;
      if (Platform.OS === 'web' && !uri.startsWith('data:')) {
        const response = await fetch(uri);
        if (!response.ok) throw new Error('fetch');
        const blob = await response.blob();
        uri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('read'));
          reader.readAsDataURL(blob);
        });
      } else if (Platform.OS !== 'web' && /^https?:/i.test(uri)) {
        const downloaded = await FileSystem.downloadAsync(
          uri,
          `${FileSystem.cacheDirectory}loulou-avatar-${Date.now()}.jpg`,
        );
        uri = downloaded.uri;
      }

      const result = await manipulateAsync(
        uri,
        [{ crop }, { resize: { width: 320, height: 320 } }],
        { compress: 0.85, format: SaveFormat.JPEG, base64: true },
      );
      if (!result.base64) throw new Error('base64');
      const dataUri = `data:image/jpeg;base64,${result.base64}`;
      const record: AvatarRecord = {
        id: `avatar-${Date.now()}`,
        uri: dataUri,
        createdAt: new Date().toISOString(),
      };
      applyAvatar(record);
    } catch {
      setError(t('avatar.loadError'));
    } finally {
      setSaving(false);
    }
  };

  const history = activeProfile.avatarHistory ?? [];

  return (
    <Screen>
      <Row style={{ gap: 10, marginBottom: 14 }}>
        <IconBtn emoji="✕" size={38} onPress={() => router.back()} label={t('common.close')} />
        <Text style={heading(20, theme.text)} numberOfLines={1}>
          {t('avatar.title')}
        </Text>
      </Row>

      <Board style={{ marginBottom: 14 }}>
        <View style={{ padding: 14, gap: 10 }}>
          <Btn label={t('avatar.pickPhoto')} emoji="🖼️" variant="soft" onPress={pickPhoto} />
          <Label style={{ marginBottom: 0, marginTop: 2 }}>{t('avatar.useUrl')}</Label>
          <Row style={{ gap: 8 }}>
            <TextInput
              value={url}
              onChangeText={(value) => {
                setUrl(value);
                setError('');
              }}
              placeholder={t('avatar.urlPlaceholder')}
              placeholderTextColor={theme.textSoft}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={useImageUrl}
              style={{
                ...heading(11.5, theme.text),
                flex: 1,
                backgroundColor: theme.cardSoft,
                borderRadius: theme.radiusSm,
                paddingHorizontal: 12,
                paddingVertical: 9,
                borderWidth: theme.cardBorderWidth,
                borderColor: theme.border,
              }}
            />
            <Btn label={t('avatar.use')} small onPress={useImageUrl} disabled={busy} />
          </Row>
          {error ? <Text style={{ fontSize: 10.5, color: theme.danger }}>{error}</Text> : null}
        </View>
      </Board>

      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <View
          style={{
            width: frame + 8,
            height: frame + 8,
            borderRadius: (frame + 8) / 2,
            backgroundColor: theme.card,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: theme.cardBorderWidth,
            borderColor: theme.border,
          }}
        >
          <View
            testID="avatarCrop"
            {...(source ? panResponder.panHandlers : {})}
            style={{
              width: frame,
              height: frame,
              borderRadius: frame / 2,
              overflow: 'hidden',
              backgroundColor: theme.chip,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {source ? (
              <Image
                source={{ uri: source.uri }}
                style={{
                  position: 'absolute',
                  left: (frame - displayW) / 2 + offset.x,
                  top: (frame - displayH) / 2 + offset.y,
                  width: displayW,
                  height: displayH,
                }}
                resizeMode="stretch"
              />
            ) : (
              <View style={{ alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 44 }}>🖼️</Text>
                <Text style={{ fontSize: 10.5, color: theme.textSoft }}>{t('avatar.selectHint')}</Text>
              </View>
            )}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: frame,
                height: frame,
                borderRadius: frame / 2,
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.8)',
              }}
            />
          </View>
        </View>
        <Text style={{ fontSize: 10, color: theme.textSoft, marginTop: 8, textAlign: 'center' }}>
          {t('avatar.dragHint')}
        </Text>
      </View>

      <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontSize: 11, color: theme.textSoft }}>{t('avatar.zoom')}</Text>
        <Stepper
          value={Math.round(zoom * 10) / 10}
          onChange={changeZoom}
          step={0.2}
          min={1}
          max={3}
          suffix="×"
        />
      </Row>

      <Text style={{ ...heading(13, theme.text), marginBottom: 8 }}>{t('avatar.history')}</Text>
      {history.length === 0 ? (
        <Text style={{ fontSize: 10.5, color: theme.textSoft, marginBottom: 14 }}>
          {t('avatar.emptyHistory')}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
          style={{ marginBottom: 14 }}
        >
          {history.map((record, index) => {
            const active = activeProfile.avatarUri === record.uri;
            return (
              <Pressable
                key={record.id}
                onPress={() => applyAvatar(record)}
                accessibilityRole="button"
                accessibilityLabel={`${t('avatar.history')} ${index + 1}`}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Avatar
                  uri={record.uri}
                  emoji={activeProfile.avatar}
                  size={54}
                  borderWidth={active ? 2 : 1}
                  borderColor={active ? theme.primary : theme.border}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <Btn
        label={saving ? t('avatar.saving') : t('avatar.save')}
        emoji={saving ? undefined : '✓'}
        onPress={save}
        disabled={saving || !source}
      />
      <Btn
        label={t('avatar.useEmoji')}
        variant="ghost"
        onPress={() => {
          updateProfile(activeProfile.id, { avatarUri: undefined });
          router.back();
        }}
        style={{ marginTop: 10 }}
      />
      {busy ? (
        <Row style={{ justifyContent: 'center', marginTop: 10, gap: 8 }}>
          <ActivityIndicator color={theme.primary} />
        </Row>
      ) : null}
    </Screen>
  );
}
