/**
 * A bowling ball and a beach ball of the same size dropped together from rest.
 * Quadratic air drag F = ½·ρ·Cd·A·v² acts on both; with ρ = 0 the tube is a vacuum.
 * y is height above the floor (m), v is vertical velocity (m/s, + = up).
 */
import { velocityVerlet } from '@/engine/integrators';
import type { BaseSimState, Params, PhysicsModel, SimEvent } from '@/engine/types';
import { num } from '../shared';

export const HEAVY_ID = 'heavy';
export const LIGHT_ID = 'light';
export const GRAVITY = 9.8;
/** Bowling ball mass (kg). */
export const HEAVY_MASS = 6;
/** Both balls share this radius (m), so they feel the same drag at the same speed. */
export const RADIUS = 0.11;
export const DRAG_COEFFICIENT = 0.47;
const AREA = Math.PI * RADIUS * RADIUS;

interface Ball {
  y: number;
  v: number;
}

export interface DragState extends BaseSimState {
  heavy: Ball;
  light: Ball;
}

export interface DragParams {
  airDensity: number;
  lightMass: number;
  dropHeight: number;
}

export function readParams(p: Params): DragParams {
  return {
    airDensity: Math.max(0, num(p.airDensity, 0)),
    lightMass: Math.max(0.01, num(p.lightMass, 0.2)),
    dropHeight: Math.max(1, num(p.dropHeight, 20)),
  };
}

/** Magnitude of the drag force (N) at speed |v|. Depends on size and speed, not on mass. */
export function dragForce(airDensity: number, v: number): number {
  return 0.5 * airDensity * DRAG_COEFFICIENT * AREA * v * v;
}

/** Vertical acceleration of a ball of mass m moving at v: gravity plus drag opposing motion. */
export function acceleration(q: DragParams, mass: number, v: number): number {
  return -GRAVITY - (Math.sign(v) * dragForce(q.airDensity, v)) / mass;
}

const landed = (b: Ball) => b.y <= 0;

/** Touchdown time inside a step. Heights are clamped at the floor, so use the speed. */
function touchdownTime(t0: number, t1: number, before: Ball): number {
  const fall = -before.v * (t1 - t0);
  return fall > 0 ? t0 + Math.min(1, before.y / fall) * (t1 - t0) : t1;
}

function stepBall(b: Ball, t: number, dt: number, q: DragParams, mass: number): Ball {
  if (landed(b)) return { y: 0, v: 0 };
  const k = velocityVerlet({ x: b.y, v: b.v }, t, dt, (_y, v) => acceleration(q, mass, v));
  return { y: Math.max(0, k.x), v: k.v };
}

export const dragPhysics: PhysicsModel<DragState> = {
  init(p) {
    const h = readParams(p).dropHeight;
    return { t: 0, heavy: { y: h, v: 0 }, light: { y: h, v: 0 } };
  },

  step(s, dt, p) {
    const q = readParams(p);
    return {
      t: s.t + dt,
      heavy: stepBall(s.heavy, s.t, dt, q, HEAVY_MASS),
      light: stepBall(s.light, s.t, dt, q, q.lightMass),
    };
  },

  sample(s, p) {
    const q = readParams(p);
    const body = (id: string, b: Ball, mass: number) => ({
      id,
      pos: { x: 0, y: b.y },
      vel: { x: 0, y: landed(b) ? 0 : b.v },
      acc: { x: 0, y: landed(b) ? 0 : acceleration(q, mass, b.v) },
    });
    return [body(HEAVY_ID, s.heavy, HEAVY_MASS), body(LIGHT_ID, s.light, q.lightMass)];
  },

  detectEvents(prev, next) {
    const events: SimEvent[] = [];
    for (const [id, before, after] of [
      [HEAVY_ID, prev.heavy, next.heavy],
      [LIGHT_ID, prev.light, next.light],
    ] as const) {
      if (!landed(before) && landed(after)) {
        events.push({
          t: touchdownTime(prev.t, next.t, before),
          type: 'landed',
          bodyId: id,
          pos: { x: 0, y: 0 },
          data: { speed: Math.abs(after.v) },
        });
      }
    }
    return events;
  },

  isFinished: (s) => landed(s.heavy) && landed(s.light),
  maxDuration: () => 30,
};
