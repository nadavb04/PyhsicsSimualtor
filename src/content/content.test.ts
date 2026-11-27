import { describe, expect, it } from 'vitest';
import { simulate } from '@/engine/headless';
import { templateRegistry } from '@/templates/registry';
import { TOPICS, activeGhost, ghostParams, initialParams } from '.';
import { PRAISE_LINES, pickPraise } from './praise';
import { tr, type LocalizedText } from './locale';
import type { PhysicsTopic } from './schema';
import { validateContent } from './validate';

describe('curriculum content', () => {
  it('passes validation against the template registry', () => {
    expect(validateContent(TOPICS, templateRegistry)).toEqual([]);
  });

  it('Topic 1 has all ten spec questions, each on its spec template', () => {
    const t1 = TOPICS.find((t) => t.id === 'kinematics-1d')!;
    expect(t1.questions.map((q) => q.simulationTemplate)).toEqual([
      'vertical-throw',
      'two-cars-chase',
      'cart-1d-vectors',
      'strobe-runner',
      'free-fall-pair',
      'vertical-throw',
      'two-cars-chase',
      'vacuum-tube-drag',
      'glider-vt-graph',
      'valley-track-race',
    ]);
  });

  // The observe phase waits for the run to end, so every preset (and its ghost) must
  // finish on its own, in a time a student will actually sit through.
  const cases = TOPICS.flatMap((topic) =>
    topic.questions.flatMap((q) =>
      q.subQuestions.map((sub) => ({ name: `${q.id}/${sub.id}`, q, sub })),
    ),
  );
  it.each(cases)('$name: the preset run ends naturally within 15 s', ({ q, sub }) => {
    const template = templateRegistry[q.simulationTemplate];
    const params = initialParams(q.parameters, sub, q.fixedParams);
    const runs = [params];
    const ghost = activeGhost(q, sub);
    if (ghost) runs.push(ghostParams(params, ghost));
    for (const p of runs) {
      const { finalState } = simulate(template, p);
      expect(template.isFinished(finalState, p)).toBe(true);
      expect(finalState.t).toBeLessThan(15);
    }
  });

  it.each(cases)('$name: the slowest slider settings still end within 20 s', ({ q, sub }) => {
    // Try each slider at both ends, one at a time, on top of the preset.
    const template = templateRegistry[q.simulationTemplate];
    const base = initialParams(q.parameters, sub, q.fixedParams);
    for (const p of q.parameters) {
      for (const value of [p.min, p.max]) {
        const params = { ...base, [p.id]: value };
        const { finalState } = simulate(template, params);
        expect(finalState.t, `${p.id} = ${value}`).toBeLessThan(20);
      }
    }
  });
});

