import { defineTemplate } from '../types';
import { COURSE_LENGTH, TRACK_B_OFFSET, racePhysics, readParams, type RaceState } from './physics';
import { CUES, renderValleyRace } from './render';

export const valleyTrackRace = defineTemplate<RaceState>({
  id: 'valley-track-race',
  ...racePhysics,
  requiredParams: ['initialSpeed', 'valleyDepth'],
  optionalParams: [],
  supportedCues: CUES,
  worldBounds(params) {
    const depth = readParams(params).valleyDepth;
    return {
      minX: -2.2,
      maxX: COURSE_LENGTH + 1.2,
      minY: TRACK_B_OFFSET - Math.max(depth, 1) - 1.6,
      maxY: 2.6,
    };
  },
  render: renderValleyRace,
});
