/**
 * Curriculum data schema (spec §5), with small extensions marked ★.
 * Content files only describe *what* to show; engines/templates decide *how*.
 *
 * Learner-facing text is `LocalizedText` ({ en, he }). Anything drawn on the
 * simulation canvas (e.g. the ghost label) stays a plain English string.
 */
import type { SimulationTemplateId, VisualOverlays } from '@/engine/types';
import type { LocalizedText } from './locale';

export type { SimulationTemplateId, VisualOverlays, LocalizedText };

export interface SliderParam {
  id: string;
  label: LocalizedText;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  lockedDuringPrediction?: boolean;
  /** ★ 'toggle' renders an Off/On switch (min 0, max 1, step 1). Default 'range'. */
  kind?: 'range' | 'toggle';
  /** ★ Toggle captions, [off, on]. */
  valueLabels?: readonly [LocalizedText, LocalizedText];
  /** ★ Qualitative captions shown under the slider ends, e.g. ['gentle', 'hard']. */
  qualitativeLabels?: readonly [LocalizedText, LocalizedText];
}

export interface ChoiceOption {
  id: string;
  text: LocalizedText;
  isCorrect: boolean;
  /** Tailored to the specific misconception (wrong) or the conceptual takeaway (correct). */
  feedback: LocalizedText;
}

export interface SubQuestion {
  id: string;
  prompt: LocalizedText;
  options: ChoiceOption[];
  /** Must be one of the template's `supportedCues`. */
  visualFocusCue?: string;
  /** Parameter presets applied when this sub-question opens. */
  presetOverrides?: Record<string, number>;
  /** ★ Comparison run for this sub-question only. Replaces the question's `ghost`. */
  ghost?: GhostComparison;
}

/**
 * ★ Optional semi-transparent comparison run (e.g. "half launch speed").
 * Ghost params = live params × `paramScale`, then `paramOverrides` on top.
 */
export interface GhostComparison {
  /** Drawn on the canvas, so English-only like all figure labels. */
  label: string;
  /** Multipliers on the live slider values, e.g. `{ launchSpeed: 0.5 }`. */
  paramScale?: Record<string, number>;
  /** Absolute values, applied after `paramScale`. */
  paramOverrides?: Record<string, number>;
}

export interface PhysicsQuestion {
  id: string;
  title: LocalizedText;
  scenarioDescription: LocalizedText;
  simulationTemplate: SimulationTemplateId;
  parameters: SliderParam[];
  /** ★ Template parameters held fixed for this question, with no slider. */
  fixedParams?: Record<string, number>;
  visualOverlays: VisualOverlays;
  subQuestions: SubQuestion[];
  /** ★ Comparison run for every sub-question that doesn't define its own. */
  ghost?: GhostComparison;
}

export interface PhysicsTopic {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  questions: PhysicsQuestion[];
}
