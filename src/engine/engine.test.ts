import { describe, expect, it } from 'vitest';
import { euler, semiImplicitEuler, velocityVerlet, type AccelFn } from './integrators';
import { MAX_FRAME_DT, PHYSICS_DT, SimulationRunner } from './loop';
import { createHistory, recordSample, resampleEvery, sampleAt } from './recorder';
import { simulate } from './headless';
import type { BaseSimState, PhysicsModel } from './types';

const gravity: AccelFn = () => -9.8;

describe('integrators', () => {
  it('velocity Verlet is exact for constant acceleration', () => {
    let s = { x: 0, v: 10 };
    const dt = 0.01;
    for (let i = 0; i < 100; i++) s = velocityVerlet(s, i * dt, dt, gravity);
    // x(1) = 10 - 4.9 = 5.1, v(1) = 10 - 9.8 = 0.2
    expect(s.x).toBeCloseTo(5.1, 9);
    expect(s.v).toBeCloseTo(0.2, 9);
  });

  it('euler and semi-implicit euler converge to the right answer at small dt', () => {
    for (const integrator of [euler, semiImplicitEuler]) {
      let s = { x: 0, v: 10 };
      const dt = 1e-4;
      for (let i = 0; i < 10_000; i++) s = integrator(s, i * dt, dt, gravity);
      expect(s.x).toBeCloseTo(5.1, 2);
      expect(s.v).toBeCloseTo(0.2, 6);
    }
  });
});

describe('recorder', () => {
  const h = createHistory();
  recordSample(h, { t: 0, bodies: [body(0, 0)] });
  recordSample(h, { t: 1, bodies: [body(10, 2)] });

  it('interpolates between samples and clamps outside', () => {
    expect(sampleAt(h, 0.5)?.bodies[0]?.pos.x).toBeCloseTo(5);
    expect(sampleAt(h, 0.5)?.bodies[0]?.vel.x).toBeCloseTo(1);
    expect(sampleAt(h, -1)?.t).toBe(0);
    expect(sampleAt(h, 9)?.t).toBe(1);
    expect(sampleAt(createHistory(), 0)).toBeUndefined();
  });

  it('resamples at equal intervals', () => {
    const dots = resampleEvery(h, 0.25, 1);
    expect(dots.map((d) => d.t)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(resampleEvery(h, 0.25, 0.5)).toHaveLength(3);
  });
});

interface FallState extends BaseSimState {
  y: number;
  v: number;
}

/** Ball dropped from 10 m. */
const fallModel: PhysicsModel<FallState> = {
  init: (p) => ({ t: 0, y: p.height ?? 10, v: 0 }),
  step: (s, dt) => {
    const k = velocityVerlet({ x: s.y, v: s.v }, s.t, dt, gravity);
    return { t: s.t + dt, y: k.x, v: k.v };
  },
  sample: (s) => [
    { id: 'ball', pos: { x: 0, y: s.y }, vel: { x: 0, y: s.v }, acc: { x: 0, y: -9.8 } },
  ],
  detectEvents: (prev, next) => (prev.y > 5 && next.y <= 5 ? [{ t: next.t, type: 'halfway' }] : []),
  isFinished: (s) => s.y <= 0,
  maxDuration: () => 5,
};

describe('SimulationRunner', () => {
  it('starts ready with one recorded sample', () => {
    const r = new SimulationRunner(fallModel, { height: 10 });
    expect(r.status).toBe('ready');
    expect(r.history.samples).toHaveLength(1);
    expect(r.advance(0.5)).toBe(0); // not running → no-op
  });

  it('advances fixed steps and caps long frames', () => {
    const r = new SimulationRunner(fallModel, { height: 10 });
    r.play();
    const steps = r.advance(5); // a 5 s stall is capped
    expect(steps).toBe(Math.floor(MAX_FRAME_DT / PHYSICS_DT + 1e-9));
    expect(r.state.t).toBeCloseTo(steps * PHYSICS_DT, 9);
  });

  it('finishes, records events and the final sample', () => {
    const r = new SimulationRunner(fallModel, { height: 10 });
    r.play();
    for (let i = 0; i < 100 && r.status === 'running'; i++) r.advance(0.05);
    expect(r.status).toBe('finished');
    // t_land = sqrt(2h/g) ≈ 1.4286 s
    expect(r.state.t).toBeCloseTo(Math.sqrt(20 / 9.8), 2);
    expect(r.history.events.map((e) => e.type)).toEqual(['halfway']);
    expect(r.history.samples.at(-1)?.t).toBe(r.state.t);
  });

  it('play after finish restarts; reset applies new params', () => {
    const r = new SimulationRunner(fallModel, { height: 10 });
    r.runToEnd();
    r.play();
    expect(r.state.t).toBe(0);
    r.reset({ height: 3 });
    expect(r.state.y).toBe(3);
  });

  it('stepOnce pauses and advances a fixed chunk', () => {
    const r = new SimulationRunner(fallModel, { height: 10 });
    r.stepOnce(0.1);
    expect(r.status).toBe('paused');
    expect(r.state.t).toBeCloseTo(0.1, 6);
  });

  it('respects maxDuration', () => {
    const { finalState } = simulate(fallModel, { height: 1e6 });
    expect(finalState.t).toBeCloseTo(5, 1);
  });
});

function body(x: number, vx: number) {
  return { id: 'b', pos: { x, y: 0 }, vel: { x: vx, y: 0 }, acc: { x: 0, y: 0 } };
}
