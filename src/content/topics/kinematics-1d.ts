import type { PhysicsTopic } from '../schema';
import { stoneThrownUpward } from './kinematics-1d/q01-stone-thrown-upward';
import { twoCarsPassing } from './kinematics-1d/q02-two-cars-passing';
import { speedingUpSlowingDown } from './kinematics-1d/q03-speeding-up-slowing-down';
import { strobeDotSpacing } from './kinematics-1d/q04-strobe-dot-spacing';
import { droppedVsThrown } from './kinematics-1d/q05-dropped-vs-thrown';
import { doublingLaunchSpeed } from './kinematics-1d/q06-doubling-launch-speed';
import { chasingTheBus } from './kinematics-1d/q07-chasing-the-bus';
import { heavyVsLight } from './kinematics-1d/q08-heavy-vs-light';
import { readingVtGraph } from './kinematics-1d/q09-reading-vt-graph';
import { valleyTrackRace } from './kinematics-1d/q10-valley-track-race';

/**
 * Topic 1: 1D Kinematics (spec §6). One module per question in ./kinematics-1d/.
 * Each question's answer key is verified by its template's physics tests.
 */
export const kinematics1d: PhysicsTopic = {
  id: 'kinematics-1d',
  title: { en: '1D Kinematics', he: 'קינמטיקה חד-ממדית' },
  description: {
    en: 'Position, velocity and acceleration along a straight line.',
    he: 'מיקום, מהירות ותאוצה לאורך קו ישר.',
  },
  questions: [
    stoneThrownUpward,
    twoCarsPassing,
    speedingUpSlowingDown,
    strobeDotSpacing,
    droppedVsThrown,
    doublingLaunchSpeed,
    chasingTheBus,
    heavyVsLight,
    readingVtGraph,
    valleyTrackRace,
  ],
};
