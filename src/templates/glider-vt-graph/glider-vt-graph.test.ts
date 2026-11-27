/** Answer-key verification for Q9 (reading a velocity-vs-time line). */
import { describe, expect, it } from 'vitest';
import { simulate } from '@/engine/headless';
import { findBody, sampleAt } from '@/engine/recorder';
import type { History } from '@/engine/types';
import { gliderVtGraph } from '.';
import { GLIDER_ID } from './physics';

const preset = { initialVelocity: 3, acceleration: -1 };
const gliderAt = (h: History, t: number) => findBody(sampleAt(h, t), GLIDER_ID)!;

describe('glider-vt-graph', () => {
  const { history } = simulate(gliderVtGraph, preset);

  it('(a) where the falling v(t) line crosses v = 0, the glider stops and reverses', () => {
    const zero = history.events.filter((e) => e.type === 'v-zero');
    expect(zero).toHaveLength(1);
    expect(zero[0]!.t).toBeCloseTo(3, 2);
    expect(gliderAt(history, 2.5).vel.x).toBeGreaterThan(0); // moving right before
    expect(gliderAt(history, 3.5).vel.x).toBeLessThan(0); // moving left after
    // It does not stay stopped: the acceleration is unchanged throughout.
    expect(gliderAt(history, 3).acc.x).toBe(-1);
  });

  it('(b) the glider is farthest from the start at the v = 0 crossing, not at the end', () => {
    let farthest = { t: 0, x: 0 };
    for (const s of history.samples) {
      const x = findBody(s, GLIDER_ID)!.pos.x;
      if (Math.abs(x) > Math.abs(farthest.x)) farthest = { t: s.t, x };
    }
    expect(farthest.t).toBeCloseTo(3, 1);
    expect(farthest.x).toBeCloseTo(4.5, 2);
    // By the end of the graph it has come all the way back to the start.
    expect(gliderAt(history, 6).pos.x).toBeCloseTo(0, 2);
  });

  it('the run lasts the length of the graph (6 s)', () => {
    expect(history.samples.at(-1)!.t).toBeCloseTo(6, 2);
  });
});
