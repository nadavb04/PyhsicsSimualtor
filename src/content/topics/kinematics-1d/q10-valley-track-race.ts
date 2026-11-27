import type { PhysicsQuestion } from '../../schema';

/** Q10: Same distance, different paths. Verified by valley-track-race.test.ts. */
export const valleyTrackRace: PhysicsQuestion = {
  id: 'valley-track-race',
  title: {
    en: 'Two Paths, Same Distance: The Valley Race',
    he: 'שני מסלולים, אותו מרחק: מרוץ העמק',
  },
  scenarioDescription: {
    en: 'Two marbles roll at the same speed onto two tracks that cover the same horizontal distance. Track A is flat. Track B dips into a smooth valley and climbs back to its original height. Friction is negligible.',
    he: 'שתי גולות מתגלגלות באותה מהירות אל שני מסלולים שעוברים אותו מרחק אופקי. מסלול A שטוח. מסלול B יורד לעמק חלק ועולה בחזרה לגובה ההתחלתי. החיכוך זניח.',
  },
  simulationTemplate: 'valley-track-race',
  parameters: [
    {
      id: 'initialSpeed',
      label: { en: 'Starting roll speed', he: 'מהירות גלגול התחלתית' },
      unit: 'm/s',
      min: 2,
      max: 6,
      step: 0.5,
      defaultValue: 4,
    },
    {
      id: 'valleyDepth',
      label: { en: 'Valley depth', he: 'עומק העמק' },
      unit: 'm',
      min: 0,
      max: 3,
      step: 0.5,
      defaultValue: 2,
      qualitativeLabels: [
        { en: 'flat', he: 'שטוח' },
        { en: 'deep', he: 'עמוק' },
      ],
    },
  ],
  visualOverlays: { showVelocityVector: true, showStrobeDots: true },
  subQuestions: [
    {
      id: 'a',
      prompt: {
        en: 'When marble B climbs out of the valley, how does its speed compare with marble A’s?',
        he: 'כשגולה B יוצאת מהעמק, איך המהירות שלה משתווה למהירות של גולה A?',
      },
      visualFocusCue: 'compare_exit_speeds',
      options: [
        {
          id: 'same',
          text: { en: 'The same as A’s', he: 'זהה לזו של A' },
          isCorrect: true,
          feedback: {
            en: 'Yes. Going down, B trades height for speed; climbing back up, it trades exactly that speed back for height. Back at the same height with no friction, it has the speed it started with. Check the purple “valley exit” label.',
            he: 'כן. בירידה B ממירה גובה במהירות; בעלייה בחזרה היא ממירה בדיוק את אותה מהירות בחזרה לגובה. כשהיא שוב באותו גובה ובלי חיכוך, יש לה בדיוק המהירות שהתחילה איתה. בדקו את התווית הסגולה “valley exit”.',
          },
        },
        {
          id: 'faster',
          text: {
            en: 'Faster: it gained speed going downhill',
            he: 'מהירה יותר: היא צברה מהירות בירידה',
          },
          isCorrect: false,
          feedback: {
            en: 'It did gain speed on the way down, but it lost exactly the same amount climbing back up. Read the “valley exit” label: both speeds match.',
            he: 'היא אכן צברה מהירות בירידה, אבל איבדה בדיוק את אותה כמות בעלייה בחזרה. קראו את התווית “valley exit”: שתי המהירויות שוות.',
          },
        },
        {
          id: 'slower',
          text: {
            en: 'Slower: the climb out used up its energy',
            he: 'איטית יותר: העלייה החוצה גזלה את האנרגיה שלה',
          },
          isCorrect: false,
          feedback: {
            en: 'The climb only takes back what the descent gave. With no friction nothing is lost overall, and the “valley exit” label shows equal speeds.',
            he: 'העלייה לוקחת בחזרה רק את מה שהירידה נתנה. בלי חיכוך שום דבר לא הולך לאיבוד בסך הכול, והתווית “valley exit” מראה מהירויות שוות.',
          },
        },
      ],
    },
    {
      id: 'b',
      prompt: {
        en: 'Which marble reaches the finish line first?',
        he: 'איזו גולה מגיעה ראשונה לקו הסיום?',
      },
      visualFocusCue: 'compare_finish_times',
      options: [
        {
          id: 'b-first',
          text: {
            en: 'Marble B, because it is faster throughout the valley',
            he: 'גולה B, כי היא מהירה יותר לאורך כל העמק',
          },
          isCorrect: true,
          feedback: {
            en: 'Exactly. Both marbles move at the same speed on the flat parts, but inside the valley B is always faster than A. That extra speed more than makes up for its slightly longer path. Compare the finish times, then make the valley deeper: B wins by more.',
            he: 'בדיוק. בקטעים השטוחים שתי הגולות נעות באותה מהירות, אבל בתוך העמק B תמיד מהירה יותר מ-A. המהירות העודפת הזו יותר ממפצה על המסלול הארוך מעט שלה. השוו את זמני הסיום, ואז העמיקו את העמק: B מנצחת בפער גדול יותר.',
          },
        },
        {
          id: 'a-first',
          text: {
            en: 'Marble A, because its path is shorter',
            he: 'גולה A, כי המסלול שלה קצר יותר',
          },
          isCorrect: false,
          feedback: {
            en: 'B’s path is a little longer, but B moves faster than A all through the valley. Watch B’s strobe dots spread out in the dip, then compare the finish times.',
            he: 'המסלול של B קצת ארוך יותר, אבל B נעה מהר יותר מ-A לאורך כל העמק. ראו איך נקודות הסטרובוסקופ של B מתרווחות בשקע, ואז השוו את זמני הסיום.',
          },
        },
        {
          id: 'tie',
          text: {
            en: 'A tie, because they end with the same speed',
            he: 'תיקו, כי הן מסיימות באותה מהירות',
          },
          isCorrect: false,
          feedback: {
            en: 'The same final speed doesn’t mean the same time. B spent the whole valley moving faster, so it arrives earlier. Compare the finish times by the finish line.',
            he: 'אותה מהירות סופית לא אומרת אותו זמן. B נעה מהר יותר לאורך כל העמק, ולכן היא מגיעה מוקדם יותר. השוו את זמני הסיום ליד קו הסיום.',
          },
        },
      ],
    },
  ],
};
