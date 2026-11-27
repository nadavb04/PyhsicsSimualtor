/**
 * Two balls released at the same instant from the top of a tower, no air.
 * Ball A is dropped from rest; ball B is thrown straight down.
 * y is height above the ground (m), v is vertical velocity (m/s, + = up).
 */
import { velocityVerlet } from '@/engine/integrators';
import type { BaseSimState, Params, PhysicsModel, SimEvent } from '@/engine/types';
import { num } from '../shared';

export const A_ID = 'A';
export const B_ID = 'B';
export const DEFAULT_GRAVITY = 9.8;

interface Ball {
  y: number;
  v: number;
}

export interface FreeFallPairState extends BaseSimState {
  a: Ball;
  b: Ball;
}

export interface FreeFallPairParams {
  launchSpeedB: number;
  towerHeight: number;
  gravity: number;
}

export function readParams(p: Params): FreeFallPairParams {
  return {
    launchSpeedB: Math.max(0, num(p.launchSpeedB, 8)),
    towerHeight: Math.max(1, num(p.towerHeight, 45)),
    gravity: num(p.gravity, DEFAULT_GRAVITY),
  };
}

const landed = (ball: Ball) => ball.y <= 0;

function stepBall(ball: Ball, t: number, dt: number, g: number): Ball {
  if (landed(ball)) return { y: 0, v: 0 };
  const k = velocityVerlet({ x: ball.y, v: ball.v }, t, dt, () => -g);
  return k.x <= 0 ? { y: 0, v: k.v } : { y: k.x, v: k.v };
}

/** Time for a ball to fall H with initial downward speed u: (−u + √(u² + 2gH)) / g. */
export function landingTime(q: FreeFallPairParams, downSpeed: number): number {
  return (-downSpeed + Math.sqrt(downSpeed ** 2 + 2 * q.gravity * q.towerHeight)) / q.gravity;
}

export const freeFallPairPhysics: PhysicsModel<FreeFallPairState> = {
  init(p) {
    const q = readParams(p);
    return { t: 0, a: { y: q.towerHeight, v: 0 }, b: { y: q.towerHeight, v: -q.launchSpeedB } };
  },

  step(s, dt, p) {
    const g = readParams(p).gravity;
    return { t: s.t + dt, a: stepBall(s.a, s.t, dt, g), b: stepBall(s.b, s.t, dt, g) };
  },

  sample(s, p) {
    const g = readParams(p).gravity;
    const body = (id: string, ball: Ball) => ({
      id,
      pos: { x: 0, y: ball.y },
      // A landed ball is at rest on the ground: no velocity, no acceleration.
      vel: { x: 0, y: landed(ball) ? 0 : ball.v },
      acc: { x: 0, y: landed(ball) ? 0 : -g },
    });
    return [body(A_ID, s.a), body(B_ID, s.b)];
  },

  detectEvents(prev, next) {
    const events: SimEvent[] = [];
    for (const [id, before, after] of [
      [A_ID, prev.a, next.a],
      [B_ID, prev.b, next.b],
    ] as const) {
      if (!landed(before) && landed(after)) {
        // Heights are clamped at the ground, so locate touchdown using the speed.
        const fall = -before.v * (next.t - prev.t);
        const f = fall > 0 ? Math.min(1, before.y / fall) : 1;
        events.push({
          t: prev.t + f * (next.t - prev.t),
          type: 'landed',
          bodyId: id,
          pos: { x: 0, y: 0 },
          data: { speed: Math.abs(after.v) },
        });
      }
    }
    return events;
  },

  isFinished: (s) => landed(s.a) && landed(s.b),
  maxDuration: () => 30,
};
