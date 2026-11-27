import { useCallback } from 'react';
import { tr as resolve, type LocalizedText } from '@/content/locale';
import { useLocaleStore } from '@/state/localeStore';
import { UI_STRINGS } from './strings';

/** Current locale, its UI strings, and a resolver for curriculum `LocalizedText`. */
export function useI18n() {
  const locale = useLocaleStore((s) => s.locale);
  const tr = useCallback((text: LocalizedText) => resolve(text, locale), [locale]);
  return { locale, t: UI_STRINGS[locale], tr };
}
