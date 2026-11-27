import { defineTemplate } from '../types';
import { RUN_SECONDS, positionAt, readParams, runnerPhysics, type RunnerState } from './physics';
import { CUES, renderStrobeRunner } from './render';

export const strobeRunner = defineTemplate<RunnerState>({
  id: 'strobe-runner',
  ...runnerPhysics,
  requiredParams: ['initialSpeed', 'acceleration', 'strobeInterval'],
  optionalParams: [],
  supportedCues: CUES,
  worldBounds(params) {
    const end = Math.max(positionAt(readParams(params), RUN_SECONDS), 5);
    return { minX: -0.05 * end - 0.5, maxX: end * 1.08 + 0.5, minY: -1, maxY: 1 };
  },
  render: renderStrobeRunner,
});
