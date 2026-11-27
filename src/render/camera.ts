import type { Bounds, Vec2 } from '@/engine/types';

/** Maps world metres (y up) to CSS pixels (y down) with a uniform scale. */
export interface Camera {
  /** Pixels per metre. */
  scale: number;
  width: number;
  height: number;
  toX(x: number): number;
  toY(y: number): number;
  toScreen(p: Vec2): Vec2;
  /** World rectangle actually visible (may be larger than the requested bounds). */
  visible: Bounds;
}

export function fitCamera(bounds: Bounds, width: number, height: number, padding = 12): Camera {
  const worldW = Math.max(bounds.maxX - bounds.minX, 1e-6);
  const worldH = Math.max(bounds.maxY - bounds.minY, 1e-6);
  const availW = Math.max(width - 2 * padding, 1);
  const availH = Math.max(height - 2 * padding, 1);
  const scale = Math.min(availW / worldW, availH / worldH);

  // Centre the world rectangle in the viewport.
  const offsetX = (width - worldW * scale) / 2 - bounds.minX * scale;
  const offsetY = (height - worldH * scale) / 2 + bounds.maxY * scale;

  const toX = (x: number) => offsetX + x * scale;
  const toY = (y: number) => offsetY - y * scale;

  return {
    scale,
    width,
    height,
    toX,
    toY,
    toScreen: (p) => ({ x: toX(p.x), y: toY(p.y) }),
    visible: {
      minX: -offsetX / scale,
      maxX: (width - offsetX) / scale,
      minY: (offsetY - height) / scale,
      maxY: offsetY / scale,
    },
  };
}

export function unionBounds(a: Bounds, b?: Bounds): Bounds {
  if (!b) return a;
  return {
    minX: Math.min(a.minX, b.minX),
    maxX: Math.max(a.maxX, b.maxX),
    minY: Math.min(a.minY, b.minY),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

/** Prepare a canvas for crisp HiDPI drawing in CSS-pixel units. Returns false if size is zero. */
export function syncCanvasSize(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
): boolean {
  const w = Math.round(cssWidth * dpr);
  const h = Math.round(cssHeight * dpr);
  if (w === 0 || h === 0) return false;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return true;
}
