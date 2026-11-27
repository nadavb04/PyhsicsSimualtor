import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LOCALE, dirOf, isLocale, type Locale } from '@/content/locale';

/** Kept separate from progress so language changes never touch the progress schema. */
export const LOCALE_STORAGE_KEY = 'physics-intuition-locale';

interface LocaleState {
  locale: Locale;
  setLocale(locale: Locale): void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: LOCALE_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ locale }) => ({ locale }),
      merge: (persisted, current) => {
        const locale = (persisted as Partial<LocaleState> | undefined)?.locale;
        return { ...current, locale: isLocale(locale) ? locale : current.locale };
      },
    },
  ),
);

/** Sync <html lang/dir> so the whole page lays out right-to-left in Hebrew. */
export function applyDocumentLocale(locale: Locale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  document.documentElement.dir = dirOf(locale);
}

applyDocumentLocale(useLocaleStore.getState().locale);
useLocaleStore.subscribe((s, prev) => {
  if (s.locale !== prev.locale) applyDocumentLocale(s.locale);
});
