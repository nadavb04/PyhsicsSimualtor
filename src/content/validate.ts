import { LOCALES, type LocalizedText } from './locale';
import type { GhostComparison, PhysicsTopic, SimulationTemplateId, SliderParam } from './schema';

/** The slice of a template that content validation needs (keeps content free of render code). */
export interface TemplateContract {
  requiredParams: readonly string[];
  optionalParams: readonly string[];
  supportedCues: readonly string[];
}

export type TemplateLookup = Partial<Record<SimulationTemplateId, TemplateContract>>;

const EPS = 1e-9;

function onStep(p: SliderParam, value: number): boolean {
  const n = (value - p.min) / p.step;
  return Math.abs(n - Math.round(n)) < 1e-6;
}

function checkValue(p: SliderParam, value: number, where: string, errors: string[]): void {
  if (value < p.min - EPS || value > p.max + EPS) {
    errors.push(`${where}: value ${value} for "${p.id}" is outside [${p.min}, ${p.max}]`);
  } else if (!onStep(p, value)) {
    errors.push(`${where}: value ${value} for "${p.id}" is not on step ${p.step}`);
  }
}

/**
 * Every locale must have text. With `optional`, the field may be blank in all
 * locales, but a translation can't be missing when another locale has one.
 */
function checkText(
  text: LocalizedText | undefined,
  where: string,
  errors: string[],
  optional = false,
): void {
  const missing = LOCALES.filter((l) => typeof text?.[l] !== 'string' || !text[l].trim());
  if (missing.length === 0) return;
  if (optional && missing.length === LOCALES.length) return;
  errors.push(`${where}: missing text for locale(s) ${missing.join(', ')}`);
}

/**
 * Structural and referential checks on curriculum data. Returns human-readable errors;
 * an empty array means the content is valid. Run in CI via content.test.ts.
 */
export function validateContent(
  topics: readonly PhysicsTopic[],
  templates: TemplateLookup,
): string[] {
  const errors: string[] = [];
  const topicIds = new Set<string>();

  for (const topic of topics) {
    if (topicIds.has(topic.id)) errors.push(`duplicate topic id "${topic.id}"`);
    topicIds.add(topic.id);
    if (topic.questions.length === 0) errors.push(`${topic.id}: topic has no questions`);
    checkText(topic.title, `${topic.id} title`, errors);
    checkText(topic.description, `${topic.id} description`, errors, true);

    const questionIds = new Set<string>();
    for (const q of topic.questions) {
      const where = `${topic.id}/${q.id}`;
      if (questionIds.has(q.id)) errors.push(`${where}: duplicate question id`);
      questionIds.add(q.id);
      checkText(q.title, `${where} title`, errors);
      checkText(q.scenarioDescription, `${where} scenario`, errors, true);

      const template = templates[q.simulationTemplate];
      if (!template) errors.push(`${where}: template "${q.simulationTemplate}" is not registered`);

      // Parameters.
      const params = new Map<string, SliderParam>();
      for (const p of q.parameters) {
        if (params.has(p.id)) errors.push(`${where}: duplicate parameter id "${p.id}"`);
        params.set(p.id, p);
        const pw = `${where} parameter "${p.id}"`;
        checkText(p.label, `${pw} label`, errors);
        p.valueLabels?.forEach((l, i) => checkText(l, `${pw} valueLabels[${i}]`, errors));
        p.qualitativeLabels?.forEach((l, i) =>
          checkText(l, `${pw} qualitativeLabels[${i}]`, errors),
        );
        if (p.min >= p.max) errors.push(`${where}: parameter "${p.id}" has min >= max`);
        if (p.step <= 0) errors.push(`${where}: parameter "${p.id}" has non-positive step`);
        if (p.kind === 'toggle' && (p.min !== 0 || p.max !== 1 || p.step !== 1)) {
          errors.push(`${where}: toggle "${p.id}" must have min 0, max 1, step 1`);
        }
        checkValue(p, p.defaultValue, `${where} default`, errors);
      }
      const fixed = new Map(Object.entries(q.fixedParams ?? {}));
      for (const [id, value] of fixed) {
        if (params.has(id)) errors.push(`${where}: "${id}" is both a slider and a fixed param`);
        if (!Number.isFinite(value)) errors.push(`${where}: fixed param "${id}" is not finite`);
      }
      if (template) {
        for (const id of template.requiredParams) {
          if (!params.has(id) && !fixed.has(id))
            errors.push(`${where}: missing required parameter "${id}"`);
        }
        const known = new Set([...template.requiredParams, ...template.optionalParams]);
        for (const id of [...params.keys(), ...fixed.keys()]) {
          if (!known.has(id))
            errors.push(`${where}: parameter "${id}" is not used by the template`);
        }
      }

      const checkOverrides = (overrides: Record<string, number> | undefined, ctx: string) => {
        for (const [id, value] of Object.entries(overrides ?? {})) {
          const p = params.get(id);
          if (!p) errors.push(`${ctx}: override for unknown parameter "${id}"`);
          else checkValue(p, value, ctx, errors);
        }
      };
      const checkGhost = (ghost: GhostComparison | undefined, ctx: string) => {
        if (!ghost) return;
        if (!ghost.label.trim()) errors.push(`${ctx}: ghost needs a label`);
        if (!q.visualOverlays.showGhostComparison) {
          errors.push(`${ctx}: ghost defined but visualOverlays.showGhostComparison is off`);
        }
        // Ghost values may leave the slider range (e.g. 2× the max), so only check ids.
        for (const id of Object.keys({ ...ghost.paramOverrides, ...ghost.paramScale })) {
          if (!params.has(id) && !fixed.has(id))
            errors.push(`${ctx}: ghost changes unknown parameter "${id}"`);
        }
        if (Object.keys({ ...ghost.paramOverrides, ...ghost.paramScale }).length === 0) {
          errors.push(`${ctx}: ghost changes no parameters`);
        }
      };
      checkGhost(q.ghost, `${where} ghost`);

      // Sub-questions.
      if (q.subQuestions.length === 0) errors.push(`${where}: no sub-questions`);
      const subIds = new Set<string>();
      for (const sub of q.subQuestions) {
        const sw = `${where}/${sub.id}`;
        if (subIds.has(sub.id)) errors.push(`${sw}: duplicate sub-question id`);
        subIds.add(sub.id);
        checkText(sub.prompt, `${sw} prompt`, errors);
        if (sub.options.length < 2) errors.push(`${sw}: needs at least 2 options`);
        const correct = sub.options.filter((o) => o.isCorrect).length;
        if (correct !== 1)
          errors.push(`${sw}: must have exactly 1 correct option (has ${correct})`);
        const optIds = new Set<string>();
        for (const o of sub.options) {
          if (optIds.has(o.id)) errors.push(`${sw}: duplicate option id "${o.id}"`);
          optIds.add(o.id);
          checkText(o.text, `${sw}/${o.id} text`, errors);
          checkText(o.feedback, `${sw}/${o.id} feedback`, errors);
        }
        checkOverrides(sub.presetOverrides, `${sw} preset`);
        checkGhost(sub.ghost, `${sw} ghost`);
        if (
          sub.visualFocusCue &&
          template &&
          !template.supportedCues.includes(sub.visualFocusCue)
        ) {
          errors.push(
            `${sw}: focus cue "${sub.visualFocusCue}" not supported by ${q.simulationTemplate}`,
          );
        }
      }
    }
  }
  return errors;
}
