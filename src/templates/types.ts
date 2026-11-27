import type { RunStatus } from '@/engine/loop';
import type {
  BaseSimState,
  Bounds,
  History,
  Params,
  PhysicsModel,
  SimulationTemplateId,
  VisualOverlays,
} from '@/engine/types';
import type { Camera } from '@/render/camera';
import type { Theme } from '@/render/theme';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  camera: Camera;
  theme: Theme;
  width: number;
  height: number;
}

export interface GhostRun {
  history: History;
  params: Params;
  label: string;
}

/** Everything a template needs to draw one frame. */
export interface FrameData<S extends BaseSimState> {
  state: S;
  params: Params;
  history: History;
  status: RunStatus;
  overlays: VisualOverlays;
  focusCue?: string;
  ghost?: GhostRun;
}

/**
 * A simulation template = pure physics model + how to draw it.
 * Content files pick a template by id and supply parameter values; the UI never
 * knows template internals.
 */
export interface SimTemplate<S extends BaseSimState> extends PhysicsModel<S> {
  id: SimulationTemplateId;
  /** Param ids content MUST define for this template. */
  requiredParams: readonly string[];
  /** Param ids content MAY define (template has internal defaults). */
  optionalParams: readonly string[];
  /** Values accepted in SubQuestion.visualFocusCue. */
  supportedCues: readonly string[];
  /** World rectangle (metres) the camera should fit for these params. */
  worldBounds(params: Params): Bounds;
  render(rc: RenderContext, frame: FrameData<S>): void;
}

/** Type-erased template for registries and UI. Method bivariance keeps this assignable. */
export type AnySimTemplate = SimTemplate<BaseSimState>;

/** Identity helper that preserves the template's concrete state type. */
export function defineTemplate<S extends BaseSimState>(template: SimTemplate<S>): SimTemplate<S> {
  return template;
}
