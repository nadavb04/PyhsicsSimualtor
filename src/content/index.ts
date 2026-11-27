import type {
  GhostComparison,
  PhysicsQuestion,
  PhysicsTopic,
  SliderParam,
  SubQuestion,
} from './schema';
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

/** Fixed params, then default slider values, then sub-question presets on top. */
export function initialParams(
  params: readonly SliderParam[],
  sub?: SubQuestion,
  fixedParams?: Readonly<Record<string, number>>,
): Record<string, number> {
  const values: Record<string, number> = { ...fixedParams };
  for (const p of params) values[p.id] = p.defaultValue;
  return { ...values, ...sub?.presetOverrides };
}

/** The comparison run shown for a sub-question: its own, else the question's. */
export function activeGhost(
  question: PhysicsQuestion,
  sub: SubQuestion,
): GhostComparison | undefined {
  return sub.ghost ?? question.ghost;
}

/** Parameters for a ghost run: live values × `paramScale`, then `paramOverrides`. */
export function ghostParams(
  params: Readonly<Record<string, number>>,
  ghost: GhostComparison,
): Record<string, number> {
  const out: Record<string, number> = { ...params };
  for (const [id, factor] of Object.entries(ghost.paramScale ?? {})) {
    out[id] = (params[id] ?? 0) * factor;
  }
  return { ...out, ...ghost.paramOverrides };
}
