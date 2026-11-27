/**
 * Curriculum data schema (spec §5), with small extensions marked ★.
 * Content files only describe *what* to show; engines/templates decide *how*.
 */
import type { SimulationTemplateId, VisualOverlays } from '@/engine/types';

export type { SimulationTemplateId, VisualOverlays };

export interface SliderParam {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  lockedDuringPrediction?: boolean;
  /** ★ 'toggle' renders an Off/On switch (min 0, max 1, step 1). Default 'range'. */
  kind?: 'range' | 'toggle';
  /** ★ Toggle captions, [off, on]. */
  valueLabels?: readonly [string, string];
  /** ★ Qualitative captions shown under the slider ends, e.g. ['gentle', 'hard']. */
  qualitativeLabels?: readonly [string, string];
}

export interface ChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  /** Tailored to the specific misconception (wrong) or the conceptual takeaway (correct). */
  feedback: string;
}

export interface SubQuestion {
  id: string;
  prompt: string;
  options: ChoiceOption[];
  /** Must be one of the template's `supportedCues`. */
  visualFocusCue?: string;
  /** Parameter presets applied when this sub-question opens. */
  presetOverrides?: Record<string, number>;
}

/** ★ Optional semi-transparent comparison run (e.g. "2× launch speed"). */
export interface GhostComparison {
  label: string;
  paramOverrides: Record<string, number>;
}

export interface PhysicsQuestion {
  id: string;
  title: string;
  scenarioDescription: string;
  simulationTemplate: SimulationTemplateId;
  parameters: SliderParam[];
  visualOverlays: VisualOverlays;
  subQuestions: SubQuestion[];
  /** ★ */
  ghost?: GhostComparison;
}

export interface PhysicsTopic {
  id: string;
  title: string;
  description: string;
  questions: PhysicsQuestion[];
}
