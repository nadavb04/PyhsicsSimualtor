import type { PhysicsQuestion } from '../../schema';

/** Q9: Direction vs. slope on a v(t) graph. Verified by glider-vt-graph.test.ts. */
export const readingVtGraph: PhysicsQuestion = {
  id: 'reading-vt-graph',
  title: { en: 'Reading a Velocity–Time Line', he: 'קוראים גרף מהירות–זמן' },
  scenarioDescription: {
    en: 'A glider moves along a frictionless air track. Above it, its velocity is plotted live against time. Above the v = 0 line means moving right, below means moving left, and the slope of the line is the acceleration.',
    he: 'דאון נע לאורך מסילת אוויר חסרת חיכוך. מעליו מצויר בזמן אמת גרף המהירות שלו כפונקציה של הזמן. מעל הקו v = 0 פירושו תנועה ימינה, מתחתיו תנועה שמאלה, והשיפוע של הקו הוא התאוצה.',
  },
  simulationTemplate: 'glider-vt-graph',
  parameters: [
    {
      id: 'initialVelocity',
      label: { en: 'Starting velocity', he: 'מהירות התחלתית' },
      unit: 'm/s',
      min: -4,
      max: 4,
      step: 0.5,
      defaultValue: 3,
      lockedDuringPrediction: true,
      qualitativeLabels: [
        { en: '← left', he: '← שמאלה' },
        { en: 'right →', he: 'ימינה →' },
      ],
    },
    {
      id: 'acceleration',
      label: { en: 'Acceleration (slope)', he: 'תאוצה (שיפוע)' },
      unit: 'm/s²',
      min: -2,
      max: 2,
      step: 0.25,
      defaultValue: -1,
      lockedDuringPrediction: true,
      qualitativeLabels: [
        { en: 'line slopes down', he: 'הקו יורד' },
        { en: 'line slopes up', he: 'הקו עולה' },
      ],
    },
  ],
  visualOverlays: {
    showVelocityVector: true,
    showAccelerationVector: true,
    showStrobeDots: true,
    showLiveVTGraph: true,
  },
  subQuestions: [
    {
      id: 'a',
      prompt: {
        en: 'The v(t) line slopes downward and crosses v = 0. What is the glider physically doing at that moment?',
        he: 'קו ה-v(t) יורד וחוצה את v = 0. מה הדאון עושה בפועל ברגע הזה?',
      },
      visualFocusCue: 'highlight_zero_crossing',
      options: [
        {
          id: 'turns-around',
          text: {
            en: 'Stopping for an instant and turning around',
            he: 'נעצר לרגע ומסתובב לאחור',
          },
          isCorrect: true,
          feedback: {
            en: 'Yes. v = 0 means the glider is momentarily at rest. Because the line keeps going down, the velocity becomes negative: the glider turns around and heads left. The yellow rings mark the same instant on the graph and on the track.',
            he: 'כן. v = 0 פירושו שהדאון נמצא רגע במנוחה. מכיוון שהקו ממשיך לרדת, המהירות נעשית שלילית: הדאון מסתובב ונע שמאלה. הטבעות הצהובות מסמנות את אותו רגע בגרף ועל המסילה.',
          },
        },
        {
          id: 'at-start',
          text: {
            en: 'Arriving back at its starting point',
            he: 'חוזר לנקודת ההתחלה',
          },
          isCorrect: false,
          feedback: {
            en: 'The graph shows velocity, not position. Crossing v = 0 means stopped, not “back at the start”. Look at the track: at the yellow ring the glider is well to the right of the start line.',
            he: 'הגרף מראה מהירות, לא מיקום. חציית v = 0 פירושה עצירה, לא “חזרה להתחלה”. הסתכלו על המסילה: בטבעת הצהובה הדאון נמצא הרבה מימין לקו ההתחלה.',
          },
        },
        {
          id: 'stays',
          text: {
            en: 'Coming to rest and staying there',
            he: 'נעצר ונשאר במקום',
          },
          isCorrect: false,
          feedback: {
            en: 'To stay at rest, the line would have to flatten out along v = 0. It keeps sloping down, so the velocity keeps changing and becomes leftward.',
            he: 'כדי להישאר במנוחה, הקו היה צריך להתיישר לאורך v = 0. הוא ממשיך לרדת, ולכן המהירות ממשיכה להשתנות ונעשית שמאלית.',
          },
        },
        {
          id: 'fastest',
          text: { en: 'Moving at its fastest', he: 'נע במהירות הגבוהה ביותר' },
          isCorrect: false,
          feedback: {
            en: 'Speed is how far the line is from v = 0. At the crossing that distance is zero: it is the slowest moment of the whole run.',
            he: 'גודל המהירות הוא המרחק של הקו מ-v = 0. בנקודת החצייה המרחק הזה אפס: זה הרגע האיטי ביותר בכל ההרצה.',
          },
        },
      ],
    },
    {
      id: 'b',
      prompt: {
        en: 'At which point on the graph is the glider farthest from where it started?',
        he: 'באיזו נקודה בגרף הדאון הכי רחוק מהמקום שבו התחיל?',
      },
      visualFocusCue: 'highlight_farthest_point',
      options: [
        {
          id: 'crossing',
          text: {
            en: 'Where the line crosses v = 0',
            he: 'היכן שהקו חוצה את v = 0',
          },
          isCorrect: true,
          feedback: {
            en: 'Right. While v is positive (the green area above the axis) the glider keeps moving right, getting farther away. Once v goes negative (the orange area) it comes back. So the turnaround is the farthest point. By the end, the orange area matches the green one and the glider is back at the start.',
            he: 'נכון. כל עוד v חיובית (השטח הירוק מעל הציר) הדאון ממשיך לנוע ימינה ומתרחק. כש-v נעשית שלילית (השטח הכתום) הוא חוזר. לכן נקודת המפנה היא הנקודה הרחוקה ביותר. בסוף, השטח הכתום שווה לשטח הירוק והדאון חוזר להתחלה.',
          },
        },
        {
          id: 'top',
          text: {
            en: 'At the start of the graph, where v is largest',
            he: 'בתחילת הגרף, היכן ש-v הכי גדולה',
          },
          isCorrect: false,
          feedback: {
            en: 'Being fast isn’t the same as being far. At t = 0 the glider is right at the start line. It gets farthest at the end of its rightward motion, where v reaches zero.',
            he: 'להיות מהיר זה לא כמו להיות רחוק. ב-t = 0 הדאון נמצא בדיוק על קו ההתחלה. הוא מגיע הכי רחוק בסוף התנועה שלו ימינה, היכן ש-v מגיעה לאפס.',
          },
        },
        {
          id: 'end',
          text: {
            en: 'At the end of the graph, after the most time',
            he: 'בסוף הגרף, אחרי הכי הרבה זמן',
          },
          isCorrect: false,
          feedback: {
            en: 'After the crossing it heads back to the left, and by t = 6 s it has returned all the way to the start. Watch the “farthest so far” marker stop moving at the crossing.',
            he: 'אחרי החצייה הוא חוזר שמאלה, וב-t = 6 s הוא כבר חזר עד נקודת ההתחלה. ראו איך הסמן “farthest so far” מפסיק לזוז בנקודת החצייה.',
          },
        },
        {
          id: 'lowest',
          text: {
            en: 'At the lowest point of the line',
            he: 'בנקודה הנמוכה ביותר של הקו',
          },
          isCorrect: false,
          feedback: {
            en: 'The lowest point is where it is moving left fastest, on its way back toward the start. The farthest point is where it stopped going right: the v = 0 crossing.',
            he: 'הנקודה הנמוכה ביותר היא היכן שהוא נע שמאלה הכי מהר, בדרך חזרה להתחלה. הנקודה הרחוקה ביותר היא היכן שהוא הפסיק לנוע ימינה: חציית v = 0.',
          },
        },
      ],
    },
  ],
};
