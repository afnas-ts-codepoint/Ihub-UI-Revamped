# Migration Plan Change Log

This file records approved changes to migration sequencing, release flow, task scope, or dependencies. Implementation completion continues to be tracked in `docs/tasks/`.

## 2026-10-03 - M10.4 `/home/tasks` implemented (Review)

- Started after the user approved M10.3. Only `/home/tasks` was added; the Task Status stepper stays out of scope pending a separate decision. No new deviation: the page reuses the approved `JobOrderCard`, `FilterChips` and the Home queue store, and one PROTOTYPE-NOOP row (Board view) was recorded.

## 2026-10-03 - M10.3 implemented (parallel to M10.2; unblocks M10.4 `/home/tasks`)

- M10.3 (Assigned, live incidents, tracker, legacy-form entry points) was implemented although its dependency M10.2 is still Pending, on the user's instruction. M10.2 files (Overview) were not touched.
- The tracking store that replaces `window.__ihubTrack` is `store/tracking.store.ts` (the Phase 2 location), a hand-off queue: Incident Workspace "Track" queues a record and `HomeQueueHost` applies it to the Home queue store (tracker row, plus a pinned "Tracking" incident or a pin on the existing one). The tracker list itself stays in `homeQueue.store` (M10.1), so M10.2's tracker card reads `trackedTasks` from there.
- `JobOrderCard` now exists (`features/home/components/job-orders/`); M10.4 can wire `/home/tasks` around it.
- Decision recorded for approval: D31 (the Home task form embeds the canonical create form instead of navigating to `/tasks/:taskId`) and minor D32.
- Correction to approved M10.1 styling: the shared home `secondary` button is now the prototype's blue-outlined `.btn.secondary` (it was neutral grey).
- Prototype branch update (same day): the read-only prototype is now `final-change` @ `7ee0ed9` (live: https://designs.codepoints.in/new-ihub/). Delta intake found a uniform font-size remap (10.5/11.5/12.5/14.5 → 11/13/13.5/15) and a Task Status stepper redesign. Human decision: adopt for M10.3. The type-scale tokens in `styles/index.css` were remapped (affects every screen, as the prototype's did); the stepper is left for M8.4–M8.6 and recorded in `PROTOTYPE_DELTAS.md`.
- Fidelity fixes found while re-comparing M10.3 pages with the new prototype (text size/weight and button geometry compared element by element): the Home banner buttons are the prototype `.btn` (40px, 14px) instead of 38px/13px custom buttons; banner eyebrow labels are 12px/500 with 0.16em tracking; chips are weight 500 with the 3px/9px padding; the `bolt` and `pin` glyphs are drawn from the prototype's own paths; the Incident Reports / Live Incidents strip uses the same strip as the Assigned queues.

## 2026-10-02 - M10.4 started in parallel with M10.3 (Option A)

- M10.3 (Assigned, live incidents, tracker, legacy-form entry points) is being implemented in a parallel session although its dependency M10.2 is still Pending; M10.2 remains the owner of its planned tracking-store work. M10.4 (dependency M10.1 only) was authorized by the user as the next safe parallel task.
- Human decision (Option A): implement `/home/company` and `/home/reports` now; do not create or fork `JobOrderCard` (M10.3-owned); `/home/tasks` stays `MigrationPending` until M10.3's card is available, then M10.4 wires the All/Internal/External filter and grid around it. M10.4 does not move to Review until then.
- Root `index.html` is the authoritative rendered prototype (M10.1 precedent); no R6 drift (see `PROTOTYPE_DELTAS.md`).
- Deviation D30 and three PROTOTYPE-NOOP rows recorded. M10.2 and M10.3 files untouched.

## 2026-10-01 - M10.1 Queues, workflow drawer, Approvals view started

- M10.1 (dependencies M6.6, M6.7, M9.2 — all approved) was started on the user's instruction, completed to Review, and user-approved the same day (2026-10-01). M11.3 is being worked in a parallel session; M10.1 touches no `settings/` or task-dashboard-config files. M10.2, M10.3 and M10.4 were not started.
- Source file: the rendered prototype is the root `index.html` (the plan's M10.1 line ranges are valid for it); `ihub/index.html` is an older sibling build with identical queue/drawer logic (verified) but without the phone `ac-*` card rules. See the M10.1 intake in `PROTOTYPE_DELTAS.md`.
- Decision (approved with M10.1): M6.7's Option A (dead-code exclusion of `PettyCashRequestCreate`'s `review`/`resubmit`/`verify`/`onDecision`) does not hold for the Home Form Preview, which passes them; M10.1 ported them (see `DECISIONS.md`).
- Scope clarifications (no plan change): the Home queue store also owns the incident and job-order slices the workflow drawer mutates (pin/escalate/dismiss; assign/dismiss); their cards and the Assigned/Live Incidents views remain M10.3. `/home/approvals` has no Home tab and is entered from the Overview "On the clock" buttons (M10.2); the route is live now.
- Deviations D28 and D29 and the M6.6 `ActionSheetForm` fidelity correction (always-on 40px bottom padding and sticky right column, matching `CreateActionSheetPanel`) are recorded in `DEVIATIONS.md` and the M10.1 phase card.

## 2026-09-30 - Full migration authorized beyond the first release; M6.6 started

### Human authorization and decision

The scoped first release (Navbar/menus, Masters, Home + Work Centre including the pulled-forward Task flows, and Settings configuration — M11.1/M11.2) is now fully approved and complete. The 2026-09-28 "First-release priority flow" decision explicitly scoped that release as partial ("not the final M12 migration release") and every subsequent changelog entry reiterated that no M6.6+/M9/M10/M11.3/M12 work was authorized. With the first-release scope exhausted, the user was asked whether to authorize the full migration to continue and explicitly chose to do so, starting with **M6.6 — Payment settlement: layout and action sheets** (dependencies M5.1, M6.4 both already approved).

### Consequences accepted

- The full migration (beyond the scoped first release) is now authorized to proceed, one phase at a time, under the existing one-phase-at-a-time review and human-approval gates.
- M6.6 was started and is recorded in Review in `docs/tasks/phases/M6.6.md` / `MASTER_TASK_LIST.md`.
- No other M6.7+/M9/M10/M11.3/M12 work is authorized by this change; each remains a separate phase requiring its own start.

## 2026-09-30 - M6.7 Payment settlement: petty cash started

- M6.6 was user-approved on 2026-09-30 (`COMPLETED.md`); M6.7 (dependency M6.6 only) was started as the next phase; the user approved it on 2026-09-30 and it is recorded in `COMPLETED.md`.
- Human decision (Option A): `PettyCashRequestForm` is create-mode only. The prototype's `review`/`resubmit`/`verify`/`onDecision` branches are never invoked by any caller and are excluded as dead source; the question is deferred to M10.1 (see `DECISIONS.md`).
- The plan's source line numbers (`PettyCashScreen` 11667–11874 etc.) do not match the current prototype checkout; `ihub/index.html` is byte-identical between baseline `273abc8` and `3c391b4` so there is no R6 delta, and the regions were located by name (`PettyCashScreen` L9549–9755, `PettyCashRequestCreate` L7744–7828, `ReimbursePettyCashCreate` L7663–7741). `PCRequestCreate` is Purchasing's (M6.3) and excluded.
- M6.8 (Add a Supplier) and M10.x (Home approvals queue) remain untouched; M9.1 (document-only) runs in parallel with no shared code.

## 2026-09-29 - M8.2 Task analytics dashboard approved

- Replaced the M8.1 Dashboard `MigrationPending` body inside `/home/work-centre/tasks` with the reachable current-prototype Soft Tint dashboard.
- Added all eleven registered Task dashboard widgets with exact static fixtures, current Task-store-backed High priority rows/search, impacted-area drill-down, and the Department/Employee workload heatmap with filters and deterministic inline Gantt rows.
- Added the persisted `taskDashboardConfig.store` under `ihub.v2.taskdash.config`; it owns organization/personal runtime configs and prototype-equivalent effective-layout rules without `window.*` events.
- Kept the M11.2 Settings builder store independent. Connecting Settings to this runtime store remains M11.3 and still also depends on M10.2.
- Preserved the High priority widget's inert `Go to tasks` control and the M8.1 in-place detail modal; M8.5/M8.6 edit behavior remains pending.
- Added focused domain/store/page coverage and a 13-image visual evidence pack across EN/AR, Paper/Ink, desktop/tablet/mobile, impacted-area drill-down, and workload states. User approved M8.2 on 2026-09-29; it is recorded in `COMPLETED.md`.

## 2026-09-29 - M11.1 dead-code exclusion and M11.2 implementation

### Human authorization and decision

The user resolved the M11.1 delta-intake finding with **ADOPT CURRENT PROTOTYPE for M11.1**: `UserConfigScreen`'s cited user-administration panel (`index.html:6949-7007`) sits behind a `tab` branch no code path can reach, confirmed by static analysis and by driving the live rendered app. M11.1 is a no-migration outcome — no user list/profile/permissions/MFA/delegate/status UI is built, and the actually-reachable Settings content (the two-tab dashboard-configuration builder) belongs to M11.2 instead. See the `DECISIONS.md` row for the full record.

With M11.1 resolved, M11.2 (Dashboard configuration builders) was implemented against its already-narrowed first-release scope (Default/Role/Department/Individual-user scopes, ordering/hiding/locked widgets with `MAX = 15`, admin rules and user inheritance, JSON import/export, prototype-faithful local-state previews; no backend, no production authorization model, no dependency on the unfinished Task/Overview dashboard stores). Status is Review, awaiting explicit human approval before M11.3 (runtime integration) may be scheduled.

### Consequences accepted

- `/settings/configuration` becomes live, replacing its `PendingRoutePage` marker with the `SettingsConfigurationPage` two-tab shell (Admin Configuration / User Configuration).
- No `DashboardLayoutView`/`DL_WIDGETS` (`index.html:7449-7853`) migration — confirmed dead/unreachable during the M11.2 delta intake, same exclusion rationale as M11.1's finding.
- Runtime integration with `taskDashboardConfig.store` and the Task/Overview dashboards remains deferred to M11.3, which has not been started; M8.2 is now in Review and M10.2 is still pending.
- No new npm dependency was added; `shared/file/json.ts` is the one new shared module, with M11.2 as its first real consumer.

## 2026-09-29 - M8.3 current-prototype adoption

### Human authorization and decision

The user resolved the material M8.3 written-plan/current-prototype conflict with **ADOPT CURRENT PROTOTYPE for M8.3**. The phase targets the current `/ihub/index.html` `CreateTaskPanel` `!task` three-column form and its actual local interactions, not the stale `CreateTaskPanelDesignChange`/root-shell expectations.

### Consequences accepted

- `/home/work-centre/create-task` becomes live with inline Location/Zone rows, Asset Code-only QR simulation, local attachments, literal requester data, validation-free Create, and a minimal prepend to the existing M8.1 store.
- Location drawer/edit/Add Another/cascades, team auto-suggest, checklist, dependencies, sample attachments, Save Draft, shared attachment abstractions, and seedable-random infrastructure are excluded because the selected current form does not render or require them.
- Successful Create stays on the populated form, shows inline `Task created`, and is session-memory only. M8.2 remains deferred; M8.4, M8.5/M8.6, M9, M10, and M11 are not started.

## 2026-09-29 - Pull Work Centre Tasks into the first release

### Human authorization and decision

The user authorized the reachable Work Centre task flows shown by the current prototype to be included in the first release. Pull forward M8.1 Task list and M8.3 Create Task; their existing dependency on M7.1, M4.1, and M6.5 remains in force. M8.4 Task View remains separately authorized for the first release, but the adopted M8.1 prototype opens an in-place modal and does not depend on that route. M8.2 analytics and M8.5-M8.6 task editing remain deferred.

For M8.1, the user first resolved the written-plan/current-prototype conflict with **ADOPT CURRENT PROTOTYPE**, then reopened that decision on 2026-09-29 after visual QA found the current rendered List surface also includes Location/Zone and Department columns, Settings/Export affordances, Group controls, row View/Edit/Remove affordances, and six-row pagination. M8.1 now reproduces those visible affordances while keeping them inert and preserving the M8.2-M8.6 boundaries; it still does not deliver Card view, functional settings, column reorder/grouping, QA restrictions, routed View/Edit, or delete/hide behavior.

### Consequences accepted

- `/home/work-centre/tasks` becomes live in M8.1. `/home/work-centre/create-task` remains pending until M8.3, and `/tasks/:taskId` remains pending until the separately authorized M8.4 phase.
- The pulled-forward phases remain subject to the one-phase-at-a-time review and human approval gates.
- No unrelated M8, M9, M10, or M11 work is authorized by this change.

## 2026-09-28 — M7.5 route and task-boundary reconciliation

### Human authorization and decision

- M7.5 Incident Workspace is explicitly authorized; M7.6 and later phases remain unauthorized.
- **ADOPT current prototype** for the written-plan conflict: Incident Workspace belongs under Home → Incidents → Incident Reports, not a new visible Work Centre Incidents section.
- Incident detail remains an in-place modal rather than a new ID route.
- `Raise a task` remains `MigrationPending` for M9.2. M7.5 does not implement task creation, conversion, references, status changes, or task-related history.

### Implementation consequence

M7.5 uses feature-local `RecordHUD` and in-memory tracking state. The speculative Timeline abstractions, global tracking store, and `convertToTask` requirement are removed from the active M7.5 contract because the current prototype has no present consumer requiring them.

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
- Full dashboard configuration integration remains pending until M8.2 is approved and M10.2 is complete.

### Files changed

- `docs/migration/PHASE_3_MIGRATION_PLAN.md`
- `docs/migration/PLAN_CHANGELOG.md`
- `docs/tasks/README.md`
- `docs/tasks/MASTER_TASK_LIST.md`
- `docs/tasks/phases/M11.2.md`
- `docs/tasks/phases/M11.3.md`
