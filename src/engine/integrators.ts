/**
 * Transparent, single-step numerical integrators for 1D motion.
 * 2D templates apply them per axis. All functions are pure.
 */

export interface Kinematic1D {
  x: number;
  v: number;
}

/** Acceleration as a function of position, velocity and time. */
export type AccelFn = (x: number, v: number, t: number) => number;

/** Explicit (forward) Euler. Simple but drifts in energy; kept for teaching/comparison. */
export function euler(s: Kinematic1D, t: number, dt: number, a: AccelFn): Kinematic1D {
  const acc = a(s.x, s.v, t);
  return { x: s.x + s.v * dt, v: s.v + acc * dt };
}

/** Semi-implicit (symplectic) Euler: update v first, then x with the new v. */
export function semiImplicitEuler(s: Kinematic1D, t: number, dt: number, a: AccelFn): Kinematic1D {
  const v = s.v + a(s.x, s.v, t) * dt;
  return { x: s.x + v * dt, v };
}

/**
 * Velocity Verlet. Exact for constant acceleration; for velocity-dependent forces (drag)
 * the end-of-step acceleration uses a predicted velocity.
 */
export function velocityVerlet(s: Kinematic1D, t: number, dt: number, a: AccelFn): Kinematic1D {
  const a0 = a(s.x, s.v, t);
  const x = s.x + s.v * dt + 0.5 * a0 * dt * dt;
  const vPredicted = s.v + a0 * dt;
  const a1 = a(x, vPredicted, t + dt);
  return { x, v: s.v + 0.5 * (a0 + a1) * dt };
}

/** Fraction (0..1) between two samples at which a quantity going f0 → f1 crosses `target`. */
export function crossingFraction(f0: number, f1: number, target: number): number {
  const d = f1 - f0;
  return d === 0 ? 0 : (target - f0) / d;
}
