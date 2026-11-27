import type { SliderParam } from '@/content/schema';
import { useI18n } from '../i18n/useI18n';

interface Props {
  param: SliderParam;
  value: number;
  disabled: boolean;
  onChange(value: number): void;
}

export function ParamToggle({ param, value, disabled, onChange }: Props) {
  const { t, tr } = useI18n();
  const offLabel = param.valueLabels ? tr(param.valueLabels[0]) : t.toggleOff;
  const onLabel = param.valueLabels ? tr(param.valueLabels[1]) : t.toggleOn;
  const label = tr(param.label);
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
        {label}
        {disabled && (
          <span className="ms-1 text-xs text-slate-400" aria-label={t.locked}>
            🔒
          </span>
        )}
      </span>
      <div className="flex w-40 gap-1 rounded-xl bg-slate-800 p-1" role="group" aria-label={label}>
        {option(0, offLabel)}
        {option(1, onLabel)}
      </div>
    </div>
  );
}
