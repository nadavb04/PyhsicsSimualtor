import type { RunStatus } from '@/engine/loop';

interface Props {
  status: RunStatus;
  disabled: boolean;
  /** Shown instead of the controls' meaning when disabled. */
  disabledHint?: string;
  onPlay(): void;
  onPause(): void;
  onReset(): void;
  onStep(): void;
}

const btn =
  'flex min-h-11 min-w-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold ' +
  'transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40';

export function PlaybackControls({
  status,
  disabled,
  disabledHint,
  onPlay,
  onPause,
  onReset,
  onStep,
}: Props) {
  const running = status === 'running';
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2" role="group" aria-label="Playback">
        <button
          type="button"
          className={`${btn} bg-sky-600 text-white`}
          disabled={disabled}
          onClick={running ? onPause : onPlay}
        >
          <span aria-hidden>{running ? '❚❚' : '▶'}</span>
          {running ? 'Pause' : status === 'finished' ? 'Replay' : 'Play'}
        </button>
        <button
          type="button"
          className={`${btn} bg-slate-700`}
          disabled={disabled || running}
          onClick={onStep}
        >
          <span aria-hidden>⏭</span>Step
        </button>
        <button
          type="button"
          className={`${btn} bg-slate-700`}
          disabled={disabled}
          onClick={onReset}
        >
          <span aria-hidden>↺</span>Reset
        </button>
      </div>
      {disabled && disabledHint && (
        <p className="text-center text-xs text-slate-400">{disabledHint}</p>
      )}
    </div>
  );
}
