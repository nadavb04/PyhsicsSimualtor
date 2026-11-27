import type { PhysicsQuestion } from '../../schema';

/** Q7: Closing the gap. Verified by two-cars-chase.test.ts. */
export const chasingTheBus: PhysicsQuestion = {
  id: 'chasing-the-bus',
  title: { en: 'Chasing a Departing Bus', he: 'רודפים אחרי אוטובוס שיוצא מהתחנה' },
  scenarioDescription: {
    en: 'You are running for the bus at a steady speed. While you are still some distance behind, it pulls away from the stop and accelerates. Can you reach the door?',
    he: 'אתם רצים לעבר האוטובוס במהירות קבועה. כשאתם עדיין במרחק מה מאחוריו, הוא יוצא מהתחנה ומאיץ. האם תצליחו להגיע לדלת?',
  },
  simulationTemplate: 'two-cars-chase',
  parameters: [
    {
      id: 'speedA',
      label: { en: 'Your running speed', he: 'מהירות הריצה שלכם' },
      unit: 'm/s',
      min: 3,
      max: 8,
      step: 0.5,
      defaultValue: 4,
      lockedDuringPrediction: true,
      qualitativeLabels: [
        { en: 'jog', he: 'ריצה קלה' },
        { en: 'sprint', he: 'ספרינט' },
      ],
    },
    {
      id: 'accelB',
      label: { en: 'Bus acceleration', he: 'תאוצת האוטובוס' },
      unit: 'm/s²',
      min: 0.5,
      max: 2,
      step: 0.25,
      defaultValue: 1,
      lockedDuringPrediction: true,
    },
    {
      id: 'initialGap',
      label: { en: 'Starting gap to the door', he: 'המרחק ההתחלתי לדלת' },
      unit: 'm',
      min: 4,
      max: 20,
      step: 2,
      defaultValue: 10,
      lockedDuringPrediction: true,
    },
  ],
  fixedParams: { scene: 1 },
  visualOverlays: { showVelocityVector: true, showStrobeDots: true, showLiveVTGraph: true },
  subQuestions: [
    {
      id: 'a',
      prompt: {
        en: 'With these settings you barely miss the bus. At what instant are you closest to its door?',
        he: 'בהגדרות האלה אתם מפספסים את האוטובוס בקושי. באיזה רגע אתם הכי קרובים לדלת שלו?',
      },
      visualFocusCue: 'show_gap',
      options: [
        {
          id: 'speeds-match',
          text: {
            en: 'When your speed and the bus’s speed are equal',
            he: 'כשהמהירות שלכם ומהירות האוטובוס שוות',
          },
          isCorrect: true,
          feedback: {
            en: 'Yes. While you are faster, you close the gap; once the bus is faster, it pulls away. So the closest moment is exactly when the speeds match. The yellow bar marks that smallest gap, and on the graph the pink line crosses the blue one at the same moment.',
            he: 'כן. כל עוד אתם מהירים יותר, אתם סוגרים את הפער; מרגע שהאוטובוס מהיר יותר, הוא מתרחק. לכן הרגע הקרוב ביותר הוא בדיוק כשהמהירויות שוות. הפס הצהוב מסמן את הפער הקטן ביותר, ובגרף הקו הוורוד חוצה את הקו הכחול באותו רגע.',
          },
        },
        {
          id: 'start',
          text: {
            en: 'Right at the start, before the bus gets going',
            he: 'ממש בהתחלה, לפני שהאוטובוס צובר מהירות',
          },
          isCorrect: false,
          feedback: {
            en: 'At first you’re running faster than the slowly starting bus, so the gap keeps shrinking. Watch the purple gap label count down before it turns around.',
            he: 'בהתחלה אתם רצים מהר יותר מהאוטובוס שרק מתחיל לנסוע, ולכן הפער ממשיך להצטמק. ראו איך תווית הפער הסגולה יורדת לפני שהיא מתחילה לעלות.',
          },
        },
        {
          id: 'end',
          text: {
            en: 'At the very end, after running the longest',
            he: 'ממש בסוף, אחרי שרצתם הכי הרבה זמן',
          },
          isCorrect: false,
          feedback: {
            en: 'By then the bus is much faster than you and pulling away. The gap was smallest earlier, at the yellow bar, when your speeds were equal.',
            he: 'עד אז האוטובוס כבר מהיר מכם בהרבה ומתרחק. הפער היה הקטן ביותר מוקדם יותר, בפס הצהוב, כשהמהירויות שלכם היו שוות.',
          },
        },
      ],
    },
    {
      id: 'b',
      prompt: {
        en: 'Suppose the starting gap doubles. To just catch the bus now, how much faster must you run?',
        he: 'נניח שהמרחק ההתחלתי מוכפל. כדי להספיק בדיוק לתפוס את האוטובוס, כמה מהר יותר צריך לרוץ?',
      },
      visualFocusCue: 'show_gap',
      options: [
        {
          id: 'root-two',
          text: {
            en: 'Faster, but less than double: about 1.4×',
            he: 'מהר יותר, אבל פחות מפי שניים: בערך פי 1.4',
          },
          isCorrect: true,
          feedback: {
            en: 'Right. A faster runner reaches the bus sooner, before it has picked up much speed, so speed pays off more than you might think. The speed needed grows as the square root of the gap: double the gap needs about 1.4× the speed, and four times the gap needs 2×. Try it at 1 m/s²: a 10 m gap needs about 4.5 m/s, a 20 m gap about 6.3 m/s.',
            he: 'נכון. רץ מהיר יותר מגיע לאוטובוס מוקדם יותר, לפני שהוא צבר הרבה מהירות, ולכן מהירות משתלמת יותר ממה שנדמה. המהירות הדרושה גדלה כמו השורש של המרחק: מרחק כפול דורש בערך פי 1.4 מהירות, ומרחק פי ארבעה דורש פי שניים. נסו בתאוצה של 1 m/s²: למרחק 10 מטר צריך בערך 4.5 m/s, ולמרחק 20 מטר בערך 6.3 m/s.',
          },
        },
        {
          id: 'double',
          text: { en: 'Exactly twice as fast', he: 'בדיוק פי שניים' },
          isCorrect: false,
          feedback: {
            en: 'Twice your speed would handle a gap four times as big. Try a 10 m gap (about 4.5 m/s needed), then 20 m (about 6.3 m/s): a factor of about 1.4, not 2.',
            he: 'מהירות כפולה מספיקה למרחק גדול פי ארבעה. נסו מרחק של 10 מטר (צריך בערך 4.5 m/s), ואז 20 מטר (בערך 6.3 m/s): פקטור של בערך 1.4, לא 2.',
          },
        },
        {
          id: 'same',
          text: {
            en: 'No faster: at the same speed you’ll catch it eventually',
            he: 'לא צריך מהר יותר: באותה מהירות תשיגו אותו בסוף',
          },
          isCorrect: false,
          feedback: {
            en: 'The bus keeps accelerating, so sooner or later it is faster than any runner. If you haven’t reached it by the time the speeds match, you never will. Try a bigger gap at the same speed and watch the closest gap grow.',
            he: 'האוטובוס ממשיך להאיץ, כך שבמוקדם או במאוחר הוא מהיר יותר מכל רץ. אם לא הגעתם אליו עד שהמהירויות משתוות, לא תגיעו לעולם. נסו מרחק גדול יותר באותה מהירות וראו איך הפער הקטן ביותר גדל.',
          },
        },
        {
          id: 'four',
          text: { en: 'Four times as fast', he: 'פי ארבעה' },
          isCorrect: false,
          feedback: {
            en: 'Speed helps much more than that: four times the speed would cover a gap sixteen times as big. Doubling the gap needs only about 1.4× the speed.',
            he: 'מהירות עוזרת הרבה יותר מזה: מהירות פי ארבעה תכסה מרחק גדול פי שישה עשר. הכפלת המרחק דורשת רק בערך פי 1.4 מהירות.',
          },
        },
      ],
    },
  ],
};
