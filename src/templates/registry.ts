import type { SimulationTemplateId } from '@/engine/types';
import type { AnySimTemplate } from './types';
import { verticalThrow } from './vertical-throw';

/**
 * All implemented templates. To add one: create src/templates/<id>/index.ts,
 * then register it here. Content referencing an unregistered id fails validation.
 */
export const templateRegistry: Partial<Record<SimulationTemplateId, AnySimTemplate>> = {
  'vertical-throw': verticalThrow,
};

export function getTemplate(id: SimulationTemplateId): AnySimTemplate | undefined {
  return templateRegistry[id];
}
