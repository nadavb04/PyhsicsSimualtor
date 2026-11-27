/** Answer-key verification for Q8 (heavy vs. light in free fall, with and without air). */
import { describe, expect, it } from 'vitest';
import { simulate } from '@/engine/headless';
import type { History } from '@/engine/types';
import { vacuumTubeDrag } from '.';
import {
  GRAVITY,
  HEAVY_ID,
  HEAVY_MASS,
  LIGHT_ID,
  acceleration,
  dragForce,
  readParams,
} from './physics';

const landing = (history: History, id: string) =>
  history.events.find((e) => e.type === 'landed' && e.bodyId === id)!.t;

describe('vacuum-tube-drag', () => {
  it('(a) in a vacuum, heavy and light land at the same moment, after √(2h/g)', () => {
    for (const lightMass of [0.1, 0.5, 2]) {
      const { history } = simulate(vacuumTubeDrag, { airDensity: 0, lightMass });
      const heavy = landing(history, HEAVY_ID);
      expect(landing(history, LIGHT_ID)).toBe(heavy);
      expect(heavy).toBeCloseTo(Math.sqrt((2 * 20) / GRAVITY), 2);
    }
  });

  it('(b) with air, the light ball lands noticeably later', () => {
    const { history } = simulate(vacuumTubeDrag, { airDensity: 1.2, lightMass: 0.2 });
    const heavy = landing(history, HEAVY_ID);
    const light = landing(history, LIGHT_ID);
    expect(light - heavy).toBeGreaterThan(0.15);
    // The bowling ball barely notices the air.
    expect(heavy).toBeLessThan(Math.sqrt((2 * 20) / GRAVITY) * 1.01);
  });

  it('(b) at the same speed both balls feel the same drag force; it slows the light one more', () => {
    const q = readParams({ airDensity: 1.2, lightMass: 0.2 });
    const v = -10;
    // Same size + same speed → same force, whatever the mass.
    expect(dragForce(q.airDensity, v)).toBeGreaterThan(0);
    const aHeavy = acceleration(q, HEAVY_MASS, v);
    const aLight = acceleration(q, q.lightMass, v);
    expect(-aHeavy).toBeGreaterThan(-aLight * 1.5);
    // Drag as a fraction of weight is 30× larger for the light ball.
    const frac = (m: number) => dragForce(q.airDensity, v) / (m * GRAVITY);
    expect(frac(q.lightMass) / frac(HEAVY_MASS)).toBeCloseTo(HEAVY_MASS / q.lightMass, 9);
  });

  it('denser air widens the gap', () => {
    const lag = (airDensity: number) => {
      const { history } = simulate(vacuumTubeDrag, { airDensity, lightMass: 0.2 });
      return landing(history, LIGHT_ID) - landing(history, HEAVY_ID);
    };
    expect(lag(2.4)).toBeGreaterThan(lag(1.2));
    expect(lag(1.2)).toBeGreaterThan(lag(0.3));
  });
});
