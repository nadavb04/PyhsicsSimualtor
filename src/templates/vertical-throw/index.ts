import { defineTemplate } from '../types';
import { idealRise, readParams, verticalThrowPhysics, type VerticalThrowState } from './physics';
import { CUES, renderVerticalThrow } from './render';

export const verticalThrow = defineTemplate<VerticalThrowState>({
  id: 'vertical-throw',
  ...verticalThrowPhysics,
  requiredParams: ['launchSpeed', 'buildingHeight'],
  optionalParams: ['airDrag', 'gravity'],
  supportedCues: CUES,
  worldBounds(params) {
    const q = readParams(params);
    const top = q.buildingHeight + idealRise(q);
    return { minX: -6, maxX: 6, minY: -0.08 * top - 1, maxY: top * 1.08 + 1 };
  },
  render: renderVerticalThrow,
});
