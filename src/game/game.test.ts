import { describe, expect, it } from 'vitest';
import { kinematics1d } from '@/content/topics/kinematics-1d';
import {
  canFreePlay,
  flowReducer,
  initialFlowState,
  type FlowAction,
  type FlowState,
} from './questionFlow';
import { MAX_POINTS_PER_SUB, SCORING, pointsForAttempt, topicScore } from './scoring';

const run = (actions: FlowAction[], from: FlowState = initialFlowState) =>
  actions.reduce(flowReducer, from);

describe('pointsForAttempt', () => {
  it('rewards first try, retry and exploration', () => {
    expect(pointsForAttempt({ correct: true, attempt: 1, explored: false })).toBe(SCORING.firstTry);
    expect(pointsForAttempt({ correct: true, attempt: 2, explored: false })).toBe(SCORING.retry);
    expect(pointsForAttempt({ correct: true, attempt: 1, explored: true })).toBe(
      MAX_POINTS_PER_SUB,
    );
    expect(pointsForAttempt({ correct: false, attempt: 1, explored: true })).toBe(0);
  });
});

describe('topicScore', () => {
  it('aggregates best points and derives max from content', () => {
    const q = kinematics1d.questions[0]!;
    const key = `${kinematics1d.id}/${q.id}/a`;
    const s = topicScore(kinematics1d, {
      [key]: { attempts: 1, bestPoints: 10, solved: true, solvedFirstTry: true },
    });
    const subCount = kinematics1d.questions.reduce((n, qq) => n + qq.subQuestions.length, 0);
    expect(s).toEqual({
      earned: 10,
      max: subCount * MAX_POINTS_PER_SUB,
      solved: 1,
      total: subCount,
    });
  });
});

describe('flowReducer', () => {
  it('cannot submit without a selection, and cannot free-play before predicting', () => {
    expect(run([{ type: 'submit' }]).phase).toBe('explore');
    expect(canFreePlay(initialFlowState)).toBe(false);
  });

  it('correct first try with exploration earns max points', () => {
    const s = run([
      { type: 'param-changed' },
      { type: 'select', optionId: 'x' },
      { type: 'submit' },
      { type: 'reveal', correctOptionId: 'x' },
    ]);
    expect(s.phase).toBe('debrief');
    expect(s.outcome).toEqual({
      optionId: 'x',
      correct: true,
      points: MAX_POINTS_PER_SUB,
      attempt: 1,
    });
    expect(canFreePlay(s)).toBe(true);
    // Can't retry after a correct answer.
    expect(flowReducer(s, { type: 'retry' })).toBe(s);
  });

  it('wrong answer → retry → correct earns retry points', () => {
    const s = run([
      { type: 'select', optionId: 'wrong' },
      { type: 'submit' },
      { type: 'reveal', correctOptionId: 'x' },
    ]);
    expect(s.outcome?.points).toBe(0);

    const retry = flowReducer(s, { type: 'retry' });
    expect(retry.phase).toBe('explore');
    expect(retry.selectedOptionId).toBeNull();
    expect(canFreePlay(retry)).toBe(true);

    const done = run(
      [
        { type: 'select', optionId: 'x' },
        { type: 'submit' },
        { type: 'reveal', correctOptionId: 'x' },
      ],
      retry,
    );
    expect(done.outcome).toMatchObject({ correct: true, points: SCORING.retry, attempt: 2 });
  });

  it('ignores selection changes while observing', () => {
    const s = run([
      { type: 'select', optionId: 'x' },
      { type: 'submit' },
      { type: 'select', optionId: 'y' },
    ]);
    expect(s.selectedOptionId).toBe('x');
  });
});
