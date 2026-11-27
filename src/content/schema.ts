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
}

/** ★ Optional semi-transparent comparison run (e.g. "2× launch speed"). */
export interface GhostComparison {
  /** Drawn on the canvas, so English-only like all figure labels. */
  label: string;
  paramOverrides: Record<string, number>;
}

export interface PhysicsQuestion {
  id: string;
  title: LocalizedText;
  scenarioDescription: LocalizedText;
  simulationTemplate: SimulationTemplateId;
  parameters: SliderParam[];
  visualOverlays: VisualOverlays;
  subQuestions: SubQuestion[];
  /** ★ */
  ghost?: GhostComparison;
}

export interface PhysicsTopic {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  questions: PhysicsQuestion[];
}
