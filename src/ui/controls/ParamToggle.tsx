import type { SliderParam } from '@/content/schema';

interface Props {
  param: SliderParam;
  value: number;
  disabled: boolean;
  onChange(value: number): void;
}

export function ParamToggle({ param, value, disabled, onChange }: Props) {
  const [offLabel, onLabel] = param.valueLabels ?? ['Off', 'On'];
  const option = (v: 0 | 1, text: string) => (
    <button
      type="button"
      aria-pressed={value === v}
      disabled={disabled}
      onClick={() => onChange(v)}
      className={`min-h-11 flex-1 rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed ${
        value === v ? 'bg-sky-600 text-white' : 'text-slate-300'
      }`}
    >
      {text}
    </button>
  );
  return (
    <div className={`flex items-center justify-between gap-3 ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-sm font-medium text-slate-200">
        {param.label}
        {disabled && (
          <span className="ml-1 text-xs text-slate-400" aria-label="locked">
            🔒
          </span>
        )}
      </span>
      <div
        className="flex w-40 gap-1 rounded-xl bg-slate-800 p-1"
        role="group"
        aria-label={param.label}
      >
        {option(0, offLabel)}
        {option(1, onLabel)}
      </div>
    </div>
  );
}
