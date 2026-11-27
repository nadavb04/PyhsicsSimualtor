/**
 * Answer-key verification for Q2 (two cars passing) and Q7 (chasing a bus).
 */
import { describe, expect, it } from 'vitest';
import { simulate } from '@/engine/headless';
import { findBody, sampleAt } from '@/engine/recorder';
import type { SimEvent } from '@/engine/types';
import { twoCarsChase } from '.';
import { A_ID, B_ID, catchTime, closestGap, readParams, speedNeededToCatch } from './physics';

const ofType = (events: SimEvent[], type: string) => events.filter((e) => e.type === type);

describe('two-cars-chase: cars passing (Q2)', () => {
  const grid = [
    { speedA: 8, accelB: 4 },
    { speedA: 4, accelB: 6 },
    { speedA: 10, accelB: 2 },
  ];

  it.each(grid)('(a) when B overtakes A, B is going exactly twice as fast (%o)', (p) => {
    const { history } = simulate(twoCarsChase, p);
    const [pass] = ofType(history.events, 'pass');
    expect(pass?.t).toBeCloseTo((2 * p.speedA) / p.accelB, 2);
    expect(Number(pass?.data?.speedB)).toBeCloseTo(2 * p.speedA, 2);
  });

  it.each(grid)('(b) equal speeds happen halfway to the pass, at the widest gap (%o)', (p) => {
    const { history } = simulate(twoCarsChase, p);
    const [same] = ofType(history.events, 'speeds-equal');
    const [pass] = ofType(history.events, 'pass');
    expect(same!.t).toBeCloseTo(pass!.t / 2, 2);

    // A's lead (xA − xB) is largest at the equal-speed instant.
    const lead = (t: number) => {
      const s = sampleAt(history, t);
      return findBody(s, A_ID)!.pos.x - findBody(s, B_ID)!.pos.x;
    };
    const widest = lead(same!.t);
    for (let t = 0; t <= pass!.t; t += 0.05) expect(lead(t)).toBeLessThanOrEqual(widest + 1e-6);
  });

  it('they are never side by side at equal speed', () => {
    const { history } = simulate(twoCarsChase, grid[0]!);
    const [same] = ofType(history.events, 'speeds-equal');
    expect(Math.abs(Number(same?.data?.gap))).toBeGreaterThan(1);
  });
});

describe('two-cars-chase: chasing a bus (Q7)', () => {
  const missed = { speedA: 4, accelB: 1, initialGap: 10, scene: 1 };

  it('(a) a runner who barely misses is closest exactly when the speeds match', () => {
    const { history } = simulate(twoCarsChase, missed);
    expect(ofType(history.events, 'caught')).toHaveLength(0);
    const [same] = ofType(history.events, 'speeds-equal');
    expect(same!.t).toBeCloseTo(4, 2);

    const gap = (t: number) => {
      const s = sampleAt(history, t);
      return findBody(s, B_ID)!.pos.x - findBody(s, A_ID)!.pos.x;
    };
    const atMatch = gap(same!.t);
    expect(atMatch).toBeCloseTo(closestGap(readParams(missed)), 2);
    expect(atMatch).toBeGreaterThan(0);
    for (let t = 0; t <= history.samples.at(-1)!.t; t += 0.05) {
      expect(gap(t)).toBeGreaterThanOrEqual(atMatch - 1e-6);
    }
  });

  it('a runner at or above √(2ad) catches the bus', () => {
    const p = { ...missed, speedA: 5 };
    const { history } = simulate(twoCarsChase, p);
    const [caught] = ofType(history.events, 'caught');
    expect(caught?.t).toBeCloseTo(catchTime(readParams(p))!, 2);
  });

  it('(b) more gap needs more speed, but only as √gap: 2× gap → ×1.41, 4× gap → ×2', () => {
    const v1 = speedNeededToCatch(1, 8);
    expect(speedNeededToCatch(1, 16) / v1).toBeCloseTo(Math.SQRT2, 9);
    expect(speedNeededToCatch(1, 32) / v1).toBeCloseTo(2, 9);

    // And the simulation agrees at the threshold: just above catches, just below misses.
    for (const gap of [8, 16]) {
      const need = speedNeededToCatch(1, gap);
      const run = (speedA: number) =>
        ofType(
          simulate(twoCarsChase, { speedA, accelB: 1, initialGap: gap }).history.events,
          'caught',
        );
      expect(run(need * 1.02)).toHaveLength(1);
      expect(run(need * 0.98)).toHaveLength(0);
    }
  });

  it('world bounds contain the whole run', () => {
    const p = { speedA: 8, accelB: 0.5, initialGap: 20 };
    const b = twoCarsChase.worldBounds(p);
    const { finalState } = simulate(twoCarsChase, p);
    expect(b.maxX).toBeGreaterThan(Math.max(finalState.xA, finalState.xB));
  });
});
