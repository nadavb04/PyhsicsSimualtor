import { findBody, sampleAt } from '@/engine/recorder';
import type { BodySample } from '@/engine/types';
import { clear, drawArrow, drawDot, drawLabel, drawLine } from '@/render/primitives';
import type { FrameData, RenderContext } from '../types';
import { drawClock, drawStrobeTrail, eventBy } from '../shared';
import {
  A_ID,
  B_ID,
  COURSE_LENGTH,
  TRACK_B_OFFSET,
  VALLEY_END,
  readParams,
  trackHeight,
  type RaceState,
} from './physics';

export const CUES = [
  'compare_exit_speeds',
  'compare_finish_times',
  'show_velocity_vector',
] as const;

const STROBE_INTERVAL = 0.5;
const MARBLE_PX = 7;

export function renderValleyRace(rc: RenderContext, frame: FrameData<RaceState>): void {
  const { ctx, camera: cam, theme, width, height } = rc;
  const { params, history, overlays, focusCue, state } = frame;
  const q = readParams(params);
  const t = state.t;
  const color: Record<string, string> = { [A_ID]: theme.bodyA, [B_ID]: theme.bodyB };
  // Marbles sit on top of the rail.
  const toScreen = (b: BodySample) => ({ x: cam.toX(b.pos.x), y: cam.toY(b.pos.y) - MARBLE_PX });

  clear(ctx, width, height, theme.background);

  // Track A (flat) and track B (valley).
  const yA = cam.toY(0);
  drawLine(ctx, cam.toX(0), yA, cam.toX(COURSE_LENGTH), yA, theme.structure, { lineWidth: 4 });
  ctx.save();
  ctx.strokeStyle = theme.structure;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i <= 240; i++) {
    const x = (COURSE_LENGTH * i) / 240;
    const sx = cam.toX(x);
    const sy = cam.toY(TRACK_B_OFFSET + trackHeight(q, x));
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  ctx.restore();

  // Start and finish lines.
  const top = yA - 34;
  const bottom = cam.toY(TRACK_B_OFFSET - q.valleyDepth) + 6;
  for (const [x, label] of [
    [0, 'start'],
    [COURSE_LENGTH, 'finish'],
  ] as const) {
    const sx = cam.toX(x);
    drawLine(ctx, sx, top, sx, Math.max(bottom, cam.toY(TRACK_B_OFFSET) + 6), theme.marker, {
      dash: [4, 4],
      alpha: 0.7,
    });
    drawLabel(ctx, label, sx, top - 10, theme.marker, { align: 'center' });
  }
  drawLabel(ctx, 'A', cam.toX(0) - 8, yA - 2, theme.bodyA, { align: 'right' });
  drawLabel(ctx, 'B', cam.toX(0) - 8, cam.toY(TRACK_B_OFFSET) - 2, theme.bodyB, { align: 'right' });

  if (overlays.showStrobeDots) {
    for (const id of [A_ID, B_ID]) {
      drawStrobeTrail(ctx, history, STROBE_INTERVAL, t, id, toScreen, color[id]!, 0.4, 3);
    }
  }

  const snap = sampleAt(history, t);
  const vScale = 9;
  for (const id of [A_ID, B_ID]) {
    const m = findBody(snap, id);
    if (!m) continue;
    const p = toScreen(m);
    drawDot(ctx, p.x, p.y, MARBLE_PX, color[id]!);
    const rolling = m.pos.x < COURSE_LENGTH;
    if (rolling && (overlays.showVelocityVector || focusCue === 'show_velocity_vector')) {
      drawArrow(ctx, p.x, p.y, m.vel.x * vScale, -m.vel.y * vScale, {
        color: theme.velocity,
        minLength: 4,
      });
    }
    const finish = eventBy(history.events, 'finish', t, id);
    if (finish && focusCue === 'compare_finish_times') {
      // A's time above its rail, B's below its rail, so the two never overlap.
      drawLabel(
        ctx,
        `${finish.t.toFixed(2)} s`,
        cam.toX(COURSE_LENGTH) - 12,
        id === A_ID ? p.y - 18 : p.y + MARBLE_PX + 20,
        color[id]!,
        { align: 'right' },
      );
    }
  }

  const exit = eventBy(history.events, 'valley-exit', t);
  if (exit && focusCue === 'compare_exit_speeds') {
    const ex = cam.toX(VALLEY_END);
    drawLine(ctx, ex, yA - 8, ex, cam.toY(TRACK_B_OFFSET) + 8, theme.reference, { lineWidth: 2 });
    drawLabel(
      ctx,
      `valley exit: A ${Number(exit.data?.speedA).toFixed(1)}, B ${Number(exit.data?.speedB).toFixed(1)} m/s`,
      Math.min(Math.max(ex, 120), width - 120),
      Math.min(height - 14, bottom + 24),
      theme.reference,
      { align: 'center' },
    );
  }

  drawClock(ctx, t, theme);
  const a = findBody(snap, A_ID);
  const b = findBody(snap, B_ID);
  const readout = (name: string, s: BodySample | undefined) =>
    s && s.pos.x >= COURSE_LENGTH
      ? `${name} finished`
      : `${name} ${Math.hypot(s?.vel.x ?? 0, s?.vel.y ?? 0).toFixed(1)} m/s`;
  drawLabel(ctx, readout('A', a), width - 10, 16, theme.bodyA, { align: 'right' });
  drawLabel(ctx, readout('B', b), width - 10, 40, theme.bodyB, { align: 'right' });
}
