# Migration Task Tracker

`docs/tasks/` is the operational execution tracker for the iHub React migration.

[Phase 3](../migration/PHASE_3_MIGRATION_PLAN.md) is the authoritative migration plan. This tracker must not redefine its architecture, scope, sequence, dependencies, decisions, or approval gates.

## Files

- [MASTER_TASK_LIST.md](MASTER_TASK_LIST.md) shows overall progress.
- [ACTIVE.md](ACTIVE.md) lists only work currently being executed.
- [COMPLETED.md](COMPLETED.md) lists tasks completed after human approval.
- [BLOCKED.md](BLOCKED.md) records actionable blockers.
- [phases/](phases/) contains one operational file for every executable Phase 3 task.

## Workflow

1. Read Phase 3 and the task file.
2. Verify dependencies and perform required delta intake.
3. Set the task to Active only when authorized work begins.
4. Run and record applicable quality gates.
5. Set the task to Review and stop.
6. A human reviewer may approve completion; only then set it to Completed.
7. Do not begin the next task automatically.

Keep the task file, master list, and the relevant status view synchronized. Use only the approved status values listed in the master list.

