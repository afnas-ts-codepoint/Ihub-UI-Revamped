# Phase 1 Scope Finalization Report

*All findings below were re-verified directly against `index.html` in this pass (line numbers cited); nothing here is taken on faith from the earlier subagent summaries alone. `app/` was not touched. No files were modified.*

---

## 1. Canonical Create Task implementation

**`CreateTaskPanelDesignChange` is canonical.**

- `ProcessesScreen` (Work Centre) initializes `const [sub, setSub] = React.useState('createTaskDesign')` — line 9375 — so it's the default tab shown.
- The `createTask` subsection entry is explicitly `hidden: true` with the code comment *"old Create Task tab, hidden; the Design Change page replaces it"* (line 9383) and is filtered out of the visible tab strip (`subSections.filter(s => ... && !s.hidden)`, line 9549) — **it cannot be reached through normal navigation.**

**`CreateTaskPanel` is not fully dead, but is not the primary form** — it is still live-wired in exactly one narrow, secondary path: `IncidentWorkspace`'s "Raise a task" action pre-fills a `taskDraft` and opens `CreateTaskPanel` in `embedded` mode as a preview/confirm step before the incident is converted to a task (lines 8674–8854). Outside that one incident→task conversion flow, it is unreachable.

**Exclude from primary migration**: treat `CreateTaskPanel` as legacy/superseded for the *general* Create Task feature. Its embedded usage inside the incident-conversion flow is a separate, smaller behavior that should be scoped explicitly if that flow is migrated (don't silently drop it without confirming the incident→task conversion feature is in scope).

---

## 2. Canonical Task View implementation

**`TaskViewPage` (=`TaskEditPage` rendered with `readOnly:true`) is canonical.**

- `TaskViewPage(props) { return h(TaskEditPage, {...props, readOnly:true}); }` (line 19512), exported as `window.TaskViewPage` (19513).
- App's `task-view` route renders `window.TaskViewPage || window.TaskDetailPage` (line 22441) — since `TaskViewPage` is always assigned, it always wins; `TaskDetailPage` is dead code at this render site.
- Note an odd wrinkle: the *outer* gate for rendering the whole `task-view` route branch checks `window.TaskDetailPage` truthiness, not `TaskViewPage` (line 22432) — cosmetic/harmless since `TaskDetailPage` is always defined too, but worth cleaning up rather than replicating in Phase 2.

**Exclude from migration**: `TaskDetailPage` (line 17372) — a full standalone component, but unreachable in the live routing; it is superseded by `TaskEditPage(readOnly)`.

---

## 3. Canonical dashboard implementation

**`DashboardOCC` is canonical.**

- `TWEAK_DEFAULTS.variation = "C"` (line 22294–22301, confirmed direct read).
- `App`'s dashboard branch: variation `'A'` → `DashboardCommand`, `'B'` → `DashboardFocus`, **else (default `'C'`) → `window.DashboardOCC`** (lines 22419–22429, confirmed direct read).

**Exclude from migration**: `DashboardCommand` and `DashboardFocus` — both fully built, but reachable only via the dev-only Tweaks panel's "Variation" toggle (Command/Focus/Cockpit), never through normal end-user navigation. Treat as abandoned design alternatives, not the product.

---

## 4. Files/folders confirmed excluded from Phase 2 and all future migration analysis

| Path | Status | Evidence |
|---|---|---|
| `app/` | Excluded per this task's own scope (prior migration attempt) | Not inspected, per instruction |
| `ihub/` | **Dead duplicate mirror** | Full copy of root `index.html`/`js`/`assets`/`fonts`; not referenced by anything; `ihub/js/resources-inline.js` has even drifted from root's own copy (hash mismatch confirmed) |
| `css/*.css` (tokens/base/components/layout/responsive) | **Dead — unused by the live app** | Zero `<link>` tags in `index.html` (grep confirmed); zero `"css/"` references in `index.html` (grep confirmed); all styling is injected at runtime by `installGlobalStyles()` |
| Old vanilla-JS files: `js/{app,router,shell,ui,data,icons,screens-core,screens-masters}.js` | **Dead — a separate, earlier no-React/hash-router build** | None of these are in any `<script src>` tag in `index.html` (confirmed: only `resources-inline.js`, `react.js`, `react-dom.js`, `xlsx.core.min.js` are loaded); fully described by `README-html-app.txt`, which documents this defunct architecture, not the current one |
| Old JSX snapshots: `js/00-tokens.js` … `js/13-app.jsx` (incl. `11-occ.js/.jsx`, `12-drawer.js/.jsx`) | **Dead — stale frozen snapshot** | Not in any `<script src>` tag; content proven stale (`13-app.jsx`'s `App` has 0 `route ===` branches vs. 20 in current `index.html`); last touched only at the initial commit |
| `menu-explorations/` (design-canvas.jsx, menus.jsx, nav-data.jsx, iHub Menu Designs.html) | **Excluded — standalone design exploration, unrelated** | Self-contained, loads React/Babel from CDN (unpkg), not the vendored local build; zero references to/from `index.html` |
| `masters-menu-options.html` | **Excluded — standalone design exploration, unrelated** | Own inline `<style>`/`<script>`, not linked from or to `index.html` |
| `ORIGINAL_SOURCE.html` | **Excluded — frozen backup, not the live app** | README.md: "kept as a backup/reference and was not modified"; loads React/ReactDOM from unpkg CDN (not the vendored local files `index.html` uses) — confirms it predates the current local-asset setup |
| `Claude outputs/` | **Excluded — gitignored scratch notes** | `.gitignore` line 22: `Claude outputs/` explicitly excluded; contains prior migration-attempt notes, not source |

**Net result**: the only files that constitute the current prototype's source of truth are `index.html` itself, plus the four assets it actually loads (`js/react.js`, `js/react-dom.js`, `js/xlsx.core.min.js`, `js/resources-inline.js`), plus the raw asset files it falls back to when `window.__resources` entries are absent (`assets/`, `fonts/`, `img/`).

---

## 5. Local vs. live — source of truth confirmed

**Confirmed: local `index.html` is the source of truth, and it is currently ahead of the live deployment**, not behind it.

- Byte diff of local `index.html` (22,623 lines) against the live-deployed `index.html` (20,375 lines, fetched fresh from `https://designs.codepoints.in/ihub-taskManager/`) shows local has strictly more content: extra "Requester Info"/"Assignment Info" sections (7 vs. 2, and 3 vs. 2 occurrences respectively), an extra mobile-overview CSS block absent from live, and other differences — all consistent with local commits dated 2026-09-24 (`01a609b`, `f6fbb2b`, `00f3062`, `273abc8`) that have not yet been deployed.
- This does not change the analysis in §1–3 above — the routing/wiring logic (which Create Task form, which Task View, which dashboard is default) is identical in both versions; only content within already-wired screens differs.
- **Practical implication for Phase 2**: any live-URL spot-check will show a slightly older Requester/Assignment Info state than local. That gap is expected and should not be "fixed" by copying from live — local is authoritative.

---

## 6. Visible controls — functional / no-op / uncertain

*(Classification only, per instruction — no controls have been made functional.)*

**Confirmed functional:**
- Approve/Reject/Send-back/Pin on dashboard `ActionCard`s (mutates local queue state)
- Incident "Action" dropdown items incl. "Raise a task" (real conversion into a task draft) and "Close case"
- `RecordFilter`'s date range (`RFDate` min/max cross-field constraint), quick-flag toggles, applied-filter chips, "Clear all filters"
- `RFExport`'s CSV/Excel export (real Blob download) and Print (real `window.print()`)
- XLSX/CSV bulk upload in Sub Area / Project Category Add modals (parses and merges into the editable row list — confirmed for these two; Task Mapping/Assignment Area presumed identical but not independently re-verified this pass)
- Master listing search box, status-chip toggle (directly flips a row's status), column/chip/filter-field visibility settings, per-page selector
- Dashboard-config JSON import/export (`AdminDashConfig`/`UserDashConfig`) — real `FileReader`/`JSON.parse`/validation
- Task Edit's Reject/Close/Redirect gates (required-field blocking confirmed in code), Resolution-Tasks weight-cap validation (blocks Save above 100%)
- Theme (Paper/Ink) and Language (EN/AR) toggles, layout (Sidebar/Topnav) toggle — all update live state/attributes
- WorkflowDrawer's Approve/Reject/Escalate/Resolve/Dismiss actions (delegate back to the dashboard's queue-mutation functions)

**Confirmed prototype-only / no-op:**
- `TabbedTable`'s pagination footer ("‹ 1 2 3 ›") — always shows all rows regardless of click, across every portal screen using it
- Most `TabbedTable` tab-count badges — hard-coded literals disconnected from the actual row array length (e.g. Overtime "Record Listing (92)" against 6 real rows)
- `ReportsScreen`'s "Search"/result area — explicitly renders "Run search to generate report. Result table will render here." with no implementation
- `WorkflowsScreen`'s "New Rule", per-row/per-step Edit icons, Discard/Save Draft/Publish buttons — all no-ops
- Master listing's Export button (icon-only; unlike `RFExport`, no export actually fires — not independently confirmed to be fully wired, distinct from the confirmed-working `RFExport`)
- Dashboard's "Bulk approve" button in `ApprovalsScreen`'s header (present, wired to nothing)
- CEO Comments modal's footer note "Process owner and assignee are required" — displayed but not enforced by its actual save handler (copy-paste artifact)
- Simulated QR scan — explicitly a random-record picker, not a real scan (acknowledged in-code as intentional prototype behavior, not a bug)
- Team/Attendance screens' "Add" and "…" (dots) buttons — present, not wired

**Uncertain (flagged, not classified with confidence — needs a live-browser pass or product input):**
- Whether Task Mapping / Assignment Area Add modals' bulk-upload actually functions identically to the two confirmed ones (pattern strongly suggests yes, not independently executed/traced this pass)
- Whether theme/accent/language preferences persist to `localStorage` across reloads in the live React build — only `route` persistence was found in code (`safeStore`); `README-html-app.txt`'s claim of persisted theme/language describes the *dead* vanilla-JS build and may not apply here
- PurchasingScreen's Review-modal "Attach"/PO/Quotation "Save" buttons — close the modal but their downstream data effects were not traced to a definitive dead-end or live-end in this pass
- Exact mobile-drawer-nav and RTL interactive behavior at each breakpoint — not clicked through live in this phase (no browser-automation tool was available this session)

---

## 7. Shared-component candidates — reconfirmed

All of the following were reconfirmed as genuinely repeated in the current implementation (not merely a Phase-1 hypothesis):

1. **Modal shell** (header/icon/title/close + scrollable body + sticky footer) — repeated across `MasterModalShell`, `RecordFilter`'s modal, every Master Add modal, `JobOrderModal`, and every `TaskEditPage` modal.
2. **Delete-confirmation dialog** — identical shape in `MasterDeleteModal` and `TasksTable`'s inline delete confirm.
3. **Multi-select chip picker** — three independent implementations (`RecordFilter`'s `multi()`, `TmMultiSelect`, `multiSelectChips`) of the same select-to-add/removable-chip pattern.
4. **Tab-strip / segmented control** — at least 4 hand-rolled reimplementations of the same pill-row visual (`SectionShell` toggle, `L2TabStrip`, `SecondaryNav`, per-screen `seg()` helpers).
5. **File-drop zone** — identical drag/drop + hidden-input markup reused in Task Edit's Attachments/Add-Comment/CEO-Comments and both Create-Task forms.
6. **Accordion card** (`acc()`/`accPanel()`) — copy-pasted per-file rather than shared.
7. **Progress bar** (track+fill div) — hand-rolled in `JobOrderCard`, `SheetRow`, `SLASection`, `WorkflowDrawer`; `ProgressRing` is the one already-shared circular variant.
8. **Chip/status-pill color-lookup tables** (`PRIO_CHIP`, `SEV_COLOR`, `SLA_TONE`) — duplicated verbatim between the dashboard and `WorkflowDrawer` script blocks.
9. **Bulk CSV/XLSX-upload-by-first-column flow** — near-identical logic across the master Add modals.
10. **Timeline/feed renderer** — near-duplicate implementations in the dashboard's `FeedTimeline` and `WorkflowDrawer`'s inline feed block.

---

## 8. Shared-functionality candidates — reconfirmed

1. **`T(en, ar, locale)`** i18n helper — one true implementation exists (line 2614) but is redeclared with a local fallback in ≥2 other script blocks rather than always referenced — candidate to formalize as a single i18n layer.
2. **CSV/Excel export (`RFExport`)** — the one genuinely working export mechanism; candidate to become the sole export utility (several screens have visually identical but non-functional Export buttons).
3. **Date range cross-validation** (`RFDate`'s min/max) — the only real "From ≤ To" enforcement found anywhere; Create Task's start/end dates have **no such validation**, a real gap versus `README-html-app.txt`'s claim.
4. **SLA computation is modeled twice, independently** — the dashboard's `slaOf`/`SLA_TARGET_H` engine and `SLAScreen`'s separate `SLA_LEVELS`/`SLA_MAP` engine use different tier definitions with no shared source of truth — candidate to unify into one SLA domain model.
5. **Required-field validation** is ad hoc per form (`masterFormMissing()`, `locAddMissing()`, various `canSubmit` booleans, `slaCanSave`, the sub-task weight-cap check) — no shared validation utility exists; candidate for a common validation layer.

---

## 9. Decisions requiring human/product confirmation before architecture design

1. **Scope of the incident→task "Raise a task" flow** (which still uses the legacy `CreateTaskPanel` in embedded/preview mode) — confirm whether this narrower flow is in scope for Phase 2, and if so, whether it should be re-pointed at the canonical `CreateTaskPanelDesignChange` form or kept as its own lighter-weight preview.
2. **Fate of decorative/no-op controls** (§6) — which should become real (pagination, tab counts, Reports search, Export buttons, Workflows edit/save actions) vs. remain fidelity-only placeholders in the new app.
3. **Merge or keep separate**: the two disconnected approval-inbox data models (`ApprovalsScreen` vs. `ApproveRequestScreen`).
4. **SLA domain**: unify the dashboard's and `SLAScreen`'s independent SLA engines, or keep them as two distinct domain concepts (they currently model different things — general SLA state vs. compliance/mapping — but need a product call on whether that's intentional or accidental duplication).
5. **Persistence expectations**: confirm whether theme/language/accent are actually expected to persist across sessions in production (only `route` persistence was confirmed in current code) before Phase 2 designs the persistence layer.
6. **Whether to deploy local `index.html` to the live URL before/alongside Phase 2 work**, so future live-UI verification passes aren't checking against a stale deployment.
7. **Bulk-upload parity**: confirm (via a quick manual/live check) that Task Mapping and Assignment Area Add modals' XLSX upload genuinely matches the two confirmed working ones, before Phase 2 assumes uniform behavior across all four.

---

No files were modified. No architecture or migration plan was produced. Awaiting your review before any further phase begins.