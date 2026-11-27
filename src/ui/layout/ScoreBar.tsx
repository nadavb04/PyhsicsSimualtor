import type { ScoreSummary } from '@/game/scoring';

export function ScoreBar({ score, label }: { score: ScoreSummary; label: string }) {
  const pct = score.max ? Math.round((score.earned / score.max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 tabular-nums">
        <span>
          {score.solved}/{score.total} solved
        </span>
        <span>
          {score.earned} / {score.max} pts
        </span>
      </div>
      <div
        className="mt-1 h-2 overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={score.max}
        aria-valuenow={score.earned}
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
