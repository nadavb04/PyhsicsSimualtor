import type { PhysicsQuestion } from '../../schema';

/** Q6: Quadratic height scaling. Verified by vertical-throw.test.ts ("Q6: …"). */
export const doublingLaunchSpeed: PhysicsQuestion = {
  id: 'doubling-launch-speed',
  title: { en: 'Doubling the Launch Speed', he: 'מכפילים את מהירות הזריקה' },
  scenarioDescription: {
    en: 'Two stones are thrown straight up from the ground at the same moment, with no air. The blue ghost stone is thrown at half your launch speed, so yours goes up at twice the ghost’s speed. Gravity is the same for both.',
    he: 'שתי אבנים נזרקות ישר למעלה מהקרקע באותו רגע, בלי אוויר. אבן הרפאים הכחולה נזרקת בחצי ממהירות הזריקה שלכם, כך שהאבן שלכם עולה במהירות כפולה משלה. הכבידה זהה לשתיהן.',
  },
  simulationTemplate: 'vertical-throw',
  parameters: [
    {
      id: 'launchSpeed',
      label: { en: 'Your launch speed (2×)', he: 'מהירות הזריקה שלכם (‎2×‎)' },
      unit: 'm/s',
      min: 8,
      max: 24,
      step: 2,
      defaultValue: 20,
    },
    {
      id: 'gravity',
      label: { en: 'Gravity g', he: 'תאוצת הכובד g' },
      unit: 'm/s²',
      min: 5,
      max: 20,
      step: 0.2,
      defaultValue: 9.8,
      qualitativeLabels: [
        { en: 'weaker', he: 'חלשה יותר' },
        { en: 'stronger', he: 'חזקה יותר' },
      ],
    },
  ],
  fixedParams: { buildingHeight: 0, airDrag: 0 },
  visualOverlays: { showVelocityVector: true, showStrobeDots: true, showGhostComparison: true },
  ghost: { label: '1× (half speed)', paramScale: { launchSpeed: 0.5 } },
  subQuestions: [
    {
      id: 'a',
      prompt: {
        en: 'Your stone is launched at twice the ghost’s speed. How does its hang time (time in the air) compare with the ghost’s?',
        he: 'האבן שלכם נזרקת במהירות כפולה ממהירות אבן הרפאים. איך זמן השהייה שלה באוויר משתווה לזה של אבן הרפאים?',
      },
      visualFocusCue: 'compare_flight_times',
      options: [
        {
          id: 'double',
          text: { en: 'Twice as long', he: 'פי שניים' },
          isCorrect: true,
          feedback: {
            en: 'Yes. Gravity removes speed at a steady rate (g metres per second, every second), so twice the launch speed takes twice as long to use up, and twice as long to come back down. Compare the two landing times under the ground.',
            he: 'כן. הכבידה מורידה מהירות בקצב קבוע (g מטרים לשנייה, בכל שנייה), ולכן לוקח פי שניים זמן “לגמור” מהירות זריקה כפולה, ופי שניים זמן לחזור למטה. השוו את שני זמני הנחיתה מתחת לקרקע.',
          },
        },
        {
          id: 'four',
          text: { en: 'Four times as long', he: 'פי ארבעה' },
          isCorrect: false,
          feedback: {
            en: 'That factor of four belongs to height (that’s the next part!). Time simply scales with speed: the stone loses the same speed every second, so double the speed means double the time. Compare the landing times.',
            he: 'הפקטור ארבע שייך לגובה (זה הסעיף הבא!). הזמן פשוט פרופורציוני למהירות: האבן מאבדת אותה מהירות בכל שנייה, ולכן מהירות כפולה פירושה זמן כפול. השוו את זמני הנחיתה.',
          },
        },
        {
          id: 'root-two',
          text: { en: 'About 1.4 times as long', he: 'בערך פי 1.4' },
          isCorrect: false,
          feedback: {
            en: 'Hang time grows in direct proportion to launch speed, not as its square root. Read the landing times under the ground: one is twice the other.',
            he: 'זמן השהייה גדל ביחס ישר למהירות הזריקה, לא כשורש שלה. קראו את זמני הנחיתה מתחת לקרקע: אחד כפול מהשני.',
          },
        },
        {
          id: 'same',
          text: {
            en: 'The same: gravity is the same for both',
            he: 'אותו זמן: הכבידה זהה לשתיהן',
          },
          isCorrect: false,
          feedback: {
            en: 'The same gravity means the same rate of slowing down, so the faster stone needs more time to stop. Its landing time is twice the ghost’s.',
            he: 'אותה כבידה פירושה אותו קצב האטה, ולכן האבן המהירה צריכה יותר זמן כדי לעצור. זמן הנחיתה שלה כפול מזה של אבן הרפאים.',
          },
        },
      ],
    },
    {
      id: 'b',
      prompt: {
        en: 'How does your stone’s maximum height compare with the ghost’s?',
        he: 'איך הגובה המרבי של האבן שלכם משתווה לגובה המרבי של אבן הרפאים?',
      },
      visualFocusCue: 'compare_peaks',
      options: [
        {
          id: 'four',
          text: { en: 'Four times as high', he: 'פי ארבעה' },
          isCorrect: true,
          feedback: {
            en: 'Exactly. It rises for twice as long, and its average speed on the way up is also twice as big: 2 × 2 = 4. Compare the two dashed peak lines. The same rule makes braking distance quadruple when a car’s speed doubles.',
            he: 'בדיוק. היא עולה פי שניים זמן, וגם המהירות הממוצעת שלה בעלייה כפולה: 2 × 2 = 4. השוו את שני קווי השיא המקווקווים. אותו כלל גורם לדרך הבלימה של מכונית לגדול פי ארבעה כשהמהירות שלה מוכפלת.',
          },
        },
        {
          id: 'double',
          text: { en: 'Twice as high', he: 'פי שניים' },
          isCorrect: false,
          feedback: {
            en: 'Twice the time, yes, but it is also moving twice as fast on average during that time. The two effects multiply: 2 × 2 = 4. Compare the two peak labels.',
            he: 'פי שניים זמן, נכון, אבל במשך הזמן הזה היא גם נעה בממוצע מהר פי שניים. שתי ההשפעות מוכפלות: 2 × 2 = 4. השוו את שתי תוויות השיא.',
          },
        },
        {
          id: 'depends',
          text: { en: 'It depends on gravity', he: 'זה תלוי בכבידה' },
          isCorrect: false,
          feedback: {
            en: 'Gravity changes both peaks, but by the same factor. Try the gravity slider after this question: the two peaks move together and their ratio stays 4.',
            he: 'הכבידה משנה את שני השיאים, אבל באותו יחס. אחרי השאלה נסו את מחוון הכבידה: שני השיאים זזים יחד והיחס ביניהם נשאר 4.',
          },
        },
      ],
    },
  ],
};
