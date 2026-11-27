import { defineTemplate } from '../types';
import { dragPhysics, readParams, type DragState } from './physics';
import { CUES, renderVacuumTube } from './render';

export const vacuumTubeDrag = defineTemplate<DragState>({
  id: 'vacuum-tube-drag',
  ...dragPhysics,
  requiredParams: ['airDensity', 'lightMass'],
  optionalParams: ['dropHeight'],
  supportedCues: CUES,
  worldBounds(params) {
    const h = readParams(params).dropHeight;
    return { minX: -0.5 * h, maxX: 0.5 * h, minY: -0.12 * h, maxY: h * 1.12 };
  },
  render: renderVacuumTube,
});
