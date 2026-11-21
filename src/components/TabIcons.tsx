import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

export type TabIconName = 'today' | 'tasks' | 'report' | 'wallet' | 'settings';

/**
 * 底部 Tab 的贴纸图标：统一 32 网格、厚实的填充形状，
 * 用 cutout 色挖出细节，accent 色做小亮点。
 */
export function TabIcon({
  name,
  size = 26,
  color,
  accent,
  cutout,
}: {
  name: TabIconName;
  size?: number;
  color: string;
  accent: string;
  cutout: string;
}) {
  const common = { width: size, height: size, viewBox: '0 0 32 32' };

  if (name === 'today') {
    return (
      <Svg {...common}>
        {Array.from({ length: 8 }, (_, i) => (
          <G key={i} transform={`rotate(${i * 45} 16 16)`}>
            <Rect x={15.1} y={2.5} width={1.8} height={4.2} rx={0.9} fill={color} />
          </G>
        ))}
        <Circle cx={16} cy={16} r={8.2} fill={color} />
        <Circle cx={13.2} cy={15.3} r={1.15} fill={cutout} />
        <Circle cx={18.8} cy={15.3} r={1.15} fill={cutout} />
        <Path
          d="M13.4 18.8 Q16 20.8 18.6 18.8"
          stroke={cutout}
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx={11.2} cy={18} r={1.5} fill={accent} opacity={0.8} />
        <Circle cx={20.8} cy={18} r={1.5} fill={accent} opacity={0.8} />
      </Svg>
    );
  }

  if (name === 'tasks') {
    return (
      <Svg {...common}>
        <Rect x={8} y={6.5} width={16} height={21} rx={4} fill={color} />
        <Rect x={11} y={9.5} width={10} height={15.5} rx={2} fill={cutout} />
        <Rect x={12.3} y={4} width={7.4} height={5} rx={2.2} fill={accent} />
        <Path
          d="M13 14.4 L14.5 15.9 L17.6 12.7"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Rect x={13} y={18.4} width={6} height={1.6} rx={0.8} fill={color} opacity={0.55} />
        <Rect x={13} y={21.3} width={4.8} height={1.6} rx={0.8} fill={color} opacity={0.4} />
      </Svg>
    );
  }

  if (name === 'report') {
    return (
      <Svg {...common}>
        <Rect x={6.5} y={5.5} width={19} height={21} rx={5} fill={color} />
        <Rect x={10} y={16} width={3} height={7} rx={1.5} fill={cutout} />
        <Rect x={15} y={12} width={3} height={11} rx={1.5} fill={cutout} />
        <Rect x={20} y={9} width={3} height={14} rx={1.5} fill={cutout} />
        <Path
          d="M25 6.2 l0.9 1.8 2 .3 -1.45 1.4 .35 2 -1.8-1 -1.8 1 .35-2 -1.45-1.4 2-.3 Z"
          fill={accent}
        />
      </Svg>
    );
  }

  if (name === 'wallet') {
    return (
      <Svg {...common}>
        <Circle cx={16} cy={8.4} r={4.3} fill={accent} />
        <Circle cx={14.7} cy={7.3} r={0.9} fill={cutout} opacity={0.8} />
        <Path
          d="M6.8 14 C6.8 10.9 9.4 9 12.8 9 H19.2 C22.6 9 25.2 10.9 25.2 14 V23.2 C25.2 26.1 23.1 27.6 20 27.6 H12 C8.9 27.6 6.8 26.1 6.8 23.2 Z"
          fill={color}
        />
        <Path
          d="M9.4 13 C11.8 10.8 20.2 10.8 22.6 13"
          stroke={cutout}
          strokeWidth={1.4}
          strokeLinecap="round"
          fill="none"
          opacity={0.45}
        />
        <Circle cx={16} cy={17.4} r={2.2} fill={cutout} />
        <Path
          d="M16 17.4 V20"
          stroke={cutout}
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.5}
        />
      </Svg>
    );
  }

  return (
    <Svg {...common}>
      <Rect x={5.5} y={7.8} width={21} height={3} rx={1.5} fill={color} opacity={0.35} />
      <Circle cx={21} cy={9.3} r={3.4} fill={color} />
      <Circle cx={21} cy={9.3} r={1.1} fill={cutout} />

      <Rect x={5.5} y={14.5} width={21} height={3} rx={1.5} fill={color} opacity={0.35} />
      <Circle cx={11} cy={16} r={3.4} fill={color} />
      <Circle cx={11} cy={16} r={1.1} fill={cutout} />

      <Rect x={5.5} y={21.2} width={21} height={3} rx={1.5} fill={color} opacity={0.35} />
      <Circle cx={18} cy={22.7} r={3.4} fill={color} />
      <Circle cx={18} cy={22.7} r={1.1} fill={cutout} />
    </Svg>
  );
}
