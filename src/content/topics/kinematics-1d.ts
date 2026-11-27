import type { PhysicsTopic } from '../schema';

/**
 * Topic 1 — 1D Kinematics.
 * Q1 is implemented; Q2–Q10 (spec §6) are added here as their templates land.
 */
export const kinematics1d: PhysicsTopic = {
  id: 'kinematics-1d',
  title: '1D Kinematics',
  description: 'Position, velocity and acceleration along a straight line.',
  questions: [
    {
      id: 'stone-thrown-upward',
      title: 'Stone Thrown Upward from a Building',
      scenarioDescription:
        'You stand on the edge of a rooftop and throw a stone straight up. It rises, stops for an instant, then falls past the roof edge all the way to the street.',
      simulationTemplate: 'vertical-throw',
      parameters: [
        {
          id: 'launchSpeed',
          label: 'Launch speed',
          unit: 'm/s',
          min: 5,
          max: 25,
          step: 1,
          defaultValue: 15,
          qualitativeLabels: ['gentle toss', 'hard throw'],
        },
        {
          id: 'buildingHeight',
          label: 'Building height',
          unit: 'm',
          min: 0,
          max: 40,
          step: 5,
          defaultValue: 20,
          qualitativeLabels: ['ground level', 'tall tower'],
        },
        {
          id: 'airDrag',
          label: 'Air drag',
          unit: '',
          min: 0,
          max: 1,
          step: 1,
          defaultValue: 0,
          kind: 'toggle',
          valueLabels: ['Off', 'On'],
          lockedDuringPrediction: true,
        },
      ],
      visualOverlays: {
        showVelocityVector: true,
        showAccelerationVector: true,
        showStrobeDots: true,
      },
      subQuestions: [
        {
          id: 'a',
          prompt:
            'Pick any height between the roof edge and the top of the flight (the purple line). How many times does the stone pass that height?',
          visualFocusCue: 'compare_height_crossings',
          presetOverrides: { airDrag: 0 },
          options: [
            {
              id: 'twice',
              text: 'Twice: once on the way up, once on the way down',
              isCorrect: true,
              feedback:
                'Exactly. Look at the two rings on the purple line: the strobe dots go up one column and come back down the other. Every height between the roof and the peak is visited twice.',
            },
            {
              id: 'once',
              text: 'Once: it only goes up through that height',
              isCorrect: false,
              feedback:
                'Watch the strobe dots after the peak. The stone has to come back down past the roof to reach the street, so it crosses the purple line a second time.',
            },
            {
              id: 'depends',
              text: 'It depends on how hard you throw it',
              isCorrect: false,
              feedback:
                'Try a gentle throw and a hard one. The peak moves, but as long as the height is below the peak, the stone always passes it going up and again coming down.',
            },
          ],
        },
        {
          id: 'b',
          prompt:
            'With air drag off, compare the stone’s speed at the purple line on the way down with its speed there on the way up.',
          visualFocusCue: 'compare_crossing_speeds',
          presetOverrides: { airDrag: 0 },
          options: [
            {
              id: 'same',
              text: 'The same speed, just in the opposite direction',
              isCorrect: true,
              feedback:
                'Right. Without drag the flight is symmetric: gravity takes away speed on the way up at exactly the rate it gives it back on the way down. The two speed labels match. Now try turning air drag on after this question.',
            },
            {
              id: 'faster-down',
              text: 'Faster on the way down, because gravity has been pulling longer',
              isCorrect: false,
              feedback:
                'Gravity has been pulling longer, but for the first half of that time it was slowing the stone down. Compare the ↑ and ↓ speed labels on the purple line: they are equal.',
            },
            {
              id: 'slower-down',
              text: 'Slower on the way down, because it lost energy at the top',
              isCorrect: false,
              feedback:
                'Stopping for an instant at the top doesn’t cost any energy. With drag off, nothing takes energy away. Look at the two speed labels: they match.',
            },
          ],
        },
        {
          id: 'c',
          prompt: 'At the very top of the flight, what are the stone’s velocity and acceleration?',
          visualFocusCue: 'highlight_turning_point',
          presetOverrides: { airDrag: 0 },
          options: [
            {
              id: 'v0-a-down',
              text: 'Velocity is zero; acceleration is still g, pointing down',
              isCorrect: true,
              feedback:
                'Spot on. The green velocity arrow shrinks to nothing at the top, but the orange acceleration arrow never changes. Gravity doesn’t switch off just because the stone has stopped for an instant.',
            },
            {
              id: 'both-zero',
              text: 'Both are zero: the stone is stopped',
              isCorrect: false,
              feedback:
                'Watch the orange arrow at the top: it’s still there. If the acceleration really were zero, the stone would stay hanging in the air. It starts falling because gravity is still accelerating it.',
            },
            {
              id: 'v-up-a-zero',
              text: 'Velocity is small and upward; acceleration is zero',
              isCorrect: false,
              feedback:
                'Step through the top frame by frame. The green arrow shrinks to zero, while the orange arrow stays the same length and keeps pointing down the whole time.',
            },
            {
              id: 'v0-a-up',
              text: 'Velocity is zero; acceleration points up, which is why it stopped',
              isCorrect: false,
              feedback:
                'The stone stopped because a downward acceleration had been draining its upward speed the whole way up. Check the orange arrow: it never flips.',
            },
          ],
        },
      ],
    },
  ],
};
