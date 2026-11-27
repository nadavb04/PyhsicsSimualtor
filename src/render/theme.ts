/**
 * Canvas colour palette. The source of truth is the CSS `@theme` block in src/index.css
 * (so Tailwind utilities like `text-velocity` match the canvas); these are fallbacks.
 */
export interface Theme {
  background: string;
  ground: string;
  structure: string;
  body: string;
  velocity: string;
  acceleration: string;
  ghost: string;
  strobe: string;
  marker: string;
  reference: string;
  text: string;
  grid: string;
}

export const DEFAULT_THEME: Theme = {
  background: '#0f172a',
  ground: '#334155',
  structure: '#475569',
  body: '#f8fafc',
  velocity: '#22c55e',
  acceleration: '#f97316',
  ghost: '#93c5fd',
  strobe: '#e2e8f0',
  marker: '#facc15',
  reference: '#a78bfa',
  text: '#cbd5e1',
  grid: '#1e293b',
};

const CSS_VARS: Record<keyof Theme, string> = {
  background: '--color-stage',
  ground: '--color-ground',
  structure: '--color-structure',
  body: '--color-body',
  velocity: '--color-velocity',
  acceleration: '--color-acceleration',
  ghost: '--color-ghost',
  strobe: '--color-strobe',
  marker: '--color-marker',
  reference: '--color-reference',
  text: '--color-stage-text',
  grid: '--color-stage-grid',
};

/** Read the palette from CSS custom properties, falling back to DEFAULT_THEME. */
export function readTheme(el: Element): Theme {
  const style = getComputedStyle(el);
  const theme = { ...DEFAULT_THEME };
  for (const key of Object.keys(CSS_VARS) as (keyof Theme)[]) {
    const value = style.getPropertyValue(CSS_VARS[key]).trim();
    if (value) theme[key] = value;
  }
  return theme;
}
