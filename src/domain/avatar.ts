/** 头像裁剪的纯计算：保证图片始终覆盖圆形取景框。 */

export interface CropInput {
  imageWidth: number;
  imageHeight: number;
  frame: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export function coverScale(imageWidth: number, imageHeight: number, frame: number): number {
  return Math.max(frame / imageWidth, frame / imageHeight);
}

export function avatarDisplayScale(input: Pick<CropInput, 'imageWidth' | 'imageHeight' | 'frame' | 'zoom'>) {
  return coverScale(input.imageWidth, input.imageHeight, input.frame) * Math.max(1, input.zoom);
}

export function clampAvatarOffset(
  offsetX: number,
  offsetY: number,
  input: Omit<CropInput, 'offsetX' | 'offsetY'>,
): { x: number; y: number } {
  const scale = avatarDisplayScale(input);
  const maxX = Math.max(0, (input.imageWidth * scale - input.frame) / 2);
  const maxY = Math.max(0, (input.imageHeight * scale - input.frame) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, offsetX)),
    y: Math.min(maxY, Math.max(-maxY, offsetY)),
  };
}

export function avatarCropRect(input: CropInput): {
  originX: number;
  originY: number;
  width: number;
  height: number;
} {
  const scale = avatarDisplayScale(input);
  const offset = clampAvatarOffset(input.offsetX, input.offsetY, input);
  const size = input.frame / scale;
  const maxX = input.imageWidth - size;
  const maxY = input.imageHeight - size;
  const originX = (input.imageWidth * scale / 2 - input.frame / 2 - offset.x) / scale;
  const originY = (input.imageHeight * scale / 2 - input.frame / 2 - offset.y) / scale;
  return {
    originX: Math.min(maxX, Math.max(0, originX)),
    originY: Math.min(maxY, Math.max(0, originY)),
    width: size,
    height: size,
  };
}
