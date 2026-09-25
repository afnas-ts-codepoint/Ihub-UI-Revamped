# iHub Task Manager — React Migration

## Purpose

This repository contains the new production React application being built from the existing prototype through a controlled migration.

## Important repositories

- Prototype repository: external, read-only reference.
- This repository: production migration target.

Do not place prototype source code in this repository.

## Current status

Planning is complete: Phase 1 analysis, Phase 1.5 scope finalization, Phase 2 target architecture, and the Phase 3 controlled migration plan. Implementation has not started.

## Documentation

- [Phase 2 target architecture](docs/architecture/PHASE_2_TARGET_ARCHITECTURE.md)
- [Phase 3 migration plan](docs/migration/PHASE_3_MIGRATION_PLAN.md)
- [Phase 1 analysis](docs/migration/PHASE_1_ANALYSIS_REPORT.md) and [Phase 1.5 scope finalization](docs/migration/PHASE_1_5_SCOPE_FINALIZATION_REPORT.md)

## Migration workflow

Prototype → analyse current phase → implement one migration phase → typecheck/lint/test/build → compare with prototype → human review → PR → approval → next phase.

## Development rule

Do not start a migration phase without following [AGENTS.md](AGENTS.md) and the Phase 3 plan.

## Collaboration

GitHub is the source of truth for code. Claude and Codex support architecture, review, and implementation. Work through branches and pull requests; do not push migration work directly to `main`.

## Implementation status

`M1.1 — Scaffold & Quality Gates: NOT STARTED`

No setup commands are listed because the React application has not been scaffolded.
