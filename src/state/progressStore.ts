import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SubResult } from '@/game/scoring';

export const PROGRESS_STORAGE_KEY = 'physics-intuition-progress';
export const PROGRESS_SCHEMA_VERSION = 1;

export interface OutcomeInput {
  correct: boolean;
  points: number;
  /** 1-based attempt number within the current session of this sub-question. */
  attempt: number;
}

interface ProgressData {
  results: Record<string, SubResult>;
  /** Consecutive correct first-try predictions. */
  streak: number;
  bestStreak: number;
}

interface ProgressActions {
  /** Record a debriefed prediction. Replays of already-solved sub-questions are practice only. */
  recordOutcome(key: string, outcome: OutcomeInput): void;
  resetProgress(): void;
}

export type ProgressState = ProgressData & ProgressActions;

const EMPTY: ProgressData = { results: {}, streak: 0, bestStreak: 0 };

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      ...EMPTY,

      recordOutcome(key, { correct, points, attempt }) {
        set((s) => {
          const prev = s.results[key];
          if (prev?.solved) return s;

          const result: SubResult = {
            attempts: (prev?.attempts ?? 0) + 1,
            bestPoints: Math.max(prev?.bestPoints ?? 0, points),
            solved: correct,
            solvedFirstTry: correct && attempt === 1,
            ...(correct ? { completedAt: new Date().toISOString() } : {}),
          };
          const streak = correct ? (attempt === 1 ? s.streak + 1 : s.streak) : 0;
          return {
            results: { ...s.results, [key]: result },
            streak,
            bestStreak: Math.max(s.bestStreak, streak),
          };
        });
      },

      resetProgress() {
        set(EMPTY);
      },
    }),
    {
      name: PROGRESS_STORAGE_KEY,
      version: PROGRESS_SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ results, streak, bestStreak }) => ({ results, streak, bestStreak }),
      // Bump PROGRESS_SCHEMA_VERSION and transform old data here when the shape changes.
      migrate: (persisted) => ({ ...EMPTY, ...(persisted as Partial<ProgressData>) }),
    },
  ),
);
