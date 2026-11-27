import { describe, expect, it } from 'vitest';
import { templateRegistry } from '@/templates/registry';
import { TOPICS, initialParams } from '.';
import { PRAISE_LINES, pickPraise } from './praise';
import { tr, type LocalizedText } from './locale';
import type { PhysicsTopic } from './schema';
import { validateContent } from './validate';

describe('curriculum content', () => {
  it('passes validation against the template registry', () => {
    expect(validateContent(TOPICS, templateRegistry)).toEqual([]);
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

  it('pickPraise is deterministic with an injected random source', () => {
    expect(pickPraise(() => 0)).toBe(PRAISE_LINES[0]);
    expect(pickPraise(() => 0.9999)).toBe(PRAISE_LINES.at(-1));
  });

  it('tr resolves a locale and falls back to English when blank', () => {
    expect(tr({ en: 'Hi', he: 'שלום' }, 'he')).toBe('שלום');
    expect(tr({ en: 'Hi', he: '' }, 'he')).toBe('Hi');
  });
});
