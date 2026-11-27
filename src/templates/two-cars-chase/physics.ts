/**
 * Two bodies on a straight road (x along the road, m; + = forward).
 * Body A moves at a constant speed. Body B starts from rest `initialGap` metres
 * ahead of A and accelerates uniformly.
 *
 * - Two cars passing (gap 0): A cruises past B just as B pulls away; B later overtakes.
 * - Chasing a bus (gap > 0): a runner (A) chases a bus (B) pulling away from the stop.
 */
import { crossingFraction, velocityVerlet } from '@/engine/integrators';
import type { BaseSimState, Params, PhysicsModel, SimEvent } from '@/engine/types';
import { num } from '../shared';

export const A_ID = 'A';
export const B_ID = 'B';
/** Extra seconds shown after an overtake or a catch, so the result is visible. */
const AFTER_PASS = 0.75;
const AFTER_CATCH = 0.6;

export interface ChaseState extends BaseSimState {
  xA: number;
  xB: number;
  vB: number;
}

export interface ChaseParams {
  speedA: number;
  accelB: number;
  initialGap: number;
  /** 0 = two cars, 1 = runner chasing a bus (drawing only). */
  scene: number;
}

export function readParams(p: Params): ChaseParams {
  return {
    speedA: Math.max(0.1, num(p.speedA, 8)),
    accelB: Math.max(0.05, num(p.accelB, 4)),
    initialGap: Math.max(0, num(p.initialGap, 0)),
    scene: num(p.scene, 0),
  };
}

/** Time at which B's speed equals A's: v / a. */
export function equalSpeedTime(q: ChaseParams): number {
  return q.speedA / q.accelB;
}

/** Time at which A catches B (gap > 0), or undefined if A never reaches B. */
export function catchTime(q: ChaseParams): number | undefined {
  if (q.initialGap <= 0) return undefined;
  const disc = q.speedA ** 2 - 2 * q.accelB * q.initialGap;
  return disc < 0 ? undefined : (q.speedA - Math.sqrt(disc)) / q.accelB;
}

/** Smallest A-to-B distance during the chase: d − v²/2a at the equal-speed instant (≥ 0). */
export function closestGap(q: ChaseParams): number {
  return Math.max(0, q.initialGap - q.speedA ** 2 / (2 * q.accelB));
}

/** Slowest constant speed that still reaches B: √(2·a·d). */
export function speedNeededToCatch(accelB: number, gap: number): number {
  return Math.sqrt(2 * accelB * gap);
}

/** When the run ends: just after the overtake / catch, or well past the closest approach. */
export function endTime(q: ChaseParams): number {
  if (q.initialGap <= 0) return (2 * q.speedA) / q.accelB + AFTER_PASS;
  const caught = catchTime(q);
  return caught !== undefined ? caught + AFTER_CATCH : (2 * q.speedA) / q.accelB + AFTER_PASS;
}

export function positionsAt(q: ChaseParams, t: number): { xA: number; xB: number } {
  return { xA: q.speedA * t, xB: q.initialGap + 0.5 * q.accelB * t * t };
}

export const chasePhysics: PhysicsModel<ChaseState> = {
  init(p) {
    const q = readParams(p);
    return { t: 0, xA: 0, xB: q.initialGap, vB: 0 };
  },

  step(s, dt, p) {
    const q = readParams(p);
    const b = velocityVerlet({ x: s.xB, v: s.vB }, s.t, dt, () => q.accelB);
    return { t: s.t + dt, xA: s.xA + q.speedA * dt, xB: b.x, vB: b.v };
  },

  sample(s, p) {
    const q = readParams(p);
    return [
      { id: A_ID, pos: { x: s.xA, y: 0 }, vel: { x: q.speedA, y: 0 }, acc: { x: 0, y: 0 } },
      { id: B_ID, pos: { x: s.xB, y: 0 }, vel: { x: s.vB, y: 0 }, acc: { x: q.accelB, y: 0 } },
    ];
  },

  detectEvents(prev, next, p) {
    const q = readParams(p);
    const events: SimEvent[] = [];
    const dt = next.t - prev.t;
    const at = (f: number) => ({
      t: prev.t + f * dt,
      xA: prev.xA + f * (next.xA - prev.xA),
      xB: prev.xB + f * (next.xB - prev.xB),
      vB: prev.vB + f * (next.vB - prev.vB),
    });

    if (prev.vB < q.speedA && next.vB >= q.speedA) {
      const e = at(crossingFraction(prev.vB, next.vB, q.speedA));
      events.push({
        t: e.t,
        type: 'speeds-equal',
        pos: { x: e.xA, y: 0 },
        data: { speed: q.speedA, gap: e.xB - e.xA, xA: e.xA, xB: e.xB },
      });
    }

    const relPrev = prev.xB - prev.xA;
    const relNext = next.xB - next.xA;
    if (relPrev < 0 && relNext >= 0) {
      const e = at(crossingFraction(relPrev, relNext, 0));
      events.push({
        t: e.t,
        type: 'pass',
        bodyId: B_ID,
        pos: { x: e.xB, y: 0 },
        data: { speedA: q.speedA, speedB: e.vB },
      });
    }
    if (relPrev > 0 && relNext <= 0) {
      const e = at(crossingFraction(relPrev, relNext, 0));
      events.push({
        t: e.t,
        type: 'caught',
        bodyId: A_ID,
        pos: { x: e.xA, y: 0 },
        data: { speedA: q.speedA, speedB: e.vB },
      });
    }
    return events;
  },

  isFinished: (s, p) => s.t >= endTime(readParams(p)),
  maxDuration: () => 30,
};
