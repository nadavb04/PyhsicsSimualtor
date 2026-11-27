import type { Locale } from '@/content/locale';

/**
 * UI chrome text. Curriculum text lives in src/content as `LocalizedText`;
 * canvas/figure labels (and the vector legend) intentionally stay English.
 */
export interface UiStrings {
  appName: string;
  /** Label on the language switch: the language you'd switch *to*. */
  switchLanguage: string;
  switchLanguageAria: string;
  scoreAria(earned: number, max: number): string;
  streakAria(streak: number): string;

  homeTitle: string;
  homeSubtitle: string;
  topicProgressAria(topicTitle: string): string;
  resetProgress: string;
  resetConfirm: string;
  solvedCount(solved: number, total: number): string;
  points(earned: number, max: number): string;

  backToTopics: string;
  backToTopic: string;
  notFoundTitle: string;
  notFoundBody: string;

  questionParts: string;
  partLetter(index: number): string;
  scenario: string;
  nextPart(letter: string): string;
  finishQuestion: string;
  simulationAria(title: string): string;
  lockedHint: string;
  experimentSettings: string;
  locked: string;
  toggleOff: string;
  toggleOn: string;

  predict: string;
  watchSimulation: string;
  skipToResult: string;
  lockIn: string;

  correct: string;
  pointsEarned(points: number): string;
  freePlayUnlocked: string;
  notQuite: string;
  youPredicted(text: string): string;
  retry: string;

  playback: string;
  play: string;
  pause: string;
  replay: string;
  step: string;
  reset: string;
}

/** Isolate a left-to-right run (e.g. "+10") inside Hebrew text so its sign stays put. */
const ltr = (s: string) => `⁦${s}⁩`;

const HEBREW_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת';

const en: UiStrings = {
  appName: 'Physics Intuition',
  switchLanguage: 'עב',
  switchLanguageAria: 'החלפה לעברית',
  scoreAria: (e, m) => `Score ${e} of ${m}`,
  streakAria: (s) => `Streak ${s}`,

  homeTitle: 'Build your physics intuition',
  homeSubtitle: 'Predict first, then watch the simulation to check yourself.',
  topicProgressAria: (t) => `${t} progress`,
  resetProgress: 'Reset progress',
  resetConfirm: 'Reset all progress, points and streaks?',
  solvedCount: (s, t) => `${s}/${t} solved`,
  points: (e, m) => `${e} / ${m} pts`,

  backToTopics: '← All topics',
  backToTopic: '← Topic',
  notFoundTitle: 'Nothing here',
  notFoundBody: 'This page doesn’t exist (yet).',

  questionParts: 'Question parts',
  partLetter: (i) => String.fromCharCode(97 + i),
  scenario: 'Scenario',
  nextPart: (l) => `Next: part (${l}) →`,
  finishQuestion: 'Back to topic',
  simulationAria: (t) => `Simulation: ${t}`,
  lockedHint: 'Lock in a prediction to run the experiment.',
  experimentSettings: 'Experiment settings',
  locked: 'locked',
  toggleOff: 'Off',
  toggleOn: 'On',

  predict: 'Predict',
  watchSimulation: 'Watch the simulation…',
  skipToResult: 'Skip to result',
  lockIn: 'Lock in & test prediction',

  correct: 'Correct!',
  pointsEarned: (p) => `+${p} pts`,
  freePlayUnlocked: 'Free play unlocked: change the sliders and replay.',
  notQuite: 'Not quite. Look again!',
  youPredicted: (t) => `You predicted: “${t}”`,
  retry: 'Tweak & retry',

  playback: 'Playback',
  play: 'Play',
  pause: 'Pause',
  replay: 'Replay',
  step: 'Step',
  reset: 'Reset',
};

const he: UiStrings = {
  appName: 'חוש פיזיקלי',
  switchLanguage: 'EN',
  switchLanguageAria: 'Switch to English',
  scoreAria: (e, m) => `ניקוד ${e} מתוך ${m}`,
  streakAria: (s) => `רצף ${s}`,

  homeTitle: 'פתחו אינטואיציה פיזיקלית',
  homeSubtitle: 'קודם מנבאים, ואז צופים בסימולציה כדי לבדוק את עצמכם.',
  topicProgressAria: (t) => `התקדמות ב${t}`,
  resetProgress: 'איפוס התקדמות',
  resetConfirm: 'לאפס את כל ההתקדמות, הנקודות והרצפים?',
  solvedCount: (s, t) => `${s}/${t} נפתרו`,
  points: (e, m) => `${e} / ${m} נק׳`,

  backToTopics: '→ כל הנושאים',
  backToTopic: '→ לנושא',
  notFoundTitle: 'אין כאן כלום',
  notFoundBody: 'הדף הזה לא קיים (עדיין).',

  questionParts: 'חלקי השאלה',
  partLetter: (i) => HEBREW_LETTERS[i] ?? String(i + 1),
  scenario: 'התרחיש',
  nextPart: (l) => `הבא: סעיף (${l}) ←`,
  finishQuestion: 'חזרה לנושא',
  simulationAria: (t) => `סימולציה: ${t}`,
  lockedHint: 'נעלו ניבוי כדי להריץ את הניסוי.',
  experimentSettings: 'הגדרות הניסוי',
  locked: 'נעול',
  toggleOff: 'כבוי',
  toggleOn: 'פעיל',

  predict: 'ניבוי',
  watchSimulation: 'צפו בסימולציה…',
  skipToResult: 'דילוג לתוצאה',
  lockIn: 'נעילה ובדיקת הניבוי',

  correct: 'נכון!',
  pointsEarned: (p) => ltr(`+${p}`) + ' נק׳',
  freePlayUnlocked: 'משחק חופשי נפתח: שנו את המחוונים והריצו שוב.',
  notQuite: 'לא בדיוק. הסתכלו שוב!',
  youPredicted: (t) => `הניבוי שלך: ״${t}״`,
  retry: 'שינוי וניסיון חוזר',

  playback: 'בקרת הפעלה',
  play: 'הפעלה',
  pause: 'השהיה',
  replay: 'שוב',
  step: 'צעד',
  reset: 'איפוס',
};

export const UI_STRINGS: Record<Locale, UiStrings> = { en, he };
