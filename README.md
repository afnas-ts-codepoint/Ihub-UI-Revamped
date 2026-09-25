# iHub Task Manager — React Migration

## Purpose

This repository contains the new production React application being built from the existing prototype through a controlled migration.

## Important repositories

- Prototype repository: external, read-only reference.
- This repository: production migration target.

Do not place prototype source code in this repository.

## Current status

Planning is complete, and M1.1 scaffold and quality-gate implementation is approved and completed.

## Documentation

- [Phase 2 target architecture](docs/architecture/PHASE_2_TARGET_ARCHITECTURE.md)
- [Phase 3 migration plan](docs/migration/PHASE_3_MIGRATION_PLAN.md)
- [Phase 1 analysis](docs/migration/PHASE_1_ANALYSIS_REPORT.md) and [Phase 1.5 scope finalization](docs/migration/PHASE_1_5_SCOPE_FINALIZATION_REPORT.md)

## Migration workflow

Prototype → analyse current phase → implement one migration phase → typecheck/lint/test/build → compare with prototype → human review → PR → approval → next phase.

## Migration Task Tracking

[Phase 3](docs/migration/PHASE_3_MIGRATION_PLAN.md) defines the authoritative migration plan. [`docs/tasks/`](docs/tasks/README.md) tracks operational execution, [`MASTER_TASK_LIST.md`](docs/tasks/MASTER_TASK_LIST.md) shows overall progress, and individual files under [`docs/tasks/phases/`](docs/tasks/phases/) contain task-level execution information.

## Development rule

Do not start a migration phase without following [AGENTS.md](AGENTS.md) and the Phase 3 plan.

## Collaboration

GitHub is the source of truth for code. Claude and Codex support architecture, review, and implementation. Work through branches and pull requests; do not push migration work directly to `main`.

## Local development

```sh
npm ci
npm run dev
```

## Quality gates

```sh
npm run typecheck
npm run lint
npm run test
npm run build
npm run check:bundle
```

## Implementation status

`M1.1 — Scaffold & Quality Gates: COMPLETED`

`M1.2 — Design Tokens, Fonts, Base CSS & Tailwind: COMPLETED`

M1.3 has not started.
