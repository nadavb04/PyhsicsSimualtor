/**
 * A glider on a frictionless air track with constant acceleration, shown alongside
 * its live velocity-vs-time graph. x in m (+ = right), starting at x = 0.
 */
import { crossingFraction, velocityVerlet } from '@/engine/integrators';
import type { BaseSimState, Params, PhysicsModel, SimEvent } from '@/engine/types';
import { num } from '../shared';

export const GLIDER_ID = 'glider';
export const RUN_SECONDS = 6;

export interface GliderState extends BaseSimState {
  x: number;
  v: number;
}

export interface GliderParams {
  initialVelocity: number;
  acceleration: number;
}

export function readParams(p: Params): GliderParams {
  return { initialVelocity: num(p.initialVelocity, 3), acceleration: num(p.acceleration, -1) };
}

export function positionAt(q: GliderParams, t: number): number {
  return q.initialVelocity * t + 0.5 * q.acceleration * t * t;
}

export function velocityAt(q: GliderParams, t: number): number {
  return q.initialVelocity + q.acceleration * t;
}

export const gliderPhysics: PhysicsModel<GliderState> = {
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
        id: GLIDER_ID,
        pos: { x: s.x, y: 0 },
        vel: { x: s.v, y: 0 },
        acc: { x: q.acceleration, y: 0 },
      },
    ];
  },

  detectEvents(prev, next) {
    const events: SimEvent[] = [];
    const dt = next.t - prev.t;
    if ((prev.v > 0 && next.v <= 0) || (prev.v < 0 && next.v >= 0)) {
      const f = crossingFraction(prev.v, next.v, 0);
      events.push({
        t: prev.t + f * dt,
        type: 'v-zero',
        bodyId: GLIDER_ID,
        pos: { x: prev.x + f * (next.x - prev.x), y: 0 },
      });
    }
    if (prev.t > 0 && ((prev.x > 0 && next.x <= 0) || (prev.x < 0 && next.x >= 0))) {
      const f = crossingFraction(prev.x, next.x, 0);
      events.push({
        t: prev.t + f * dt,
        type: 'back-at-start',
        bodyId: GLIDER_ID,
        pos: { x: 0, y: 0 },
      });
    }
    return events;
  },

  isFinished: (s) => s.t >= RUN_SECONDS - 1e-9,
  maxDuration: () => RUN_SECONDS + 1,
};
