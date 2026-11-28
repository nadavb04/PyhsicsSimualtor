/**
 * Reusable canvas drawing helpers. All coordinates are CSS pixels unless a Camera is passed.
 */
import type { Camera } from './camera';

type Ctx = CanvasRenderingContext2D;

export const FONT = '600 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

export function clear(ctx: Ctx, width: number, height: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

export interface ArrowStyle {
  color: string;
  lineWidth?: number;
  label?: string;
  /** Arrows shorter than this (px) are drawn as a small dot so "zero" is still visible. */
  minLength?: number;
}

/** Arrow from (x, y) with screen-space components (dx, dy). */
export function drawArrow(
  ctx: Ctx,
  x: number,
  y: number,
  dx: number,
  dy: number,
  style: ArrowStyle,
): void {
  const len = Math.hypot(dx, dy);
  const lw = style.lineWidth ?? 3;
  ctx.save();
  ctx.strokeStyle = style.color;
  ctx.fillStyle = style.color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';

  if (len < (style.minLength ?? 3)) {
    ctx.beginPath();
    ctx.arc(x, y, lw, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const ux = dx / len;
    const uy = dy / len;
    const head = Math.min(10, len * 0.45);
    const bx = x + dx - ux * head;
    const by = y + dy - uy * head;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(bx - uy * head * 0.6, by + ux * head * 0.6);
    ctx.lineTo(bx + uy * head * 0.6, by - ux * head * 0.6);
    ctx.closePath();
    ctx.fill();
  }

  if (style.label) {
    ctx.font = FONT;
    ctx.textBaseline = 'middle';
    ctx.fillText(style.label, x + dx + (dx >= 0 ? 6 : -14), y + dy);
  }
  ctx.restore();
}

export function drawDot(ctx: Ctx, x: number, y: number, r: number, color: string, alpha = 1): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawRing(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  color: string,
  lineWidth = 2,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawLine(
  ctx: Ctx,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  opts: { lineWidth?: number; dash?: number[]; alpha?: number } = {},
): void {
  ctx.save();
  ctx.globalAlpha = opts.alpha ?? 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = opts.lineWidth ?? 1.5;
  ctx.setLineDash(opts.dash ?? []);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

/** Small text label with a translucent pill background for legibility over the scene. */
export function drawLabel(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  color: string,
  opts: { align?: CanvasTextAlign; background?: string } = {},
): void {
  ctx.save();
  ctx.font = FONT;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width;
  let left = opts.align === 'center' ? x - w / 2 : opts.align === 'right' ? x - w : x;
  // Keep the pill inside the canvas (CSS px = device px / transform scale).
  const cssWidth = ctx.canvas.width / (ctx.getTransform().a || 1);
  left = Math.max(6, Math.min(left, cssWidth - w - 6));
  ctx.fillStyle = opts.background ?? 'rgba(15, 23, 42, 0.75)';
  ctx.beginPath();
  ctx.roundRect(left - 5, y - 10, w + 10, 20, 6);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, left, y);
  ctx.restore();
}

/** A "nice" tick step (1, 2, 5 × 10^n) giving roughly `target` ticks over `span`. */
export function niceStep(span: number, target = 5): number {
  const raw = span / Math.max(target, 1);
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * pow;
}

/** Vertical metre ruler along the right edge of the stage. */
export function drawVerticalRuler(
  ctx: Ctx,
  cam: Camera,
  minY: number,
  maxY: number,
  color: string,
  unit = 'm',
): void {
  const step = niceStep(maxY - minY, 5);
  const x = cam.width - 8;
  ctx.save();
  ctx.font = FONT;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1;
  for (let v = Math.ceil(minY / step) * step; v <= maxY + 1e-9; v += step) {
    const y = cam.toY(v);
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillText(`${Math.round(v * 100) / 100} ${unit}`, x - 9, y);
  }
  ctx.restore();
}

/** Horizontal metre ruler with ticks at screen row `y` (e.g. under a track). */
export function drawHorizontalRuler(
  ctx: Ctx,
  cam: Camera,
  minX: number,
  maxX: number,
  y: number,
  color: string,
  unit = 'm',
): void {
  const step = niceStep(maxX - minX, Math.max(2, Math.floor(cam.width / 70)));
  ctx.save();
  ctx.font = FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1;
  for (let v = Math.ceil(minX / step) * step; v <= maxX + 1e-9; v += step) {
    const x = cam.toX(v);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 5);
    ctx.stroke();
    ctx.fillText(`${Math.round(v * 100) / 100}${unit}`, x, y + 7);
  }
  ctx.restore();
}

/** Filled rounded box centred on (x, y), e.g. a car or glider. */
export function drawBox(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  alpha = 1,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, Math.min(4, h / 3));
  ctx.fill();
  ctx.restore();
}

export interface GraphSeries {
  points: readonly { x: number; y: number }[];
  color: string;
  dash?: number[];
}

export interface GraphRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GraphDomain {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Data → CSS-pixel mapping for a mini graph, so templates can annotate points on it. */
export function graphMapper(rect: GraphRect, domain: GraphDomain) {
  return {
    sx: (v: number) => rect.x + ((v - domain.minX) / (domain.maxX - domain.minX)) * rect.w,
    sy: (v: number) => rect.y + rect.h - ((v - domain.minY) / (domain.maxY - domain.minY)) * rect.h,
  };
}

/** Compact inset graph (e.g. live v(t)). `rect` is in CSS pixels. */
export function drawMiniGraph(
  ctx: Ctx,
  rect: GraphRect,
  domain: GraphDomain,
  series: readonly GraphSeries[],
  opts: { axisColor: string; background?: string; xLabel?: string; yLabel?: string },
): void {
  const { sx, sy } = graphMapper(rect, domain);
  ctx.save();
  ctx.fillStyle = opts.background ?? 'rgba(15, 23, 42, 0.8)';
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 6);
  ctx.fill();

  ctx.strokeStyle = opts.axisColor;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1;
  if (domain.minY < 0 && domain.maxY > 0) {
    ctx.beginPath();
    ctx.moveTo(rect.x, sy(0));
    ctx.lineTo(rect.x + rect.w, sy(0));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  for (const s of series) {
    if (s.points.length < 2) continue;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2;
    ctx.setLineDash(s.dash ?? []);
    ctx.beginPath();
    s.points.forEach((p, i) =>
      i === 0 ? ctx.moveTo(sx(p.x), sy(p.y)) : ctx.lineTo(sx(p.x), sy(p.y)),
    );
    ctx.stroke();
  }

  ctx.font = FONT;
  ctx.fillStyle = opts.axisColor;
  ctx.textBaseline = 'top';
  if (opts.yLabel) ctx.fillText(opts.yLabel, rect.x + 4, rect.y + 3);
  if (opts.xLabel) {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(opts.xLabel, rect.x + rect.w - 4, rect.y + rect.h - 2);
  }
  ctx.restore();
}

/** A letter with a hat over it (unit-vector notation), drawn centred on (x, y). */
function drawHatLetter(ctx: Ctx, letter: string, x: number, y: number, color: string): void {
  ctx.save();
  ctx.font = `italic ${FONT}`;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, x, y);
  ctx.lineWidth = 1.2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 3, y - 6);
  ctx.lineTo(x, y - 9);
  ctx.lineTo(x + 3, y - 6);
  ctx.stroke();
  ctx.restore();
}

/**
 * Coordinate-system key: unit vectors x̂ (right) and ŷ (up) from the origin (x, y), in CSS px.
 * Matches the world convention used by every template (SI, x right, y up).
 */
export function drawAxisUnitVectors(
  ctx: Ctx,
  x: number,
  y: number,
  color: string,
  size = 18,
): void {
  ctx.save();
  ctx.globalAlpha = 0.85;
  drawArrow(ctx, x, y, size, 0, { color, lineWidth: 2 });
  drawArrow(ctx, x, y, 0, -size, { color, lineWidth: 2 });
  drawHatLetter(ctx, 'x', x + size + 8, y + 1, color);
  drawHatLetter(ctx, 'y', x - 9, y - size / 2 + 1, color);
  ctx.restore();
}
