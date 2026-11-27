import type { PhysicsQuestion } from '../../schema';

/** Q2: Position vs. velocity trap. Verified by two-cars-chase.test.ts. */
export const twoCarsPassing: PhysicsQuestion = {
  id: 'two-cars-passing',
  title: { en: 'Two Cars Passing Each Other', he: 'שתי מכוניות חולפות זו על פני זו' },
  scenarioDescription: {
    en: 'Car A cruises at a steady speed. Just as it passes Car B, which is waiting at a red light, the light turns green and B pulls away with constant acceleration. Eventually B catches up and overtakes A.',
    he: 'מכונית A נוסעת במהירות קבועה. בדיוק כשהיא חולפת על פני מכונית B, שעומדת ברמזור אדום, האור מתחלף לירוק ו-B יוצאת לדרך בתאוצה קבועה. בסופו של דבר B משיגה את A ועוקפת אותה.',
  },
  simulationTemplate: 'two-cars-chase',
  parameters: [
    {
      id: 'speedA',
      label: { en: 'Car A speed', he: 'מהירות מכונית A' },
      unit: 'm/s',
      min: 4,
      max: 10,
      step: 1,
      defaultValue: 8,
      qualitativeLabels: [
        { en: 'slow', he: 'איטית' },
        { en: 'fast', he: 'מהירה' },
      ],
    },
    {
      id: 'accelB',
      label: { en: 'Car B acceleration', he: 'תאוצת מכונית B' },
      unit: 'm/s²',
      min: 2,
      max: 6,
      step: 0.5,
      defaultValue: 4,
      qualitativeLabels: [
        { en: 'gentle', he: 'עדינה' },
        { en: 'sporty', he: 'ספורטיבית' },
      ],
    },
  ],
  visualOverlays: { showVelocityVector: true, showStrobeDots: true, showLiveVTGraph: true },
  subQuestions: [
    {
      id: 'a',
      prompt: {
        en: 'At the exact instant Car B draws level with Car A, do the two cars have the same speed?',
        he: 'ברגע המדויק שבו מכונית B מגיעה לצד מכונית A, האם לשתי המכוניות יש אותה מהירות?',
      },
      visualFocusCue: 'compare_speeds_at_pass',
      options: [
        {
          id: 'same',
          text: {
            en: 'Yes. They’re side by side, so they must be going the same speed',
            he: 'כן. הן זו לצד זו, אז הן חייבות לנסוע באותה מהירות',
          },
          isCorrect: false,
          feedback: {
            en: 'Being at the same place isn’t the same as going the same speed. Read the yellow “side by side” label: B’s speed is twice A’s. B has to be faster at that moment, or it couldn’t pull ahead.',
            he: 'להיות באותו מקום זה לא כמו לנסוע באותה מהירות. קראו את התווית הצהובה “side by side”: המהירות של B כפולה מזו של A. ברגע הזה B חייבת להיות מהירה יותר, אחרת היא לא הייתה מתקדמת לפני A.',
          },
        },
        {
          id: 'b-twice',
          text: {
            en: 'No. B is going faster: exactly twice A’s speed',
            he: 'לא. B נוסעת מהר יותר: בדיוק פי שניים ממהירות A',
          },
          isCorrect: true,
          feedback: {
            en: 'Yes! Both cars covered the same distance in the same time, so their average speeds match. A held its speed the whole way, while B started from 0, so B must end at twice A’s speed for its average to equal A’s. Same position doesn’t mean same velocity.',
            he: 'כן! שתי המכוניות עברו אותו מרחק באותו זמן, ולכן המהירויות הממוצעות שלהן שוות. A שמרה על מהירותה כל הדרך, ואילו B התחילה מ-0, ולכן B חייבת להגיע למהירות כפולה משל A כדי שהממוצע שלה יהיה שווה לשל A. אותו מיקום לא אומר אותה מהירות.',
          },
        },
        {
          id: 'b-slower',
          text: {
            en: 'No. B is still slower, since it’s only just catching up',
            he: 'לא. B עדיין איטית יותר, כי היא רק עכשיו משיגה את A',
          },
          isCorrect: false,
          feedback: {
            en: 'If B were slower than A at that instant, A would immediately pull ahead again. Look at the speed readouts and the yellow label at the pass: B is the faster car.',
            he: 'אילו B הייתה איטית מ-A ברגע הזה, A הייתה מיד חוזרת להוביל. הסתכלו על קריאות המהירות ועל התווית הצהובה ברגע העקיפה: B היא המכונית המהירה יותר.',
          },
        },
      ],
    },
    {
      id: 'b',
      prompt: {
        en: 'So when did the two cars have exactly the same speed?',
        he: 'אז מתי היו לשתי המכוניות בדיוק אותה מהירות?',
      },
      visualFocusCue: 'highlight_equal_speed',
      options: [
        {
          id: 'at-pass',
          text: { en: 'At the moment B overtook A', he: 'ברגע ש-B עקפה את A' },
          isCorrect: false,
          feedback: {
            en: 'At the pass B was already twice as fast (part a). Watch the graph: the pink line crosses the blue one well before the cars are side by side.',
            he: 'ברגע העקיפה B כבר הייתה מהירה פי שניים (סעיף א). הסתכלו על הגרף: הקו הוורוד חוצה את הקו הכחול הרבה לפני שהמכוניות זו לצד זו.',
          },
        },
        {
          id: 'halfway',
          text: {
            en: 'Halfway through the chase, when A’s lead was at its biggest',
            he: 'באמצע המרדף, כשהיתרון של A היה הגדול ביותר',
          },
          isCorrect: true,
          feedback: {
            en: 'Exactly. Until then A was faster, so its lead kept growing. Once B became faster, the lead started to shrink. The yellow ring on the graph marks equal speed, halfway to the pass, and the yellow dots on the road show where the cars were then: as far apart as they ever get.',
            he: 'בדיוק. עד אז A הייתה מהירה יותר, ולכן היתרון שלה המשיך לגדול. מרגע ש-B נעשתה מהירה יותר, היתרון התחיל להצטמק. הטבעת הצהובה בגרף מסמנת מהירויות שוות, באמצע הדרך לעקיפה, והנקודות הצהובות על הכביש מראות איפה היו המכוניות אז: במרחק הגדול ביותר זו מזו.',
          },
        },
        {
          id: 'start',
          text: {
            en: 'At the start, when they were side by side',
            he: 'בהתחלה, כשהן היו זו לצד זו',
          },
          isCorrect: false,
          feedback: {
            en: 'At the start B was standing still (speed 0) while A was cruising. Look at the left end of the graph: the pink line starts at zero.',
            he: 'בהתחלה B עמדה במקום (מהירות 0) בזמן ש-A נסעה. הסתכלו על הקצה השמאלי של הגרף: הקו הוורוד מתחיל מאפס.',
          },
        },
        {
          id: 'never',
          text: {
            en: 'Never. B was slower and then faster, but never equal',
            he: 'אף פעם. B הייתה איטית יותר ואחר כך מהירה יותר, אבל אף פעם לא שווה',
          },
          isCorrect: false,
          feedback: {
            en: 'B’s speed rises smoothly from 0, so it can’t jump from below A’s speed to above it without passing through it. The yellow ring on the graph marks that instant.',
            he: 'המהירות של B עולה ברציפות מ-0, ולכן היא לא יכולה לקפוץ ממתחת למהירות של A אל מעליה בלי לעבור דרכה. הטבעת הצהובה בגרף מסמנת את הרגע הזה.',
          },
        },
      ],
    },
  ],
};
