/**
 * A cart on a straight track with constant acceleration (x in m, + = right).
 * Velocity and acceleration may each be negative (leftward).
 */
import { crossingFraction, velocityVerlet } from '@/engine/integrators';
import type { BaseSimState, Params, PhysicsModel, SimEvent } from '@/engine/types';
import { num } from '../shared';

export const CART_ID = 'cart';
export const RUN_SECONDS = 5;

export interface CartState extends BaseSimState {
  x: number;
  v: number;
}

export interface CartParams {
  initialVelocity: number;
  acceleration: number;
}

export function readParams(p: Params): CartParams {
  return { initialVelocity: num(p.initialVelocity, 3), acceleration: num(p.acceleration, -1) };
}

export function positionAt(q: CartParams, t: number): number {
  return q.initialVelocity * t + 0.5 * q.acceleration * t * t;
}

export type SpeedTrend = 'speeding up' | 'slowing down' | 'steady';

/** Speeding up when v and a point the same way, slowing down when they are opposite. */
export function speedTrend(v: number, a: number): SpeedTrend {
  if (a === 0) return 'steady';
  if (Math.abs(v) < 1e-9) return 'speeding up';
  return Math.sign(v) === Math.sign(a) ? 'speeding up' : 'slowing down';
}

export const cartPhysics: PhysicsModel<CartState> = {
  init: (p) => ({ t: 0, x: 0, v: readParams(p).initialVelocity }),

  step(s, dt, p) {
    const q = readParams(p);
    const k = velocityVerlet({ x: s.x, v: s.v }, s.t, dt, () => q.acceleration);
    return { t: s.t + dt, x: k.x, v: k.v };
  },

  sample(s, p) {
    const q = readParams(p);
    return [
      {
        id: CART_ID,
        pos: { x: s.x, y: 0 },
        vel: { x: s.v, y: 0 },
        acc: { x: q.acceleration, y: 0 },
      },
    ];
  },

  detectEvents(prev, next) {
    const events: SimEvent[] = [];
    if ((prev.v > 0 && next.v <= 0) || (prev.v < 0 && next.v >= 0)) {
      const f = crossingFraction(prev.v, next.v, 0);
      events.push({
        t: prev.t + f * (next.t - prev.t),
        type: 'turnaround',
        bodyId: CART_ID,
        pos: { x: prev.x + f * (next.x - prev.x), y: 0 },
        data: { from: prev.v > 0 ? 'right' : 'left' },
      });
    }
    return events;
  },

  isFinished: (s) => s.t >= RUN_SECONDS,
  maxDuration: () => RUN_SECONDS + 1,
};
