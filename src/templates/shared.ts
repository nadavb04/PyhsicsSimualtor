/**
 * Small helpers shared by template renderers. Framework-free like the rest of templates/.
 */
import { findBody, resampleEvery } from '@/engine/recorder';
import type { BodySample, History, SimEvent } from '@/engine/types';
import { drawDot, drawLabel } from '@/render/primitives';
import type { Theme } from '@/render/theme';

/** Points (t, value) for one body, from the start of the history up to time `untilT`. */
export function seriesFrom(
  history: History,
  bodyId: string,
  untilT: number,
  pick: (b: BodySample) => number,
): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (const s of history.samples) {
    if (s.t > untilT + 1e-9) break;
    const b = findBody(s, bodyId);
    if (b) out.push({ x: s.t, y: pick(b) });
  }
  return out;
}

/** Equal-time strobe dots for one body, up to time `untilT`. */
export function drawStrobeTrail(
  ctx: CanvasRenderingContext2D,
  history: History,
  interval: number,
  untilT: number,
  bodyId: string,
  toScreen: (b: BodySample) => { x: number; y: number },
  color: string,
  alpha = 0.55,
  radius = 3.5,
): void {
  for (const snap of resampleEvery(history, interval, untilT)) {
    const b = findBody(snap, bodyId);
    if (!b) continue;
    const p = toScreen(b);
    drawDot(ctx, p.x, p.y, radius, color, alpha);
  }
}

/** First event of a type (optionally for one body) that has happened by time t. */
export function eventBy(
  events: readonly SimEvent[],
  type: string,
  t: number,
  bodyId?: string,
): SimEvent | undefined {
  return events.find((e) => e.type === type && e.t <= t + 1e-9 && (!bodyId || e.bodyId === bodyId));
}

/** Simulation clock in the top-left corner. */
export function drawClock(ctx: CanvasRenderingContext2D, t: number, theme: Theme, y = 16): void {
  drawLabel(ctx, `t = ${t.toFixed(2)} s`, 10, y, theme.text);
}

/** Numeric param with a default, tolerant of missing keys. */
export function num(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
