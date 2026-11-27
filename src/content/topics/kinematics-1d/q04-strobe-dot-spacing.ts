import type { PhysicsQuestion } from '../../schema';

/** Q4: Strobe / ticker-tape intuition. Verified by strobe-runner.test.ts. */
export const strobeDotSpacing: PhysicsQuestion = {
  id: 'strobe-dot-spacing',
  title: { en: 'Motion Trail Dot Spacing', he: 'המרווחים בין נקודות הסטרובוסקופ' },
  scenarioDescription: {
    en: 'A strobe light flashes at equal time intervals and photographs a runner on a track. Each dot shows where the runner was at one flash. Without any numbers, the pattern of dots tells you how the runner is moving.',
    he: 'מנורת סטרובוסקופ מהבהבת במרווחי זמן שווים ומצלמת רץ על מסלול. כל נקודה מראה איפה היה הרץ באחד ההבזקים. גם בלי מספרים, דפוס הנקודות מספר איך הרץ נע.',
  },
  simulationTemplate: 'strobe-runner',
  parameters: [
    {
      id: 'initialSpeed',
      label: { en: 'Starting speed', he: 'מהירות התחלתית' },
      unit: 'm/s',
      min: 0,
      max: 8,
      step: 0.5,
      defaultValue: 4,
      lockedDuringPrediction: true,
    },
    {
      id: 'acceleration',
      label: { en: 'Acceleration', he: 'תאוצה' },
      unit: 'm/s²',
      min: -1.5,
      max: 1.5,
      step: 0.25,
      defaultValue: 0,
      lockedDuringPrediction: true,
      qualitativeLabels: [
        { en: 'slowing', he: 'מאט' },
        { en: 'speeding up', he: 'מאיץ' },
      ],
    },
    {
      id: 'strobeInterval',
      label: { en: 'Time between flashes', he: 'זמן בין הבזקים' },
      unit: 's',
      min: 0.25,
      max: 1,
      step: 0.25,
      defaultValue: 0.5,
    },
  ],
  visualOverlays: { showStrobeDots: true, showVelocityVector: true, showGhostComparison: true },
  subQuestions: [
    {
      id: 'a',
      prompt: {
        en: 'In this strobe photo the dots get closer together from left to right. What is the runner doing?',
        he: 'בצילום הסטרובוסקופ הזה הנקודות מתקרבות זו לזו משמאל לימין. מה הרץ עושה?',
      },
      visualFocusCue: 'label_dot_spacing',
      presetOverrides: { initialSpeed: 8, acceleration: -1.5 },
      options: [
        {
          id: 'slowing',
          text: { en: 'Slowing down', he: 'מאט' },
          isCorrect: true,
          feedback: {
            en: 'Yes. The time between flashes is always the same, so a smaller gap means less distance per flash: the runner is slowing. The numbers above the dots (metres between flashes) shrink steadily.',
            he: 'כן. הזמן בין ההבזקים תמיד זהה, ולכן מרווח קטן יותר פירושו פחות מרחק בכל הבזק: הרץ מאט. המספרים מעל הנקודות (מטרים בין הבזקים) קטנים בהדרגה.',
          },
        },
        {
          id: 'speeding',
          text: {
            en: 'Speeding up, because the dots bunch up along the track',
            he: 'מאיץ, כי הנקודות מצטופפות לאורך המסלול',
          },
          isCorrect: false,
          feedback: {
            en: 'Bunching up means less distance covered in each equal time interval. Read the spacing labels: they shrink, and so does the speed readout.',
            he: 'הצטופפות פירושה פחות מרחק בכל פרק זמן שווה. קראו את המספרים בין הנקודות: הם קטנים, וכך גם קריאת המהירות.',
          },
        },
        {
          id: 'constant',
          text: {
            en: 'Running at constant speed: there’s one dot every flash',
            he: 'רץ במהירות קבועה: יש נקודה אחת בכל הבזק',
          },
          isCorrect: false,
          feedback: {
            en: 'There is a dot every flash, but at constant speed all the gaps would be equal. Here each gap is shorter than the one before.',
            he: 'אכן יש נקודה בכל הבזק, אבל במהירות קבועה כל המרווחים היו שווים. כאן כל מרווח קצר מהקודם.',
          },
        },
        {
          id: 'backwards',
          text: { en: 'Running backwards', he: 'רץ אחורה' },
          isCorrect: false,
          feedback: {
            en: 'Every new dot is still to the right of the last one, so the runner never turns around. Shorter gaps just mean slower.',
            he: 'כל נקודה חדשה עדיין מימין לקודמת, כך שהרץ אף פעם לא מסתובב. מרווחים קצרים יותר פירושם פשוט תנועה איטית יותר.',
          },
        },
      ],
    },
    {
      id: 'b',
      prompt: {
        en: 'Now the runner keeps a constant speed, and a blue ghost runner runs at twice that speed. How does the ghost’s dot spacing compare?',
        he: 'עכשיו הרץ שומר על מהירות קבועה, ורץ רפאים כחול רץ במהירות כפולה. איך המרווחים בין הנקודות של רץ הרפאים משתווים?',
      },
      visualFocusCue: 'compare_spacing',
      presetOverrides: { initialSpeed: 3, acceleration: 0 },
      ghost: { label: '2× speed', paramScale: { initialSpeed: 2 } },
      options: [
        {
          id: 'double',
          text: { en: 'The gaps are twice as big', he: 'המרווחים גדולים פי שניים' },
          isCorrect: true,
          feedback: {
            en: 'Right. Twice the speed covers twice the distance in each flash interval, so every gap doubles: compare 1.5 with 3.0 m. Try changing the time between flashes afterwards: both gaps change, but the ratio stays 2.',
            he: 'נכון. מהירות כפולה עוברת מרחק כפול בכל מרווח בין הבזקים, ולכן כל מרווח מוכפל: השוו 1.5 ל-3.0 מטר. אחר כך נסו לשנות את הזמן בין ההבזקים: שני המרווחים משתנים, אבל היחס נשאר 2.',
          },
        },
        {
          id: 'four',
          text: { en: 'The gaps are four times as big', he: 'המרווחים גדולים פי ארבעה' },
          isCorrect: false,
          feedback: {
            en: 'A factor of four shows up for height when you double a launch speed, but here the distance per flash is just speed × time, so it doubles. Compare the spacing labels in the two lanes.',
            he: 'פי ארבעה מופיע בגובה כשמכפילים מהירות זריקה, אבל כאן המרחק בכל הבזק הוא פשוט מהירות × זמן, ולכן הוא מוכפל. השוו את המספרים בין הנקודות בשני המסלולים.',
          },
        },
        {
          id: 'same-more',
          text: {
            en: 'The gaps are the same, but there are more dots',
            he: 'המרווחים זהים, אבל יש יותר נקודות',
          },
          isCorrect: false,
          feedback: {
            en: 'The strobe flashes at the same moments for both runners, so both lanes get the same number of dots. The faster runner’s dots are spread twice as far apart.',
            he: 'הסטרובוסקופ מהבהב באותם רגעים לשני הרצים, כך שבשני המסלולים יש אותו מספר נקודות. הנקודות של הרץ המהיר מרוחקות זו מזו פי שניים.',
          },
        },
        {
          id: 'half',
          text: {
            en: 'The gaps are half as big, since the faster runner needs less time',
            he: 'המרווחים קטנים פי שניים, כי הרץ המהיר צריך פחות זמן',
          },
          isCorrect: false,
          feedback: {
            en: 'The strobe sets the time between dots, not the runner. In that same time the faster runner goes twice as far, so its gaps are bigger.',
            he: 'הסטרובוסקופ קובע את הזמן בין הנקודות, לא הרץ. באותו זמן הרץ המהיר עובר מרחק כפול, ולכן המרווחים שלו גדולים יותר.',
          },
        },
      ],
    },
  ],
};
