/**
 * Core, framework-free engine types. Nothing in src/engine may touch the DOM or React.
 */

/** Every simulation template the curriculum may reference. Add new ids here first. */
export type SimulationTemplateId =
  | 'vertical-throw'
  | 'two-cars-chase'
  | 'cart-1d-vectors'
  | 'strobe-runner'
  | 'free-fall-pair'
  | 'vacuum-tube-drag'
  | 'glider-vt-graph'
  | 'valley-track-race';

/** Numeric parameter values keyed by SliderParam.id. Toggles are 0/1. */
export type Params = Readonly<Record<string, number>>;

export interface Vec2 {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Kinematic snapshot of one body, in SI units (m, m/s, m/s²), y pointing up. */
export interface BodySample {
  id: string;
  pos: Vec2;
  vel: Vec2;
  acc: Vec2;
}

export interface SampleRecord {
  t: number;
  bodies: BodySample[];
}

/** Discrete moments worth marking on screen or asserting in tests (turning points, crossings...). */
export interface SimEvent {
  t: number;
  type: string;
  bodyId?: string;
  pos?: Vec2;
  data?: Readonly<Record<string, number | string>>;
}

export interface History {
  samples: SampleRecord[];
  events: SimEvent[];
}

/** Minimum shape of any template state. */
export interface BaseSimState {
  t: number;
}

/** Which visual overlays a question turns on. Templates decide how to draw each one. */
export interface VisualOverlays {
  showVelocityVector?: boolean;
  showAccelerationVector?: boolean;
  showStrobeDots?: boolean;
  showGhostComparison?: boolean;
  showLiveVTGraph?: boolean;
}

/**
 * The pure physics half of a simulation template.
 * `step` must be deterministic and must not mutate `state`.
 */
export interface PhysicsModel<S extends BaseSimState> {
  init(params: Params): S;
  step(state: S, dt: number, params: Params): S;
  sample(state: S, params: Params): BodySample[];
  detectEvents?(prev: S, next: S, params: Params): SimEvent[];
  isFinished(state: S, params: Params): boolean;
  /** Hard stop so a misconfigured run can never loop forever. Seconds of simulated time. */
  maxDuration(params: Params): number;
}
