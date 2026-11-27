# CLAUDE.md

Product spec: `coding_agent_prompt_physics_intuition_simulator.md`. Architecture overview: `README.md`. How to add questions and templates: `docs/ADDING_CONTENT.md`.

## Commands

- `npm test`: Vitest (unit, physics, content validation, component flow)
- `npm run lint && npm run typecheck && npm run format:check`
- `npm run test:e2e`: Playwright at 375px and 430px (builds and serves on port 4173)

## Conventions

- Layering: `engine/ render/ game/ content/` are framework-free (enforced by ESLint `no-restricted-imports`). React lives only in `ui/`, and Zustand only in `state/`.
- Physics is SI with y up, a fixed `PHYSICS_DT` of 1/240, and pure `step` functions. A new template needs headless physics tests that verify the content's answer key.
- Curriculum changes go in `src/content/` data only. Never special-case a question in UI code.
- Scoring rules live only in `src/game/scoring.ts`. If you change the persisted progress shape, bump `PROGRESS_SCHEMA_VERSION` and write a `migrate`.
- Mobile-first: tap targets ≥44px (an e2e test checks this) and no horizontal overflow.
