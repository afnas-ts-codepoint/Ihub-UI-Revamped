# Task Form Analysis (M9.1)

Status: M9.1 deliverable. Document only — no production code accompanies this file.

Baseline: prototype HEAD `3c391b4b5ccbc3fa0bb0ff56d5c8eda6bc6f80ff` (`origin/master` — `273abc8` remains unreachable in this environment per the open `M0.2` blocker; this delta intake is against the current HEAD, consistent with every prior ADOPT-current-prototype phase).

## 0. Plan-vs-current source correction

The Phase 3 plan and the M9.1 phase card cite `CreateTaskPanel` at root `/index.html:19547-20195`, a separate `CreateTaskPanelDesignChange` "canonical form" at `/index.html:20196-20862`, and five usages at `/index.html:8849, 14391, 14652, 14730, 14739`.

Per the standing rule that the **currently rendered prototype is authoritative**, and consistent with the ADOPT-current-prototype decisions already made for M7.5, M8.1, M8.3, and M11.1, this analysis is built from `/ihub/index.html` (the served app), not the root `/index.html` reference file. In `/ihub/index.html`:

- `CreateTaskPanelDesignChange` **does not exist**. There is only one component, `CreateTaskPanel` (`ihub/index.html:16462-16973`), already confirmed as the M8.3 canonical source.
- `CreateTaskPanel` is invoked from **three call sites**, not five, each rendering it with `embedded: true`. A fourth logical trigger (an Edit button) reuses one of those three sites' state, so there are four *triggers* feeding three *render sites*:

| # | Render site | Trigger(s) | Owning surface |
|---|---|---|---|
| 1 | `ihub/index.html:7454` — `ProcessesScreen` `sub==='createTask'` | Work Centre → Create a New Task (default tab) | Work Centre (M7.1) → **already migrated as M8.3** |
| 2 | `ihub/index.html:6739` — `IncidentWorkspace`'s `taskDraft` modal | Incident Reports action menu → "Raise a task" (`openTaskDraft`, `ihub/index.html:6607, 6706-6722`) | Incident Workspace (M7.5) → **pending, owned by M9.2** |
| 3 | `ihub/index.html:12740` — Home's `taskOpen` modal | (a) Assigned Tasks queue row click / Edit button (`ihub/index.html:12597, 12606`); (b) Home incidents queue "Raise a task" action (`ihub/index.html:12256-12259`) | Home Assigned queue + Home Incidents (Live) (Stage 10) → **pending, owned by M10.3** ("the four Home task-form entry points") |

Both `taskOpen` triggers count as two of M10.3's cited "four Home task-form entry points"; the other two belong to Home surfaces not yet built (Overview / Approvals) and are out of M9.1's scope to specify further — M10.3 owns their exact wiring.

This is a material, but non-blocking, correction to the stale plan text; it narrows "five legacy usages" to three render sites / four triggers, all traceable to the same single `CreateTaskPanel` component. No `CreateTaskPanelDesignChange`-style second implementation exists to reconcile against.

## 1. Behavior matrix

### Usage A — Normal create (Work Centre "Create a New Task")

