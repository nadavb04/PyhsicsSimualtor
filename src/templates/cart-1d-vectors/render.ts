import { findBody, sampleAt } from '@/engine/recorder';
import type { BodySample } from '@/engine/types';
import {
  clear,
  drawArrow,
  drawBox,
  drawDot,
  drawHorizontalRuler,
  drawLabel,
  drawLine,
  drawRing,
} from '@/render/primitives';
import type { FrameData, RenderContext } from '../types';
import { drawClock, drawStrobeTrail, eventBy } from '../shared';
import { CART_ID, RUN_SECONDS, readParams, speedTrend, type CartState } from './physics';

export const CUES = ['show_speed_trend', 'highlight_turnaround', 'show_velocity_vector'] as const;

const STROBE_INTERVAL = 0.5;

const signed = (v: number, digits = 1) => `${v >= 0 ? '+' : ''}${v.toFixed(digits)}`;

export function renderCart(rc: RenderContext, frame: FrameData<CartState>): void {
  const { ctx, camera: cam, theme, width, height } = rc;
  const { params, history, overlays, focusCue, state } = frame;
  const q = readParams(params);
  const t = state.t;
  const trackY = cam.toY(0);
  const toScreen = (b: BodySample) => ({ x: cam.toX(b.pos.x), y: trackY });

  clear(ctx, width, height, theme.background);

  // Track, start mark and the sign convention.
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, trackY + 9, width, 6);
  drawHorizontalRuler(ctx, cam, cam.visible.minX, cam.visible.maxX, trackY + 20, theme.text);
  const x0 = cam.toX(0);
  drawLine(ctx, x0, trackY - 26, x0, trackY + 15, theme.text, { dash: [3, 4], alpha: 0.6 });
  drawLabel(ctx, 'start', x0, trackY - 72, theme.text, { align: 'center' });
  drawArrow(ctx, width - 50, 44, 36, 0, { color: theme.text, lineWidth: 2 });
  drawLabel(ctx, '+ direction', width - 56, 44, theme.text, { align: 'right' });

  if (overlays.showStrobeDots) {
    drawStrobeTrail(ctx, history, STROBE_INTERVAL, t, CART_ID, toScreen, theme.strobe, 0.5, 3);
  }

  const turn = eventBy(history.events, 'turnaround', t);
  if (turn?.pos) {
    const highlight = focusCue === 'highlight_turnaround';
    const px = cam.toX(turn.pos.x);
    drawRing(ctx, px, trackY, highlight ? 16 : 11, theme.marker, highlight ? 3 : 1.5);
    if (highlight) {
      drawLabel(ctx, 'v = 0 here: turns around', px, trackY - 50, theme.marker, {
        align: 'center',
      });
    }
  }

  const cart = findBody(sampleAt(history, t), CART_ID);
  if (!cart) return;
  const cx = cam.toX(cart.pos.x);
  drawBox(ctx, cx, trackY, 26, 14, theme.body);
  drawDot(ctx, cx - 7, trackY + 8, 3, theme.structure);
  drawDot(ctx, cx + 7, trackY + 8, 3, theme.structure);

  // Scale arrows to the fastest speed of the run so they always fit.
  const vMax = Math.max(
    Math.abs(q.initialVelocity),
    Math.abs(q.initialVelocity + q.acceleration * RUN_SECONDS),
    2,
  );
  const velScale = 70 / vMax;
  if (overlays.showVelocityVector || focusCue === 'show_velocity_vector') {
    drawArrow(ctx, cx, trackY - 16, cart.vel.x * velScale, 0, {
      color: theme.velocity,
      label: 'v',
      minLength: 4,
    });
  }
  if (overlays.showAccelerationVector) {
    drawArrow(ctx, cx, trackY - 32, cart.acc.x * 22, 0, {
      color: theme.acceleration,
      label: 'a',
      minLength: 4,
    });
  }

  drawClock(ctx, t, theme);
  const rowY = Math.min(height - 38, trackY + 56);
  drawLabel(ctx, `v = ${signed(cart.vel.x)} m/s`, 10, rowY, theme.velocity);
  drawLabel(ctx, `speed ${Math.abs(cart.vel.x).toFixed(1)} m/s`, 10, rowY + 24, theme.velocity);
  drawLabel(ctx, `a = ${signed(q.acceleration)} m/s²`, width - 10, rowY, theme.acceleration, {
    align: 'right',
  });
  if (focusCue === 'show_speed_trend') {
    drawLabel(ctx, speedTrend(cart.vel.x, q.acceleration), width - 10, rowY + 24, theme.marker, {
      align: 'right',
    });
  }
}
