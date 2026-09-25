# iHub React Migration Instructions

## Repository role

- This is the production React migration repository.
- The prototype repository is external and read-only.
- Production work happens only in this repository.

## Source of truth

- Approved baseline commit: `273abc8`.
- The current local prototype is the migration and QA reference; the live deployment is secondary.
- Before work, follow `docs/architecture/PHASE_2_TARGET_ARCHITECTURE.md` and `docs/migration/PHASE_3_MIGRATION_PLAN.md`.

## Migration rules

- Execute one migration phase at a time. Never start the next without human approval; perform required delta intake first.
- Preserve canonical UI and behavior. Do not silently fix prototype behavior; prototype no-ops remain inert unless approved.
- Do not migrate excluded or dead prototype code.
- Add shared infrastructure and packages only for their first real consumer. Do not create empty feature folders, speculative abstractions, or fake APIs.
- Axios and TanStack Query wait for real backend endpoints. Do not use `window.*` communication in production code.
- Avoid mega-components such as UniversalTable, UniversalForm, and UniversalModal. Keep feature logic in its owning feature; place only genuinely reusable, domain-agnostic code in `shared`.
- Use strict TypeScript with no `any`. Preserve EN/AR, RTL, Paper/Ink behavior, and logical RTL-safe styling.

## Quality gates and stop rule

Run all Phase 3 gates for each implementation phase; once available, this includes typecheck, lint, tests, and build.

After a requested phase, report changed files, packages added, quality-gate results, and deviations/no-ops/pending items. Stop and wait for approval.
