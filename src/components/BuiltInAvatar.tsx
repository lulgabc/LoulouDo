import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import type { BuiltInAvatarId } from '@/domain/avatars';

const INK = '#452E39';
const BLUSH = '#FF9DB6';

function Sparkles() {
  return (
    <G opacity={0.55}>
      <Circle cx={15} cy={17} r={3} fill="#FFFFFF" />
      <Circle cx={86} cy={24} r={2} fill="#FFFFFF" />
      <Circle cx={82} cy={84} r={3.4} fill="#FFFFFF" opacity={0.7} />
      <Path d="M14 82 l1.5 3 3 1.4 -3 1.4 -1.5 3 -1.5-3 -3-1.4 3-1.4 Z" fill="#FFFFFF" opacity={0.8} />
    </G>
  );
}

function Eyes({
  y = 49,
  gap = 20,
  r = 2.9,
  color = INK,
  happy = false,
}: {
  y?: number;
  gap?: number;
  r?: number;
  color?: string;
  happy?: boolean;
}) {
  const left = 50 - gap / 2;
  const right = 50 + gap / 2;
  if (happy) {
    return (
      <G stroke={color} strokeWidth={2.2} strokeLinecap="round" fill="none">
        <Path d={`M${left - 4} ${y + 1} q4 -5 8 0`} />
        <Path d={`M${right - 4} ${y + 1} q4 -5 8 0`} />
      </G>
    );
  }
  return (
    <G>
      <Circle cx={left} cy={y} r={r} fill={color} />
      <Circle cx={right} cy={y} r={r} fill={color} />
      <Circle cx={left - 1} cy={y - 1} r={r * 0.33} fill="#FFFFFF" />
      <Circle cx={right - 1} cy={y - 1} r={r * 0.33} fill="#FFFFFF" />
    </G>
  );
}

function Cheeks({ y = 61, color = BLUSH }: { y?: number; color?: string }) {
  return (
    <G fill={color} opacity={0.55}>
      <Ellipse cx={32} cy={y} rx={5.5} ry={3.2} />
      <Ellipse cx={68} cy={y} rx={5.5} ry={3.2} />
    </G>
  );
}

function Smile({ y = 65, width = 6, color = INK }: { y?: number; width?: number; color?: string }) {
  return (
    <Path
      d={`M${50 - width} ${y} Q50 ${y + 5} ${50 + width} ${y}`}
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function Nose({
  y = 59,
  type = 'oval',
  color = INK,
}: {
  y?: number;
  type?: 'oval' | 'triangle' | 'snout';
  color?: string;
}) {
  if (type === 'triangle') {
    return <Path d={`M46 ${y} L54 ${y} L50 ${y + 5} Z`} fill={color} />;
  }
  return <Ellipse cx={50} cy={y} rx={4.2} ry={3.1} fill={color} />;
}

export function BuiltInAvatar({ id, size }: { id: BuiltInAvatarId; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {id === 'bear' ? <Bear /> : null}
      {id === 'bunny' ? <Bunny /> : null}
      {id === 'cat' ? <Cat /> : null}
      {id === 'fox' ? <Fox /> : null}
      {id === 'panda' ? <Panda /> : null}
      {id === 'lion' ? <Lion /> : null}
      {id === 'koala' ? <Koala /> : null}
      {id === 'penguin' ? <Penguin /> : null}
      {id === 'frog' ? <Frog /> : null}
      {id === 'puppy' ? <Puppy /> : null}
      {id === 'deer' ? <Deer /> : null}
      {id === 'tiger' ? <Tiger /> : null}
      {id === 'elephant' ? <Elephant /> : null}
      {id === 'pig' ? <Pig /> : null}
      {id === 'cow' ? <Cow /> : null}
      {id === 'sheep' ? <Sheep /> : null}
      {id === 'monkey' ? <Monkey /> : null}
      {id === 'owl' ? <Owl /> : null}
      {id === 'mouse' ? <Mouse /> : null}
      {id === 'hedgehog' ? <Hedgehog /> : null}
    </Svg>
  );
}

function Bear() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#FFE4CF" />
      <Sparkles />
      <Circle cx={27} cy={29} r={13} fill="#B97850" />
      <Circle cx={73} cy={29} r={13} fill="#B97850" />
      <Circle cx={27} cy={29} r={7} fill="#F3C7A7" />
      <Circle cx={73} cy={29} r={7} fill="#F3C7A7" />
      <Ellipse cx={50} cy={55} rx={31} ry={30} fill="#C98B62" />
      <Ellipse cx={50} cy={64} rx={15} ry={10.5} fill="#F7DCC4" />
      <Eyes />
      <Cheeks />
      <Nose y={59} color="#5B3A2E" />
      <Smile y={67} width={5} />
    </G>
  );
}

