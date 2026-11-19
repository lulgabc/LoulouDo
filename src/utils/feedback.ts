import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function tapFeedback(kind: 'success' | 'light' = 'light') {
  if (Platform.OS === 'web') return;
  const run =
    kind === 'success'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  run.catch(() => {});
}
