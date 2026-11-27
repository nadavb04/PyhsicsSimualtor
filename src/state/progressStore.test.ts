import { beforeEach, describe, expect, it } from 'vitest';
import { PROGRESS_STORAGE_KEY, useProgressStore } from './progressStore';

const store = () => useProgressStore.getState();

describe('progressStore', () => {
  beforeEach(() => store().resetProgress());

  it('records a first-try success and bumps the streak', () => {
    store().recordOutcome('t/q/a', { correct: true, points: 12, attempt: 1 });
    expect(store().results['t/q/a']).toMatchObject({
      attempts: 1,
      bestPoints: 12,
      solved: true,
      solvedFirstTry: true,
    });
    expect(store().streak).toBe(1);
  });

  it('a wrong answer resets the streak; a later retry success keeps it at zero', () => {
    store().recordOutcome('t/q/a', { correct: true, points: 10, attempt: 1 });
    store().recordOutcome('t/q/b', { correct: false, points: 0, attempt: 1 });
    expect(store().streak).toBe(0);
    store().recordOutcome('t/q/b', { correct: true, points: 5, attempt: 2 });
    expect(store().results['t/q/b']).toMatchObject({
      attempts: 2,
      bestPoints: 5,
      solved: true,
      solvedFirstTry: false,
    });
    expect(store().streak).toBe(0);
    expect(store().bestStreak).toBe(1);
  });

  it('replaying a solved sub-question changes nothing', () => {
    store().recordOutcome('t/q/a', { correct: true, points: 10, attempt: 1 });
    const before = store().results;
    store().recordOutcome('t/q/a', { correct: false, points: 0, attempt: 1 });
    expect(store().results).toBe(before);
    expect(store().streak).toBe(1);
  });

  it('persists to localStorage with a schema version', () => {
    store().recordOutcome('t/q/a', { correct: true, points: 10, attempt: 1 });
    const saved = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '{}');
    expect(saved.version).toBe(1);
    expect(saved.state.results['t/q/a'].bestPoints).toBe(10);
  });
});
