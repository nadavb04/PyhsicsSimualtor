/** Answer-key verification for Q3 (speeding up vs. slowing down). */
import { describe, expect, it } from 'vitest';
import { simulate } from '@/engine/headless';
import { findBody, sampleAt } from '@/engine/recorder';
import type { History } from '@/engine/types';
import { cart1dVectors } from '.';
import { CART_ID, speedTrend } from './physics';

const cartAt = (history: History, t: number) => findBody(sampleAt(history, t), CART_ID)!;
const speedAt = (history: History, t: number) => Math.abs(cartAt(history, t).vel.x);

describe('cart-1d-vectors', () => {
  it('(a) negative acceleration speeds up a cart that is moving left', () => {
    const { history } = simulate(cart1dVectors, { initialVelocity: -2, acceleration: -1 });
    for (let t = 0.5; t <= 5; t += 0.5) {
      expect(speedAt(history, t)).toBeGreaterThan(speedAt(history, t - 0.5));
    }
    expect(speedTrend(-2, -1)).toBe('speeding up');
  });

  it('(a) the same negative acceleration slows down a cart moving right', () => {
    const { history } = simulate(cart1dVectors, { initialVelocity: 3, acceleration: -1 });
    expect(speedAt(history, 1)).toBeLessThan(speedAt(history, 0));
    expect(speedTrend(3, -1)).toBe('slowing down');
  });

  it('(b) moving right with leftward acceleration: stops, then moves left, speeding up', () => {
    const { history } = simulate(cart1dVectors, { initialVelocity: 4, acceleration: -2 });
    const turns = history.events.filter((e) => e.type === 'turnaround');
    expect(turns).toHaveLength(1);
    expect(turns[0]!.t).toBeCloseTo(2, 2);
    expect(turns[0]!.pos!.x).toBeCloseTo(4, 2);

    expect(cartAt(history, 3).vel.x).toBeLessThan(0);
    expect(cartAt(history, 4).vel.x).toBeLessThan(cartAt(history, 3).vel.x); // faster leftward
    expect(cartAt(history, 4).acc.x).toBe(-2); // the acceleration never changed
    expect(cartAt(history, 5).pos.x).toBeLessThan(0); // ends up left of the start
  });

  it('runs for a fixed 5 s and the bounds contain the path', () => {
    const p = { initialVelocity: 5, acceleration: 2 };
    const { finalState } = simulate(cart1dVectors, p);
    expect(finalState.t).toBeCloseTo(5, 2);
    expect(cart1dVectors.worldBounds(p).maxX).toBeGreaterThan(finalState.x);
  });
});
