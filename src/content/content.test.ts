import { describe, expect, it } from 'vitest';
import { templateRegistry } from '@/templates/registry';
import { TOPICS, initialParams } from '.';
import { PRAISE_LINES, pickPraise } from './praise';
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
  const make = (patch: (t: PhysicsTopic) => void): PhysicsTopic => {
    const topic: PhysicsTopic = {
      id: 't',
      title: 'T',
      description: '',
      questions: [
        {
          id: 'q',
          title: 'Q',
          scenarioDescription: '',
          simulationTemplate: 'vertical-throw',
          parameters: [
            { id: 'a', label: 'A', unit: '', min: 0, max: 10, step: 2, defaultValue: 4 },
          ],
          visualOverlays: {},
          subQuestions: [
            {
              id: 's',
              prompt: '?',
              visualFocusCue: 'cue',
              options: [
                { id: 'x', text: 'x', isCorrect: true, feedback: 'yes' },
                { id: 'y', text: 'y', isCorrect: false, feedback: 'no' },
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
});
