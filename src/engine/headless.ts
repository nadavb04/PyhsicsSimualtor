import { SimulationRunner, type RunnerOptions } from './loop';
import type { BaseSimState, History, Params, PhysicsModel } from './types';

export interface HeadlessResult<S extends BaseSimState> {
  history: History;
  finalState: S;
}

/** Run a model from init to finish without rendering. Used for ghost runs and physics tests. */
export function simulate<S extends BaseSimState>(
  model: PhysicsModel<S>,
  params: Params,
  options?: RunnerOptions,
): HeadlessResult<S> {
  const runner = new SimulationRunner(model, params, options);
  runner.runToEnd();
  return { history: runner.history, finalState: runner.state };
}
