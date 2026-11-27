/** Answer-key verification for Q5 (dropped vs. thrown downward). */
import { describe, expect, it } from 'vitest';
import { simulate } from '@/engine/headless';
import { findBody, sampleAt } from '@/engine/recorder';
import { freeFallPair } from '.';
import { A_ID, B_ID, DEFAULT_GRAVITY, landingTime, readParams } from './physics';

const base = { launchSpeedB: 8, towerHeight: 45 };

describe('free-fall-pair', () => {
  const { history } = simulate(freeFallPair, base);
  const at = (t: number) => {
    const s = sampleAt(history, t);
    return { a: findBody(s, A_ID)!, b: findBody(s, B_ID)! };
  };
  const bLands = history.events.find((e) => e.type === 'landed' && e.bodyId === B_ID)!.t;

  it('(a) once released, both balls have the same downward acceleration g', () => {
    for (let t = 0.1; t < bLands; t += 0.3) {
      const { a, b } = at(t);
      expect(a.acc.y).toBeCloseTo(-DEFAULT_GRAVITY, 9);
      expect(b.acc.y).toBeCloseTo(-DEFAULT_GRAVITY, 9);
    }
  });

  it('(b) the gap grows steadily: it equals (launch speed) × t while both fall', () => {
    let prevGap = 0;
    for (let t = 0.25; t < bLands; t += 0.25) {
      const { a, b } = at(t);
      const gap = a.pos.y - b.pos.y;
      expect(gap).toBeCloseTo(base.launchSpeedB * t, 2);
      expect(gap).toBeGreaterThan(prevGap);
      prevGap = gap;
    }
  });

  it('(b) the speed difference stays constant, which is why the gap keeps growing', () => {
    for (let t = 0.2; t < bLands; t += 0.4) {
      const { a, b } = at(t);
      expect(Math.abs(b.vel.y) - Math.abs(a.vel.y)).toBeCloseTo(base.launchSpeedB, 6);
    }
  });

  it('lands each ball at the kinematic time and stops when both are down', () => {
    const q = readParams(base);
    const aLands = history.events.find((e) => e.type === 'landed' && e.bodyId === A_ID)!.t;
    expect(aLands).toBeCloseTo(landingTime(q, 0), 2);
    expect(bLands).toBeCloseTo(landingTime(q, base.launchSpeedB), 2);
    expect(history.samples.at(-1)!.t).toBeCloseTo(aLands, 2);
  });
});