function Bunny() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#FFE1EE" />
      <Sparkles />
      <Ellipse cx={37} cy={25} rx={9} ry={22} fill="#FFF9F4" />
      <Ellipse cx={63} cy={25} rx={9} ry={22} fill="#FFF9F4" />
      <Ellipse cx={37} cy={25} rx={4.5} ry={15} fill="#FFC4DA" />
      <Ellipse cx={63} cy={25} rx={4.5} ry={15} fill="#FFC4DA" />
      <Ellipse cx={50} cy={56} rx={29} ry={28} fill="#FFF9F4" />
      <Eyes y={51} />
      <Cheeks y={62} />
      <Nose y={60} type="triangle" color="#F27C9E" />
      <Smile y={67} width={5} />
      <G stroke="#E9B9C8" strokeWidth={1.5} strokeLinecap="round">
        <Path d="M29 58 l-8 -2" />
        <Path d="M29 62 l-8 2" />
        <Path d="M71 58 l8 -2" />
        <Path d="M71 62 l8 2" />
      </G>
    </G>
  );
}

function Cat() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#FFF0C9" />
      <Sparkles />
      <Path d="M22 33 L29 10 L45 28 Z" fill="#F6B44A" />
      <Path d="M78 33 L71 10 L55 28 Z" fill="#F6B44A" />
      <Path d="M28 28 L32 16 L40 27 Z" fill="#FFD9A0" />
      <Path d="M72 28 L68 16 L60 27 Z" fill="#FFD9A0" />
      <Ellipse cx={50} cy={55} rx={31} ry={29} fill="#F6B44A" />
      <Ellipse cx={50} cy={64} rx={13} ry={9} fill="#FFF6E2" />
      <Eyes />
      <Cheeks />
      <Nose y={60} type="triangle" color="#E86F7A" />
      <Smile y={67} width={5} />
      <G stroke="#E4A23B" strokeWidth={1.7} strokeLinecap="round">
        <Path d="M27 60 l-9 -2" />
        <Path d="M27 64 l-9 2" />
        <Path d="M73 60 l9 -2" />
        <Path d="M73 64 l9 2" />
      </G>
    </G>
  );
}

function Fox() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#FFE5D5" />
      <Sparkles />
      <Path d="M21 34 L27 9 L45 27 Z" fill="#EE8A4A" />
      <Path d="M79 34 L73 9 L55 27 Z" fill="#EE8A4A" />
      <Path d="M27 30 L31 16 L39 27 Z" fill="#FFD0B0" />
      <Path d="M73 30 L69 16 L61 27 Z" fill="#FFD0B0" />
      <Ellipse cx={50} cy={55} rx={31} ry={29} fill="#EE8A4A" />
      <Path d="M28 59 Q50 84 72 59 Q66 78 50 84 Q34 78 28 59 Z" fill="#FFF6EC" />
      <Eyes />
      <Cheeks y={65} />
      <Nose y={63} type="triangle" color="#4A2A3C" />
      <Smile y={70} width={5} />
    </G>
  );
}

function Panda() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#DFF5EA" />
      <Sparkles />
      <Circle cx={26} cy={28} r={13} fill="#3D3D4A" />
      <Circle cx={74} cy={28} r={13} fill="#3D3D4A" />
      <Ellipse cx={50} cy={54} rx={32} ry={30} fill="#FFFDF8" />
      <Ellipse cx={39} cy={50} rx={10} ry={12} fill="#3D3D4A" transform="rotate(-18 39 50)" />
      <Ellipse cx={61} cy={50} rx={10} ry={12} fill="#3D3D4A" transform="rotate(18 61 50)" />
      <Circle cx={39} cy={50} r={4} fill="#FFFFFF" />
      <Circle cx={61} cy={50} r={4} fill="#FFFFFF" />
      <Circle cx={39} cy={50} r={2.3} fill={INK} />
      <Circle cx={61} cy={50} r={2.3} fill={INK} />
      <Cheeks y={64} />
      <Nose y={62} color="#3D3D4A" />
      <Smile y={69} width={5.5} />
    </G>
  );
}

function Lion() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#FFF3C4" />
      <Sparkles />
      <Circle cx={50} cy={54} r={39} fill="#E2A32F" />
      <Circle cx={27} cy={31} r={10} fill="#F6C459" />
      <Circle cx={73} cy={31} r={10} fill="#F6C459" />
      <Circle cx={50} cy={54} r={28} fill="#F6C459" />
      <Ellipse cx={50} cy={64} rx={14} ry={10} fill="#FFF0C9" />
      <Eyes />
      <Cheeks y={63} />
      <Nose y={60} color="#8A5A1A" />
      <Smile y={67} width={5} />
    </G>
  );
}

