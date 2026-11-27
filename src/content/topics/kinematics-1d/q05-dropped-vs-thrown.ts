import type { PhysicsQuestion } from '../../schema';

/** Q5: Constant acceleration for both balls. Verified by free-fall-pair.test.ts. */
export const droppedVsThrown: PhysicsQuestion = {
  id: 'dropped-vs-thrown',
  title: { en: 'Dropped vs. Thrown Downward', he: 'מופל או נזרק כלפי מטה' },
  scenarioDescription: {
    en: 'From the top of a tower, with no air resistance, you let go of ball A from rest and, at the same instant, throw ball B straight down.',
    he: 'מראש מגדל, בלי התנגדות אוויר, משחררים את כדור A ממנוחה, ובאותו רגע זורקים את כדור B ישר למטה.',
  },
  simulationTemplate: 'free-fall-pair',
  parameters: [
    {
      id: 'launchSpeedB',
      label: { en: 'Ball B downward throw speed', he: 'מהירות הזריקה של כדור B למטה' },
      unit: 'm/s',
      min: 0,
      max: 15,
      step: 1,
      defaultValue: 8,
      qualitativeLabels: [
        { en: 'just let go', he: 'רק משחררים' },
        { en: 'hard throw', he: 'זריקה חזקה' },
      ],
    },
    {
      id: 'towerHeight',
      label: { en: 'Tower height', he: 'גובה המגדל' },
      unit: 'm',
      min: 20,
      max: 60,
      step: 5,
      defaultValue: 45,
    },
  ],
  visualOverlays: { showVelocityVector: true, showAccelerationVector: true, showStrobeDots: true },
  subQuestions: [
    {
      id: 'a',
      prompt: {
        en: 'Once both balls have left your hands, which one has the greater downward acceleration?',
        he: 'אחרי ששני הכדורים עזבו את הידיים, לאיזה מהם יש תאוצה גדולה יותר כלפי מטה?',
      },
      visualFocusCue: 'compare_accelerations',
      options: [
        {
          id: 'same',
          text: { en: 'Neither: both accelerate at g', he: 'לאף אחד: שניהם מאיצים ב-g' },
          isCorrect: true,
          feedback: {
            en: 'Right. Acceleration is how quickly velocity changes, and gravity changes both balls’ velocities at the same rate: 9.8 m/s every second. The orange arrows are identical. B is faster, but it isn’t accelerating more.',
            he: 'נכון. תאוצה היא קצב השינוי של המהירות, והכבידה משנה את המהירות של שני הכדורים באותו קצב: 9.8 m/s בכל שנייה. החצים הכתומים זהים. B מהיר יותר, אבל התאוצה שלו לא גדולה יותר.',
          },
        },
        {
          id: 'b',
          text: { en: 'Ball B, because it was thrown', he: 'כדור B, כי הוא נזרק' },
          isCorrect: false,
          feedback: {
            en: 'The throw gave B extra speed, not extra acceleration. Once it leaves your hand only gravity acts on it. Compare the orange arrows and their “a” labels: they’re identical.',
            he: 'הזריקה נתנה ל-B מהירות נוספת, לא תאוצה נוספת. מרגע שהוא עוזב את היד פועלת עליו רק הכבידה. השוו את החצים הכתומים ואת תוויות ה-“a” שלהם: הם זהים.',
          },
        },
        {
          id: 'a',
          text: {
            en: 'Ball A, because it starts from rest and has more speeding up to do',
            he: 'כדור A, כי הוא מתחיל ממנוחה וצריך להאיץ יותר',
          },
          isCorrect: false,
          feedback: {
            en: 'Gravity doesn’t care how fast a ball is already going. Both orange arrows stay the same length the whole way down.',
            he: 'לכבידה לא משנה כמה מהר הכדור כבר נע. שני החצים הכתומים שומרים על אותו אורך לאורך כל הנפילה.',
          },
        },
      ],
    },
    {
      id: 'b',
      prompt: {
        en: 'As they fall, does the vertical gap between the two balls stay the same, shrink, or grow?',
        he: 'בזמן הנפילה, האם הפער האנכי בין שני הכדורים נשאר קבוע, קטן או גדל?',
      },
      visualFocusCue: 'show_gap',
      options: [
        {
          id: 'grows-steadily',
          text: { en: 'It grows at a steady rate', he: 'הוא גדל בקצב קבוע' },
          isCorrect: true,
          feedback: {
            en: 'Yes. Both balls gain speed at the same rate, so B stays faster by exactly its throw speed at every moment. A constant speed difference makes the gap grow by the same amount every second. Watch the purple gap label climb steadily.',
            he: 'כן. שני הכדורים צוברים מהירות באותו קצב, ולכן B נשאר מהיר יותר בדיוק במהירות הזריקה שלו בכל רגע. הפרש מהירויות קבוע גורם לפער לגדול באותה כמות בכל שנייה. ראו איך תווית הפער הסגולה עולה בהתמדה.',
          },
        },
        {
          id: 'same',
          text: {
            en: 'It stays the same, since they have the same acceleration',
            he: 'הוא נשאר קבוע, כי יש להם אותה תאוצה',
          },
          isCorrect: false,
          feedback: {
            en: 'The same acceleration keeps the speed difference constant, not the gap. B is always faster than A, so it keeps pulling further ahead. Watch the purple gap label grow.',
            he: 'תאוצה זהה שומרת על הפרש מהירויות קבוע, לא על פער קבוע. B תמיד מהיר מ-A, ולכן הוא ממשיך להתרחק. ראו איך תווית הפער הסגולה גדלה.',
          },
        },
        {
          id: 'shrinks',
          text: {
            en: 'It shrinks: A catches up as it speeds up',
            he: 'הוא קטן: A משיג את B ככל שהוא מאיץ',
          },
          isCorrect: false,
          feedback: {
            en: 'A does speed up, but B speeds up by exactly the same amount. A never closes the speed difference, so the gap never shrinks. Compare the two speeds in the corner: B is always faster.',
            he: 'A אכן מאיץ, אבל B מאיץ בדיוק באותה מידה. A אף פעם לא סוגר את הפרש המהירויות, ולכן הפער אף פעם לא קטן. השוו את שתי המהירויות בפינה: B תמיד מהיר יותר.',
          },
        },
        {
          id: 'grows-faster',
          text: { en: 'It grows faster and faster', he: 'הוא גדל מהר יותר ויותר' },
          isCorrect: false,
          feedback: {
            en: 'The gap would grow faster and faster only if B kept gaining extra speed on A. Both gain speed at the same rate, so B’s speed lead is fixed and the gap grows by the same amount every second.',
            he: 'הפער היה גדל מהר יותר ויותר רק אילו B היה ממשיך לצבור יתרון מהירות על A. שניהם צוברים מהירות באותו קצב, ולכן יתרון המהירות של B קבוע והפער גדל באותה כמות בכל שנייה.',
          },
        },
      ],
    },
  ],
};