- **Status:** Already implemented and approved as **M8.3** (`src/features/tasks/pages/CreateTaskPage.tsx`, route `/home/work-centre/create-task`).
- **Props:** `{ locale, embedded: true }` — no `task` prop → the component's `!task` branch.
- **Prefill:** none.
- **Sections shown (`!task` branch, `ihub/index.html:16953-16960`):** Task Details, Attachments, Location/Zone, Asset/Machine, Task Classification, References — a flat three-column card grid (`taskDetailsCard`, `attachCard2`, `locSec2`, `assetCard`, `classCard`, `classifyCard`, `refCard`), plus the QR modal.
- **Footer actions:** Create, Cancel (in the card grid's own action bar, not the right-column `actionsCard` used by the `task` branch).
- **Close / submit effects:** Create prepends a minimal record to the M8.1 task store and shows an inline "Task created" flash; the form stays populated (no navigation, no reset-on-submit). Cancel resets local state. No validation blocks Create.
- **Presentation:** embedded (`embedded: true`), rendered as the default Work Centre tab content, not a modal.

### Usage B — Prefilled create / incident → task conversion ("Raise a task" from Incident Workspace)

- **Status:** Pending. Owned by **M9.2** (explicitly named in its scope: "Wire the Incident Workspace 'Raise a task' action, with `convertToTask` on confirm"). M7.5's completion notes record this as the deliberate `MigrationPending` boundary.
- **Props:** `{ key: taskDraft.id, locale, task: taskDraft, embedded: true, onClose: closeTaskDraft }` → the `task`-truthy branch.
- **Prefill shape** (`openTaskDraft`, `ihub/index.html:6706-6722`): `id` (reused from the **incident's** id, not a real task id), `title`/`subject` ("Follow-up: " + incident title), `priority` (mapped from incident priority), `severity` (from incident risk), `kind: 'internal'`, `flow: 'multi'`, `stage: 'Ongoing'`, `dept`/`location`/`zone`/`area`/`subArea` (from incident detail), `taskType: 'Guest Incident'`, `desc` (incident description + action-taken note), `attachments` (incident docs), `source`/`det` (the raw incident record, used only for the outer wrapper's own logic), and an `onOpenIncident` callback (unused by the panel itself).
- **Sections shown** (`task`-truthy branch, `embedded: true` so neither of the panel's own headers render — see §2): `progressCard`, `sourceSec` (open by default because `task.source` is set), `headerCard`, `convertBanner`, `teamSec` (scope is forced `internal`), `locSec`, `expSec`, `checklistSec` (scope is `internal`), `depSec` (mode is `'multi'`, not `'direct'`), `attachSec`; right column `actionsCard`, `statsCard`, `attrCard`, `slaCard`. This is the full task-management surface, not a slim confirmation form — see the overlap flag in §3.
- **Footer actions:** the panel's own `actionsCard` (whatever it exposes — save/status controls scoped to a task-in-progress, not verified further here since it is superseded, see §3) **plus** a bespoke wrapper footer outside the panel (`ihub/index.html:6740-6744`): "The incident stays open and links to the new task." · Cancel · **Create task**.
- **Close / submit effects — verified no-op:** the wrapper's **Create task** button calls `convertToTask(taskDraft.source)` (`ihub/index.html:6596-6603`), which **ignores every field in the embedded form**. It only marks the source incident row `status: 'Converted to task'`, generates a `TSK-2026-<seq>` reference, appends incident history, and closes the modal with a flash message. Nothing the user edits inside the embedded `CreateTaskPanel` (subject, location, checklist, team, etc.) is read or persisted. This is a confirmed `PROTOTYPE-NOOP`-class behavior, not a bug in this analysis.
- **Wrapper chrome:** its own sticky header — "Raise a task" · "from incident" · the draft's `id` — and its own scrim/portal. Because `embedded: true` suppresses the panel's internal headers (§2), there is no duplicate/clashing title; only the wrapper's header is visible.
- **Presentation:** modal (portal to `document.body`), opened from the Incident Reports action menu (`{ id: 'task', label: 'Raise a task' }`, `ihub/index.html:6607`).

### Usage C — Existing-item preview/edit (Home queues)

- **Status:** Pending. Owned by **M10.3** ("The four Home task-form entry points, wired per the M9.1 decision").
- **Two triggers, one render site**, both feeding `taskOpen`:
  - **C1 — Assigned Tasks queue** (`ihub/index.html:12595-12609`): clicking a task card or its **Edit** button sets `taskOpen = jo`, a real existing job/task row: `{ id, title, dept, location, due, priority }`. The same card also exposes independent **Approve/Verify** and **Send back** actions that do not open the panel.
  - **C2 — Home Incidents (Live) queue "Raise a task"** (`ihub/index.html:12256-12259`): sets `taskOpen` to a synthetic, partial object: `{ id: item.id, title, subject: title, priority (derived from severity), kind: 'internal', flow: 'multi', stage: 'Ongoing', dept: item.owner }` — no location/zone/description/attachments. This is a second, thinner "prefilled create" shape distinct from Usage B's `taskDraft`.
- **Props:** `{ key: taskOpen.id, locale, task: taskOpen, embedded: true, onClose: () => setTaskOpen(null) }` — same `task`-truthy branch as Usage B.
- **Sections shown:** identical section set to Usage B (driven by the same branch and the same `scope`/`mode` defaults, since neither C1 nor C2 sets `kind`/`flow` differently in a way that changes which sections render): progress, source (closed by default here — no `task.source`), header, team, location, experience, checklist, dependencies, attachments, plus the right-column actions/stats/attrs/SLA cards.
- **Footer actions:** only the panel's own internal `actionsCard`; **no bespoke outer footer** — the wrapper is just a sticky header (`taskOpen.id` + `subject`/`title`) and a close (×) button (`ihub/index.html:12740`).
- **Close / submit effects:** not independently verified beyond what `actionsCard` does generically (out of M9.1's document-only scope to trace further); closing via × or scrim click simply calls `setTaskOpen(null)` and discards any in-panel edits (no persistence hook is wired at this call site).
- **Presentation:** modal (portal to `document.body`).

## 2. Field-by-field / structural comparison against the canonical form

| Aspect | A — Normal create (M8.3, done) | B — Incident conversion (pending, M9.2) | C — Home preview/edit (pending, M10.3) |
|---|---|---|---|
| Branch | `!task` | `task` truthy | `task` truthy |
| Header inside panel | Full `<h1>` "Create a New Task" (only when `!embedded`; suppressed here since Work Centre passes `embedded: true`) | Suppressed (`embedded: true` skips both the `task.id`/subject mini-header and the `<h1>`) | Suppressed, same reason |
| Outer chrome supplies title? | Work Centre's own section header ("Create a New Task" tab) | Yes — bespoke "Raise a task / from incident" sticky header | Yes — plain `id` + `subject`/`title` sticky header |
| Sections | Task Details, Attachments, Location/Zone, Asset/Machine, Classification, References (flat grid) | Progress, Source, Header, Convert banner, Team, Location, Experience, Checklist, Dependencies, Attachments, Actions, Stats, Attributes, SLA (full task-surface layout) | Same full task-surface layout as B |
| Checklist / Links / Team / SLA / Progress | Not present | Present | Present |
| Footer that actually submits | Panel's own Create/Cancel bar | **Outer wrapper's** Cancel / "Create task" (panel's own `actionsCard` is decorative for this flow — see verified no-op) | Panel's own `actionsCard` only |
| Prefill richness | None | Rich (10+ fields incl. location/desc/attachments) | C1: rich (real row); C2: thin (7 fields, no location/desc) |
| Presentation | Page-equivalent (embedded in a routed tab) | Modal | Modal |
| Persists to a store? | Yes — M8.1 `prependTask` | **No** — `convertToTask` only mutates the incident row + a generated reference; it never touches the M8.1 task store | Not wired at this call site |

Observation for the recommendation: sections A uses (Task Details/Attachments/Location/Asset/Classification/References) are a strict subset of the fields the M8.3 canonical form already implements exactly. Sections B/C use (Progress/Checklist/Team/Dependencies/SLA/Stats/Attributes) are **not** part of M8.3's implemented field set at all — they belong to the task **view/edit** domain that M8.4 (Task View, `/tasks/:taskId`) and M8.5/M8.6 (Task Edit, `/tasks/:taskId/edit`) already migrated, from a **different prototype source** (`TaskEditPage`, root `/index.html:17892-19510`, per `docs/tasks/phases/M8.4.md`). `CreateTaskPanel`'s `task`-truthy branch in `/ihub/index.html` is a second, independent implementation of overlapping task-detail/edit functionality that was never itself selected as the M8.4-M8.6 source.

## 3. Recommendation

**One canonical creation form, reused as-is, plus two thin wrapper flows that do not reimplement task view/edit:**

1. **Keep M8.3's `CreateTaskPage` exactly as implemented** as the single source of "create" fields. Do not change it for M9.2.
2. **`TaskFormDialog` (new, M9.2-scoped) wraps the same create fields** for the incident-conversion flow (Usage B) as a modal:
   - `mode="createFromIncident"` (naming only — the underlying fields are identical to `mode="create"`; no distinct field set is required because the conversion's own submit path never reads them).
   - `presentation="modal"`, with the bespoke header ("Raise a task" / "from incident" / draft id) and footer (Cancel / "Create task") reproduced exactly, calling the equivalent of `convertToTask`.
   - **Preserve the verified no-op**: the embedded form fields are decorative for this flow in the prototype. M9.2 should carry this forward as-is (do not silently wire field data into the conversion) unless a future human decision explicitly asks for that behavior change.
3. **Do not port `CreateTaskPanel`'s `task`-truthy branch (Progress/Checklist/Team/Dependencies/SLA/Stats)** into the new form. That surface duplicates the already-approved, separately-sourced M8.4 (Task View) and M8.5/M8.6 (Task Edit) implementations. Recommend that M10.3, when it wires Usage C's two triggers:
   - For **C1** (Assigned Tasks row/Edit — a real existing task), navigate to the existing `/tasks/:taskId` (view) or `/tasks/:taskId/edit` (edit) routes instead of re-implementing a third task-detail surface in a modal.
   - For **C2** (Home Incidents Live "Raise a task" — a synthetic partial draft, not a real task), treat it as a second consumer of the same `TaskFormDialog` `mode="createFromIncident"` (or a thin `mode="createFromLiveIncident"` variant if the prefill/footer copy differs), since its prefill shape is structurally the same family as Usage B, just thinner.
   - This is a **decision for M10.3 to confirm**, not for M9.1 to implement — flagged here so M10.3 doesn't reopen the M8.4-M8.6 boundary.
4. **`presentation` options needed:** `"page"` (M8.3's existing routed tab — unchanged) and `"modal"` (new, for B and C's callers, reproducing each caller's own header/footer chrome rather than the panel's own suppressed-when-embedded header).

No new package or shared infrastructure is required for this recommendation; `TaskFormDialog` can be built from M8.3's existing form pieces plus the existing `Dialog` primitives already used across M8.5/M8.6/M11.x.

## 4. Open items for the human-decision gate

- **D1 approval requested:** the mode/presentation shape above (§3) as the basis for M9.2.
- **Flag for M10.3 (not blocking M9.1):** whether Usage C's two triggers navigate to the existing Task View/Edit routes (recommended) or get their own modal-only preview, to avoid a third parallel implementation of the task-detail surface.
- **Preserved prototype quirk to carry forward:** the incident-conversion "Create task" button ignores the embedded form's field edits (§1, Usage B). Flagging explicitly so M9.2 doesn't "fix" it without a recorded decision.

## 5. Scope confirmation

- No production code was added or changed for this analysis.
- No packages were added.
- The read-only prototype was not modified.
- `docs/tasks/phases/M9.1.md`, `docs/tasks/MASTER_TASK_LIST.md`, and `docs/tasks/COMPLETED.md` are updated to record this deliverable; no other phase's documentation was touched.
