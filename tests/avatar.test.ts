import { describe, expect, it } from 'vitest';
import {
  avatarCropRect,
  avatarDisplayScale,
  clampAvatarOffset,
  coverScale,
} from '@/domain/avatar';

describe('头像裁剪计算', () => {
  it('横图按高度覆盖取景框', () => {
    const scale = coverScale(1000, 500, 300);
    expect(scale).toBeCloseTo(0.6, 5);
    expect(avatarDisplayScale({ imageWidth: 1000, imageHeight: 500, frame: 300, zoom: 1 })).toBeCloseTo(0.6, 5);
  });

  it('默认居中裁剪成方形，且落在原图内', () => {
    const crop = avatarCropRect({
      imageWidth: 1000,
      imageHeight: 500,
      frame: 300,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
    expect(crop.width).toBeCloseTo(500, 5);
    expect(crop.height).toBeCloseTo(500, 5);
    expect(crop.originX).toBeCloseTo(250, 5);
    expect(crop.originY).toBeCloseTo(0, 5);
  });

  it('拖动偏移会移动裁剪区域，并被限制在图片内', () => {
    const moved = avatarCropRect({
      imageWidth: 1000,
      imageHeight: 500,
      frame: 300,
      zoom: 1,
      offsetX: 999,
      offsetY: 0,
    });
    expect(moved.originX).toBeCloseTo(0, 5);
    expect(moved.originX + moved.width).toBeLessThanOrEqual(1000);

    const left = avatarCropRect({
      imageWidth: 1000,
      imageHeight: 500,
      frame: 300,
      zoom: 1,
      offsetX: -999,
      offsetY: 0,
    });
    expect(left.originX).toBeCloseTo(500, 5);
  });

  it('放大后裁剪尺寸变小', () => {
    const crop = avatarCropRect({
      imageWidth: 1000,
      imageHeight: 500,
      frame: 300,
      zoom: 2,
      offsetX: 0,
      offsetY: 0,
    });
    expect(crop.width).toBeCloseTo(250, 5);
    expect(crop.originX).toBeCloseTo(375, 5);
  });

  it('竖图按宽度覆盖取景框', () => {
    const crop = avatarCropRect({
      imageWidth: 400,
      imageHeight: 1200,
      frame: 300,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
    expect(crop.width).toBeCloseTo(400, 5);
    expect(crop.originY).toBeCloseTo(400, 5);
    expect(crop.originX).toBeCloseTo(0, 5);
  });

  it('偏移限制与缩放相关', () => {
    expect(
      clampAvatarOffset(999, 0, {
        imageWidth: 1000,
        imageHeight: 500,
        frame: 300,
        zoom: 1,
      }),
    ).toEqual({ x: 150, y: 0 });
    expect(
      clampAvatarOffset(999, 0, {
        imageWidth: 1000,
        imageHeight: 500,
        frame: 300,
        zoom: 2,
      }),
    ).toEqual({ x: 450, y: 0 });
  });
});
