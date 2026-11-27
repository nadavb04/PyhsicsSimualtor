/**
 * Prediction-first learning loop for one sub-question, as a pure reducer:
 *
 *   explore ──submit──▶ observe ──reveal──▶ debrief ──retry (if wrong)──▶ explore
 *
 * - explore: adjust allowed sliders and choose a prediction. Before the first
 *   submission the simulation may not run, so the outcome stays hidden.
 * - observe: the simulation plays with the locked prediction.
 * - debrief: praise + takeaway, or a misconception hint and a retry option.
 */
import type { LocalizedText } from '@/content/locale';
import { pointsForAttempt } from './scoring';

export type FlowPhase = 'explore' | 'observe' | 'debrief';

export interface FlowOutcome {
  optionId: string;
  correct: boolean;
  points: number;
  attempt: number;
  /** Praise line chosen at reveal time (kept here so re-renders don't reshuffle it). */
  praise?: LocalizedText;
}

export interface FlowState {
  phase: FlowPhase;
  selectedOptionId: string | null;
  /** Number of submitted predictions so far. */
  attempts: number;
  explored: boolean;
  outcome: FlowOutcome | null;
}

export type FlowAction =
  | { type: 'select'; optionId: string }
  | { type: 'param-changed' }
  | { type: 'submit' }
  | { type: 'reveal'; correctOptionId: string; praise?: LocalizedText }
  | { type: 'retry' }
  | { type: 'reset' };

export const initialFlowState: FlowState = {
  phase: 'explore',
  selectedOptionId: null,
  attempts: 0,
  explored: false,
  outcome: null,
};

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'select':
      return state.phase === 'explore' ? { ...state, selectedOptionId: action.optionId } : state;

    case 'param-changed':
      return state.explored ? state : { ...state, explored: true };

    case 'submit':
      if (state.phase !== 'explore' || !state.selectedOptionId) return state;
      return { ...state, phase: 'observe', attempts: state.attempts + 1 };

    case 'reveal': {
      if (state.phase !== 'observe' || !state.selectedOptionId) return state;
      const correct = state.selectedOptionId === action.correctOptionId;
      const points = pointsForAttempt({
        correct,
        attempt: state.attempts,
        explored: state.explored,
      });
      return {
        ...state,
        phase: 'debrief',
        outcome: {
          optionId: state.selectedOptionId,
          correct,
          points,
          attempt: state.attempts,
          ...(correct && action.praise ? { praise: action.praise } : {}),
        },
      };
    }

    case 'retry':
      if (state.phase !== 'debrief' || state.outcome?.correct) return state;
      return { ...state, phase: 'explore', selectedOptionId: null };

    case 'reset':
      return initialFlowState;
  }
}

/** Whether the student may freely play the simulation in this state. */
export function canFreePlay(state: FlowState): boolean {
  return state.phase === 'debrief' || (state.phase === 'explore' && state.attempts > 0);
}
