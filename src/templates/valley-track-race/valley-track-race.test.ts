/** Answer-key verification for Q10 (the valley track race). */
import { describe, expect, it } from 'vitest';
import { simulate } from '@/engine/headless';
import type { History } from '@/engine/types';
import { valleyTrackRace } from '.';
import { A_ID, B_ID, COURSE_LENGTH, VALLEY_START, speedOnB, readParams } from './physics';

const finish = (h: History, id: string) =>
  h.events.find((e) => e.type === 'finish' && e.bodyId === id)!.t;

// The slider extremes and the middle.
const grid = [2, 4, 6].flatMap((initialSpeed) =>
  [0.5, 1.5, 3].map((valleyDepth) => ({ initialSpeed, valleyDepth })),
);

describe('valley-track-race', () => {
  it.each(grid)('(a) B leaves the valley at exactly its entry speed (%o)', (p) => {
    const { history } = simulate(valleyTrackRace, p);
    const exit = history.events.find((e) => e.type === 'valley-exit')!;
    expect(Number(exit.data?.speedB)).toBeCloseTo(p.initialSpeed, 9);
    expect(Number(exit.data?.speedA)).toBe(p.initialSpeed);
  });

  it.each(grid)('(b) B reaches the finish first despite the longer path (%o)', (p) => {
    const { history } = simulate(valleyTrackRace, p);
    const a = finish(history, A_ID);
    expect(a).toBeCloseTo(COURSE_LENGTH / p.initialSpeed, 2);
    expect(finish(history, B_ID)).toBeLessThan(a - 0.05);
  });

  it('B is faster than A everywhere inside the valley', () => {
    const q = readParams({ initialSpeed: 4, valleyDepth: 2 });
    for (let x = VALLEY_START + 0.5; x < VALLEY_START + 16; x += 0.5) {
      expect(speedOnB(q, x)).toBeGreaterThan(q.initialSpeed);
    }
  });

  it('with no valley the race is a tie', () => {
    const { history } = simulate(valleyTrackRace, { initialSpeed: 4, valleyDepth: 0 });
    expect(finish(history, B_ID)).toBeCloseTo(finish(history, A_ID), 3);
  });

  it('the run ends once both marbles have finished', () => {
    const p = { initialSpeed: 2, valleyDepth: 1 };
    const { history, finalState } = simulate(valleyTrackRace, p);
    expect(finalState.xA).toBe(COURSE_LENGTH);
    expect(finalState.xB).toBe(COURSE_LENGTH);
    expect(history.samples.at(-1)!.t).toBeCloseTo(COURSE_LENGTH / 2, 1);
  });
});
