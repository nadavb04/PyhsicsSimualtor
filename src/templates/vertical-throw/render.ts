import { findBody, resampleEvery, sampleAt } from '@/engine/recorder';
import type { BodySample, History, SimEvent } from '@/engine/types';
import {
  clear,
  drawArrow,
  drawDot,
  drawLabel,
  drawLine,
  drawRing,
  drawVerticalRuler,
} from '@/render/primitives';
import type { FrameData, RenderContext } from '../types';
import { STONE_ID, readParams, referenceHeight, type VerticalThrowState } from './physics';

const BUILDING_LEFT = -5;
const BUILDING_RIGHT = 0;
const STROBE_INTERVAL = 0.2;
const STONE_RADIUS = 8;
/** Screen-space offset of the descending column so up/down strobe dots don't overlap. */
const DOWN_COLUMN_PX = 18;

export const CUES = [
  'compare_height_crossings',
  'compare_crossing_speeds',
  'highlight_turning_point',
  'show_velocity_vector',
] as const;

/** Smoothly shift falling positions to the right of rising ones. */
function columnOffset(v: number, v0: number): number {
  const ref = Math.max(0.5, 0.08 * v0);
  const f = Math.min(1, Math.max(0, 0.5 - v / (2 * ref)));
  return f * DOWN_COLUMN_PX;
}

export function renderVerticalThrow(rc: RenderContext, frame: FrameData<VerticalThrowState>): void {
  const { ctx, camera: cam, theme, width, height } = rc;
  const { params, history, overlays, focusCue, ghost, state } = frame;
  const q = readParams(params);
  const t = state.t;
  const sx = (b: BodySample) => cam.toX(b.pos.x) + columnOffset(b.vel.y, q.launchSpeed);

  clear(ctx, width, height, theme.background);

  // Ground and building.
  const groundY = cam.toY(0);
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = theme.structure;
  const bx = cam.toX(BUILDING_LEFT);
  ctx.fillRect(
    bx,
    cam.toY(q.buildingHeight),
    cam.toX(BUILDING_RIGHT) - bx,
    groundY - cam.toY(q.buildingHeight),
  );

  // Ledge height line.
  const ledgeY = cam.toY(q.buildingHeight);
  drawLine(ctx, cam.toX(BUILDING_RIGHT), ledgeY, width - 60, ledgeY, theme.text, {
    dash: [4, 6],
    alpha: 0.5,
  });

  drawVerticalRuler(ctx, cam, 0, cam.visible.maxY, theme.text);

  // Reference height used by the "same height twice" sub-questions.
  const cueCrossings =
    focusCue === 'compare_height_crossings' || focusCue === 'compare_crossing_speeds';
  if (cueCrossings) {
    const ry = cam.toY(referenceHeight(q));
    drawLine(ctx, cam.toX(BUILDING_RIGHT), ry, width - 60, ry, theme.reference, {
      dash: [8, 5],
      lineWidth: 2,
    });
    drawLabel(ctx, 'test height', width - 64, ry + 14, theme.reference, { align: 'right' });
  }

  // Ghost comparison run, kept in sync with the live clock.
  if (ghost && overlays.showGhostComparison) {
    const g = findBody(sampleAt(ghost.history, t), STONE_ID);
    if (overlays.showStrobeDots) drawStrobe(ctx, ghost.history, t, sx, cam.toY, theme.ghost, 0.35);
    if (g) {
      drawDot(ctx, sx(g), cam.toY(g.pos.y), STONE_RADIUS, theme.ghost, 0.45);
      drawLabel(ctx, ghost.label, sx(g) + 14, cam.toY(g.pos.y), theme.ghost);
    }
  }

  if (overlays.showStrobeDots) drawStrobe(ctx, history, t, sx, cam.toY, theme.strobe, 0.55);

  // Event markers.
  const events = history.events;
  if (cueCrossings) {
    for (const e of events.filter((ev) => ev.type === 'reference-crossing')) {
      drawCrossing(rc, e, focusCue === 'compare_crossing_speeds', q.launchSpeed);
    }
  }
  const peak = events.find((e) => e.type === 'turning-point');
  if (peak?.pos) {
    const highlight = focusCue === 'highlight_turning_point';
    const px = cam.toX(peak.pos.x) + DOWN_COLUMN_PX / 2;
    const py = cam.toY(peak.pos.y);
    drawRing(ctx, px, py, highlight ? 16 : 11, theme.marker, highlight ? 3 : 1.5);
    if (highlight) drawLabel(ctx, 'top: v = 0, a still ↓', px + 22, py, theme.marker);
  }

  // The stone and its vectors.
  const stone = findBody(sampleAt(history, t), STONE_ID);
  if (!stone) return;
  const x = sx(stone);
  const y = cam.toY(stone.pos.y);
  const stageH = cam.height;
  // Scale by the fastest speed in the flight (at landing) so the arrow always fits the stage.
  const maxSpeed = Math.sqrt(q.launchSpeed ** 2 + 2 * q.gravity * q.buildingHeight);
  const velScale = (0.22 * stageH) / Math.max(maxSpeed, 5);
  const accScale = (0.12 * stageH) / q.gravity;

  drawDot(ctx, x, y, STONE_RADIUS, theme.body);

  // Once landed the stone is at rest on the ground: no flight vectors.
  // (status, not y > 0, so a throw from ground level still shows vectors at t = 0).
  const inFlight = frame.status !== 'finished';
  const showVel = inFlight && (overlays.showVelocityVector || focusCue === 'show_velocity_vector');
  if (showVel) {
    drawArrow(ctx, x - 4, y, 0, -stone.vel.y * velScale, {
      color: theme.velocity,
      label: 'v',
      minLength: 4,
    });
  }
  if (inFlight && overlays.showAccelerationVector) {
    drawArrow(ctx, x + 12, y, 0, -stone.acc.y * accScale, {
      color: theme.acceleration,
      label: 'a',
    });
  }

  // Compact readout.
  drawLabel(ctx, `t = ${t.toFixed(2)} s`, 10, 16, theme.text);
  drawLabel(ctx, `speed ${Math.abs(stone.vel.y).toFixed(1)} m/s`, 10, 40, theme.velocity);
}

function drawStrobe(
  ctx: CanvasRenderingContext2D,
  history: History,
  t: number,
  sx: (b: BodySample) => number,
  sy: (y: number) => number,
  color: string,
  alpha: number,
): void {
  for (const snap of resampleEvery(history, STROBE_INTERVAL, t)) {
    const b = findBody(snap, STONE_ID);
    if (b) drawDot(ctx, sx(b), sy(b.pos.y), 3.5, color, alpha);
  }
}

function drawCrossing(rc: RenderContext, e: SimEvent, showSpeed: boolean, v0: number): void {
  if (!e.pos || !e.data) return;
  const goingUp = e.data.direction === 'up';
  const x = rc.camera.toX(e.pos.x) + columnOffset(goingUp ? v0 : -v0, v0);
  const y = rc.camera.toY(e.pos.y);
  drawRing(rc.ctx, x, y, 10, rc.theme.reference, 2.5);
  if (showSpeed && typeof e.data.speed === 'number') {
    const label = `${goingUp ? '↑' : '↓'} ${e.data.speed.toFixed(1)} m/s`;
    drawLabel(
      rc.ctx,
      label,
      goingUp ? x - 16 : x + 16,
      y + (goingUp ? 18 : -18),
      rc.theme.reference,
      {
        align: goingUp ? 'right' : 'left',
      },
    );
  }
}
