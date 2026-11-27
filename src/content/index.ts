import type { PhysicsQuestion, PhysicsTopic, SliderParam, SubQuestion } from './schema';
import { kinematics1d } from './topics/kinematics-1d';

/** Curriculum order. Add new topics here. */
export const TOPICS: readonly PhysicsTopic[] = [kinematics1d];

export function getTopic(topicId: string): PhysicsTopic | undefined {
  return TOPICS.find((t) => t.id === topicId);
}

export function getQuestion(topicId: string, questionId: string): PhysicsQuestion | undefined {
  return getTopic(topicId)?.questions.find((q) => q.id === questionId);
}

/** Stable progress key for one sub-question. */
export function subQuestionKey(topicId: string, questionId: string, subId: string): string {
  return `${topicId}/${questionId}/${subId}`;
}

/** Default slider values, then sub-question presets on top. */
export function initialParams(
  params: readonly SliderParam[],
  sub?: SubQuestion,
): Record<string, number> {
  const values: Record<string, number> = {};
  for (const p of params) values[p.id] = p.defaultValue;
  return { ...values, ...sub?.presetOverrides };
}
