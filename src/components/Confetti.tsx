import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, View } from 'react-native';

const COLORS = ['#FF6FA5', '#FFD166', '#5BD6B0', '#7C6CFF', '#FF8B5E', '#38B6FF', '#FF4D6D'];

/** 打卡成功时的彩纸雨，纯 Animated 实现，web 端同样可用。 */
export function Confetti({
  visible,
  onDone,
  duration = 1500,
}: {
  visible: boolean;
  onDone?: () => void;
  duration?: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const screen = Dimensions.get('window');
  const useNative = Platform.OS !== 'web';

  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: 4 + Math.random() * 92,
        size: 7 + Math.random() * 7,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 180,
        rotate: Math.random() * 360,
        round: Math.random() > 0.55,
        drift: (Math.random() - 0.5) * 90,
      })),
    [visible],
  );

  useEffect(() => {
    if (!visible) return;
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: useNative,
    });
    anim.start(({ finished }) => {
      if (finished) onDone?.();
    });
    return () => anim.stop();
  }, [visible, duration, onDone, progress, useNative]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
      {pieces.map((piece) => (
        <Animated.View
          key={piece.id}
          style={{
            position: 'absolute',
            left: `${piece.x}%`,
            top: -24,
            width: piece.size,
            height: piece.round ? piece.size : piece.size * 0.62,
            borderRadius: piece.round ? piece.size / 2 : 2.5,
            backgroundColor: piece.color,
            opacity: progress.interpolate({
              inputRange: [0, 0.75, 1],
              outputRange: [1, 1, 0],
            }),
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, screen.height * 0.82 + piece.delay],
                }),
              },
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, piece.drift],
                }),
              },
              {
                rotate: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [`${piece.rotate}deg`, `${piece.rotate + 640}deg`],
                }),
              },
              {
                scaleX: progress.interpolate({
                  inputRange: [0, 0.4, 0.8, 1],
                  outputRange: [1, 0.6, 1, 0.7],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
