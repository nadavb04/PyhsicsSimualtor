/** Randomised Physics-Hero praise shown on a correct prediction. */
export const PRAISE_LINES: readonly string[] = [
  'Sharp intuition like Galileo!',
  "You're thinking like Einstein!",
  'Feynman-level curiosity!',
  'Newton would approve!',
  'Marie Curie-grade precision!',
  'Emmy Noether would see the symmetry in that!',
  'Faraday-style experimental instinct!',
  'Kepler would have predicted that too!',
  'Chien-Shiung Wu-level rigor!',
  'Archimedes would shout "Eureka!"',
  'Maxwell would call that elegant!',
  'Lise Meitner-sharp reasoning!',
];

/** `random` is injectable for deterministic tests. */
export function pickPraise(random: () => number = Math.random): string {
  const i = Math.floor(random() * PRAISE_LINES.length) % PRAISE_LINES.length;
  return PRAISE_LINES[i] ?? PRAISE_LINES[0]!;
}
