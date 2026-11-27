/**
 * Stone thrown straight up from the ledge of a building.
 * y is height above the ground (m), v is vertical velocity (m/s, + = up).
 */
import { crossingFraction, velocityVerlet } from '@/engine/integrators';
import type { BaseSimState, Params, PhysicsModel, SimEvent } from '@/engine/types';

export const STONE_ID = 'stone';
export const STONE_X = 1.5;
export const DEFAULT_GRAVITY = 9.8;
/** Quadratic drag constant k = ρ·Cd·A / 2m (1/m). Exaggerated so the effect is visible. */
export const DRAG_K = 0.02;

export interface VerticalThrowState extends BaseSimState {
  y: number;
  v: number;
}

export interface VerticalThrowParams {
  launchSpeed: number;
  buildingHeight: number;
  airDrag: boolean;
  gravity: number;
}

export function readParams(p: Params): VerticalThrowParams {
  return {
    launchSpeed: p.launchSpeed ?? 15,
    buildingHeight: p.buildingHeight ?? 20,
    airDrag: (p.airDrag ?? 0) >= 0.5,
    gravity: p.gravity ?? DEFAULT_GRAVITY,
  };
}

export function acceleration(v: number, q: VerticalThrowParams): number {
  return -q.gravity - (q.airDrag ? DRAG_K * v * Math.abs(v) : 0);
}

/** Drag-free peak rise above the ledge, v0² / 2g. */
export function idealRise(q: VerticalThrowParams): number {
  return (q.launchSpeed * q.launchSpeed) / (2 * q.gravity);
}

/** Reference height used for "same height twice" comparisons: halfway up the ideal rise. */
export function referenceHeight(q: VerticalThrowParams): number {
  return q.buildingHeight + 0.5 * idealRise(q);
}

export const verticalThrowPhysics: PhysicsModel<VerticalThrowState> = {
  init(p) {
    const q = readParams(p);
    return { t: 0, y: q.buildingHeight, v: q.launchSpeed };
  },

  step(s, dt, p) {
    const q = readParams(p);
    const k = velocityVerlet({ x: s.y, v: s.v }, s.t, dt, (_x, v) => acceleration(v, q));
    return { t: s.t + dt, y: Math.max(0, k.x), v: k.v };
  },

  sample(s, p) {
    const q = readParams(p);
    return [
      {
        id: STONE_ID,
        pos: { x: STONE_X, y: s.y },
        vel: { x: 0, y: s.v },
        acc: { x: 0, y: acceleration(s.v, q) },
      },
    ];
  },

  detectEvents(prev, next, p) {
    const q = readParams(p);
    const events: SimEvent[] = [];
    const dt = next.t - prev.t;
    const at = (f: number) => ({
      t: prev.t + f * dt,
      y: prev.y + f * (next.y - prev.y),
      v: prev.v + f * (next.v - prev.v),
    });

    if (prev.v > 0 && next.v <= 0) {
      const e = at(crossingFraction(prev.v, next.v, 0));
      events.push({
        t: e.t,
        type: 'turning-point',
        bodyId: STONE_ID,
        pos: { x: STONE_X, y: e.y },
        data: { velocity: 0, acceleration: acceleration(0, q) },
      });
    }

    for (const [type, h] of [
      ['reference-crossing', referenceHeight(q)],
      ['ledge-crossing', q.buildingHeight],
    ] as const) {
      const up = prev.y < h && next.y >= h;
      const down = prev.y > h && next.y <= h;
      if (!up && !down) continue;
      const e = at(crossingFraction(prev.y, next.y, h));
      events.push({
        t: e.t,
        type,
        bodyId: STONE_ID,
        pos: { x: STONE_X, y: h },
        data: { direction: up ? 'up' : 'down', speed: Math.abs(e.v) },
      });
    }

    if (prev.y > 0 && next.y <= 0) {
      events.push({ t: next.t, type: 'landed', bodyId: STONE_ID, pos: { x: STONE_X, y: 0 } });
    }
    return events;
  },

  isFinished: (s) => s.y <= 0,
  maxDuration: () => 60,
};
