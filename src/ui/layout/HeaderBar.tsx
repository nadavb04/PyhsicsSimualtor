import { useMemo } from 'react';
import { Link } from 'react-router';
import { TOPICS } from '@/content';
import { overallScore } from '@/game/scoring';
import { useProgressStore } from '@/state/progressStore';

export function HeaderBar() {
  const results = useProgressStore((s) => s.results);
  const streak = useProgressStore((s) => s.streak);
  const total = useMemo(() => overallScore(TOPICS, results), [results]);

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/95 px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
      <Link to="/" className="flex min-h-11 items-center gap-2 font-bold tracking-tight">
        <span aria-hidden className="text-xl">
          🪐
        </span>
        <span className="text-base">Physics Intuition</span>
      </Link>
      <div className="flex items-center gap-2 text-sm font-semibold tabular-nums">
        <span
          className="rounded-full bg-slate-800 px-2.5 py-1"
          aria-label={`Score ${total.earned} of ${total.max}`}
        >
          <span aria-hidden>⭐ </span>
          <span data-testid="total-score">{total.earned}</span>
          <span className="text-slate-500"> / {total.max}</span>
        </span>
        <span className="rounded-full bg-slate-800 px-2.5 py-1" aria-label={`Streak ${streak}`}>
          <span aria-hidden>🔥 </span>
          {streak}
        </span>
      </div>
    </header>
  );
}
