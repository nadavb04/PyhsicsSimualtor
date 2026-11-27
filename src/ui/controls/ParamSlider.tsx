import { useId } from 'react';
import type { SliderParam } from '@/content/schema';

interface Props {
  param: SliderParam;
  value: number;
  disabled: boolean;
  onChange(value: number): void;
}

export function ParamSlider({ param, value, disabled, onChange }: Props) {
  const id = useId();
  return (
    <div className={disabled ? 'opacity-50' : ''}>
      <div className="flex items-baseline justify-between text-sm">
        <label htmlFor={id} className="font-medium text-slate-200">
          {param.label}
          {disabled && (
            <span className="ml-1 text-xs text-slate-400" aria-label="locked">
              🔒
            </span>
          )}
        </label>
        <output htmlFor={id} className="tabular-nums text-slate-300">
          {value} {param.unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="slider"
        min={param.min}
        max={param.max}
        step={param.step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {param.qualitativeLabels && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>{param.qualitativeLabels[0]}</span>
          <span>{param.qualitativeLabels[1]}</span>
        </div>
      )}
    </div>
  );
}
