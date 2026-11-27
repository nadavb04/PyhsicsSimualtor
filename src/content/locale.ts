/** Supported learner-facing languages. Canvas/figure labels are intentionally English-only. */
export type Locale = 'he' | 'en';

export const LOCALES: readonly Locale[] = ['he', 'en'];
export const DEFAULT_LOCALE: Locale = 'he';

/** A learner-facing string in every supported language. */
export type LocalizedText = Record<Locale, string>;

/** Resolve a localized string, falling back to English if a translation is blank. */
export function tr(text: LocalizedText, locale: Locale): string {
  return text[locale] || text.en;
}

export function dirOf(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'he' ? 'rtl' : 'ltr';
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
