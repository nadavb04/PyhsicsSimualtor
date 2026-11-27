# Physics Intuition Simulator

A mobile-first static web app that builds physics intuition through a **predict → observe → debrief** loop. Students commit to a qualitative prediction, then watch a real-time simulation with velocity/acceleration vectors, strobe dots, and ghost comparison runs, then get misconception-targeted feedback.

The full product spec is in [coding_agent_prompt_physics_intuition_simulator.md](coding_agent_prompt_physics_intuition_simulator.md).

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script                                  | Purpose                                                                                      |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm run dev`                           | Vite dev server                                                                              |
| `npm run build`                         | Typecheck + production build to `dist/`                                                      |
| `npm run preview`                       | Serve the production build                                                                   |
| `npm test`                              | Unit, physics, content-validation and component tests (Vitest)                               |
| `npm run test:e2e`                      | Playwright smoke tests at 375px and 430px (run `npx playwright install chromium` once first) |
| `npm run lint` / `typecheck` / `format` | Code quality                                                                                 |
| `node scripts/generate-icons.mjs`       | Re-render PWA PNG icons from `public/icons/icon.svg`                                         |

## Architecture

```
src/
  engine/     Pure TS physics core: integrators, fixed-timestep runner, recorder, headless simulate()
  render/     Canvas helpers: camera (world↔screen, HiDPI), arrows/dots/rulers/graphs, theme
  templates/  One folder per simulation template (physics model + renderer), plus the registry
  content/    Curriculum data (topics/questions, bilingual), schema, locale helpers, validator, praise lines
  game/       Pure logic: prediction-loop state machine, scoring and aggregation
  state/      Zustand stores persisted to localStorage: progress (versioned) and locale
  ui/         React: app shell, screens, controls, prediction/debrief cards, simulation bridge
```

- **Dependencies point downward.** `engine/render/game/content` never import React or app state, and ESLint enforces it.
- **Determinism.** Physics runs at a fixed 1/240 s step, independent of frame rate, with frame time capped at 0.1 s. Rendering stops when a run ends or the tab is hidden.
- **Content is data.** Adding questions means editing `src/content/`. CI validates it against the template registry. See [docs/ADDING_CONTENT.md](docs/ADDING_CONTENT.md).
- **Answer keys are tested.** Template physics tests assert the behaviour each "correct" option claims.
- **Languages.** Hebrew (default, RTL) and English. Content strings are `{ en, he }` objects (`src/content/locale.ts`). UI chrome strings are in `src/ui/i18n/strings.ts`. The locale is persisted by `src/state/localeStore.ts`, separately from progress. The simulation figure and its legend stay English and LTR.
- **Routing.** Hash routing (`/#/topic/...`) so deep links work on GitHub Pages.

## Deployment

The GitHub Actions workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) deploys `main` to GitHub Pages, building with `BASE_PATH=/<repo-name>/`. Before the first deploy, enable it once under **Settings → Pages → Source: GitHub Actions**. CI ([ci.yml](.github/workflows/ci.yml)) runs lint, format check, typecheck, tests, build, and the Playwright smoke tests.

## Status

- ✅ Infrastructure, with the `vertical-throw` template and Topic 1 / Question 1 as a working vertical slice.
- ⏳ Templates still to build: `two-cars-chase`, `cart-1d-vectors`, `strobe-runner`, `free-fall-pair`, `vacuum-tube-drag`, `glider-vt-graph`, `valley-track-race`. These come with Questions 2–10.
