import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { useTheme } from '@/theme/themes';

export type MascotMood = 'happy' | 'cheer' | 'sleepy';

/**
 * Loulou —— 一只会陪你打卡的小鹿。
 * 纯 SVG 绘制，不需要图片资源，任何皮肤下都清晰。
 */
export function Mascot({
  size = 110,
  mood = 'happy',
}: {
  size?: number;
  mood?: MascotMood;
}) {
  const theme = useTheme();
  const cream = theme.dark ? '#FFE3C9' : '#FFE7CF';
  const creamDeep = theme.dark ? '#F5C9A6' : '#F8D3B2';
  const antler = '#C0906A';
  const eye = '#3F2A33';
  const blush = '#FF9FB5';

  const eyes =
    mood === 'sleepy' ? (
      <G stroke={eye} strokeWidth={3.2} strokeLinecap="round" fill="none">
        <Path d="M42 61 Q47 66 52 61" />
        <Path d="M68 61 Q73 66 78 61" />
      </G>
    ) : mood === 'cheer' ? (
      <G stroke={eye} strokeWidth={3.4} strokeLinecap="round" fill="none">
        <Path d="M42 63 Q47 56 52 63" />
        <Path d="M68 63 Q73 56 78 63" />
      </G>
    ) : (
      <G>
        <Ellipse cx={47} cy={61} rx={4.6} ry={5.2} fill={eye} />
        <Ellipse cx={73} cy={61} rx={4.6} ry={5.2} fill={eye} />
        <Circle cx={48.6} cy={59.3} r={1.7} fill="#FFFFFF" />
        <Circle cx={74.6} cy={59.3} r={1.7} fill="#FFFFFF" />
      </G>
    );

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      {/* 小鹿角 */}
      <G stroke={antler} strokeWidth={5} strokeLinecap="round" fill="none">
        <Path d="M45 33 C42 24 36 20 29 18" />
        <Path d="M40 26 C36 24 33 24 30 26" />
        <Path d="M75 33 C78 24 84 20 91 18" />
        <Path d="M80 26 C84 24 87 24 90 26" />
      </G>

      {/* 耳朵 */}
      <G>
        <Ellipse cx={24} cy={51} rx={11} ry={18} fill={cream} transform="rotate(-24 24 51)" />
        <Ellipse cx={26} cy={52} rx={5.5} ry={11} fill="#FFB9C9" transform="rotate(-24 26 52)" />
        <Ellipse cx={96} cy={51} rx={11} ry={18} fill={cream} transform="rotate(24 96 51)" />
        <Ellipse cx={94} cy={52} rx={5.5} ry={11} fill="#FFB9C9" transform="rotate(24 94 52)" />
      </G>

      {/* 脸 */}
      <Circle cx={60} cy={66} r={35} fill={cream} />
      <Ellipse cx={60} cy={84} rx={20} ry={15} fill="#FFF6EA" />
      <Ellipse cx={60} cy={89} rx={17} ry={8} fill={creamDeep} opacity={0.4} />

      {eyes}

      {/* 腮红 */}
      <Ellipse cx={36} cy={75} rx={7} ry={4.2} fill={blush} opacity={0.75} />
      <Ellipse cx={84} cy={75} rx={7} ry={4.2} fill={blush} opacity={0.75} />

      {/* 鼻头和嘴 */}
      <Ellipse cx={60} cy={78} rx={4.4} ry={3.4} fill="#FF8FA8" />
      {mood === 'cheer' ? (
        <G>
          <Path d="M53 84 Q60 96 67 84 Z" fill="#E0627F" />
          <Ellipse cx={60} cy={90} rx={4.5} ry={3} fill="#FF9FB5" />
        </G>
      ) : mood === 'sleepy' ? (
        <Path d="M56 86 Q60 89 64 86" stroke={eye} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      ) : (
        <Path
          d="M54 84 Q60 91 66 84"
          stroke={eye}
          strokeWidth={2.6}
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* 小围巾，跟随皮肤颜色 */}
      <Path
        d="M38 104 Q60 114 82 104 L82 112 Q60 120 38 112 Z"
        fill={theme.primary}
        opacity={0.95}
      />
      <Circle cx={60} cy={111} r={5.5} fill={theme.accent} />

      {(mood === 'cheer' || mood === 'happy') && (
        <G fill={theme.accent}>
          <Path d="M104 42 l2.2 5.4 5.6 1.2 -4.2 3.8 1 5.6 -4.6-3 -4.6 3 1-5.6 -4.2-3.8 5.6-1.2 Z" opacity={0.9} />
          <Path d="M18 34 l1.5 3.8 4 .8 -3 2.7 .7 4 -3.2-2.1 -3.2 2.1 .7-4 -3-2.7 4-.8 Z" opacity={0.6} />
        </G>
      )}
      {mood === 'sleepy' && (
        <G fill={theme.primary}>
          <Ellipse cx={98} cy={30} rx={6} ry={3} opacity={0.5} />
          <Ellipse cx={24} cy={84} rx={5} ry={2.4} opacity={0.4} />
        </G>
      )}
    </Svg>
  );
}
