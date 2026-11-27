import { beforeEach, describe, expect, it } from 'vitest';
import { LOCALE_STORAGE_KEY, useLocaleStore } from './localeStore';

describe('localeStore', () => {
  beforeEach(() => {
    useLocaleStore.setState(useLocaleStore.getInitialState());
  });

  it('defaults to Hebrew', () => {
    expect(useLocaleStore.getState().locale).toBe('he');
  });

  it('persists the chosen locale and updates <html lang/dir>', () => {
    useLocaleStore.getState().setLocale('en');
    expect(JSON.parse(localStorage.getItem(LOCALE_STORAGE_KEY) ?? '{}').state.locale).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');

    useLocaleStore.getState().setLocale('he');
    expect(document.documentElement.lang).toBe('he');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('ignores an unknown persisted locale', async () => {
    localStorage.setItem(
      LOCALE_STORAGE_KEY,
      JSON.stringify({ state: { locale: 'fr' }, version: 1 }),
    );
    await useLocaleStore.persist.rehydrate();
    expect(useLocaleStore.getState().locale).toBe('he');
  });
});
