import type { SubQuestion } from '@/content/schema';

interface Props {
  sub: SubQuestion;
  selectedOptionId: string | null;
  /** True while the simulation is running the locked-in prediction. */
  observing: boolean;
  onSelect(optionId: string): void;
  onSubmit(): void;
  onSkip(): void;
}

export function PredictionCard({
  sub,
  selectedOptionId,
  observing,
  onSelect,
  onSubmit,
  onSkip,
}: Props) {
  return (
    <section className="rounded-2xl bg-slate-800/70 p-4" aria-labelledby={`prompt-${sub.id}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">Predict</p>
      <h2 id={`prompt-${sub.id}`} className="mt-1 text-base font-semibold leading-snug">
        {sub.prompt}
      </h2>

      <div role="radiogroup" aria-labelledby={`prompt-${sub.id}`} className="mt-3 space-y-2">
        {sub.options.map((o) => {
          const selected = o.id === selectedOptionId;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={observing}
              onClick={() => onSelect(o.id)}
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                selected
                  ? 'border-sky-400 bg-sky-500/15 text-white'
                  : 'border-slate-700 bg-slate-900/60 text-slate-200 active:bg-slate-800'
              } disabled:cursor-default`}
            >
              <span
                aria-hidden
                className={`size-4 shrink-0 rounded-full border-2 ${selected ? 'border-sky-400 bg-sky-400' : 'border-slate-500'}`}
              />
              {o.text}
            </button>
          );
        })}
      </div>

      {observing ? (
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-sm text-slate-300">Watch the simulation…</p>
          <button
            type="button"
            onClick={onSkip}
            className="min-h-11 rounded-xl px-3 text-sm font-semibold text-sky-300"
          >
            Skip to result
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!selectedOptionId}
          className="mt-3 min-h-12 w-full rounded-xl bg-emerald-600 text-base font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
        >
          Lock in & test prediction
        </button>
      )}
    </section>
  );
}
