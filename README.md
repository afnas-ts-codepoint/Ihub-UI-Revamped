# iHub Task Manager — React Migration

## Purpose

This repository contains the new production React application being built from the existing prototype through a controlled migration.

## Important repositories

- Prototype repository: external, read-only reference.
- This repository: production migration target.

Do not place prototype source code in this repository.

## Current status

Migration implementation and full regression are complete. M12.2 production
readiness is in review; release sign-off (M12.3) has not started.

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

## Production build

```sh
cp .env.example .env.production
npm ci
npm run build
npm run check:bundle
npm run preview
```

The build has two public, build-time configuration values:

- `VITE_BASE_PATH`: deployment mount path, `/` by default. For example,
  `/ihub` emits `/ihub/assets/...` URLs and configures the router basename.
- `VITE_ROUTER_MODE`: `browser` by default; use `hash` only when the host cannot
  provide the required SPA rewrite.

These values are embedded in the browser bundle. Do not put secrets in any
`VITE_*` value. Browser mode requires the host to serve `index.html` for
unknown application paths under `VITE_BASE_PATH`.

See the [production runbook](docs/operations/PRODUCTION_RUNBOOK.md) for build,
deployment, verification, and recovery details.

## Quality gates

```sh
npm run typecheck
npm run lint
npm run test
npm run build
npm run check:bundle
npm run report:pending -- --release
```

Run the complete release-oriented suite with `npm run verify:release`.

## Current implementation status

The authoritative current state is in
[`MASTER_TASK_LIST.md`](docs/tasks/MASTER_TASK_LIST.md). Do not infer release
approval from a successful build; M12.3 is the separate human sign-off gate.

## Historical scaffold notes

`M1.1 — Scaffold & Quality Gates: COMPLETED`

`M1.2 — Design Tokens, Fonts, Base CSS & Tailwind: COMPLETED`

`M1.3 — i18n, Preferences & Direction: COMPLETED`

`M1.4 — Router Skeleton, Error Handling & Migration Markers: COMPLETED`

This scaffold snapshot is retained for historical context.
