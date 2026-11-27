import type { PhysicsQuestion, PhysicsTopic } from '@/content/schema';

/** All point rules live here. */
export const SCORING = {
  firstTry: 10,
  retry: 5,
  /** Awarded with a correct answer if the student moved a slider before submitting. */
  explorationBonus: 2,
} as const;

export const MAX_POINTS_PER_SUB = SCORING.firstTry + SCORING.explorationBonus;

export interface AttemptInput {
  correct: boolean;
  /** 1-based attempt number. */
  attempt: number;
  explored: boolean;
}

export function pointsForAttempt({ correct, attempt, explored }: AttemptInput): number {
  if (!correct) return 0;
  const base = attempt <= 1 ? SCORING.firstTry : SCORING.retry;
  return base + (explored ? SCORING.explorationBonus : 0);
}

/** Persisted result for one sub-question. */
export interface SubResult {
  attempts: number;
  bestPoints: number;
  solved: boolean;
  solvedFirstTry: boolean;
  completedAt?: string;
}

export type ResultsMap = Readonly<Record<string, SubResult>>;

export interface ScoreSummary {
  earned: number;
  max: number;
  solved: number;
  total: number;
}

const EMPTY: ScoreSummary = { earned: 0, max: 0, solved: 0, total: 0 };

function add(a: ScoreSummary, b: ScoreSummary): ScoreSummary {
  return {
    earned: a.earned + b.earned,
    max: a.max + b.max,
    solved: a.solved + b.solved,
    total: a.total + b.total,
  };
}

export function questionScore(
  topicId: string,
  question: PhysicsQuestion,
  results: ResultsMap,
): ScoreSummary {
  return question.subQuestions.reduce<ScoreSummary>((acc, sub) => {
    const r = results[`${topicId}/${question.id}/${sub.id}`];
    return add(acc, {
      earned: r?.bestPoints ?? 0,
      max: MAX_POINTS_PER_SUB,
      solved: r?.solved ? 1 : 0,
      total: 1,
    });
  }, EMPTY);
}

export function topicScore(topic: PhysicsTopic, results: ResultsMap): ScoreSummary {
  return topic.questions.reduce((acc, q) => add(acc, questionScore(topic.id, q, results)), EMPTY);
}

export function overallScore(topics: readonly PhysicsTopic[], results: ResultsMap): ScoreSummary {
  return topics.reduce((acc, t) => add(acc, topicScore(t, results)), EMPTY);
}
