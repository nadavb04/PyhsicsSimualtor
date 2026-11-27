import type { SimulationTemplateId } from '@/engine/types';
import type { AnySimTemplate } from './types';
import { cart1dVectors } from './cart-1d-vectors';
import { freeFallPair } from './free-fall-pair';
import { gliderVtGraph } from './glider-vt-graph';
import { strobeRunner } from './strobe-runner';
import { twoCarsChase } from './two-cars-chase';
import { vacuumTubeDrag } from './vacuum-tube-drag';
import { valleyTrackRace } from './valley-track-race';
import { verticalThrow } from './vertical-throw';

/**
 * All implemented templates. To add one: create src/templates/<id>/index.ts,
 * then register it here. Content referencing an unregistered id fails validation.
 */
export const templateRegistry: Record<SimulationTemplateId, AnySimTemplate> = {
  'vertical-throw': verticalThrow,
  'two-cars-chase': twoCarsChase,
  'cart-1d-vectors': cart1dVectors,
  'strobe-runner': strobeRunner,
  'free-fall-pair': freeFallPair,
  'vacuum-tube-drag': vacuumTubeDrag,
  'glider-vt-graph': gliderVtGraph,
  'valley-track-race': valleyTrackRace,
};

export function getTemplate(id: SimulationTemplateId): AnySimTemplate | undefined {
  return templateRegistry[id];
}
