import type { PhysicsQuestion } from '../../schema';

/** Q3: Sign confusion. Verified by cart-1d-vectors.test.ts. */
export const speedingUpSlowingDown: PhysicsQuestion = {
  id: 'speeding-up-slowing-down',
  title: { en: 'Speeding Up vs. Slowing Down', he: 'מאיצים או מאטים?' },
  scenarioDescription: {
    en: 'A cart rolls along a straight track. Right (→) is the positive direction, so a negative velocity means moving left and a negative acceleration points left. Is a negative acceleration the same thing as slowing down?',
    he: 'עגלה נעה לאורך מסילה ישרה. ימינה (→) הוא הכיוון החיובי, כך שמהירות שלילית פירושה תנועה שמאלה, ותאוצה שלילית מכוונת שמאלה. האם תאוצה שלילית היא אותו דבר כמו האטה?',
  },
  simulationTemplate: 'cart-1d-vectors',
  parameters: [
    {
      id: 'initialVelocity',
      label: { en: 'Initial velocity', he: 'מהירות התחלתית' },
      unit: 'm/s',
      min: -5,
      max: 5,
      step: 1,
      defaultValue: 3,
      lockedDuringPrediction: true,
      qualitativeLabels: [
        { en: '← moving left', he: '← נעה שמאלה' },
        { en: 'moving right →', he: 'נעה ימינה →' },
      ],
    },
    {
      id: 'acceleration',
      label: { en: 'Acceleration', he: 'תאוצה' },
      unit: 'm/s²',
      min: -2,
      max: 2,
      step: 0.5,
      defaultValue: -1,
      lockedDuringPrediction: true,
      qualitativeLabels: [
        { en: '← points left', he: '← מכוונת שמאלה' },
        { en: 'points right →', he: 'מכוונת ימינה →' },
      ],
    },
  ],
  visualOverlays: { showVelocityVector: true, showAccelerationVector: true, showStrobeDots: true },
  subQuestions: [
    {
      id: 'a',
      prompt: {
        en: 'In this run the acceleration is negative (−1 m/s²). Must the cart be slowing down?',
        he: 'בהרצה הזו התאוצה שלילית (‎−1 m/s²‎). האם העגלה חייבת להאט?',
      },
      visualFocusCue: 'show_speed_trend',
      presetOverrides: { initialVelocity: -2, acceleration: -1 },
      options: [
        {
          id: 'no',
          text: {
            en: 'No. It depends on which way the cart is moving',
            he: 'לא. זה תלוי בכיוון שבו העגלה נעה',
          },
          isCorrect: true,
          feedback: {
            en: 'Right. “Negative” only says the acceleration points left. This cart is also moving left, so the green and orange arrows point the same way and it speeds up. Speeding up or slowing down depends on whether v and a point the same way, not on the sign of a.',
            he: 'נכון. “שלילית” אומר רק שהתאוצה מכוונת שמאלה. גם העגלה הזו נעה שמאלה, ולכן החץ הירוק והחץ הכתום מצביעים לאותו כיוון והיא מאיצה. האצה או האטה תלויות בשאלה אם v ו-a מצביעים לאותו כיוון, ולא בסימן של a.',
          },
        },
        {
          id: 'yes',
          text: {
            en: 'Yes. Negative acceleration always means slowing down',
            he: 'כן. תאוצה שלילית תמיד פירושה האטה',
          },
          isCorrect: false,
          feedback: {
            en: 'Watch the speed readout: it climbs. Here both arrows point left, and when velocity and acceleration point the same way the cart speeds up, whatever the sign.',
            he: 'עקבו אחרי קריאת גודל המהירות (speed): היא עולה. כאן שני החצים מצביעים שמאלה, וכשהמהירות והתאוצה מצביעות לאותו כיוון העגלה מאיצה, לא משנה מה הסימן.',
          },
        },
        {
          id: 'size',
          text: {
            en: 'It depends on how big the acceleration is',
            he: 'זה תלוי בגודל התאוצה',
          },
          isCorrect: false,
          feedback: {
            en: 'The size only changes how quickly the speed changes. Whether the speed rises or falls depends on directions: here the green and orange arrows both point left, so the speed grows.',
            he: 'הגודל משנה רק את קצב השינוי במהירות. אם המהירות עולה או יורדת תלוי בכיוונים: כאן החץ הירוק והחץ הכתום מצביעים שניהם שמאלה, ולכן גודל המהירות גדל.',
          },
        },
      ],
    },
    {
      id: 'b',
      prompt: {
        en: 'Now the cart moves right while its acceleration points left. It slows down and stops for an instant. What happens next?',
        he: 'עכשיו העגלה נעה ימינה בזמן שהתאוצה שלה מכוונת שמאלה. היא מאטה ונעצרת לרגע. מה קורה אחר כך?',
      },
      visualFocusCue: 'highlight_turnaround',
      presetOverrides: { initialVelocity: 4, acceleration: -2 },
      options: [
        {
          id: 'left-faster',
          text: {
            en: 'It starts moving left, faster and faster',
            he: 'היא מתחילה לנוע שמאלה, מהר יותר ויותר',
          },
          isCorrect: true,
          feedback: {
            en: 'Yes. The orange arrow never changed: it pointed left the whole time. Before the yellow ring it was slowing a rightward cart; after it, the same acceleration speeds up a leftward one. The strobe dots crowd together at the turnaround, then spread out again on the way back.',
            he: 'כן. החץ הכתום לא השתנה אף פעם: הוא הצביע שמאלה כל הזמן. לפני הטבעת הצהובה הוא האט עגלה שנעה ימינה, ואחריה אותה תאוצה מאיצה עגלה שנעה שמאלה. נקודות הסטרובוסקופ מצטופפות בנקודת המפנה, ואז מתרווחות שוב בדרך חזרה.',
          },
        },
        {
          id: 'stays',
          text: { en: 'It stays stopped', he: 'היא נשארת עומדת' },
          isCorrect: false,
          feedback: {
            en: 'Stopping for an instant doesn’t remove the acceleration. The orange arrow is still there at the yellow ring, so the velocity keeps changing and becomes leftward.',
            he: 'עצירה רגעית לא מבטלת את התאוצה. החץ הכתום עדיין שם בטבעת הצהובה, ולכן המהירות ממשיכה להשתנות ונעשית שמאלית.',
          },
        },
        {
          id: 'right-again',
          text: { en: 'It starts moving right again', he: 'היא מתחילה שוב לנוע ימינה' },
          isCorrect: false,
          feedback: {
            en: 'Nothing pushes it to the right. The orange arrow points left, so after the stop the velocity turns negative (leftward): watch the v readout drop below zero.',
            he: 'שום דבר לא דוחף אותה ימינה. החץ הכתום מצביע שמאלה, ולכן אחרי העצירה המהירות נעשית שלילית (שמאלה): ראו איך קריאת v יורדת מתחת לאפס.',
          },
        },
        {
          id: 'left-slower',
          text: {
            en: 'It moves left, slowing down',
            he: 'היא נעה שמאלה ומאטה',
          },
          isCorrect: false,
          feedback: {
            en: 'After the turnaround v and a both point left, the same way, so the cart speeds up. Watch the gaps between the strobe dots grow on the way back.',
            he: 'אחרי נקודת המפנה v ו-a מצביעים שניהם שמאלה, לאותו כיוון, ולכן העגלה מאיצה. ראו איך המרווחים בין נקודות הסטרובוסקופ גדלים בדרך חזרה.',
          },
        },
      ],
    },
  ],
};
