# Adding content

The app keeps **curriculum data** (`src/content/`) separate from **simulation templates** (`src/templates/`).
Most additions touch only one of the two.

## Languages

The app is bilingual. Hebrew is the default and English is available from the header toggle. Every learner-facing string in content is a `LocalizedText` object, `{ en: '…', he: '…' }`. This covers titles, descriptions, scenario, prompts, option `text`, `feedback`, slider `label`, `qualitativeLabels` and `valueLabels`. The validator fails if a locale is missing or blank. Descriptions and scenarios may be empty in both languages, but not in just one.

Anything drawn on the simulation canvas stays **English-only**: template render labels, `ghost.label`, the vector legend and units. Don't localize these. When Hebrew feedback refers to on-screen colours or labels (the purple line, the green arrow, "↑/↓" speeds), make sure it describes what the English figure actually shows.

UI chrome strings (buttons, headings, hints) live in [src/ui/i18n/strings.ts](../src/ui/i18n/strings.ts), not in content.

## Add a question to an existing template

1. Open the topic file, e.g. [src/content/topics/kinematics-1d.ts](../src/content/topics/kinematics-1d.ts).
2. Append a `PhysicsQuestion` (schema: [src/content/schema.ts](../src/content/schema.ts)):
   - `simulationTemplate`: a registered template id.
   - `parameters`: must include the template's `requiredParams`, and may include its `optionalParams`. Use `kind: 'toggle'` for Off/On switches (min 0, max 1, step 1).
   - `subQuestions`: each has **exactly one** `isCorrect` option. Every option's `feedback` is shown in the debrief. For a wrong option it's the misconception hint (point at what's visible on screen). For the correct option it's the takeaway.
   - `visualFocusCue`: must be in the template's `supportedCues`.
   - `presetOverrides`: slider values applied when the sub-question opens.
   - `ghost` (optional): a semi-transparent comparison run. It requires `visualOverlays.showGhostComparison: true`.
3. Run `npm test`. [src/content/content.test.ts](../src/content/content.test.ts) validates all content against the template registry (ids, ranges, steps, cues, one correct option). CI fails on any content error.
4. **Verify the answer key with physics.** Add a test to the template's test file that simulates the scenario headlessly and asserts the behaviour the correct option claims. See [vertical-throw.test.ts](../src/templates/vertical-throw/vertical-throw.test.ts).

## Add a new topic

Create `src/content/topics/<topic>.ts` exporting a `PhysicsTopic`, and add it to `TOPICS` in [src/content/index.ts](../src/content/index.ts). Scores, progress bars and routes pick it up automatically.

## Add a simulation template

1. Make sure the id exists in `SimulationTemplateId` ([src/engine/types.ts](../src/engine/types.ts)).
2. Create `src/templates/<id>/` with:
   - `physics.ts`: a pure `PhysicsModel<S>` with `init`, `step` (use an integrator from [src/engine/integrators.ts](../src/engine/integrators.ts)), `sample`, an optional `detectEvents` (turning points, crossings, passes), `isFinished` and `maxDuration`.
   - `render.ts`: draw one frame using [src/render/primitives.ts](../src/render/primitives.ts) and the camera. Honour the `overlays` flags, the `focusCue` and the optional `ghost`.
   - `index.ts`: `defineTemplate({ id, ...physics, requiredParams, optionalParams, supportedCues, worldBounds, render })`.
   - `<id>.test.ts`: physics tests run with `simulate()` from [src/engine/headless.ts](../src/engine/headless.ts).
3. Register it in [src/templates/registry.ts](../src/templates/registry.ts).

Rules for templates:

- `step` must be pure and deterministic. The runner uses a fixed `PHYSICS_DT = 1/240 s`, so the same params always produce the same history.
- Use SI units with y pointing up. The camera handles the conversion to screen space.
- Never import React or app state. ESLint enforces this for `engine/`, `render/`, `game/` and `content/`.
