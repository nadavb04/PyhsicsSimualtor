/** Answer-key verification for Q4 (strobe / ticker-tape dot spacing). */
import { describe, expect, it } from 'vitest';
import { ghostParams } from '@/content';
import { simulate } from '@/engine/headless';
import { strobeRunner } from '.';
import { dotSpacings } from './physics';

describe('strobe-runner', () => {
  it('(a) dots getting closer together means the runner is slowing down', () => {
    const p = { initialSpeed: 8, acceleration: -1.5, strobeInterval: 0.5 };
    const gaps = dotSpacings(simulate(strobeRunner, p).history, p.strobeInterval);
    expect(gaps.length).toBeGreaterThan(5);
    for (let i = 1; i < gaps.length; i++) expect(gaps[i]).toBeLessThan(gaps[i - 1]!);
  });

  it('speeding up spreads the dots out; constant speed keeps them even', () => {
    const faster = dotSpacings(
      simulate(strobeRunner, { initialSpeed: 2, acceleration: 1, strobeInterval: 0.5 }).history,
      0.5,
    );
    for (let i = 1; i < faster.length; i++) expect(faster[i]).toBeGreaterThan(faster[i - 1]!);

    const even = dotSpacings(
      simulate(strobeRunner, { initialSpeed: 3, acceleration: 0, strobeInterval: 0.5 }).history,
      0.5,
    );
    for (const g of even) expect(g).toBeCloseTo(1.5, 6);
  });

  it('(b) doubling a constant speed doubles the dot spacing (ghost at 2×)', () => {
    const p = { initialSpeed: 3, acceleration: 0, strobeInterval: 0.5 };
    const g = ghostParams(p, { label: '2× speed', paramScale: { initialSpeed: 2 } });
    const base = dotSpacings(simulate(strobeRunner, p).history, 0.5);
    const doubled = dotSpacings(simulate(strobeRunner, g).history, 0.5);
    expect(doubled).toHaveLength(base.length);
    doubled.forEach((d, i) => expect(d / base[i]!).toBeCloseTo(2, 6));
  });

  it('a decelerating runner stops and stays put instead of running backwards', () => {
    const { finalState, history } = simulate(strobeRunner, {
      initialSpeed: 4,
      acceleration: -2,
      strobeInterval: 0.5,
    });
    expect(finalState.v).toBe(0);
    expect(finalState.x).toBeCloseTo(4, 3);
    expect(history.events.filter((e) => e.type === 'stopped')).toHaveLength(1);
  });
});