describe('validateContent', () => {
  const contract = {
    'vertical-throw': { requiredParams: ['a'], optionalParams: [], supportedCues: ['cue'] },
  };
  const L = (s: string): LocalizedText => ({ en: s, he: s });
  const make = (patch: (t: PhysicsTopic) => void): PhysicsTopic => {
    const topic: PhysicsTopic = {
      id: 't',
      title: L('T'),
      description: L(''),
      questions: [
        {
          id: 'q',
          title: L('Q'),
          scenarioDescription: L(''),
          simulationTemplate: 'vertical-throw',
          parameters: [
            { id: 'a', label: L('A'), unit: '', min: 0, max: 10, step: 2, defaultValue: 4 },
          ],
          visualOverlays: {},
          subQuestions: [
            {
              id: 's',
              prompt: L('?'),
              visualFocusCue: 'cue',
              options: [
                { id: 'x', text: L('x'), isCorrect: true, feedback: L('yes') },
                { id: 'y', text: L('y'), isCorrect: false, feedback: L('no') },
              ],
            },
          ],
        },
      ],
    };
    patch(topic);
    return topic;
  };
  const q = (t: PhysicsTopic) => t.questions[0]!;
  const sub = (t: PhysicsTopic) => q(t).subQuestions[0]!;

  it('accepts a minimal valid topic', () => {
    expect(validateContent([make(() => {})], contract)).toEqual([]);
  });

  it.each([
    [
      'unregistered template',
      (t: PhysicsTopic) => (q(t).simulationTemplate = 'two-cars-chase'),
      /not registered/,
    ],
    [
      'two correct options',
      (t: PhysicsTopic) => (sub(t).options[1]!.isCorrect = true),
      /exactly 1 correct/,
    ],
    ['unsupported cue', (t: PhysicsTopic) => (sub(t).visualFocusCue = 'nope'), /focus cue/],
    [
      'off-step default',
      (t: PhysicsTopic) => (q(t).parameters[0]!.defaultValue = 3),
      /not on step/,
    ],
    ['out-of-range preset', (t: PhysicsTopic) => (sub(t).presetOverrides = { a: 20 }), /outside/],
    [
      'unknown preset',
      (t: PhysicsTopic) => (sub(t).presetOverrides = { b: 1 }),
      /unknown parameter/,
    ],
    [
      'missing required param',
      (t: PhysicsTopic) => (q(t).parameters[0]!.id = 'z'),
      /missing required/,
    ],
    [
      'missing Hebrew prompt',
      (t: PhysicsTopic) => (sub(t).prompt = { en: 'Why?', he: '' }),
      /prompt: missing text for locale\(s\) he/,
    ],
    [
      'missing English feedback',
      (t: PhysicsTopic) => (sub(t).options[0]!.feedback = { en: ' ', he: 'כן' }),
      /feedback: missing text for locale\(s\) en/,
    ],
    [
      'partially translated optional description',
      (t: PhysicsTopic) => (t.description = { en: 'About', he: '' }),
      /description: missing text/,
    ],
    [
      'fixed param unknown to the template',
      (t: PhysicsTopic) => (q(t).fixedParams = { zzz: 1 }),
      /"zzz" is not used by the template/,
    ],
    [
      'param that is both a slider and fixed',
      (t: PhysicsTopic) => (q(t).fixedParams = { a: 4 }),
      /both a slider and a fixed param/,
    ],
    [
      'sub-question ghost without the ghost overlay',
      (t: PhysicsTopic) => (sub(t).ghost = { label: 'g', paramScale: { a: 2 } }),
      /showGhostComparison is off/,
    ],
    [
      'ghost scaling an unknown parameter',
      (t: PhysicsTopic) => {
        q(t).visualOverlays = { showGhostComparison: true };
        q(t).ghost = { label: 'g', paramScale: { nope: 2 } };
      },
      /ghost changes unknown parameter "nope"/,
    ],
    [
      'ghost that changes nothing',
      (t: PhysicsTopic) => {
        q(t).visualOverlays = { showGhostComparison: true };
        q(t).ghost = { label: 'g' };
      },
      /ghost changes no parameters/,
    ],
  ])('rejects %s', (_name, patch, message) => {
    const errors = validateContent([make(patch)], contract);
    expect(errors.some((e) => message.test(e))).toBe(true);
  });
});

describe('content helpers', () => {
  it('initialParams applies sub-question presets over defaults', () => {
    const question = TOPICS[0]!.questions[0]!;
    const params = initialParams(question.parameters, {
      ...question.subQuestions[0]!,
      presetOverrides: { launchSpeed: 7 },
    });
    expect(params.launchSpeed).toBe(7);
    expect(params.buildingHeight).toBe(20);
  });

  it('initialParams layers fixed params, then defaults, then presets', () => {
    const q6 = TOPICS[0]!.questions.find((q) => q.id === 'doubling-launch-speed')!;
    const params = initialParams(q6.parameters, q6.subQuestions[0], q6.fixedParams);
    expect(params).toMatchObject({ buildingHeight: 0, airDrag: 0, launchSpeed: 20 });
  });

  it('ghostParams scales live values, then applies absolute overrides', () => {
    const ghost = { label: 'g', paramScale: { v: 0.5, w: 3 }, paramOverrides: { w: 1 } };
    expect(ghostParams({ v: 10, w: 2, x: 7 }, ghost)).toEqual({ v: 5, w: 1, x: 7 });
  });

  it('a sub-question ghost replaces the question ghost', () => {
    const q4 = TOPICS[0]!.questions.find((q) => q.id === 'strobe-dot-spacing')!;
    expect(activeGhost(q4, q4.subQuestions[0]!)).toBeUndefined();
    expect(activeGhost(q4, q4.subQuestions[1]!)?.label).toBe('2× speed');
  });

  it('pickPraise is deterministic with an injected random source', () => {
    expect(pickPraise(() => 0)).toBe(PRAISE_LINES[0]);
    expect(pickPraise(() => 0.9999)).toBe(PRAISE_LINES.at(-1));
  });

  it('tr resolves a locale and falls back to English when blank', () => {
    expect(tr({ en: 'Hi', he: 'שלום' }, 'he')).toBe('שלום');
    expect(tr({ en: 'Hi', he: '' }, 'he')).toBe('Hi');
  });
});
