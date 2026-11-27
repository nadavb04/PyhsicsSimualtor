import { defineTemplate } from '../types';
import { RUN_SECONDS, gliderPhysics, positionAt, readParams, type GliderState } from './physics';
import { CUES, renderGlider } from './render';

export const gliderVtGraph = defineTemplate<GliderState>({
  id: 'glider-vt-graph',
  ...gliderPhysics,
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
    const pad = Math.max(1.5, 0.1 * (max - min));
    const span = max - min + 2 * pad;
    // Tall world so the track sits low on the stage and the v(t) graph gets the sky.
    return { minX: min - pad, maxX: max + pad, minY: -0.45 * span, maxY: 0.75 * span };
  },
  render: renderGlider,
});
