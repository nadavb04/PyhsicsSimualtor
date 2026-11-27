/**
 * Physics tests double as answer-key verification for Topic 1, Question 1.
 * If these fail, the content's "correct" options may be teaching something false.
 */
import { describe, expect, it } from 'vitest';
import { ghostParams } from '@/content';
import { simulate } from '@/engine/headless';
import type { SimEvent } from '@/engine/types';
import { verticalThrow } from '.';
import { DEFAULT_GRAVITY } from './physics';

const base = { launchSpeed: 15, buildingHeight: 20, airDrag: 0 };
const g = DEFAULT_GRAVITY;

const ofType = (events: SimEvent[], type: string) => events.filter((e) => e.type === type);
const speed = (e: SimEvent | undefined) => Number(e?.data?.speed);

describe('vertical-throw physics', () => {
  it('reaches max height v0²/2g above the ledge (no drag)', () => {
    const { history } = simulate(verticalThrow, base);
    const [peak] = ofType(history.events, 'turning-point');
    expect(peak?.pos?.y).toBeCloseTo(base.buildingHeight + base.launchSpeed ** 2 / (2 * g), 2);
    expect(peak?.t).toBeCloseTo(base.launchSpeed / g, 2);
  });

  it('(a) passes the test height twice: once rising, once falling', () => {
    const { history } = simulate(verticalThrow, base);
    const crossings = ofType(history.events, 'reference-crossing');
    expect(crossings.map((e) => e.data?.direction)).toEqual(['up', 'down']);
  });

  it('(b) without drag, the falling speed equals the rising speed at the same height', () => {
    const { history } = simulate(verticalThrow, base);
    const [up, down] = ofType(history.events, 'reference-crossing');
    expect(Math.abs(speed(down) - speed(up)) / speed(up)).toBeLessThan(0.005);

    const [ledge] = ofType(history.events, 'ledge-crossing');
    expect(Math.abs(speed(ledge) - base.launchSpeed) / base.launchSpeed).toBeLessThan(0.005);
  });

  it('(b) with drag, the falling speed is lower than the rising speed', () => {
    const { history } = simulate(verticalThrow, { ...base, airDrag: 1 });
    const [up, down] = ofType(history.events, 'reference-crossing');
    expect(speed(down)).toBeLessThan(speed(up) * 0.95);
  });

  it('(c) at the peak, velocity is zero but acceleration is still g downward', () => {
    const { history } = simulate(verticalThrow, base);
    const [peak] = ofType(history.events, 'turning-point');
    expect(peak?.data?.velocity).toBe(0);
    expect(peak?.data?.acceleration).toBeCloseTo(-g, 9);
  });

  it('lands at t = (v0 + sqrt(v0² + 2gH)) / g and stops', () => {
    const { finalState, history } = simulate(verticalThrow, base);
    const expected = (15 + Math.sqrt(15 ** 2 + 2 * g * 20)) / g;
    expect(finalState.y).toBe(0);
    expect(finalState.t).toBeCloseTo(expected, 2);
    expect(ofType(history.events, 'landed')).toHaveLength(1);
  });

  it.each([9.8, 3.6, 20])(
    'Q6: doubling launch speed doubles hang time and quadruples max height (g = %s)',
    (gravity) => {
      // Q6 shows the live stone at the slider speed and a ghost at half of it.
      const fast = { launchSpeed: 20, buildingHeight: 0, airDrag: 0, gravity };
      const slow = ghostParams(fast, { label: 'half speed', paramScale: { launchSpeed: 0.5 } });
      const run = (p: Record<string, number>) => simulate(verticalThrow, p).history.events;
      const [fastLand] = ofType(run(fast), 'landed');
      const [slowLand] = ofType(run(slow), 'landed');
      const [fastPeak] = ofType(run(fast), 'turning-point');
      const [slowPeak] = ofType(run(slow), 'turning-point');
      expect(fastLand!.t / slowLand!.t).toBeCloseTo(2, 1);
      expect(fastPeak!.pos!.y / slowPeak!.pos!.y).toBeCloseTo(4, 2);
    },
  );

  it('world bounds contain the whole flight', () => {
    const b = verticalThrow.worldBounds({ launchSpeed: 25, buildingHeight: 40, airDrag: 0 });
    expect(b.maxY).toBeGreaterThan(40 + 25 ** 2 / (2 * g));
    expect(b.minY).toBeLessThan(0);
  });
});