function Koala() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#E2F1F6" />
      <Sparkles />
      <Circle cx={23} cy={42} r={17} fill="#A8C2CC" />
      <Circle cx={77} cy={42} r={17} fill="#A8C2CC" />
      <Circle cx={23} cy={42} r={10} fill="#DDEBF0" />
      <Circle cx={77} cy={42} r={10} fill="#DDEBF0" />
      <Ellipse cx={50} cy={55} rx={29} ry={29} fill="#B7CFD8" />
      <Eyes y={50} gap={19} />
      <Cheeks y={63} color="#F4A9BC" />
      <Ellipse cx={50} cy={60} rx={8} ry={9} fill="#4A5A66" />
      <Smile y={70} width={4} />
    </G>
  );
}

function Penguin() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#DDEBFF" />
      <Sparkles />
      <Ellipse cx={50} cy={54} rx={29} ry={31} fill="#3E4C66" />
      <Ellipse cx={50} cy={58} rx={21} ry={24} fill="#FFF9F0" />
      <Eyes y={51} />
      <Cheeks y={62} />
      <Path d="M45 59 L55 59 L50 66 Z" fill="#F5A623" />
      <Smile y={70} width={4} color="#D98A12" />
    </G>
  );
}

function Frog() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#DFF7DF" />
      <Sparkles />
      <Circle cx={35} cy={32} r={12} fill="#FFFFFF" stroke="#7FD37A" strokeWidth={3} />
      <Circle cx={65} cy={32} r={12} fill="#FFFFFF" stroke="#7FD37A" strokeWidth={3} />
      <Circle cx={35} cy={33} r={4.2} fill={INK} />
      <Circle cx={65} cy={33} r={4.2} fill={INK} />
      <Circle cx={33.5} cy={31.5} r={1.4} fill="#FFFFFF" />
      <Circle cx={63.5} cy={31.5} r={1.4} fill="#FFFFFF" />
      <Ellipse cx={50} cy={58} rx={33} ry={26} fill="#7FD37A" />
      <Cheeks y={64} />
      <Path d="M35 61 Q50 74 65 61" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
    </G>
  );
}

function Puppy() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#FFF0E0" />
      <Sparkles />
      <Ellipse cx={22} cy={52} rx={10} ry={18} fill="#B77C4A" transform="rotate(18 22 52)" />
      <Ellipse cx={78} cy={52} rx={10} ry={18} fill="#B77C4A" transform="rotate(-18 78 52)" />
      <Ellipse cx={50} cy={54} rx={30} ry={29} fill="#D7A06B" />
      <Ellipse cx={39} cy={49} rx={10} ry={9} fill="#B77C4A" transform="rotate(-20 39 49)" />
      <Eyes y={50} />
      <Ellipse cx={50} cy={64} rx={14} ry={10} fill="#F9E3C8" />
      <Cheeks y={64} />
      <Nose y={60} color={INK} />
      <Smile y={68} width={5} />
      <Path d="M50 63 L50 68" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
    </G>
  );
}

function Deer() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#E9F4E2" />
      <Sparkles />
      <G stroke="#8B5E3C" strokeWidth={3.2} strokeLinecap="round" fill="none">
        <Path d="M34 26 Q30 14 34 8 M34 18 L27 13" />
        <Path d="M66 26 Q70 14 66 8 M66 18 L73 13" />
      </G>
      <Ellipse cx={27} cy={36} rx={9} ry={13} fill="#C98B62" transform="rotate(-25 27 36)" />
      <Ellipse cx={73} cy={36} rx={9} ry={13} fill="#C98B62" transform="rotate(25 73 36)" />
      <Ellipse cx={50} cy={56} rx={29} ry={29} fill="#C98B62" />
      <Ellipse cx={50} cy={65} rx={14} ry={10} fill="#F7DCC4" />
      <Eyes y={51} />
      <Cheeks y={64} />
      <Nose y={61} color="#5B3A2E" />
      <Smile y={68} width={5} />
      <G fill="#F3C7A7" opacity={0.9}>
        <Circle cx={31} cy={46} r={2.3} />
        <Circle cx={69} cy={46} r={2.3} />
        <Circle cx={34} cy={56} r={1.8} />
        <Circle cx={66} cy={56} r={1.8} />
      </G>
    </G>
  );
}

