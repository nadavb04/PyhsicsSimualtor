import type { ScoreSummary } from '@/game/scoring';
import { useI18n } from '../i18n/useI18n';

export function ScoreBar({ score, label }: { score: ScoreSummary; label: string }) {
  const { t } = useI18n();
  const pct = score.max ? Math.round((score.earned / score.max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 tabular-nums">
        <span>{t.solvedCount(score.solved, score.total)}</span>
        <span>{t.points(score.earned, score.max)}</span>
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
