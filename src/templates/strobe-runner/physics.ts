/**
 * A runner on a straight track photographed by a strobe at equal time intervals.
 * x in m (+ = right). A decelerating runner comes to a stop and stays there
 * (runners don't start running backwards).
 */
import { velocityVerlet } from '@/engine/integrators';
import { findBody, resampleEvery } from '@/engine/recorder';
import type { BaseSimState, History, Params, PhysicsModel, SimEvent } from '@/engine/types';
import { num } from '../shared';

export const RUNNER_ID = 'runner';
export const RUN_SECONDS = 5;

export interface RunnerState extends BaseSimState {
  x: number;
  v: number;
}

export interface RunnerParams {
  initialSpeed: number;
  acceleration: number;
  strobeInterval: number;
}

export function readParams(p: Params): RunnerParams {
  return {
    initialSpeed: Math.max(0, num(p.initialSpeed, 4)),
    acceleration: num(p.acceleration, 0),
    strobeInterval: Math.max(0.05, num(p.strobeInterval, 0.5)),
  };
}

/** Acceleration actually felt: zero once a decelerating runner has stopped. */
function accel(v: number, q: RunnerParams): number {
  return v <= 0 && q.acceleration <= 0 ? 0 : q.acceleration;
}

/** Closed-form position (with the stop), used for camera bounds. */
export function positionAt(q: RunnerParams, t: number): number {
  const a = q.acceleration;
  const tStop = a < 0 ? q.initialSpeed / -a : Infinity;
  const tt = Math.min(t, tStop);
  return q.initialSpeed * tt + 0.5 * a * tt * tt;
}

/** Distances between consecutive strobe dots, in metres. */
export function dotSpacings(history: History, interval: number): number[] {
  const xs = resampleEvery(history, interval, Infinity)
    .map((s) => findBody(s, RUNNER_ID)?.pos.x)
    .filter((x): x is number => typeof x === 'number');
  return xs.slice(1).map((x, i) => x - xs[i]!);
}

export const runnerPhysics: PhysicsModel<RunnerState> = {
  init: (p) => ({ t: 0, x: 0, v: readParams(p).initialSpeed }),

  step(s, dt, p) {
    const q = readParams(p);
    const k = velocityVerlet({ x: s.x, v: s.v }, s.t, dt, (_x, v) => accel(v, q));
    if (k.v < 0) {
      // Stopped part-way through this step: finish the step at rest at the stopping point.
      const stopX = s.x + (s.v * s.v) / (2 * -q.acceleration);
      return { t: s.t + dt, x: stopX, v: 0 };
    }
    return { t: s.t + dt, x: k.x, v: k.v };
  },

  sample(s, p) {
    const q = readParams(p);
    return [
      {
        id: RUNNER_ID,
        pos: { x: s.x, y: 0 },
        vel: { x: s.v, y: 0 },
        acc: { x: accel(s.v, q), y: 0 },
      },
    ];
  },

  detectEvents(prev, next) {
    const events: SimEvent[] = [];
    if (prev.v > 0 && next.v <= 0) {
      events.push({ t: next.t, type: 'stopped', bodyId: RUNNER_ID, pos: { x: next.x, y: 0 } });
    }
    return events;
  },

  isFinished: (s) => s.t >= RUN_SECONDS,
  maxDuration: () => RUN_SECONDS + 1,
};
