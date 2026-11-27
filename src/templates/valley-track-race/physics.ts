/**
 * Two marbles race over the same horizontal distance with negligible friction.
 * Track A is flat. Track B dips into a smooth cosine valley and climbs back to its
 * starting height. Marbles are treated as frictionless beads on the track.
 *
 * Track B speed follows from energy: v² = v0² − 2g·f(x), with f ≤ 0 the track height.
 * Only the horizontal position needs integrating: dx/dt = v / √(1 + f′(x)²).
 */
import { rk4 } from '@/engine/integrators';
import type { BaseSimState, Params, PhysicsModel, SimEvent } from '@/engine/types';
import { num } from '../shared';

export const A_ID = 'A';
export const B_ID = 'B';
export const GRAVITY = 9.8;
export const FLAT_IN = 4;
export const VALLEY_WIDTH = 16;
export const VALLEY_START = FLAT_IN;
export const VALLEY_END = FLAT_IN + VALLEY_WIDTH;
export const COURSE_LENGTH = VALLEY_END + 4;
/** Track B is drawn this far below track A (m), so the two don't overlap. */
export const TRACK_B_OFFSET = -1.6;

export interface RaceState extends BaseSimState {
  xA: number;
  xB: number;
}

export interface RaceParams {
  initialSpeed: number;
  valleyDepth: number;
}

export function readParams(p: Params): RaceParams {
  return {
    initialSpeed: Math.max(0.2, num(p.initialSpeed, 4)),
    valleyDepth: Math.max(0, num(p.valleyDepth, 2)),
  };
}

/** Height of track B relative to its rim (≤ 0 inside the valley). */
export function trackHeight(q: RaceParams, x: number): number {
  if (x <= VALLEY_START || x >= VALLEY_END) return 0;
  const phase = (2 * Math.PI * (x - VALLEY_START)) / VALLEY_WIDTH;
  return (-q.valleyDepth * (1 - Math.cos(phase))) / 2;
}

/** Slope dy/dx of track B. */
export function trackSlope(q: RaceParams, x: number): number {
  if (x <= VALLEY_START || x >= VALLEY_END) return 0;
  const phase = (2 * Math.PI * (x - VALLEY_START)) / VALLEY_WIDTH;
  return ((-q.valleyDepth * Math.PI) / VALLEY_WIDTH) * Math.sin(phase);
}

/** Speed along track B at x, from energy conservation. */
export function speedOnB(q: RaceParams, x: number): number {
  return Math.sqrt(q.initialSpeed ** 2 - 2 * GRAVITY * trackHeight(q, x));
}

/** Horizontal velocity on track B at x. */
function horizontalSpeedB(q: RaceParams, x: number): number {
  return speedOnB(q, x) / Math.sqrt(1 + trackSlope(q, x) ** 2);
}

export const racePhysics: PhysicsModel<RaceState> = {
  init: () => ({ t: 0, xA: 0, xB: 0 }),

  step(s, dt, p) {
    const q = readParams(p);
    const xA = Math.min(COURSE_LENGTH, s.xA + q.initialSpeed * dt);
    const xB =
      s.xB >= COURSE_LENGTH
        ? COURSE_LENGTH
        : Math.min(
            COURSE_LENGTH,
            rk4(s.xB, s.t, dt, (x) => horizontalSpeedB(q, x)),
          );
    return { t: s.t + dt, xA, xB };
  },

  sample(s, p) {
    const q = readParams(p);
    const v = speedOnB(q, s.xB);
    const slope = trackSlope(q, s.xB);
    const norm = Math.sqrt(1 + slope * slope);
    const doneA = s.xA >= COURSE_LENGTH;
    const doneB = s.xB >= COURSE_LENGTH;
    // Tangential acceleration on B: −g·sinθ along the track.
    const aT = (-GRAVITY * slope) / norm;
    return [
      {
        id: A_ID,
        pos: { x: s.xA, y: 0 },
        vel: { x: doneA ? 0 : q.initialSpeed, y: 0 },
        acc: { x: 0, y: 0 },
      },
      {
        id: B_ID,
        pos: { x: s.xB, y: TRACK_B_OFFSET + trackHeight(q, s.xB) },
        vel: doneB ? { x: 0, y: 0 } : { x: v / norm, y: (v * slope) / norm },
        acc: doneB ? { x: 0, y: 0 } : { x: aT / norm, y: (aT * slope) / norm },
      },
    ];
  },

  detectEvents(prev, next, p) {
    const q = readParams(p);
    const events: SimEvent[] = [];
    const dt = next.t - prev.t;
    const tAt = (x0: number, x1: number, target: number) =>
      prev.t + ((target - x0) / Math.max(x1 - x0, 1e-12)) * dt;

    if (prev.xB < VALLEY_END && next.xB >= VALLEY_END) {
      events.push({
        t: tAt(prev.xB, next.xB, VALLEY_END),
        type: 'valley-exit',
        bodyId: B_ID,
        pos: { x: VALLEY_END, y: TRACK_B_OFFSET },
        data: { speedA: q.initialSpeed, speedB: speedOnB(q, VALLEY_END) },
      });
    }
    for (const [id, x0, x1] of [
      [A_ID, prev.xA, next.xA],
      [B_ID, prev.xB, next.xB],
    ] as const) {
      if (x0 < COURSE_LENGTH && x1 >= COURSE_LENGTH) {
        // Positions are clamped at the line; both tracks are flat there, at speed v0.
        const t = prev.t + Math.min(dt, (COURSE_LENGTH - x0) / q.initialSpeed);
        events.push({ t, type: 'finish', bodyId: id });
      }
    }
    return events;
  },

  isFinished: (s) => s.xA >= COURSE_LENGTH && s.xB >= COURSE_LENGTH,
  maxDuration: () => 60,
};
