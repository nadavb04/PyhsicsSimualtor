import { useMemo } from 'react';
import { Link } from 'react-router';
import { TOPICS } from '@/content';
import { overallScore } from '@/game/scoring';
import { useLocaleStore } from '@/state/localeStore';
import { useProgressStore } from '@/state/progressStore';
import { useI18n } from '../i18n/useI18n';

export function HeaderBar() {
  const results = useProgressStore((s) => s.results);
  const streak = useProgressStore((s) => s.streak);
  const total = useMemo(() => overallScore(TOPICS, results), [results]);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const { locale, t } = useI18n();

  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/95 px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
      <Link to="/" className="flex min-h-11 min-w-0 items-center gap-2 font-bold tracking-tight">
        <span aria-hidden className="text-xl">
          🪐
        </span>
        <span className="truncate text-base">{t.appName}</span>
      </Link>
      <div className="flex shrink-0 items-center gap-2 text-sm font-semibold tabular-nums">
        <span
          dir="ltr"
          className="rounded-full bg-slate-800 px-2.5 py-1"
          aria-label={t.scoreAria(total.earned, total.max)}
        >
          <span aria-hidden>⭐ </span>
          <span data-testid="total-score">{total.earned}</span>
          <span className="text-slate-500"> / {total.max}</span>
        </span>
        <span
          dir="ltr"
          className="rounded-full bg-slate-800 px-2.5 py-1"
          aria-label={t.streakAria(streak)}
        >
          <span aria-hidden>🔥 </span>
          {streak}
        </span>
        <button
          type="button"
          onClick={() => setLocale(locale === 'he' ? 'en' : 'he')}
          aria-label={t.switchLanguageAria}
          lang={locale === 'he' ? 'en' : 'he'}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-sm font-bold text-sky-300 active:bg-slate-800"
        >
          {t.switchLanguage}
        </button>
      </div>
    </header>
  );
}