function Tiger() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#FFEFD6" />
      <Sparkles />
      <Circle cx={27} cy={31} r={12} fill="#F4A63A" />
      <Circle cx={73} cy={31} r={12} fill="#F4A63A" />
      <Circle cx={27} cy={31} r={6} fill="#FFD9A0" />
      <Circle cx={73} cy={31} r={6} fill="#FFD9A0" />
      <Ellipse cx={50} cy={55} rx={31} ry={29} fill="#F4A63A" />
      <Ellipse cx={50} cy={64} rx={14} ry={10} fill="#FFF3DE" />
      <G fill="#8A4B1F">
        <Path d="M50 31 l-3 6 3 4 3-4 Z" />
        <Path d="M36 37 l-1 6 4 3 2-5 Z" />
        <Path d="M64 37 l1 6 -4 3 -2-5 Z" />
        <Path d="M23 51 l7 1 -1 4 -7-2 Z" />
        <Path d="M77 51 l-7 1 1 4 7-2 Z" />
      </G>
      <Eyes y={50} />
      <Cheeks y={63} />
      <Nose y={60} type="triangle" color="#8A4B1F" />
      <Smile y={67} width={5} />
    </G>
  );
}

function Elephant() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#E3EDFB" />
      <Sparkles />
      <Circle cx={24} cy={45} r={18} fill="#A0B6D8" />
      <Circle cx={76} cy={45} r={18} fill="#A0B6D8" />
      <Circle cx={24} cy={45} r={10} fill="#D3E1F5" />
      <Circle cx={76} cy={45} r={10} fill="#D3E1F5" />
      <Ellipse cx={50} cy={53} rx={30} ry={29} fill="#AFC4E4" />
      <Eyes y={49} />
      <Cheeks y={62} />
      <Path
        d="M43 60 Q43 82 50 82 Q57 82 57 60"
        fill="#AFC4E4"
        stroke="#93AACD"
        strokeWidth={1.5}
      />
      <Path d="M46 68 Q50 70 54 68" stroke="#7C92B5" strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </G>
  );
}

function Pig() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#FFE3EC" />
      <Sparkles />
      <Path d="M25 34 L31 14 L45 29 Z" fill="#F6A6BE" />
      <Path d="M75 34 L69 14 L55 29 Z" fill="#F6A6BE" />
      <Path d="M30 29 L33 20 L39 28 Z" fill="#FFC9D9" />
      <Path d="M70 29 L67 20 L61 28 Z" fill="#FFC9D9" />
      <Ellipse cx={50} cy={55} rx={31} ry={29} fill="#F6A6BE" />
      <Eyes y={49} />
      <Cheeks y={60} color="#FF7BA0" />
      <Ellipse cx={50} cy={63} rx={12} ry={8.5} fill="#F27C9E" />
      <Circle cx={46} cy={63} r={1.6} fill="#B94F73" />
      <Circle cx={54} cy={63} r={1.6} fill="#B94F73" />
      <Smile y={73} width={4} color="#B94F73" />
    </G>
  );
}

function Cow() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#EAF6E9" />
      <Sparkles />
      <G fill="#F2D9A8">
        <Path d="M32 30 Q28 19 36 15 Q41 21 39 30 Z" />
        <Path d="M68 30 Q72 19 64 15 Q59 21 61 30 Z" />
      </G>
      <Ellipse cx={24} cy={43} rx={9} ry={13} fill="#D9C7B8" transform="rotate(25 24 43)" />
      <Ellipse cx={76} cy={43} rx={9} ry={13} fill="#D9C7B8" transform="rotate(-25 76 43)" />
      <Ellipse cx={50} cy={55} rx={31} ry={29} fill="#FFFDF6" />
      <Path d="M34 32 Q43 34 41 45 Q32 48 27 41 Q27 34 34 32 Z" fill="#3F3A3F" />
      <Path d="M63 68 Q72 62 76 70 Q72 79 63 78 Q58 73 63 68 Z" fill="#3F3A3F" />
      <Eyes y={50} />
      <Cheeks y={63} />
      <Ellipse cx={50} cy={64} rx={13} ry={9} fill="#F7B7C7" />
      <Circle cx={45.5} cy={64} r={1.5} fill="#B9516E" />
      <Circle cx={54.5} cy={64} r={1.5} fill="#B9516E" />
      <Smile y={73} width={4} color="#B9516E" />
    </G>
  );
}

