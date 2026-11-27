import type { PhysicsQuestion } from '../../schema';

/** Q8: Free fall with and without air. Verified by vacuum-tube-drag.test.ts. */
export const heavyVsLight: PhysicsQuestion = {
  id: 'heavy-vs-light',
  title: {
    en: 'Heavy vs. Light in Free Fall: With and Without Air',
    he: 'כבד מול קל בנפילה חופשית: עם אוויר ובלעדיו',
  },
  scenarioDescription: {
    en: 'A 6 kg bowling ball and a light beach ball of exactly the same size are released together from 20 m up inside a tall tube. A pump can remove all the air (a vacuum) or let it back in.',
    he: 'כדור באולינג של 6 ק״ג וכדור חוף קל בדיוק באותו גודל משוחררים יחד מגובה 20 מטר בתוך צינור גבוה. משאבה יכולה לרוקן את כל האוויר (ריק) או להכניס אותו בחזרה.',
  },
  simulationTemplate: 'vacuum-tube-drag',
  parameters: [
    {
      id: 'airDensity',
      label: { en: 'Air density', he: 'צפיפות האוויר' },
      unit: 'kg/m³',
      min: 0,
      max: 2.4,
      step: 0.3,
      defaultValue: 0,
      lockedDuringPrediction: true,
      qualitativeLabels: [
        { en: 'vacuum', he: 'ריק' },
        { en: 'thick air', he: 'אוויר סמיך' },
      ],
    },
    {
      id: 'lightMass',
      label: { en: 'Beach ball mass', he: 'מסת כדור החוף' },
      unit: 'kg',
      min: 0.1,
      max: 1.5,
      step: 0.1,
      defaultValue: 0.2,
    },
  ],
  visualOverlays: { showVelocityVector: true, showAccelerationVector: true, showStrobeDots: true },
  subQuestions: [
    {
      id: 'a',
      prompt: {
        en: 'With all the air pumped out, which ball reaches the bottom first?',
        he: 'כשכל האוויר נשאב החוצה, איזה כדור מגיע ראשון לתחתית?',
      },
      visualFocusCue: 'compare_landing',
      presetOverrides: { airDensity: 0 },
      options: [
        {
          id: 'together',
          text: { en: 'They land at the same moment', he: 'הם נוחתים באותו רגע' },
          isCorrect: true,
          feedback: {
            en: 'Yes. In a vacuum the only force is gravity, and it gives every mass the same acceleration. The bowling ball is pulled harder, but it is also harder to speed up, by exactly the same factor. Compare the landing times.',
            he: 'כן. בריק הכוח היחיד הוא הכבידה, והיא מקנה לכל מסה אותה תאוצה. כדור הבאולינג נמשך חזק יותר, אבל גם קשה יותר להאיץ אותו, בדיוק באותו יחס. השוו את זמני הנחיתה.',
          },
        },
        {
          id: 'heavy',
          text: {
            en: 'The bowling ball, because it is heavier',
            he: 'כדור הבאולינג, כי הוא כבד יותר',
          },
          isCorrect: false,
          feedback: {
            en: 'Gravity pulls the bowling ball 30 times harder, but it also has 30 times more mass to speed up. The two effects cancel: watch the strobe dots stay level all the way down.',
            he: 'הכבידה מושכת את כדור הבאולינג חזק פי 30, אבל יש לו גם מסה גדולה פי 30 שצריך להאיץ. שתי ההשפעות מבטלות זו את זו: ראו איך נקודות הסטרובוסקופ נשארות באותו גובה לאורך כל הנפילה.',
          },
        },
        {
          id: 'light',
          text: {
            en: 'The beach ball, because it is lighter and easier to move',
            he: 'כדור החוף, כי הוא קל יותר וקל יותר להזיז אותו',
          },
          isCorrect: false,
          feedback: {
            en: 'It is easier to move, but gravity also pulls it more weakly, by the same factor. In a vacuum they fall side by side: compare the landing times.',
            he: 'אכן קל יותר להזיז אותו, אבל הכבידה גם מושכת אותו חלש יותר, באותו יחס. בריק הם נופלים זה לצד זה: השוו את זמני הנחיתה.',
          },
        },
      ],
    },
    {
      id: 'b',
      prompt: {
        en: 'Now let the air back in. The beach ball falls behind. Why?',
        he: 'עכשיו מכניסים את האוויר בחזרה. כדור החוף נשאר מאחור. למה?',
      },
      visualFocusCue: 'compare_accelerations',
      presetOverrides: { airDensity: 1.2 },
      options: [
        {
          id: 'same-push-less-mass',
          text: {
            en: 'At the same speed the air pushes up on both equally, but that push slows the light ball far more',
            he: 'באותה מהירות האוויר דוחף למעלה את שניהם באותה מידה, אבל הדחיפה הזו מאטה את הכדור הקל הרבה יותר',
          },
          isCorrect: true,
          feedback: {
            en: 'Exactly. Same size and same speed mean the same drag force. For the bowling ball that force is a tiny fraction of its weight; for the beach ball it is a big fraction, so its acceleration drops. Watch its orange arrow shrink while the bowling ball’s barely changes.',
            he: 'בדיוק. אותו גודל ואותה מהירות פירושם אותו כוח גרר. עבור כדור הבאולינג הכוח הזה הוא חלק זעיר ממשקלו; עבור כדור החוף הוא חלק גדול, ולכן התאוצה שלו קטנה. ראו איך החץ הכתום שלו מתכווץ בזמן שהחץ של כדור הבאולינג כמעט לא משתנה.',
          },
        },
        {
          id: 'gravity-weaker',
          text: {
            en: 'Gravity gives the lighter ball a smaller acceleration',
            he: 'הכבידה מקנה לכדור הקל תאוצה קטנה יותר',
          },
          isCorrect: false,
          feedback: {
            en: 'If that were true, they wouldn’t have landed together in the vacuum. The difference only appears when there is air, so it is the air, not gravity.',
            he: 'אילו זה היה נכון, הם לא היו נוחתים יחד בריק. ההבדל מופיע רק כשיש אוויר, כך שהאוויר הוא הגורם, לא הכבידה.',
          },
        },
        {
          id: 'air-harder',
          text: {
            en: 'Air pushes harder on the lighter ball',
            he: 'האוויר דוחף חזק יותר את הכדור הקל',
          },
          isCorrect: false,
          feedback: {
            en: 'Drag depends on size, shape and speed, not on mass. At the same speed both balls feel the same push; the same push just matters more to the lighter ball.',
            he: 'כוח הגרר תלוי בגודל, בצורה ובמהירות, לא במסה. באותה מהירות שני הכדורים מרגישים אותה דחיפה; פשוט לכדור הקל אותה דחיפה משמעותית יותר.',
          },
        },
        {
          id: 'heavier-faster',
          text: {
            en: 'Heavier things always fall faster',
            he: 'דברים כבדים תמיד נופלים מהר יותר',
          },
          isCorrect: false,
          feedback: {
            en: 'Part (a) showed they don’t in a vacuum. Heavy things fall faster in air only because air resistance matters less to them.',
            he: 'סעיף א הראה שבריק זה לא כך. דברים כבדים נופלים מהר יותר באוויר רק כי להתנגדות האוויר יש עליהם השפעה קטנה יותר.',
          },
        },
      ],
    },
  ],
};
