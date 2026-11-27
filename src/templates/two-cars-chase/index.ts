import { defineTemplate } from '../types';
import { chasePhysics, endTime, positionsAt, readParams, type ChaseState } from './physics';
import { CUES, renderChase } from './render';

export const twoCarsChase = defineTemplate<ChaseState>({
  id: 'two-cars-chase',
  ...chasePhysics,
  requiredParams: ['speedA', 'accelB'],
  optionalParams: ['initialGap', 'scene'],
  supportedCues: CUES,
  worldBounds(params) {
    const q = readParams(params);
    const end = positionsAt(q, endTime(q));
    const maxX = Math.max(end.xA, end.xB, q.initialGap, 10);
    // Room behind the start and ahead of the leader (the bus body extends forward).
    return { minX: -0.06 * maxX - 1, maxX: maxX * 1.14 + 2, minY: -1, maxY: 1 };
  },
  render: renderChase,
});
