import { createHistory, recordEvents, recordSample } from './recorder';
import type { BaseSimState, History, Params, PhysicsModel } from './types';

/** Fixed physics step. Small enough for accuracy, cheap enough for mobile. */
export const PHYSICS_DT = 1 / 240;
/** Frame-time cap: a long stall (tab switch, GC) never causes a huge catch-up burst. */
export const MAX_FRAME_DT = 0.1;
/** Simulated seconds advanced by the "Step" button. */
export const STEP_SECONDS = 1 / 20;
/** Record a history sample every N physics steps (240 / 4 = 60 Hz). */
const DEFAULT_RECORD_EVERY = 4;

export type RunStatus = 'ready' | 'running' | 'paused' | 'finished';

export interface RunnerOptions {
  recordEvery?: number;
}

/**
 * Deterministic fixed-timestep runner. Knows nothing about requestAnimationFrame;
 * the UI feeds it real elapsed time via `advance`.
 */
export class SimulationRunner<S extends BaseSimState> {
  state!: S;
  history: History = createHistory();
  status: RunStatus = 'ready';
  params!: Params;

  private accumulator = 0;
  private stepCount = 0;
  private readonly model: PhysicsModel<S>;
  private readonly recordEvery: number;

  constructor(model: PhysicsModel<S>, params: Params, options: RunnerOptions = {}) {
    this.model = model;
    this.recordEvery = options.recordEvery ?? DEFAULT_RECORD_EVERY;
    this.reset(params);
  }

  reset(params: Params = this.params): void {
    this.params = params;
    this.state = this.model.init(params);
    this.history = createHistory();
    this.accumulator = 0;
    this.stepCount = 0;
    this.status = 'ready';
    this.record();
  }

  play(): void {
    if (this.status === 'finished') this.reset();
    this.status = 'running';
  }

  pause(): void {
    if (this.status === 'running') this.status = 'paused';
  }

  /** Advance by real elapsed seconds while running. Returns the number of physics steps taken. */
  advance(realDt: number, timeScale = 1): number {
    if (this.status !== 'running') return 0;
    this.accumulator += Math.min(Math.max(realDt, 0), MAX_FRAME_DT) * timeScale;
    let steps = 0;
    while (this.accumulator >= PHYSICS_DT && this.status === 'running') {
      this.tick();
      this.accumulator -= PHYSICS_DT;
      steps++;
    }
    return steps;
  }

  /** Advance a fixed chunk of simulated time regardless of play state (Step button). */
  stepOnce(simSeconds = STEP_SECONDS): void {
    if (this.status === 'finished') return;
    if (this.status === 'ready' || this.status === 'running') this.status = 'paused';
    const n = Math.max(1, Math.round(simSeconds / PHYSICS_DT));
    for (let i = 0; i < n && !this.isDone(); i++) this.tick();
    if (!this.isDone()) this.record();
  }

  /** Run synchronously to the end (headless use: tests, ghost runs, answer verification). */
  runToEnd(): void {
    if (this.status === 'finished') return;
    this.status = 'running';
    while (this.status === 'running') this.tick();
  }

  /** Method (not inline comparison) so TS doesn't narrow `status` across tick() mutations. */
  private isDone(): boolean {
    return this.status === 'finished';
  }

  private tick(): void {
    const prev = this.state;
    const next = this.model.step(prev, PHYSICS_DT, this.params);
    this.state = next;
    this.stepCount++;

    const events = this.model.detectEvents?.(prev, next, this.params);
    if (events?.length) recordEvents(this.history, events);

    const done =
      this.model.isFinished(next, this.params) || next.t >= this.model.maxDuration(this.params);
    if (done || this.stepCount % this.recordEvery === 0) this.record();
    if (done) this.status = 'finished';
  }

  private record(): void {
    recordSample(this.history, {
      t: this.state.t,
      bodies: this.model.sample(this.state, this.params),
    });
  }
}