function Sheep() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#FFF6DE" />
      <Sparkles />
      <G fill="#FFF9EC">
        <Circle cx={34} cy={33} r={13} />
        <Circle cx={50} cy={27} r={14} />
        <Circle cx={66} cy={33} r={13} />
        <Circle cx={27} cy={49} r={12} />
        <Circle cx={73} cy={49} r={12} />
        <Circle cx={35} cy={65} r={13} />
        <Circle cx={65} cy={65} r={13} />
      </G>
      <Ellipse cx={50} cy={54} rx={24} ry={25} fill="#F0D3B2" />
      <Ellipse cx={26} cy={52} rx={6} ry={9} fill="#F0D3B2" transform="rotate(20 26 52)" />
      <Ellipse cx={74} cy={52} rx={6} ry={9} fill="#F0D3B2" transform="rotate(-20 74 52)" />
      <Eyes y={50} gap={18} />
      <Cheeks y={62} />
      <Nose y={60} color="#8A5A3A" />
      <Smile y={67} width={4.5} />
    </G>
  );
}

function Monkey() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#FFF0DC" />
      <Sparkles />
      <Circle cx={23} cy={48} r={13} fill="#B97850" />
      <Circle cx={77} cy={48} r={13} fill="#B97850" />
      <Circle cx={23} cy={48} r={7} fill="#F3C7A7" />
      <Circle cx={77} cy={48} r={7} fill="#F3C7A7" />
      <Ellipse cx={50} cy={53} rx={30} ry={30} fill="#C98B62" />
      <Ellipse cx={50} cy={59} rx={23} ry={20} fill="#F3D1B3" />
      <Eyes y={50} />
      <Cheeks y={62} />
      <Nose y={60} color="#8A5A3A" />
      <Smile y={67} width={5} />
    </G>
  );
}

function Owl() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#EEE7FF" />
      <Sparkles />
      <Path d="M28 25 L34 12 L42 26 Z" fill="#8C74E0" />
      <Path d="M72 25 L66 12 L58 26 Z" fill="#8C74E0" />
      <Ellipse cx={50} cy={55} rx={30} ry={31} fill="#8C74E0" />
      <Circle cx={38} cy={49} r={12} fill="#FFF9F0" />
      <Circle cx={62} cy={49} r={12} fill="#FFF9F0" />
      <Circle cx={38} cy={50} r={5} fill={INK} />
      <Circle cx={62} cy={50} r={5} fill={INK} />
      <Circle cx={36.5} cy={48.5} r={1.7} fill="#FFFFFF" />
      <Circle cx={60.5} cy={48.5} r={1.7} fill="#FFFFFF" />
      <Path d="M45 59 L55 59 L50 67 Z" fill="#F5B942" />
      <Path d="M35 68 Q50 76 65 68" stroke="#6A54B8" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Cheeks y={64} />
    </G>
  );
}

function Mouse() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#F0EEF7" />
      <Sparkles />
      <Circle cx={26} cy={32} r={15} fill="#B9B9CB" />
      <Circle cx={74} cy={32} r={15} fill="#B9B9CB" />
      <Circle cx={26} cy={32} r={9} fill="#F3C7D9" />
      <Circle cx={74} cy={32} r={9} fill="#F3C7D9" />
      <Ellipse cx={50} cy={56} rx={27} ry={26} fill="#B9B9CB" />
      <Eyes y={51} />
      <Cheeks y={62} />
      <Nose y={61} color="#E86F8E" />
      <Smile y={68} width={4.5} />
      <G stroke="#9C97AB" strokeWidth={1.5} strokeLinecap="round">
        <Path d="M33 60 l-10 -3" />
        <Path d="M33 64 l-10 3" />
        <Path d="M67 60 l10 -3" />
        <Path d="M67 64 l10 3" />
      </G>
    </G>
  );
}

function Hedgehog() {
  return (
    <G>
      <Circle cx={50} cy={50} r={50} fill="#FFF1DC" />
      <Sparkles />
      <G fill="#9B6A45">
        <Path d="M20 50 Q14 28 34 22 L33 36 Z" />
        <Path d="M35 28 Q35 14 52 14 L46 33 Z" />
        <Path d="M52 15 Q70 16 74 31 L56 33 Z" />
        <Path d="M72 32 Q84 45 78 61 L62 48 Z" />
        <Path d="M25 60 Q22 74 35 82 L42 65 Z" />
        <Path d="M45 66 Q53 86 68 78 L64 59 Z" />
      </G>
      <Ellipse cx={50} cy={56} rx={25} ry={24} fill="#F1C99F" />
      <Circle cx={26} cy={58} r={6} fill="#F1C99F" />
      <Circle cx={74} cy={58} r={6} fill="#F1C99F" />
      <Eyes y={53} gap={18} />
      <Cheeks y={64} />
      <Nose y={63} color="#5B3A2E" />
      <Smile y={70} width={4.5} />
    </G>
  );
}
