import { findBody, resampleEvery, sampleAt } from '@/engine/recorder';
import type { History } from '@/engine/types';
import type { Camera } from '@/render/camera';
import {
  clear,
  drawArrow,
  drawDot,
  drawHorizontalRuler,
  drawLabel,
  drawLine,
} from '@/render/primitives';
import type { FrameData, RenderContext } from '../types';
import { drawClock } from '../shared';
import { RUNNER_ID, readParams, type RunnerState } from './physics';

export const CUES = ['label_dot_spacing', 'compare_spacing', 'show_velocity_vector'] as const;

/** The ghost runs in its own lane, this many pixels above the live runner. */
const GHOST_LANE_PX = 44;

interface Lane {
  history: History;
  y: number;
  color: string;
  alpha: number;
}

/** Strobe dots for one lane; returns their screen x positions. */
function drawDots(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  lane: Lane,
  interval: number,
  t: number,
): { x: number; worldX: number }[] {
  const dots = resampleEvery(lane.history, interval, t)
    .map((s) => findBody(s, RUNNER_ID)?.pos.x)
    .filter((x): x is number => typeof x === 'number')
    .map((worldX) => ({ x: cam.toX(worldX), worldX }));
  for (const d of dots) {
    drawLine(ctx, d.x, lane.y - 9, d.x, lane.y + 9, lane.color, { alpha: 0.35 * lane.alpha });
    drawDot(ctx, d.x, lane.y, 4.5, lane.color, 0.8 * lane.alpha);
  }
  return dots;
}

/** Spacing labels between neighbouring dots, skipping ones that would overlap. */
function labelSpacings(
  ctx: CanvasRenderingContext2D,
  dots: { x: number; worldX: number }[],
  y: number,
  color: string,
): void {
  let lastRight = -Infinity;
  for (let i = 1; i < dots.length; i++) {
    const a = dots[i - 1]!;
    const b = dots[i]!;
    const mid = (a.x + b.x) / 2;
    const text = `${(b.worldX - a.worldX).toFixed(1)}`;
    if (mid - 14 < lastRight || b.x - a.x < 8) continue;
    drawLabel(ctx, text, mid, y, color, { align: 'center' });
    lastRight = mid + 14;
  }
}

export function renderStrobeRunner(rc: RenderContext, frame: FrameData<RunnerState>): void {
  const { ctx, camera: cam, theme, width, height } = rc;
  const { params, history, overlays, focusCue, ghost, state } = frame;
  const q = readParams(params);
  const t = state.t;
  const showGhost = !!ghost && !!overlays.showGhostComparison;
  // Centre the lanes vertically as a pair.
  const laneY = cam.toY(0) + (showGhost ? GHOST_LANE_PX / 2 : 0);
  const ghostY = laneY - GHOST_LANE_PX;

  clear(ctx, width, height, theme.background);

  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, laneY + 14, width, 5);
  if (showGhost) ctx.fillRect(0, ghostY + 11, width, 3);
  drawHorizontalRuler(
    ctx,
    cam,
    Math.max(0, cam.visible.minX),
    cam.visible.maxX,
    laneY + 24,
    theme.text,
  );

  const lanes: (Lane & { label?: string })[] = [
    { history, y: laneY, color: theme.strobe, alpha: 1 },
  ];
  if (showGhost && ghost) {
    lanes.push({
      history: ghost.history,
      y: ghostY,
      color: theme.ghost,
      alpha: 0.8,
      label: ghost.label,
    });
  }

  for (const lane of lanes) {
    const dots = overlays.showStrobeDots ? drawDots(ctx, cam, lane, q.strobeInterval, t) : [];
    if (focusCue === 'label_dot_spacing' || focusCue === 'compare_spacing') {
      labelSpacings(ctx, dots, lane.y - 20, lane.color);
    }
    const runner = findBody(sampleAt(lane.history, t), RUNNER_ID);
    if (!runner) continue;
    const x = cam.toX(runner.pos.x);
    drawDot(ctx, x, lane.y - 6, 5, lane === lanes[0] ? theme.bodyA : theme.ghost, lane.alpha);
    drawLine(ctx, x, lane.y - 2, x, lane.y + 10, lane === lanes[0] ? theme.bodyA : theme.ghost, {
      lineWidth: 3,
      alpha: lane.alpha,
    });
    if (lane.label) drawLabel(ctx, `ghost: ${lane.label}`, 10, 40, theme.ghost);
    if (lane === lanes[0] && (overlays.showVelocityVector || focusCue === 'show_velocity_vector')) {
      drawArrow(ctx, x, lane.y + 50, runner.vel.x * 6, 0, {
        color: theme.velocity,
        label: 'v',
        minLength: 4,
      });
    }
  }

  drawClock(ctx, t, theme);
  drawLabel(ctx, `strobe every ${q.strobeInterval.toFixed(2)} s`, width - 10, 16, theme.strobe, {
    align: 'right',
  });
  const runner = findBody(sampleAt(history, t), RUNNER_ID);
  if (runner) {
    drawLabel(
      ctx,
      `speed ${runner.vel.x.toFixed(1)} m/s`,
      10,
      Math.min(height - 14, laneY + 72),
      theme.velocity,
    );
  }
}
