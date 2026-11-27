import { findBody, sampleAt } from '@/engine/recorder';
import type { BodySample, History } from '@/engine/types';
import {
  clear,
  drawArrow,
  drawBox,
  drawHorizontalRuler,
  drawLabel,
  drawLine,
  drawMiniGraph,
  drawRing,
  graphMapper,
  type GraphDomain,
  type GraphRect,
} from '@/render/primitives';
import type { Theme } from '@/render/theme';
import type { FrameData, RenderContext } from '../types';
import { drawClock, drawStrobeTrail, eventBy, seriesFrom } from '../shared';
import { GLIDER_ID, RUN_SECONDS, readParams, velocityAt, type GliderState } from './physics';

export const CUES = [
  'highlight_zero_crossing',
  'highlight_farthest_point',
  'show_velocity_vector',
] as const;

const STROBE_INTERVAL = 0.5;

/** One-decimal signed number, without a "-0.0" for values that round to zero. */
function signed(v: number): string {
  const s = v.toFixed(1);
  if (Number(s) === 0) return '0.0';
  return v > 0 ? `+${s}` : s;
}

/** Sample (so far) at which the glider was farthest from its start. */
function farthestSoFar(history: History, t: number): BodySample & { t: number } {
  let best = { t: 0, ...findBody(history.samples[0], GLIDER_ID)! };
  for (const s of history.samples) {
    if (s.t > t) break;
    const b = findBody(s, GLIDER_ID);
    if (b && Math.abs(b.pos.x) > Math.abs(best.pos.x) + 1e-9) best = { t: s.t, ...b };
  }
  return best;
}

/** Light fill between the v(t) line and v = 0: the area is the displacement. */
function shadeArea(
  ctx: CanvasRenderingContext2D,
  rect: GraphRect,
  domain: GraphDomain,
  points: { x: number; y: number }[],
  theme: Theme,
): void {
  const { sx, sy } = graphMapper(rect, domain);
  ctx.save();
  ctx.globalAlpha = 0.18;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    ctx.fillStyle = a.y + b.y >= 0 ? theme.velocity : theme.acceleration;
    ctx.beginPath();
    ctx.moveTo(sx(a.x), sy(0));
    ctx.lineTo(sx(a.x), sy(a.y));
    ctx.lineTo(sx(b.x), sy(b.y));
    ctx.lineTo(sx(b.x), sy(0));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function renderGlider(rc: RenderContext, frame: FrameData<GliderState>): void {
  const { ctx, camera: cam, theme, width, height } = rc;
  const { params, history, overlays, focusCue, state } = frame;
  const q = readParams(params);
  const t = state.t;
  const trackY = cam.toY(0);
  const toScreen = (b: BodySample) => ({ x: cam.toX(b.pos.x), y: trackY });

  clear(ctx, width, height, theme.background);

  // Air track.
  ctx.fillStyle = theme.structure;
  ctx.fillRect(0, trackY + 8, width, 6);
  drawHorizontalRuler(ctx, cam, cam.visible.minX, cam.visible.maxX, trackY + 18, theme.text);
  const x0 = cam.toX(0);
  drawLine(ctx, x0, trackY - 22, x0, trackY + 14, theme.text, { dash: [3, 4], alpha: 0.7 });
  drawLabel(ctx, 'start', x0, trackY - 36, theme.text, { align: 'center' });

  if (overlays.showStrobeDots) {
    drawStrobeTrail(ctx, history, STROBE_INTERVAL, t, GLIDER_ID, toScreen, theme.strobe, 0.45, 3);
  }

  const glider = findBody(sampleAt(history, t), GLIDER_ID);
  if (!glider) return;
  const gx = cam.toX(glider.pos.x);

  // Live v(t) graph above the track.
  let mapper: ReturnType<typeof graphMapper> | undefined;
  let rect: GraphRect | undefined;
  const graphBottom = trackY - 44;
  if (overlays.showLiveVTGraph && graphBottom > 90) {
    rect = { x: 8, y: 30, w: width - 16, h: Math.min(170, graphBottom - 30) };
    const vEnd = velocityAt(q, RUN_SECONDS);
    const vAbs = Math.max(Math.abs(q.initialVelocity), Math.abs(vEnd), 1) * 1.15;
    const domain = { minX: 0, maxX: RUN_SECONDS, minY: -vAbs, maxY: vAbs };
    const points = seriesFrom(history, GLIDER_ID, t, (b) => b.vel.x);
    shadeArea(ctx, rect, domain, points, theme);
    drawMiniGraph(ctx, rect, domain, [{ points, color: theme.velocity }], {
      axisColor: theme.text,
      background: 'rgba(15, 23, 42, 0)',
      yLabel: 'v (m/s)',
      xLabel: 't (s)',
    });
    mapper = graphMapper(rect, domain);
    ctx.save();
    ctx.strokeStyle = theme.text;
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    drawLabel(ctx, 'v = 0', rect.x + rect.w - 6, mapper.sy(0) - 11, theme.text, { align: 'right' });
    // "Now" cursor.
    drawRing(ctx, mapper.sx(t), mapper.sy(glider.vel.x), 4, theme.velocity, 2);
  }

  const zero = eventBy(history.events, 'v-zero', t);
  if (zero?.pos && focusCue === 'highlight_zero_crossing') {
    const zx = cam.toX(zero.pos.x);
    drawRing(ctx, zx, trackY, 15, theme.marker, 3);
    drawLabel(ctx, 'v = 0: turns around', zx, trackY + 50, theme.marker, { align: 'center' });
    if (mapper) drawRing(ctx, mapper.sx(zero.t), mapper.sy(0), 8, theme.marker, 3);
  }

  if (focusCue === 'highlight_farthest_point') {
    const far = farthestSoFar(history, t);
    const fx = cam.toX(far.pos.x);
    drawLine(ctx, fx, trackY - 18, fx, trackY + 14, theme.marker, { lineWidth: 2.5 });
    drawLabel(
      ctx,
      `farthest so far ${Math.abs(far.pos.x).toFixed(1)} m`,
      fx,
      trackY + 50,
      theme.marker,
      {
        align: fx > width / 2 ? 'right' : 'left',
      },
    );
    if (mapper && rect) {
      const px = mapper.sx(far.t);
      drawLine(ctx, px, rect.y, px, rect.y + rect.h, theme.marker, { dash: [3, 4], alpha: 0.8 });
    }
  }

  drawBox(ctx, gx, trackY, 30, 12, theme.bodyA);
  const vMax = Math.max(Math.abs(q.initialVelocity), Math.abs(velocityAt(q, RUN_SECONDS)), 1);
  if (overlays.showVelocityVector || focusCue === 'show_velocity_vector') {
    drawArrow(ctx, gx, trackY - 14, (glider.vel.x * 60) / vMax, 0, {
      color: theme.velocity,
      label: 'v',
      minLength: 4,
    });
  }
  if (overlays.showAccelerationVector) {
    drawArrow(ctx, gx, trackY - 28, q.acceleration * 22, 0, {
      color: theme.acceleration,
      label: 'a',
      minLength: 4,
    });
  }

  drawClock(ctx, t, theme);
  drawLabel(
    ctx,
    `x ${signed(glider.pos.x)} m   v ${signed(glider.vel.x)} m/s`,
    width - 10,
    16,
    theme.text,
    { align: 'right' },
  );
}
