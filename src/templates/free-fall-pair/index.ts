import { defineTemplate } from '../types';
import { freeFallPairPhysics, readParams, type FreeFallPairState } from './physics';
import { CUES, renderFreeFallPair } from './render';

export const freeFallPair = defineTemplate<FreeFallPairState>({
  id: 'free-fall-pair',
  ...freeFallPairPhysics,
  requiredParams: ['launchSpeedB', 'towerHeight'],
  optionalParams: ['gravity'],
  supportedCues: CUES,
  worldBounds(params) {
    const h = readParams(params).towerHeight;
    return { minX: -7, maxX: 7, minY: -0.06 * h - 1, maxY: h * 1.06 + 1 };
  },
  render: renderFreeFallPair,
});
