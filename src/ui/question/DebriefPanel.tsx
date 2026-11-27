import type { SubQuestion } from '@/content/schema';
import type { FlowOutcome } from '@/game/questionFlow';
import { useI18n } from '../i18n/useI18n';

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
  const { t, tr } = useI18n();
  const chosen = sub.options.find((o) => o.id === outcome.optionId);
  const correctOption = sub.options.find((o) => o.isCorrect);

  if (outcome.correct) {
    return (
      <section
        role="status"
        className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-emerald-300">
            {outcome.praise ? tr(outcome.praise) : t.correct}
          </h2>
          {!practice && outcome.points > 0 && (
            <span className="shrink-0 rounded-full bg-emerald-500/20 px-2.5 py-1 text-sm font-bold text-emerald-200">
              {t.pointsEarned(outcome.points)}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          {correctOption && tr(correctOption.feedback)}
        </p>
        <p className="mt-2 text-xs text-slate-400">{t.freePlayUnlocked}</p>
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
      <h2 className="text-lg font-bold text-amber-300">{t.notQuite}</h2>
      {chosen && <p className="mt-1 text-xs text-slate-400">{t.youPredicted(tr(chosen.text))}</p>}
      <p className="mt-2 text-sm leading-relaxed text-slate-200">{chosen && tr(chosen.feedback)}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 min-h-12 w-full rounded-xl bg-amber-500 text-base font-bold text-slate-950 active:scale-[0.98]"
      >
        {t.retry}
      </button>
    </section>
  );
}
