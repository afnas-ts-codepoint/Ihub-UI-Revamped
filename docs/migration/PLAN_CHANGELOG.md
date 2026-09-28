# Migration Plan Change Log

This file records approved changes to migration sequencing, release flow, task scope, or dependencies. Implementation completion continues to be tracked in `docs/tasks/`.

## 2026-09-28 — First-release priority flow

### Requested outcome

Prioritize the first release around:

1. all navbar and menu behavior;
2. completed Masters;
3. Home as the entry point and a complete Work Centre flow;
4. Settings configuration reachable from the header Settings action.

Unmigrated destinations may remain in navigation, but they must show the standard `MigrationPending` screen rather than appearing complete. If a reachable Work Centre flow depends on Task functionality, the minimum blocking Task phase is executed before that flow is approved. Settings must match the prototype without speculative backend, authorization, persistence, or visual over-polish.

### Approved plan changes

- Added Phase 3 §6.1 as the first-release priority overlay.
- Kept M2.1–M2.3 as the completed navigation/menu foundation.
- Kept M4.1–M4.3 as the completed Masters scope and corrected stale tracker statuses.
- Kept M5.1 Home as the completed Work Centre entry point.
- Prioritized M7.1–M7.6 next, with only blocking M8 phases pulled forward when a reachable Work Centre flow requires them.
- Prioritized M11.1 and M11.2 after Work Centre.
- Narrowed M11.2 to prototype-visible Settings builders and local/mock previews, removing premature dependencies on M8.2 and M10.2.
- Added M11.3 for the deferred runtime connection to Task and Overview dashboard stores.
- Changed R5 so registered pending destinations outside the scoped first-release flow may remain visible; the full migration still requires zero pending markers globally.
- Synchronized stale `MASTER_TASK_LIST.md` statuses for the already approved M3.9, M4.2, M6.2 and M6.3 phases.

### Consequences accepted

- The first release is intentionally partial and is not the final M12 migration release.
- Navigation parity remains mandatory even when a destination is pending.
- No pending marker may remain inside the approved Navbar → Masters/Home → Work Centre → Settings first-release flow.
- Full dashboard configuration integration remains pending until M8.2 and M10.2 are complete.

### Files changed

- `docs/migration/PHASE_3_MIGRATION_PLAN.md`
- `docs/migration/PLAN_CHANGELOG.md`
- `docs/tasks/README.md`
- `docs/tasks/MASTER_TASK_LIST.md`
- `docs/tasks/phases/M11.2.md`
- `docs/tasks/phases/M11.3.md`
