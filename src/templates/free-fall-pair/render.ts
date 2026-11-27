import { findBody, sampleAt } from '@/engine/recorder';
import type { BodySample } from '@/engine/types';
import {
  clear,
  drawArrow,
  drawDot,
  drawLabel,
  drawLine,
  drawVerticalRuler,
} from '@/render/primitives';
import type { FrameData, RenderContext } from '../types';
import { drawClock, drawStrobeTrail } from '../shared';
import { A_ID, B_ID, readParams, type FreeFallPairState } from './physics';

export const CUES = ['compare_accelerations', 'show_gap', 'show_velocity_vector'] as const;

const TOWER_LEFT = -6;
const TOWER_RIGHT = -1.5;
/** The two balls fall in columns a fixed pixel distance either side of x = 0. */
const COLUMN_PX = 26;
const STROBE_INTERVAL = 0.25;
const BALL_RADIUS = 7;

export function renderFreeFallPair(rc: RenderContext, frame: FrameData<FreeFallPairState>): void {
  const { ctx, camera: cam, theme, width, height } = rc;
  const { params, history, overlays, focusCue, state } = frame;
  const q = readParams(params);
  const t = state.t;
  const colX: Record<string, number> = {
    [A_ID]: cam.toX(0) - COLUMN_PX / 2 + 4,
    [B_ID]: cam.toX(0) + COLUMN_PX / 2 + 4,
  };
  const color: Record<string, string> = { [A_ID]: theme.bodyA, [B_ID]: theme.bodyB };
  const toScreen = (b: BodySample) => ({ x: colX[b.id] ?? 0, y: cam.toY(b.pos.y) });

  clear(ctx, width, height, theme.background);
  const groundY = cam.toY(0);
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = theme.structure;
  const tx = cam.toX(TOWER_LEFT);
  ctx.fillRect(
    tx,
    cam.toY(q.towerHeight),
    cam.toX(TOWER_RIGHT) - tx,
    groundY - cam.toY(q.towerHeight),
  );
  drawVerticalRuler(ctx, cam, 0, cam.visible.maxY, theme.text);

  if (overlays.showStrobeDots) {
    for (const id of [A_ID, B_ID]) {
      drawStrobeTrail(ctx, history, STROBE_INTERVAL, t, id, toScreen, color[id]!, 0.4, 3);
    }
  }

  const snap = sampleAt(history, t);
  const a = findBody(snap, A_ID);
  const b = findBody(snap, B_ID);
  if (!a || !b) return;
  const bothFlying = a.pos.y > 0 && b.pos.y > 0;

  // Gap between the balls while both are still in the air.
  if (focusCue === 'show_gap' && bothFlying) {
    const ya = cam.toY(a.pos.y);
    const yb = cam.toY(b.pos.y);
    const bx = colX[B_ID]! + 18;
    drawLine(ctx, colX[A_ID]!, ya, bx + 6, ya, theme.reference, { dash: [3, 3] });
    drawLine(ctx, bx, ya, bx, yb, theme.reference, { lineWidth: 2.5 });
    drawLabel(
      ctx,
      `gap ${(a.pos.y - b.pos.y).toFixed(1)} m`,
      bx + 10,
      (ya + yb) / 2,
      theme.reference,
    );
  }

  const vMax = Math.sqrt(q.launchSpeedB ** 2 + 2 * q.gravity * q.towerHeight);
  const velScale = (0.22 * cam.height) / Math.max(vMax, 5);
  const accScale = (0.1 * cam.height) / q.gravity;
  for (const [ball, id, name] of [
    [a, A_ID, 'A dropped'],
    [b, B_ID, 'B thrown'],
  ] as const) {
    const x = colX[id]!;
    const y = cam.toY(ball.pos.y) - (ball.pos.y <= 0 ? BALL_RADIUS : 0);
    drawDot(ctx, x, y, BALL_RADIUS, color[id]!);
    if (t === 0) {
      drawLabel(ctx, name, x + (id === A_ID ? -12 : 12), y - 20, color[id]!, {
        align: id === A_ID ? 'right' : 'left',
      });
    }
    const flying = ball.pos.y > 0;
    if (flying && (overlays.showVelocityVector || focusCue === 'show_velocity_vector')) {
      drawArrow(ctx, x, y, 0, -ball.vel.y * velScale, { color: theme.velocity, minLength: 4 });
    }
    if (flying && overlays.showAccelerationVector) {
      const ax = x + (id === A_ID ? -12 : 12);
      drawArrow(ctx, ax, y, 0, -ball.acc.y * accScale, { color: theme.acceleration });
      if (focusCue === 'compare_accelerations') {
        drawLabel(
          ctx,
          `a ${Math.abs(ball.acc.y).toFixed(1)}`,
          ax + (id === A_ID ? -6 : 6),
          y + 26,
          theme.acceleration,
          {
            align: id === A_ID ? 'right' : 'left',
          },
        );
      }
    }
  }

  drawClock(ctx, t, theme);
  drawLabel(ctx, `A ${Math.abs(a.vel.y).toFixed(1)} m/s`, 10, 40, color[A_ID]!);
  drawLabel(ctx, `B ${Math.abs(b.vel.y).toFixed(1)} m/s`, 10, 64, color[B_ID]!);
}
