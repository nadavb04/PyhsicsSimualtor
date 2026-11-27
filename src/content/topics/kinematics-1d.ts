import type { PhysicsTopic } from '../schema';

/**
 * Topic 1 — 1D Kinematics.
 * Q1 is implemented; Q2–Q10 (spec §6) are added here as their templates land.
 */
export const kinematics1d: PhysicsTopic = {
  id: 'kinematics-1d',
  title: { en: '1D Kinematics', he: 'קינמטיקה חד-ממדית' },
  description: {
    en: 'Position, velocity and acceleration along a straight line.',
    he: 'מיקום, מהירות ותאוצה לאורך קו ישר.',
  },
  questions: [
    {
      id: 'stone-thrown-upward',
      title: {
        en: 'Stone Thrown Upward from a Building',
        he: 'אבן שנזרקת כלפי מעלה מגג בניין',
      },
      scenarioDescription: {
        en: 'You stand on the edge of a rooftop and throw a stone straight up. It rises, stops for an instant, then falls past the roof edge all the way to the street.',
        he: 'עומדים על קצה גג וזורקים אבן ישר למעלה. היא עולה, נעצרת לרגע, ואז נופלת חזרה מעבר לשפת הגג עד לרחוב.',
      },
      simulationTemplate: 'vertical-throw',
      parameters: [
        {
          id: 'launchSpeed',
          label: { en: 'Launch speed', he: 'מהירות זריקה' },
          unit: 'm/s',
          min: 5,
          max: 25,
          step: 1,
          defaultValue: 15,
          qualitativeLabels: [
            { en: 'gentle toss', he: 'זריקה עדינה' },
            { en: 'hard throw', he: 'זריקה חזקה' },
          ],
        },
        {
          id: 'buildingHeight',
          label: { en: 'Building height', he: 'גובה הבניין' },
          unit: 'm',
          min: 0,
          max: 40,
          step: 5,
          defaultValue: 20,
          qualitativeLabels: [
            { en: 'ground level', he: 'גובה הקרקע' },
            { en: 'tall tower', he: 'מגדל גבוה' },
          ],
        },
        {
          id: 'airDrag',
          label: { en: 'Air drag', he: 'התנגדות אוויר' },
          unit: '',
          min: 0,
          max: 1,
          step: 1,
          defaultValue: 0,
          kind: 'toggle',
          valueLabels: [
            { en: 'Off', he: 'כבויה' },
            { en: 'On', he: 'פעילה' },
          ],
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
          prompt: {
            en: 'Pick any height between the roof edge and the top of the flight (the purple line). How many times does the stone pass that height?',
            he: 'בחרו גובה כלשהו בין שפת הגג לשיא המעוף (הקו הסגול). כמה פעמים האבן עוברת בגובה הזה?',
          },
          visualFocusCue: 'compare_height_crossings',
          presetOverrides: { airDrag: 0 },
          options: [
            {
              id: 'twice',
              text: {
                en: 'Twice: once on the way up, once on the way down',
                he: 'פעמיים: פעם אחת בעלייה ופעם אחת בירידה',
              },
              isCorrect: true,
              feedback: {
                en: 'Exactly. Look at the two rings on the purple line: the strobe dots go up one column and come back down the other. Every height between the roof and the peak is visited twice.',
                he: 'בדיוק. הסתכלו על שתי הטבעות על הקו הסגול: נקודות הסטרובוסקופ עולות בעמודה אחת ויורדות בעמודה השנייה. האבן מבקרת פעמיים בכל גובה שבין הגג לשיא.',
              },
            },
            {
              id: 'once',
              text: {
                en: 'Once: it only goes up through that height',
                he: 'פעם אחת: היא רק עולה דרך הגובה הזה',
              },
              isCorrect: false,
              feedback: {
                en: 'Watch the strobe dots after the peak. The stone has to come back down past the roof to reach the street, so it crosses the purple line a second time.',
                he: 'עקבו אחרי נקודות הסטרובוסקופ אחרי השיא. כדי להגיע לרחוב האבן חייבת לרדת חזרה מעבר לגג, ולכן היא חוצה את הקו הסגול פעם שנייה.',
              },
            },
            {
              id: 'depends',
              text: {
                en: 'It depends on how hard you throw it',
                he: 'זה תלוי בעוצמת הזריקה',
              },
              isCorrect: false,
              feedback: {
                en: 'Try a gentle throw and a hard one. The peak moves, but as long as the height is below the peak, the stone always passes it going up and again coming down.',
                he: 'נסו זריקה עדינה וזריקה חזקה. השיא זז, אבל כל עוד הגובה נמצא מתחת לשיא, האבן תמיד עוברת בו בעלייה ושוב בירידה.',
              },
            },
          ],
        },
        {
          id: 'b',
          prompt: {
            en: 'With air drag off, compare the stone’s speed at the purple line on the way down with its speed there on the way up.',
            he: 'כשהתנגדות האוויר כבויה, השוו את גודל המהירות של האבן בקו הסגול בירידה לגודל המהירות שלה שם בעלייה.',
          },
          visualFocusCue: 'compare_crossing_speeds',
          presetOverrides: { airDrag: 0 },
          options: [
            {
              id: 'same',
              text: {
                en: 'The same speed, just in the opposite direction',
                he: 'אותו גודל מהירות, רק בכיוון ההפוך',
              },
              isCorrect: true,
              feedback: {
                en: 'Right. Without drag the flight is symmetric: gravity takes away speed on the way up at exactly the rate it gives it back on the way down. The two speed labels match. Now try turning air drag on after this question.',
                he: 'נכון. בלי התנגדות אוויר המעוף סימטרי: הכבידה מורידה מהירות בעלייה בדיוק באותו קצב שבו היא מחזירה אותה בירידה. שתי תוויות המהירות זהות. אחרי השאלה הזו נסו להפעיל את התנגדות האוויר.',
              },
            },
            {
              id: 'faster-down',
              text: {
                en: 'Faster on the way down, because gravity has been pulling longer',
                he: 'מהירה יותר בירידה, כי הכבידה מושכת אותה זמן רב יותר',
              },
              isCorrect: false,
              feedback: {
                en: 'Gravity has been pulling longer, but for the first half of that time it was slowing the stone down. Compare the ↑ and ↓ speed labels on the purple line: they are equal.',
                he: 'הכבידה אכן מושכת זמן רב יותר, אבל בחצי הראשון של הזמן הזה היא האטה את האבן. השוו את תוויות המהירות ↑ ו-↓ על הקו הסגול: הן שוות.',
              },
            },
            {
              id: 'slower-down',
              text: {
                en: 'Slower on the way down, because it lost energy at the top',
                he: 'איטית יותר בירידה, כי היא איבדה אנרגיה בשיא',
              },
              isCorrect: false,
              feedback: {
                en: 'Stopping for an instant at the top doesn’t cost any energy. With drag off, nothing takes energy away. Look at the two speed labels: they match.',
                he: 'עצירה רגעית בשיא לא עולה שום אנרגיה. כשהתנגדות האוויר כבויה, שום דבר לא לוקח אנרגיה. הסתכלו על שתי תוויות המהירות: הן זהות.',
              },
            },
          ],
        },
        {
          id: 'c',
          prompt: {
            en: 'At the very top of the flight, what are the stone’s velocity and acceleration?',
            he: 'בשיא המעוף בדיוק, מהן המהירות והתאוצה של האבן?',
          },
          visualFocusCue: 'highlight_turning_point',
          presetOverrides: { airDrag: 0 },
          options: [
            {
              id: 'v0-a-down',
              text: {
                en: 'Velocity is zero; acceleration is still g, pointing down',
                he: 'המהירות אפס; התאוצה עדיין g, כלפי מטה',
              },
              isCorrect: true,
              feedback: {
                en: 'Spot on. The green velocity arrow shrinks to nothing at the top, but the orange acceleration arrow never changes. Gravity doesn’t switch off just because the stone has stopped for an instant.',
                he: 'בול. חץ המהירות הירוק מתכווץ לאפס בשיא, אבל חץ התאוצה הכתום לא משתנה אף פעם. הכבידה לא נכבית רק כי האבן נעצרה לרגע.',
              },
            },
            {
              id: 'both-zero',
              text: {
                en: 'Both are zero: the stone is stopped',
                he: 'שתיהן אפס: האבן עומדת',
              },
              isCorrect: false,
              feedback: {
                en: 'Watch the orange arrow at the top: it’s still there. If the acceleration really were zero, the stone would stay hanging in the air. It starts falling because gravity is still accelerating it.',
                he: 'הסתכלו על החץ הכתום בשיא: הוא עדיין שם. אילו התאוצה הייתה באמת אפס, האבן הייתה נשארת תלויה באוויר. היא מתחילה ליפול כי הכבידה עדיין מאיצה אותה.',
              },
            },
            {
              id: 'v-up-a-zero',
              text: {
                en: 'Velocity is small and upward; acceleration is zero',
                he: 'המהירות קטנה וכלפי מעלה; התאוצה אפס',
              },
              isCorrect: false,
              feedback: {
                en: 'Step through the top frame by frame. The green arrow shrinks to zero, while the orange arrow stays the same length and keeps pointing down the whole time.',
                he: 'עברו על השיא פריים אחר פריים. החץ הירוק מתכווץ לאפס, ואילו החץ הכתום שומר על אותו אורך וממשיך להצביע למטה כל הזמן.',
              },
            },
            {
              id: 'v0-a-up',
              text: {
                en: 'Velocity is zero; acceleration points up, which is why it stopped',
                he: 'המהירות אפס; התאוצה כלפי מעלה, ובגלל זה היא נעצרה',
              },
              isCorrect: false,
              feedback: {
                en: 'The stone stopped because a downward acceleration had been draining its upward speed the whole way up. Check the orange arrow: it never flips.',
                he: 'האבן נעצרה כי תאוצה כלפי מטה הקטינה את מהירותה כלפי מעלה לאורך כל העלייה. בדקו את החץ הכתום: הוא אף פעם לא מתהפך.',
              },
            },
          ],
        },
      ],
    },
  ],
};
