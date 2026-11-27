import type { LocalizedText } from './locale';

/** Randomised Physics-Hero praise shown on a correct prediction. */
export const PRAISE_LINES: readonly LocalizedText[] = [
  { en: 'Sharp intuition like Galileo!', he: 'אינטואיציה חדה כמו של גלילאו!' },
  { en: "You're thinking like Einstein!", he: 'חשיבה ממש כמו של איינשטיין!' },
  { en: 'Feynman-level curiosity!', he: 'סקרנות ברמה של פיינמן!' },
  { en: 'Newton would approve!', he: 'ניוטון היה מאשר!' },
  { en: 'Marie Curie-grade precision!', he: 'דיוק ברמה של מארי קירי!' },
  {
    en: 'Emmy Noether would see the symmetry in that!',
    he: 'אמי נתר הייתה רואה בזה את הסימטריה!',
  },
  { en: 'Faraday-style experimental instinct!', he: 'אינסטינקט ניסויי בסגנון פאראדיי!' },
  { en: 'Kepler would have predicted that too!', he: 'גם קפלר היה חוזה את זה!' },
  { en: 'Chien-Shiung Wu-level rigor!', he: 'קפדנות ברמה של צ׳יין-שיונג וו!' },
  { en: 'Archimedes would shout "Eureka!"', he: 'ארכימדס היה צועק "אאוריקה!"' },
  { en: 'Maxwell would call that elegant!', he: 'מקסוול היה קורא לזה אלגנטי!' },
  { en: 'Lise Meitner-sharp reasoning!', he: 'חשיבה חדה כמו של ליזה מייטנר!' },
];

/** `random` is injectable for deterministic tests. */
export function pickPraise(random: () => number = Math.random): LocalizedText {
  const i = Math.floor(random() * PRAISE_LINES.length) % PRAISE_LINES.length;
  return PRAISE_LINES[i] ?? PRAISE_LINES[0]!;
}
