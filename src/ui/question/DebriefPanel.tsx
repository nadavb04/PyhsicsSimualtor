import type { SubQuestion } from '@/content/schema';
import type { FlowOutcome } from '@/game/questionFlow';

interface Props {
  sub: SubQuestion;
  outcome: FlowOutcome;
  /** Already solved earlier: replay is practice, no points change. */
  practice: boolean;
  nextLabel: string;
  onRetry(): void;
  onNext(): void;
}

export function DebriefPanel({ sub, outcome, practice, nextLabel, onRetry, onNext }: Props) {
  const chosen = sub.options.find((o) => o.id === outcome.optionId);
  const correctOption = sub.options.find((o) => o.isCorrect);

  if (outcome.correct) {
    return (
      <section
        role="status"
        className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-emerald-300">{outcome.praise ?? 'Correct!'}</h2>
          {!practice && outcome.points > 0 && (
            <span className="shrink-0 rounded-full bg-emerald-500/20 px-2.5 py-1 text-sm font-bold text-emerald-200">
              +{outcome.points} pts
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">{correctOption?.feedback}</p>
        <p className="mt-2 text-xs text-slate-400">
          Free play unlocked: change the sliders and replay.
        </p>
        <button
          type="button"
          onClick={onNext}
          className="mt-3 min-h-12 w-full rounded-xl bg-emerald-600 text-base font-bold text-white active:scale-[0.98]"
        >
          {nextLabel}
        </button>
      </section>
    );
  }

  return (
    <section role="status" className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
      <h2 className="text-lg font-bold text-amber-300">Not quite. Look again!</h2>
      <p className="mt-1 text-xs text-slate-400">You predicted: “{chosen?.text}”</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-200">{chosen?.feedback}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 min-h-12 w-full rounded-xl bg-amber-500 text-base font-bold text-slate-950 active:scale-[0.98]"
      >
        Tweak & retry
      </button>
    </section>
  );
}
