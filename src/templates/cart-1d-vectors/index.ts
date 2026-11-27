import { defineTemplate } from '../types';
import { RUN_SECONDS, cartPhysics, positionAt, readParams, type CartState } from './physics';
import { CUES, renderCart } from './render';

export const cart1dVectors = defineTemplate<CartState>({
  id: 'cart-1d-vectors',
  ...cartPhysics,
  requiredParams: ['initialVelocity', 'acceleration'],
  optionalParams: [],
  supportedCues: CUES,
  worldBounds(params) {
    const q = readParams(params);
    let min = 0;
    let max = 0;
    for (let t = 0; t <= RUN_SECONDS; t += 0.05) {
      const x = positionAt(q, t);
      min = Math.min(min, x);
      max = Math.max(max, x);
    }
    const pad = Math.max(2, 0.1 * (max - min));
    return { minX: min - pad, maxX: max + pad, minY: -1, maxY: 1 };
  },
  render: renderCart,
});
