import React from 'react';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

/** 完成任务的圆点底纹：半径为原来的 3 倍。 */
export function DotFill({
  color,
  id,
  opacity = 0.2,
}: {
  color: string;
  id: string;
  opacity?: number;
}) {
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height="100%"
      style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
    >
      <Defs>
        <Pattern id={id} width={16} height={16} patternUnits="userSpaceOnUse">
          <Circle cx={8} cy={8} r={4.8} fill={color} opacity={opacity} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
