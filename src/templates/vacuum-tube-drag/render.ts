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
import { drawClock, drawStrobeTrail, eventBy } from '../shared';
import { HEAVY_ID, HEAVY_MASS, LIGHT_ID, readParams, type DragState } from './physics';

export const CUES = ['compare_landing', 'compare_accelerations', 'show_velocity_vector'] as const;

const COLUMN_PX = 26;
const STROBE_INTERVAL = 0.2;
const BALL_RADIUS = 8;

export function renderVacuumTube(rc: RenderContext, frame: FrameData<DragState>): void {
  const { ctx, camera: cam, theme, width, height } = rc;
  const { params, history, overlays, focusCue, state } = frame;
  const q = readParams(params);
  const t = state.t;
  const cx = cam.toX(0);
  const colX: Record<string, number> = { [HEAVY_ID]: cx - COLUMN_PX, [LIGHT_ID]: cx + COLUMN_PX };
  const color: Record<string, string> = { [HEAVY_ID]: theme.bodyA, [LIGHT_ID]: theme.bodyB };
  const toScreen = (b: BodySample) => ({ x: colX[b.id] ?? cx, y: cam.toY(b.pos.y) });

  clear(ctx, width, height, theme.background);

  // Tube: tinted by air density, outlined like glass.
  const floorY = cam.toY(0);
  const topY = cam.toY(q.dropHeight) - 18;
  const left = cx - 2.2 * COLUMN_PX;
  const right = cx + 2.2 * COLUMN_PX;
  ctx.save();
  ctx.globalAlpha = Math.min(0.45, 0.12 * q.airDensity);
  ctx.fillStyle = theme.ghost;
  ctx.fillRect(left, topY, right - left, floorY - topY);
  ctx.restore();
  drawLine(ctx, left, topY, left, floorY, theme.text, { alpha: 0.6, lineWidth: 2 });
  drawLine(ctx, right, topY, right, floorY, theme.text, { alpha: 0.6, lineWidth: 2 });
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, floorY, width, height - floorY);
  drawVerticalRuler(ctx, cam, 0, q.dropHeight, theme.text);
  drawLabel(
    ctx,
    q.airDensity === 0 ? 'vacuum' : `air ${q.airDensity.toFixed(1)} kg/m³`,
    cx,
    topY - 12,
    theme.text,
    { align: 'center' },
  );

  if (overlays.showStrobeDots) {
    for (const id of [HEAVY_ID, LIGHT_ID]) {
      drawStrobeTrail(ctx, history, STROBE_INTERVAL, t, id, toScreen, color[id]!, 0.4, 3);
    }
  }

  const snap = sampleAt(history, t);
  const velScale = (0.2 * cam.height) / Math.sqrt(2 * 9.8 * q.dropHeight);
  const accScale = (0.09 * cam.height) / 9.8;
  for (const [id, name] of [
    [HEAVY_ID, `${HEAVY_MASS} kg`],
    [LIGHT_ID, `${q.lightMass.toFixed(1)} kg`],
  ] as const) {
    const ball = findBody(snap, id);
    if (!ball) continue;
    const x = colX[id]!;
    const y = cam.toY(ball.pos.y) - (ball.pos.y <= 0 ? BALL_RADIUS : 0);
    drawDot(ctx, x, y, BALL_RADIUS, color[id]!);
    const outside = id === HEAVY_ID ? -1 : 1;
    drawLabel(ctx, name, x + outside * 14, y - 18, color[id]!, {
      align: outside < 0 ? 'right' : 'left',
    });

    const flying = ball.pos.y > 0;
    if (flying && (overlays.showVelocityVector || focusCue === 'show_velocity_vector')) {
      drawArrow(ctx, x, y, 0, -ball.vel.y * velScale, { color: theme.velocity, minLength: 4 });
    }
    if (flying && overlays.showAccelerationVector) {
      const ax = x + outside * 13;
      drawArrow(ctx, ax, y, 0, -ball.acc.y * accScale, { color: theme.acceleration, minLength: 4 });
      if (focusCue === 'compare_accelerations') {
        drawLabel(
          ctx,
          `a ${Math.abs(ball.acc.y).toFixed(1)}`,
          ax + outside * 6,
          y + 30,
          theme.acceleration,
          {
            align: outside < 0 ? 'right' : 'left',
          },
        );
      }
    }

    const land = eventBy(history.events, 'landed', t, id);
    if (land && focusCue === 'compare_landing') {
      drawLabel(ctx, `landed ${land.t.toFixed(2)} s`, x + outside * 10, floorY + 16, color[id]!, {
        align: outside < 0 ? 'right' : 'left',
      });
    }
  }

  drawClock(ctx, t, theme);
}
