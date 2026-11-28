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
  drawMiniGraph,
  drawRing,
  graphMapper,
} from '@/render/primitives';
import type { FrameData, RenderContext } from '../types';
import { drawClock, drawStrobeTrail, eventBy, seriesFrom } from '../shared';
import { A_ID, B_ID, endTime, readParams, type ChaseState } from './physics';

export const CUES = [
  'compare_speeds_at_pass',
  'highlight_equal_speed',
  'show_gap',
  'show_velocity_vector',
] as const;

const STROBE_INTERVAL = 0.5;
/** Lanes are a fixed pixel distance apart so they stay readable at any zoom. */
const LANE_PX = 13;

export function renderChase(rc: RenderContext, frame: FrameData<ChaseState>): void {
  const { ctx, camera: cam, theme, width, height } = rc;
  const { params, history, overlays, focusCue, state } = frame;
  const q = readParams(params);
  const bus = q.scene >= 0.5;
  const names = bus ? { A: 'runner', B: 'bus' } : { A: 'A', B: 'B' };
  const t = state.t;
  const tEnd = endTime(q);

  clear(ctx, width, height, theme.background);

  const roadY = cam.toY(0);
  const laneY: Record<string, number> = { [A_ID]: roadY - LANE_PX, [B_ID]: roadY + LANE_PX };
  const color: Record<string, string> = { [A_ID]: theme.bodyA, [B_ID]: theme.bodyB };
  const toScreen = (b: BodySample) => ({ x: cam.toX(b.pos.x), y: laneY[b.id] ?? roadY });

  // Road.
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, roadY - 2 * LANE_PX - 2, width, 4 * LANE_PX + 4);
  drawLine(ctx, 0, roadY, width, roadY, theme.text, { dash: [10, 8], alpha: 0.35 });
  drawHorizontalRuler(
    ctx,
    cam,
    Math.max(cam.visible.minX, 0),
    cam.visible.maxX,
    roadY + 2 * LANE_PX + 6,
    theme.text,
  );
  if (bus) {
    const stopX = cam.toX(q.initialGap);
    drawLine(ctx, stopX, roadY - 2 * LANE_PX - 10, stopX, roadY + 2 * LANE_PX, theme.marker, {
      alpha: 0.6,
    });
    drawLabel(ctx, 'bus stop', stopX, roadY - 2 * LANE_PX - 18, theme.marker, { align: 'center' });
  }

  if (overlays.showStrobeDots) {
    for (const id of [A_ID, B_ID]) {
      drawStrobeTrail(ctx, history, STROBE_INTERVAL, t, id, toScreen, color[id]!, 0.45, 3);
    }
  }

  const snap = sampleAt(history, t);
  const a = findBody(snap, A_ID);
  const b = findBody(snap, B_ID);
  if (!a || !b) return;
  const pa = toScreen(a);
  const pb = toScreen(b);

  // Gap bracket (chase questions).
  if (focusCue === 'show_gap') {
    const gap = b.pos.x - a.pos.x;
    drawLine(ctx, pa.x, roadY, pb.x, roadY, theme.reference, { lineWidth: 2 });
    drawLabel(
      ctx,
      `gap ${Math.max(0, gap).toFixed(1)} m`,
      (pa.x + pb.x) / 2,
      roadY - 2 * LANE_PX - 18,
      theme.reference,
      { align: 'center' },
    );
    const closest = eventBy(history.events, 'speeds-equal', t);
    if (closest?.data && typeof closest.data.xA === 'number') {
      const x0 = cam.toX(closest.data.xA);
      const x1 = cam.toX(Number(closest.data.xB));
      drawLine(ctx, x0, roadY, x1, roadY, theme.marker, { lineWidth: 5 });
      drawRing(ctx, x0, laneY[A_ID]!, 10, theme.marker, 2);
      if (Number(closest.data.gap) > 0) {
        drawLabel(
          ctx,
          `closest ${Number(closest.data.gap).toFixed(1)} m`,
          Math.max(x0, 60),
          roadY + 2 * LANE_PX + 62,
          theme.marker,
          { align: 'center' },
        );
      }
    }
  }

  // Bodies.
  if (bus) {
    // The tracked point is the bus door at its rear; the body extends ahead of it.
    drawBox(ctx, pb.x + 17, pb.y, 34, 15, color[B_ID]!);
    drawDot(ctx, pa.x, pa.y, 7, color[A_ID]!);
  } else {
    drawBox(ctx, pa.x - 11, pa.y, 24, 12, color[A_ID]!);
    drawBox(ctx, pb.x - 11, pb.y, 24, 12, color[B_ID]!);
  }
  const caught = eventBy(history.events, 'caught', t);
  if (caught?.pos) {
    drawRing(ctx, cam.toX(caught.pos.x), laneY[A_ID]!, 14, theme.marker, 3);
    drawLabel(ctx, 'caught it!', cam.toX(caught.pos.x), roadY - 2 * LANE_PX - 18, theme.marker, {
      align: 'center',
    });
  }

  // Overtake marker with the two speeds.
  const pass = eventBy(history.events, 'pass', t);
  if (pass?.pos && focusCue === 'compare_speeds_at_pass') {
    const x = cam.toX(pass.pos.x);
    drawLine(ctx, x, roadY - 2 * LANE_PX - 4, x, roadY + 2 * LANE_PX + 4, theme.marker, {
      lineWidth: 2,
    });
    drawLabel(
      ctx,
      `side by side: ${names.A} ${Number(pass.data?.speedA).toFixed(1)}, ${names.B} ${Number(pass.data?.speedB).toFixed(1)} m/s`,
      Math.min(Math.max(x, 130), width - 130),
      roadY - 2 * LANE_PX - 18,
      theme.marker,
      { align: 'center' },
    );
  }

  // Velocity arrows above/below the lanes.
  if (overlays.showVelocityVector || focusCue === 'show_velocity_vector') {
    const vMax = Math.max(q.speedA, q.accelB * tEnd, 1);
    const scale = 46 / vMax;
    drawArrow(ctx, pa.x, pa.y - 11, a.vel.x * scale, 0, { color: theme.velocity, minLength: 4 });
    drawArrow(ctx, pb.x, pb.y + 11, b.vel.x * scale, 0, { color: theme.velocity, minLength: 4 });
  }

  // Live v(t) graph in the sky above the road.
  const graphBottom = roadY - 2 * LANE_PX - 32;
  if (overlays.showLiveVTGraph && graphBottom > 70) {
    const rect = { x: 8, y: 30, w: width - 16, h: Math.min(130, graphBottom - 30) };
    const domain = {
      minX: 0,
      maxX: tEnd,
      minY: 0,
      maxY: Math.max(q.speedA, q.accelB * tEnd) * 1.1,
    };
    drawMiniGraph(
      ctx,
      rect,
      domain,
      [
        { points: seriesFrom(history, A_ID, t, (s) => s.vel.x), color: color[A_ID]! },
        { points: seriesFrom(history, B_ID, t, (s) => s.vel.x), color: color[B_ID]! },
      ],
      { axisColor: theme.text, yLabel: 'speed v(t)', xLabel: 't' },
    );
    const same = eventBy(history.events, 'speeds-equal', t);
    if (same && focusCue === 'highlight_equal_speed') {
      const m = graphMapper(rect, domain);
      const gx = m.sx(same.t);
      const gy = m.sy(Number(same.data?.speed));
      drawLine(ctx, gx, rect.y, gx, rect.y + rect.h, theme.marker, { dash: [3, 4], alpha: 0.8 });
      drawRing(ctx, gx, gy, 7, theme.marker, 2.5);
      drawLabel(ctx, `same speed, t = ${same.t.toFixed(1)} s`, gx + 10, gy - 14, theme.marker, {
        align: gx > width / 2 ? 'right' : 'left',
      });
      // Where the cars were at that instant: the widest gap.
      const at = sampleAt(history, same.t);
      const sa = findBody(at, A_ID);
      const sb = findBody(at, B_ID);
      if (sa && sb) {
        drawDot(ctx, cam.toX(sa.pos.x), laneY[A_ID]!, 5, theme.marker, 0.8);
        drawDot(ctx, cam.toX(sb.pos.x), laneY[B_ID]!, 5, theme.marker, 0.8);
      }
    }
  }

  // Readouts.
  drawClock(ctx, t, theme, 16);
  const rowY = Math.min(height - 14, roadY + 2 * LANE_PX + 38);
  drawLabel(ctx, `${names.A} ${a.vel.x.toFixed(1)} m/s`, 10, rowY, color[A_ID]!);
  drawLabel(ctx, `${names.B} ${b.vel.x.toFixed(1)} m/s`, width - 10, rowY, color[B_ID]!, {
    align: 'right',
  });
}
