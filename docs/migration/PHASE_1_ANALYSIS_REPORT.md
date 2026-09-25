# Phase 1 Analysis Report — iHub Task Manager Prototype

*Scope: current repository outside `app/`. `app/` was not read, searched, or referenced. Primary source: `index.html` (~22,600 lines). Live deployment (`https://designs.codepoints.in/ihub-taskManager/`) used as a secondary visual/behavioral reference and diffed byte-for-byte against local files.*

---

## 1. Executive Summary

The current prototype is a **single self-contained HTML file** (`index.html`, 2.0 MB, 22,623 lines) that boots a React 18 application entirely from ~20 sequential inline `<script>` tags — no build step, no ES modules, no bundler. React/ReactDOM/SheetJS are loaded from local vendored files (`js/react.js`, `js/react-dom.js`, `js/xlsx.core.min.js`); all other JS, all CSS, all fonts, and all images are embedded inline (fonts/logos as base64 in `js/resources-inline.js`, styles injected at runtime via `installGlobalStyles()`). There are **no `<link>` tags and no external CSS files loaded** — the entire design system lives inside one JS string.

The app implements ~120 top-level React components/functions covering: a top-nav/mega-menu shell, three dashboard variants (only one — the "Operational Command Center", `DashboardOCC` — is actually wired live), a Tasks/Work-Centre module (Create/View/Edit, sub-tasks, dependencies, Gantt/timeline), five real Masters CRUD screens (of ~125 total masters items, only 5 have live data — the rest are stubs), and ~15 "portal" business screens (Overtime, Appraisal, Purchasing, Budgeting, Petty Cash, Workflows, SLA, etc.), most of which share two structural templates (`RecordFilter`+`TabbedTable`, and `FilterForm`+`TabbedTable`).

State is 100% local `React.useState` (601 call sites) with **no Context, Redux, or reducer** anywhere — cross-component communication happens via `window.*` globals, a necessity created by each `<script>` tag being an isolated top-level scope. Persistence is `localStorage`-only (theme/language/route/dashboard-layout preferences), guarded in try/catch; almost nothing else is actually persisted — most "Save"/"Submit" actions just flash a toast.

**Key finding — the repository contains three unrelated, non-overlapping implementations**, only one of which is live:
1. **`index.html` (live)** — the React app described above. This is the only thing an end user of the deployed URL sees.
2. **`js/{data,ui,router,shell,screens-core,screens-masters,app,icons}.js` + `css/*.css`** — a complete **earlier, vanilla-JS (no React), hash-routed** rebuild, fully described by `README-html-app.txt`. **Not loaded by `index.html` at all.** Dead code, but substantial (≈8,700 lines) and easy to mistake for the current architecture if `README-html-app.txt` is trusted at face value.
3. **`js/00-tokens.js` … `js/13-app.jsx`** (and duplicates under `ihub/`) — a per-module JSX snapshot of `index.html` frozen at the *initial commit* (2026-09-21). **Also not loaded.** Confirmed stale: `13-app.jsx`'s `App` component has **zero** route branches vs. **20** in the current `index.html`.

Additionally, **the local repository is currently ahead of the live deployment** — `index.html` has ~2,250 more lines locally than what is live, and diff confirms local has extra "Requester Info"/"Assignment Info" content (from uncommitted-to-live commits `01a609b`, `f6fbb2b`, `00f3062`, `273abc8`, all dated 2026‑09‑24) that the live site does not yet show. Per the task instructions this is documented, not resolved.

---

## 2. Repository Structure

```
ihub-taskmanager/                     (repo root — analysed)
├── index.html                        ← THE live entry point (2.0 MB, self-contained React app)
├── ORIGINAL_SOURCE.html               unmodified backup of the original supplied doc (per README.md)
├── masters-menu-options.html          standalone design-exploration doc (mega-menu layout options), unrelated to index.html
├── README.md                          describes an earlier "landing page cleanup" framing — partially stale
├── README-html-app.txt                fully describes architecture #2 (vanilla JS) — describes DEAD CODE, not index.html
├── js/
│   ├── react.js, react-dom.js         vendored React 18 UMD builds — USED by index.html
│   ├── xlsx.core.min.js               vendored SheetJS — USED by index.html (bulk master-data upload)
│   ├── resources-inline.js            base64 fonts/logos, USED by index.html via window.__resources
│   ├── resources-inline.js.bak-...    stray backup file, gitignore doesn't cover it, untracked cruft
│   ├── app.js, router.js, shell.js, ui.js, data.js, icons.js,
│   │   screens-core.js, screens-masters.js
│   │                                  ← architecture #2, vanilla JS/hash-router, NOT loaded by index.html
│   ├── 00-tokens.js … 13-app.jsx      ← architecture #3, stale per-module JSX snapshot, NOT loaded
│   └── 11-occ.js/.jsx, 12-drawer.js/.jsx  compiled+source pairs, part of #3, NOT loaded
├── ihub/                              full duplicate of the above (index.html, js/, assets/, fonts/) — appears to be a stale mirror/backup copy, not referenced from anywhere
├── css/{tokens,base,components,layout,responsive}.css   design tokens for architecture #2 only; NOT linked by index.html (values match index.html's inline tokens, manually kept in sync at some point — now a duplicate source of truth)
├── assets/, fonts/, img/              image/font assets; only some are used directly by index.html (most fonts/logos are inlined as base64 instead, with these files as file:// fallbacks)
├── menu-explorations/                 3 standalone JSX/HTML design-exploration files (CDN React+Babel-standalone, not the vendored local build) — unrelated to index.html
├── .claude/launch.json                VS Code launch config that points at `app/` (npm run dev --prefix app) — irrelevant to this prototype, belongs to the excluded migration
└── Claude outputs/                    gitignored scratch notes from a prior migration attempt (not analysed as source of truth; excluded per gitignore, noted only for completeness)
```

**Entry point (confirmed):** `index.html`, opened directly via `file://` or any static server — hash-based routing needs no server rewrite rules. Boot sequence: `resources-inline.js` → `react.js`/`react-dom.js` → `xlsx.core.min.js` → ~20 inline `<script>` blocks executed top-to-bottom (each defines globals via `Object.assign(window, {...})`) → `mountApp()` at the very end renders `<App/>` into `#root`.

**Confirmed dead/orphaned code** (not reachable from `index.html`, verified via grep for `<script src=`/`<link>` and content divergence): all of `js/{app,router,shell,ui,data,icons,screens-core,screens-masters}.js`, all of `js/00-tokens.js`…`13-app.jsx`, all of `css/*.css`, the entire `ihub/` subtree, `masters-menu-options.html`, `menu-explorations/*`.

---

## 3. Application/Screen Map

| Route | Component | Status |
|---|---|---|
| `dashboard` | `DashboardOCC` (variation C, the only one wired to `TWEAK_DEFAULTS`) | **Live** |
| — variation A/B | `DashboardCommand` / `DashboardFocus` | Built but only reachable via the dev-only Tweaks panel (`variation` toggle), not part of normal navigation |
| `task-view` / `task-edit` | `TaskViewPage` (=`TaskEditPage` readOnly) / `TaskEditPage` | Live |
| `joborders` | `JobOrdersScreen` (Tasks / Work Centre list) | Live |
| `overtime`, `appraisal`, `checklist`, `sla`, `processes`, `workflows`, `reports`, `purchasing`, `budgeting(+/section)`, `pettycash`, `approve`, `notifications` | dedicated `*Screen` components | Live |
| `history(/…)` | `HistoryScreen` | Live (turned out to be a full multi-module audit-log screen, not a stub, per prior migration finding — consistent with this analysis) |
| `masters`, `masters/*`, `masters-list`, `masters-list/*` | `MasterListingMock` or `MasterPagePending` | Live for 5 masters, stub for ~120 |
| `settings-configuration/configuration` | `window.UserConfigScreen` | Live |
| everything else in `NAV_TREE` | `StubScreen` | Placeholder "Module landing" |

---

## 4. Feature Inventory

1. **Authentication** — none present in this prototype (no login screen found in `index.html`); the app boots straight into the dashboard. (Confirmed absence, not a gap in analysis — grep found no login/session UI.)
2. **App shell** — top nav / sidebar switchable layout, mega menu, search (⌘K), notifications, account/theme/language menus, mobile drawer.
3. **Dashboard (Operational Command Center)** — stat strip, live clock/hero carousel, tabbed sub-views (Overview/Assigned/Incidents/Work Centre/Budgets/Payment settlement/Purchasing/SOP Checklist/SLA/Analytics & Reports), recommended-next-action engine, department workload heatmap, incident center, live feed, dashboard widget configuration (admin/user-scoped, drag-drop, JSON import/export).
4. **Tasks / Work Centre** — Create Task (2 competing variants), Task List (table/board/card views), Task View, Task Edit (sub-tasks, dependencies, comments, log notes, history/Gantt, CEO comments, approve/reject/close/redirect).
5. **Masters** — mega-menu of ~125 master-data types across 4 categories; 5 have real CRUD (Project Category, Sub Area, Assignment Areas, Task Mapping, Machine Master implied); shared listing/filter/add/edit/delete/bulk-XLSX-upload machinery.
6. **Finance & Budgets** — Budgeting dashboard, Purchasing (Requests/Review/PO/Quotations), Petty Cash (Request/Reimburse/Settle).
7. **HR** — Overtime, Appraisal, workforce stats (Attendance/Team screens), (Payroll/Leave referenced only as unimplemented `StubScreen` links).
8. **Quality & Compliance** — Checklist, Observations, Enquiry, Snag List, Incident Workspace.
9. **Workflows** — per-department task-routing/operational-flow/SLA-escalation designer.
10. **SLA & Compliance** — priority framework, work-area mapping, monthly compliance reporting.
11. **History** — cross-module audit log.
12. **Reports** — 17 canned report definitions, mostly placeholder ("Run search" produces no output).
13. **Notifications** — outbound notification log (display-only).
14. **Floating feedback widget** — auto-detects current page/tab context, files a mock feedback ticket.
15. **Theme/Language/Layout tweaks** — dev-facing panel (Paper/Ink, Command/Focus/Cockpit dashboard variant, Sidebar/Topnav layout, accent color, card style, English/Arabic).

---

## 5. Navigation Map

Source of truth: `NAV_TREE` (`index.html:2460`), compiled at runtime into `NAV_INDEX`/`NAV_ITEMS` (path/ancestor helpers at 2592–2613).

- **Home** → Overview / Approvals / Assigned / Incidents / Tasks / Live Feed / Company / **Analytics & Reports** (17 leaf reports across 7 groups).
- **Finance & Budgets** → Dashboard, Budgeting.
- **HR** → Dashboard, Workforce Statistics, **Overtime** (7 children), Investigations, Violations, Loan, End of Probation, Exit Interview.
- **Appraisal** (leaf).
- **Quality & Compliance** → Dashboard, SLA & Compliance, Observations, Quality Assurance Checklists (8 children).
- **Settings & Configuration** (topbar-only, not sidebar) → Configuration, Work Centre, Finance & Budgets, Workforce, Quality & Compliance.
- **History** → Work Centre (7), Finance & Budgets (5), HR (5), Appraisal, Quality & Compliance (2), Purchasing, SOP Checklist.
- **Workflows** (leaf).
- **Masters** (mega-menu overlay, click-to-open not hover) → 4 categories (Admin 26 / General 21 / HR 16 / Operation 15 = 78 items) — plus a *separately maintained, older* flat 47/48-item, 7-column grid (`MASTERS_COLUMNS`/`MASTERS_ITEMS`) still present in code as a comparison artifact.
- **Masters (List)** — a deliberate duplicate of the Masters tree, wired as a plain nav item + `SecondaryNav` tab strips instead of a mega-menu overlay, with distinct route ids so both can coexist (explicit code comment confirms this was built for client comparison purposes).

**Screen-switching mechanism:** single `route` string in `App` state (`useState`), persisted to `localStorage` (`ihub.route`) with an alias map for renamed routes; no URL/hash sync (confirmed — unlike the dead vanilla-JS build, which *did* use hash routing). Deep-linking by URL is therefore **not currently possible** in the live React build; only `?ihubPreview=taskScope` is special-cased for internal preview purposes.

---

## 6. Component Inventory

~120 top-level functions/components across the file. Notable groups:

- **Icon system**: `Icon` base wrapper + `I` registry of **64 named SVG icons** (24×24 viewBox, 1.6 stroke, `currentColor`), plus 4 aliases.
- **Primitive widgets** (`index.html:1098–2180`): `Stat`, `Sparkline`, `ApprovalCard`, `ListRow`, `SectionHead`, `RecordHUD`, `RFExport`, `RFDate`/`window.__DateField`, `RecordFilter`, `SectionReport`, `SectionShell`, `ProgressRing`, `SegmentBar`, `BarChart`, `Calendar`, `TimelineItem`, `ModuleTile`.
- **Shell**: `Logo`, `NavTree`, `Sidebar`, `TopNavItem`, `MegaMenuNavItem`, `TopNav`, `SearchBox`, `ThemeToggle`, `NotificationsBell`, `TopBarActions`, `Avatar`, `PageHeader`, `L2TabStrip`, `SecondaryNav`, `Shell`, `Breadcrumbs`, `ContextPicker`.
- **Masters**: `MasterFilterModal`, `PcCategoryAddModal`, `SubAreaAddModal`, `TmMultiSelect`, `TaskMappingAddModal`, `AssignmentAreaAddModal`, `MasterAddModal`, `MasterPagePending`, `MasterModalShell`, `MasterRecordForm`, `MasterViewModal`, `MasterEditModal`, `MasterDeleteModal`, `MasterListingMock`.
- **Dashboard**: `DashboardCommand`, `DashboardFocus`, `AiSubscriptionMenu`, `PulseStrip`, `RecommendedNextAction`, `ActionCard`, `ActionList`, `JobOrderCard`, `IncidentCard`, `IncidentCenter`, `FeedTimeline`, `LiveFeed`, `SheetRow`, `HeroCarousel`, `HomeTopBanner`, `SLASection`, `WorkflowDrawer`.
- **Settings/config**: `AdminDashConfig`, `AdminTaskDashConfig`, `UserDashConfig`, `DashboardLayoutView`, `UserConfigScreen`.
- **"Deep screens"**: `ApprovalsScreen`, `TeamScreen`, `AttendanceScreen`.
- **Portal screens** (shared `FilterForm`/`TabbedTable`/`RecordFilter` template): `OvertimeScreen`, `AppraisalScreen`, `ChecklistScreen`, `IncidentWorkspace`, `ObservationsView`, `EnquiryView`, `SnagListView`, `ProcessesScreen`, `ReportsScreen`, `PurchasingScreen`, `BudgetingScreen`(+`NewBudgetView`/`BudgetSheetView`/`ActivityMasterView`), `PettyCashScreen`, `ActionSheetScreen`, `ApproveRequestScreen`, `NotificationsScreen`.
- **Tasks module**: chart primitives (`Donut`,`HBar`,`VBars`,`Bar`,`Gantt`), `Workload`/`WorkloadHeatmap`, `TasksTable`, `JobOrderModal`, `Board`, `ListView`, `JobOrdersScreen`, `DependencyReminderModal`, `TaskDetailPage`, `TaskEditPage`/`TaskViewPage`, `CreateTaskPanel`, `CreateTaskPanelDesignChange`, `AddSupplierPanel`, `CreateActionSheetPanel`, `ActionSheetSection`.
- **Workflows**: `WorkflowsScreen` + helpers (`durMins`, `fmtTotal`, `Toggle`, `Field`, `Select`).
- **SLA**: `SLAScreen`.
- **Misc**: `FeedbackWidget`, `TweaksPanel`/`TweakGroup`/`Segmented`, `App` (root).

**Note on stated vs. actual component names**: `ResolutionTasksModal`, `SubTaskHistoryModal`, `CeoCommentsModal` — referenced by name in prior migration memory/documentation — **do not exist as separate named components**; they are inline modal JSX blocks inside `TaskEditPage`, gated by local booleans (`showResolutionTasks`, `showSubTaskHistory`, `showCeo`). This is a confirmed finding, worth flagging for Phase 2 naming.

---

## 7. Shared Component Candidates

Strong candidates (structurally repeated ≥3 times, verified by direct inspection):

1. **Modal shell** — header (icon chip + title + close) / scrollable body / sticky footer. `MasterModalShell` already half-factors this, but is re-implemented by hand in: `RecordFilter`'s modal, every Master Add modal, `MasterDeleteModal`, `JobOrderModal`, and every `TaskEditPage` modal (CEO Comments, Approve/Reject/Close/Redirect, Add Dependency, Sub Task History, Copy/Move).
2. **Delete-confirmation dialog** — identical shape in `MasterDeleteModal` and `TasksTable`'s inline delete confirm.
3. **Multi-select chip picker** — three independent implementations of the same "select-to-add + removable chip" pattern: `RecordFilter`'s `multi()`, `TmMultiSelect`, and `multiSelectChips` (Create Task forms).
4. **Tab-strip / segmented control** — at least 4 separate hand-rolled implementations of the same "pill row on `--paper-2`" visual: `SectionShell`'s Section/Report toggle, `L2TabStrip`, `SecondaryNav`'s segmented tier, and per-screen `seg()` helpers (Priority/Severity/Internal-External toggles).
5. **File-drop zone** — dashed border + folder icon + "click or drag" copy, reimplemented identically in `TaskEditPage` (Attachments, Add Comment, CEO Comments) and both Create-Task variants.
6. **Accordion card** (`acc()`/`accPanel()`) — copy-pasted per-file in `JobOrderModal`, `CreateTaskPanel`, `TaskEditPage`.
7. **Progress bar** (track + fill div) — hand-rolled inline in `JobOrderCard`, `SheetRow`, `SLASection`, `WorkflowDrawer`'s resolution progress — vs. the one already-shared circular variant, `ProgressRing`.
8. **Chip/status-pill family** (`chip ok/bad/warn/accent/info`) — consistent CSS recipe, but the color-lookup tables (`PRIO_CHIP`, `SEV_COLOR`, `SLA_TONE`, `STATUS_PILL`) are duplicated verbatim across the DashboardOCC IIFE and the WorkflowDrawer IIFE rather than shared.
9. **Bulk CSV/XLSX-upload-by-first-column** flow — near-identical `readFile`/`applyNames` logic in `PcCategoryAddModal` and `SubAreaAddModal` (and by inference the other two master Add modals).
10. **Timeline/feed renderer** — `FeedTimeline` (dashboard) and the WorkflowDrawer's inline feed block are near-duplicate dot+line+card timeline implementations.
11. **Modal-open body-scroll-lock** `useEffect` pattern — repeated per-modal in `PurchasingScreen` (3 separate instances) rather than one shared hook.
12. **`pcMatchRow`/`pcRows` filter-by-substring+dept+status helper** — reimplemented independently in `PurchasingScreen` and `PettyCashScreen`.

---

## 8. Shared Functionality Candidates

- **`T(en, ar, locale)`** i18n helper — already a single shared function (`index.html:2614`), but re-declared with a fallback in at least 2 other script blocks (`window.T || (...)`) rather than always imported — a candidate to formalize as one true i18n layer in Phase 2.
- **SLA computation** (`slaOf`, `slaDur`, `slaLabelOf`, priority/due scoring in `scoreAction`/`scoreIncident`) is centralized for the OCC dashboard, but `SLAScreen` maintains an **entirely separate, non-shared** SLA data model (`SLA_LEVELS`/`SLA_MAP`/`SLA_DEPTS`) with different tier definitions — candidate to unify into one SLA domain model.
- **CSV/XLSX export** — one real implementation (`RFExport`, `index.html:1457`) building Blob+`<a download>` for CSV/Excel and falling back to `window.print()` for "PDF"/"Print" (no real PDF generation) — this is the only export mechanism and should become the canonical one (several other screens have visually-identical but non-functional Export buttons, e.g. `MasterListingMock`).
- **Date range cross-validation** (`RFDate`'s min/max wiring in `RecordFilter`) is the only real "From ≤ To" enforcement found — worth generalizing since the Create-Task start/end dates have **no such validation** despite the README claiming "date-order validation" exists (see §22, Live vs. code discrepancy).
- **Deterministic seeded mock-data generation** — some datasets are fixed literals (most portal screens), others are computed/random per load (Tasks dashboard "History" panel, QR-scan simulation's random `LOC_REGISTRY` pick) — inconsistent approach worth standardizing (a single seeded-PRNG utility) before Phase 2 builds a real mock-data layer.
- **Required-field validation** is currently ad hoc per form (`masterFormMissing()`, `locAddMissing()`, `canSubmit` booleans, `slaCanSave`, resolution-tasks weight check) — no shared validation utility exists.

---

## 9. State Inventory

- **Pattern**: pure `React.useState` (601 call sites) + prop drilling (`locale`, `onRoute` passed down everywhere). **Zero** `useContext`/`useReducer`/Redux/Zustand usage confirmed by grep (`createContext` count = 0).
- **`useEffect`**: 74 call sites, narrowly used for: DOM listener wiring (click-outside/Escape/scroll/resize for popovers and date pickers), body-scroll-lock while a modal is open, syncing internal state from a controlling prop (e.g. `BudgetingScreen.section` from `sectionProp`), and one-time global-function registration (`window.__ihubEditTask`, `window.__ihubViewTask`, `window.__ihubGoToView`, `window.__ihubTrack`, `window.__ihubToggleTheme`).
- **`useMemo`**: 2 sites only; **`useCallback`**: 6; **`useRef`**: 22 — i.e., almost no derived-data memoization; filtering/sorting is recomputed inline via `.filter()`/IIFEs on every render.
- **Root app state** (`App`, `index.html:22318`): `state` (theme/variation/layout/accent/card/locale — the "Tweaks" bag), `route`, `tweakVisible`, `viewTask`/`viewTaskFrom`, `editTask`/`editTaskFrom`, `homeView`.
- **Cross-script-block "global state"** (necessitated by isolated `<script>` scopes): `window.__ihubEditTask`, `window.__ihubViewTask`, `window.__ihubGoToView`, `window.__ihubToggleTheme`, `window.__ihubTrack`, `window.taskDashConfig`/`setTaskDashConfig`, `window.__occToast`, plus dozens of `Object.assign(window, {...})` component/data exports (this is effectively the app's only "shared state" mechanism besides localStorage — see §18).
- **Per-screen local state is the norm**, e.g. `DashboardCommand` and `DashboardFocus` each keep their *own separate local copy* of the global `APPROVALS` array rather than sharing one source of truth — approving/rejecting in one dashboard variant has no effect on the other (confirmed duplication, not a bug given only one variant is ever live at once, but a risk for Phase 2's real state layer).

---

## 10. Mock Data Inventory

| Dataset | Location | Shape (key fields) | Notes |
|---|---|---|---|
| `ACTIONS` | 12135 | id, kind, title, owner, dept, amount/amountNum, priority, dueState, due, status, recommended, reason, impact, attachments[], steps[] | 10 fixed items; drives Approvals |
| `INCIDENTS` | 12287 | id, icon, severity, status, owner, location, sla, progress, feed[] | 5 fixed items, embedded activity feed |
| `JOBORDERS` | 12357 | id, title, location, dept, kind, priority, status, due, partner, steps[] | 6 fixed items (Tasks) |
| `ASSIGNED_SHEETS` | 12275 | id, title, owner, dept, location, status, due, progress | 3 fixed items |
| `APPROVALS` | 2183 | budget/overtime/vendor/leave/hiring/expense requests | 6 fixed items, used by both dashboard variants independently |
| `TEAM` | 2244 | name/role/status/location/metric | 8 fixed items |
| `ANNOUNCEMENTS`, `CALENDAR_EVENTS` | 2301/2317 | company news / dated events | 3 / 5 fixed items |
| Masters seed rows | `MASTER_MOCK_ROWS`, `PC_CATEGORY_ROWS`, `AA_AREA_ROWS`, `TM_MAP_ROWS`, `SA_SUB_ROWS` | 3633–3623 | per-master seed data, ~5-10 rows each |
| Portal-screen rows | dozens of local literal arrays, one per screen (e.g. Overtime's 6 rows, Purchasing's `rows`/`poRows`/`quoteRows`/`revExtra`) | — | Fixed literals throughout, no shared generator |
| `SLA_LEVELS`, `SLA_MAP`, `SLA_DEPTS`, `SLA_DEPT_ITEMS`, `SLA_PERF` | 21666–21791 | priority tiers, work-area mapping, per-dept compliance rollups | separate/parallel to the OCC dashboard's own SLA model (§8) |
| `DEPTS`/`DATA`/`TX_CATEGORIES` (Workflows) | 21201–21353 | department → task-type routing rules + operational steps | |

**Relationships**: datasets are **not relationally linked** — `ACTIONS`/`INCIDENTS`/`JOBORDERS` use independent prefixed string IDs with no foreign keys; the one exception is `SLA_OVERRIDE` (12406), which keys directly by these same IDs to hand-tune specific demo records. Cross-screen "tracking" is done by ID-snapshot copying into a `trackedTasks` array, not real references.

**Confirmed inconsistency**: `ApprovalsScreen` (uses `APPROVALS`) and `ApproveRequestScreen` (uses a wholly separate, differently-shaped 4-row literal set mixing "New Budget"/"Task"/"Projecting Revenue") are two unconnected approval inboxes with no shared data model — likely a genuine prototype artifact from iterative design rather than an intentional split; **flag for Phase 2 clarification**, not to be silently merged.

**Confirmed pattern**: many `TabbedTable` tab counts are **hard-coded literals disconnected from the actual row array length** (e.g. Overtime's "Record Listing (92)" tab against only 6 real rows; Checklist's "Other Checklist (23)" against 4 rows). This is cosmetic/decorative in the current prototype, not computed — important for Phase 2 to decide whether to preserve the visual scale or compute real counts.

---

## 11. Forms and Validation Inventory

- **Create Task** (two competing implementations — `CreateTaskPanel` and `CreateTaskPanelDesignChange`, the latter labeled in-code as superseding the former): subject, project category, description, category/flow toggles, task type, priority/severity, start/end dates, multi-select location/zone/area/sub-area chips, auto-filled asset fields (via `lookupLocProfile`), process owner + matrix-partner chips, touchpoint/KPI/risk/impacted-area, requester info (read-only/partially editable), reference numbers, labels, team assignment (auto-suggested + editable), checklist items, dependencies, attachments (drag-drop, `.jpg/.jpeg/.png/.pdf`), simulated QR scan (random `LOC_REGISTRY` pick, **not a real scan**).
  - **Confirmed**: required-field validation exists **only** in the Design-Change variant's repeatable-location-drawer flow (`locAddMissing()`); the main Create-Task submit (`onCreateTask`) has **no blocking validation** — it unconditionally creates the record.
  - **Confirmed absent**: start/end **date-order validation** — no code path compares the two dates, despite `README-html-app.txt` claiming this exists. This is a **discrepancy between documentation and code** worth flagging (see §22/23).
- **Task Edit** (`TaskEditPage`): SLA target-completion edit (requires date + justification text), Reject/Close (require ≤500-char non-empty remarks), Redirect (requires process owner + assignee — footer note on CEO Comments modal repeats this same text but it is **not actually enforced** there, a copy-paste artifact), Add Dependency (category + lead time required; Showstopper reveals a required Impacted Date), Resolution Tasks/"Update Sub Tasks" (**hard rule: total sub-task weight must not exceed 100%**, blocks Save with a warning banner).
- **Master Add/Edit modals**: per-mode required-field sets enforced via `masterFormMissing()` — e.g. Sub Area needs Location+Zone+Assignment Area+≥1 name; Task Mapping needs Location+Zone+Area+SubArea+Owner Dept.
- **Observations/Enquiry forms**: `EnquiryView` has the most complete validation found (`Subject.trim() && priority && !needCaption`); `ObservationsView`'s equivalent form is **inconsistent** — file captions are required but the Subject field is not, despite looking equally required in the UI.
- **Dashboard config import** (`AdminDashConfig`/`UserDashConfig`): the only screens with **real JSON file import validation** — `JSON.parse` wrapped in try/catch, checks `Array.isArray(c.ids)`, sanitizes against the current widget catalogue before applying.

---

## 12. Tables/Search/Filter/Sort/Pagination Inventory

- **`TasksTable`** (16379): drag-to-reorder columns, group-by (Status/Priority/Assignee/Department), card-vs-table layout toggle, clickable progress segments, delete-confirm modal (rows hidden client-side, not truly deleted). No visible search/CSV-export/pagination in the table component itself (lives in the surrounding screen shell).
- **`MasterListingMock`** (4520): search box, status chip filter (toggle a row's status directly from the table), column-visibility + chip-visibility + filter-field-visibility settings panel, per-page selector, "Showing X of Y" pagination footer, row actions (View/Edit/Delete), Export button (icon-only, no format menu — unlike `RFExport`).
- **`TabbedTable`** (8070, shared by all "portal" screens): tab strip with counts (frequently decorative, see §10), real `<table>` with custom per-column `render`, but **pagination footer buttons are non-functional** ("1 2 3" always shows all rows regardless of click) and there is **no column sorting** anywhere in this shared component.
- **`RecordFilter`** (1577, the app's primary filter modal): quick-flag toggles (Showstoppers/Has dependencies/Overdue/Owner-date-exceeded/Owner-date-empty), subject search, assignee/matrix-partner multi-select, location/zone multi-select, category/priority/kind-specific fields, date-range (`RFDate`, with real min/max cross-field constraint), applied-filter chips, "Clear all".
- **`FilterForm`** (7947, used only by `ReportsScreen`): field grid — largely decorative/non-wired (no `value`/`onChange` on most call sites).
- **Purchasing/Petty Cash**: the only screens with **real client-side substring+dept+status filtering logic** (`pcMatchRow`/`pcMatch`), independently reimplemented in each screen rather than shared.
- **Bulk-select + batch actions**: `ActionList` (dashboard approvals) supports select-all/select-N + batch approve/reject; `MasterListingMock` and `TasksTable` do not have bulk multi-row actions beyond the master listing's per-row status toggle.

---

## 13. Styling and Design Token Analysis

All styling is injected at runtime by `installGlobalStyles()` (`index.html:134`), a single template-literal `<style>` block — **no external CSS file is loaded by the live app.**

- **Font stack** (Tamdeen Entertainment Digital Guideline, cited explicitly in comments): Latin primary "29LT Zarid Sans" (ExtraLight/Regular/Bold), Arabic primary "GE SS" (Light/Medium/Bold/Light-Italic) with "BCN Arabic Rounded" as a secondary Arabic face, "Cormorant" italic reserved for a magenta emphasis motif (`<em>`), "Myriad Pro"/"Calibri" as guideline-mandated fallbacks. **Numerals are always forced to Calibri/Carlito** via a `unicode-range`-scoped `@font-face` (`NumCalibri`) layered under the text fonts — a specific, deliberate guideline rule (§04/05), applied through `.num`/`.tnum`/`[data-num]` utility classes.
- **Color tokens** (`:root`, ~40 CSS custom properties): `--bg/--bg-2/--bg-3`, `--paper/--paper-2`, `--line/--line-2`, `--text` through `--text-4`, semantic `--ok/--warn/--bad/--info`, `--accent` (+`-dim`/`-ink`, set live by the app from one of 3 brand `ACCENTS`), full Tamdeen brand palette (`--brand-purple/indigo/red/orange/yellow/lilac/pink/periwinkle/mint`), and a distinct "interactive blue" family (`--blue-dark/med/light/soft`) explicitly separated from the magenta brand accent ("Magenta stays a brand accent, never a button fill" — comment at line ~412).
- **Radii**: `--radius-sm(6px)/--radius(8px)/--radius-lg(10px)/--radius-xl(14px)` — "6px controls / 8px cards" per guideline component anatomy.
- **Card style variants**: `soft`/`outlined`/`flat`, toggled via `body[data-card]` attribute, driving `.card` background/border differently.
- **Button system**: primary (Medium Blue fill)/secondary (outlined blue)/ghost/tertiary (text-only)/danger (Signal Red), 3 sizes (lg/default/sm), disabled state, guideline-cited "one primary per view" and "labels sentence case, never all-caps" rules encoded as comments.
- **Focus ring**: explicit 3px magenta ring (`--accent-dim` outline + `--accent` box-shadow) — an accessibility-relevant guideline requirement.
- **Duplication finding**: `css/tokens.css` (and sibling `base.css`/`components.css`/`layout.css`/`responsive.css`) define an **overlapping but separately-maintained** token set for the dead vanilla-JS build — comment in `css/tokens.css` states "Values taken from the existing project's design system — not invented," confirming it was derived from `index.html`'s tokens at some point and then frozen; it has since drifted (not verified token-by-token, flagged as a further-investigation item, §23) and is **not the source of truth**.

---

## 14. Theme Analysis

- Two themes: **"Paper"** (light, default) and **"Ink"** (dark), toggled via `body[data-theme="ink"]` attribute set in `App`'s `useEffect` (`index.html:22386`) from `state.theme`.
- Ink theme uses **OKLCH color space** for its neutral scale (`--bg`, `--paper`, `--text`, etc.) and remaps semantic colors (`--ok/--warn/--bad/--info`) for dark-surface contrast — Paper theme uses plain hex.
- Logo swap is theme-driven via CSS (`.brand-logo-color`/`.brand-logo-white`, `.brand-ihub-color`/`.brand-ihub-white` shown/hidden by `body[data-theme="ink"]`).
- Task-status-pipeline styling (`.tstage*`) has explicit, separate dark-mode overrides beyond the generic token remap.
- Theme (plus accent/card/layout/locale) persists via the `TWEAK_DEFAULTS`/`state` object — **not found to be saved to localStorage independently**; only `route` is explicitly persisted (`safeStore`). This is a discrepancy worth confirming against the live site's actual persistence behavior in Phase 2 (README-html-app.txt claims theme/language persist via localStorage, but that describes the *dead* vanilla-JS build, not this React build — **likely a stale claim**, flagged for further investigation, §23).
- Also exposed but not part of the main app flow: 3 accent colors (`purple`/`indigo`/`crimson` — Tamdeen Magenta / Deep Plum / Signal Red) and 3 card styles, both only reachable via the dev-only Tweaks panel.

---

## 15. Language/RTL Analysis

- **No i18n library.** Every bilingual string is manually threaded through a single helper `T(en, ar, locale) => locale === 'ar' ? ar : ar` (`index.html:2614`), passed as a `locale` prop through nearly every component tree; two other script blocks redeclare a local fallback (`window.T || (...)`).
- **RTL is attribute-driven**: `body[dir="rtl"]` set from `state.locale === 'ar'` in `App`. Layout uses **CSS logical properties throughout** (`insetInlineStart/End`, `marginInlineStart`, `borderInlineEnd`, `paddingInlineStart/End` — 152+ occurrences file-wide) rather than physical `left/right`, which is the correct approach for RTL support and confirms RTL was designed in from the start, not bolted on.
- Arabic gets **+5% line-height** (`body[dir="rtl"] { line-height: 1.58 }` vs. 1.5 default) and switches to the Arabic font stack (`--font-arabic`) and drops the italic-emphasis motif in favor of upright bold (`body[dir="rtl"] em { font-style: normal; font-weight: 700 }`) — both explicit guideline rules in comments.
- `RFDate`'s calendar popover hand-maintains **Arabic month/day name arrays** for the custom date picker (native `<input type=date>` cannot be localized/themed consistently, hence the custom component).
- RTL detection utility duplicated in at least two places (`document.documentElement.dir === 'rtl' || document.body.dir === 'rtl'`, and separately `document.documentElement.getAttribute('dir')==='rtl' || document.documentElement.lang==='ar'`) — worth unifying.

---

## 16. Responsive Behavior Analysis

- Breakpoints defined in the same `installGlobalStyles()` block: **1040px** (top-nav collapses to hamburger + slide-in drawer; task-stage pipeline switches to horizontal scroll), **760px** (`.hide-sm` utility, a dedicated `#ihub-mobile-overview` phone-layout override style block specifically for the Overview/Home screen — action cards restack, workload heatmap gets a sticky name column and compressed grid), **480px** (top bar keeps only the wordmark, hiding brand-lockup logos to fit hamburger + action icons on one line).
- Mobile drawer nav (below 1040px) replaces the inline top-nav row entirely — confirmed component: `TopNav`'s mobile branch (`index.html:3023`+).
- Popovers/menus that can't rely on media queries (mega menu, date picker, search dropdown) instead **measure `getBoundingClientRect()`/`window.innerWidth`/`innerHeight` in JS** and portal-position themselves, clamping to the viewport — a consistent but non-componentized pattern (§7, item 12 in shared candidates via the "portal-positioned popover" pattern noted by one subagent).
- No `matchMedia` JS usage found (confirmed via grep, 0 hits) — all breakpoint logic is CSS-only except the JS-measured popover positioning above.

---

## 17. Import/Export Analysis

- **XLSX/SheetJS (`window.XLSX`, vendored `js/xlsx.core.min.js`) — confirmed used**, exclusively for **bulk master-data upload** (Sub Area and Project Category Add modals confirmed directly; Task Mapping/Assignment Area presumed identical pattern from shared option lists, not independently confirmed — flagged for verification in Phase 2): parses `.xlsx/.xlsm/.xlsb/.xls` via `XLSX.read` + `sheet_to_json({header:1})`, taking column 0 of each row; `.csv`/plain-text files are parsed separately via regex split. **No distinct preview/validate step** — parsed values are merged directly into the same editable row-list used for manual entry, which *is* the de facto preview (user can edit/remove before saving). **No real persistence** — Save just closes the modal; nothing writes back to the underlying seed arrays.
- **CSV/Excel export (`RFExport`, `index.html:1457`)** — the one real export implementation: builds a quoted-CSV string, wraps in a `Blob` with the correct MIME type, triggers via synthetic `<a download>` click. "PDF document" and "Print" options both just call `window.print()` — **no real PDF generation**. Falls back to canned `REPORT_DEFS` data (not necessarily the on-screen filtered rows) when no explicit dataset is passed.
- **Dashboard-config JSON import/export** (`AdminDashConfig`/`UserDashConfig`) — the only other real file I/O: exports a `Blob` of `JSON.stringify({scope,config})`; imports via `FileReader.readAsText` + `JSON.parse` + `Array.isArray` validation + sanitization against the current widget catalogue.
- **Client-side sample-file generation**: `ctpSampleAttachments` (canvas-drawn PNG + hand-built PDF) and a "Download Sample CSV" link (built from a literal string via `Blob`) — both entirely client-side, no network calls anywhere in the codebase (confirmed — no `fetch`/`XMLHttpRequest` found).

---

## 18. Business Rule Inventory

- **SLA policy** (dashboard): per-kind target hours (budget-release 24h, purchase 48h, action-sheet 8h, petty-cash/budget 72h, overtime 24h, contract 120h, leave 48h; job orders 8–96h by priority); state thresholds `breached` (left ≤ 0), `at-risk` (elapsed/target ≥ 0.75), else `ok`.
- **Prioritization score** (Recommended Next Action): `priority weight + due weight + log10(amount)×5 (capped 25) + SLA bonus (breached +30 / at-risk +12)`; incidents: `severity weight + (breached +50 / at-risk +25)`.
- **Escalation**: manual action-escalation forces `priority:'critical', dueState:'today'`; incident escalation bumps severity one step up a fixed ladder (`low→medium→high→critical`).
- **5-tier workload heatmap color ramp** (`WL_LEGEND`): Low/Med/High/V.Hi/Crit — a deliberately finer-grained scale than the standard 3–4-tier chip system elsewhere, added specifically for this heatmap (confirmed as a previously-added token, `--crit`, per the migration memory's Phase 5 note — consistent finding).
- **"Recommended next action" surfacing rule**: item is promoted to the top pick if overdue/due-today, critical/high priority, or financial impact ≥ KWD 40,000.
- **Sub-task weight rule**: total sub-task weight must not exceed 100% (blocks save).
- **Dependency reminder window**: dependencies due within the next 5 working days (Fri–Sat weekend) or already overdue trigger a reminder popup on Task View/Edit open (2s delay on Edit, immediate on View).
- **SLA clock rules** (`SLAScreen`, distinct model from the dashboard's): clock starts at approval/creation or helpdesk log; Response = time to a qualified technician + make-safe; Resolution = full restoration/close, with an explicit carve-out that making an area safe within the Critical/High resolution window still counts as "SLA met" if parts are on backorder (a follow-up work order covers the permanent fix); timer pauses only on "Pending Client Action"/"Pending Parts" (both requiring management approval); Critical/High measured 24/7, Medium/Low only during operating hours.
- **Workflows rule precedence**: "Rules resolve top-to-bottom. The first rule whose task type, trigger label and condition all match decides the destination and SLA" (explicit code comment).
- **Escalation-on-breach** (Workflows): escalates to the next step's owner, or "Department Head" if the last step — computed at render time, not stored.
- **Masters-with-real-pages rule**: explicitly, only 5 of ~125 master types render real data; everything else is a deliberate placeholder (explicit code comment: "Every other item stays listed in the Masters menu... but opens a placeholder rather than the sample records table").
- **QR scan is an acknowledged simulation** (explicit code comment) — picks a random registry entry, no real camera/backend.
- **Currency conversion** (Purchasing quotations): fixed FX table keyed to "CBK reference rate" with an explicit note that it's user-editable if the supplier states a different figure.
- **Redirect gate**: Process Owner and Assignee both required (enforced on Redirect; the same text appears as an unenforced label on CEO Comments — a UI/logic inconsistency, not a business rule).

---

## 19. Browser/DOM/Storage Dependencies

- **`localStorage`** (guarded in try/catch everywhere via a `safeStore` wrapper, or ad hoc try/catch): keys confirmed — `ihub.route`, `ihub.admincfg.dash`, `ihub.usercfg.dash`, `ihub.dash.<id>.default`, `ihub.taskdash.default`, `ihub.taskdash.me`, plus (per one subagent's finding, not independently re-verified) `ihub.taskdash.scopes` and `ihub.dash.<id>.library`. **`sessionStorage`: zero usage confirmed** (grep = 0 hits).
- **No cookies, no IndexedDB, no Web Workers, no Service Worker** found.
- **`document.createElement('a')` + `Blob` + `URL.createObjectURL`** — the CSV/JSON export and sample-file-download mechanism throughout.
- **`FileReader`** — used for CSV/XLSX bulk upload parsing and JSON dashboard-config import.
- **Canvas API** — used once, to synthesize a demo PNG attachment (`ctpSampleAttachments`).
- **`window.postMessage`** — a two-way "edit mode" bridge (`__activate_edit_mode`/`__deactivate_edit_mode` inbound, `__edit_mode_available`/`__edit_mode_set_keys` outbound to `window.parent`) — used to show/hide the Tweaks panel and report tweak changes when the page is embedded in an iframe (evidently a design-tool/editor integration, not an end-user feature).
- **`window.addEventListener('error'/'unhandledrejection')`** — a diagnostic overlay (`__ihubShowErr`) paints any uncaught error to a fixed full-screen `<div>` instead of a blank page — a deliberate dev/QA aid, not user-facing.
- **No `fetch`/`XMLHttpRequest`/WebSocket anywhere** — fully confirmed offline/mocked, consistent with `README-html-app.txt`'s "no backend" framing (that portion of the README is accurate for architecture, even though its file-layout section describes the dead vanilla build).

---

## 20. Duplication Findings

1. **Three parallel, non-interoperating "architectures" in one repo** (§2) — the single largest duplication risk for a Phase 2 migration: a naive "read everything in `js/`" approach would pull in ~8,700 lines of dead vanilla-JS code and a stale JSX snapshot, neither of which reflects the live app.
2. **Design tokens defined twice** — inline in `index.html` (live) and in `css/tokens.css` (dead, for the vanilla build) — drift between them not fully quantified (§23 further-investigation item).
3. **Two unconnected approval-inbox data models** (`ApprovalsScreen` vs. `ApproveRequestScreen`) — §10.
4. **Two competing Create-Task implementations** (`CreateTaskPanel` vs. `CreateTaskPanelDesignChange`) coexisting in the same file, the newer explicitly marked in a comment as superseding the older, with the old Create Task tab explicitly hidden (`hidden:true`) but its code left in place.
5. **Two Task-view implementations** (`TaskDetailPage`, an older standalone read-only page, vs. `TaskViewPage` = `TaskEditPage` with `readOnly`) — only the latter is wired to the live table's "eye" icon; `TaskDetailPage` appears to be superseded but not removed.
6. **SLA domain modeled twice, independently** (dashboard's `SLA_TARGET_H`/`slaOf` vs. `SLAScreen`'s `SLA_LEVELS`/`SLA_MAP`) with different tier definitions and no shared source of truth.
7. **Chip/tone color-lookup tables duplicated verbatim** between the DashboardOCC and WorkflowDrawer script blocks rather than shared.
8. **Copy-paste field-label/accordion/segmented-control idioms** repeated per-file rather than componentized (§7).
9. **`ihub/` subtree** is a full duplicate of the repo root's `index.html`/`js`/`assets`/`fonts` — appears to be an abandoned mirror, not referenced from anywhere, and not itself internally consistent with root (root's `js/resources-inline.js` has diverged from `ihub/js/resources-inline.js`, confirmed by hash mismatch).

---

## 21. Feature Dependency Map

- **Every screen** depends on the shell-layer globals exported early in the file: `Icon`/`I` (icons), `T` (i18n), `Shell`/`TopNav`/`Sidebar` (nav chrome), `SectionShell`/`SectionReport` (per-route tab wrapper), `RecordFilter`/`RFExport`/`RFDate` (filtering/export), `Stat`/`ProgressRing`/`BarChart`/`Calendar`/`ModuleTile` (widgets).
- **Dashboard (`DashboardOCC`)** depends on `ACTIONS`/`INCIDENTS`/`JOBORDERS`/`ASSIGNED_SHEETS` (mock data), `window.WorkloadHeatmap`, `window.IncidentWorkspace`, `window.ChecklistScreen`, `window.SLAScreen`, `window.ProcessesScreen`, `window.PettyCashScreen`, `window.PurchasingScreen`, `window.BudgetingScreen`, `window.ActionSheetSection`, `window.WorkflowDrawer`, `window.TASKSUI` chart primitives — i.e., it is the most cross-cutting screen, pulling in nearly every other module by reference.
- **`TaskEditPage`/`TaskViewPage`** is invoked from `TasksTable` (via `window.__ihubEditTask`/`window.__ihubViewTask`, itself wired up by `App`) and from the dashboard's job-order cards — a genuine cross-module dependency, not merely a route.
- **`WorkflowDrawer`** is invoked from `RecommendedNextAction`, `ActionCard`, `IncidentCard`/`IncidentCenter`/`LiveFeed`, `JobOrderCard`, `SLASection` — i.e. one shared global-drawer instance mounted once in `DashboardOCC` and driven by state passed from many sibling components.
- **`FeedbackWidget`** depends on DOM heuristics (`tabChain`/`detect`) reading the *rendered* page rather than route metadata — meaning it is coupled to the visual structure of whichever screen is currently mounted, not to the routing layer, a fragile but functioning cross-cutting dependency.
- **Masters screens** all depend on the single shared `MasterListingMock`/`MasterModalShell`/`MasterFilterModal` — changing that shared code affects all 5 live masters simultaneously (both a strength for Phase 2 componentization and a risk if changes aren't screen-tested across all 5).

---

## 22. Migration Risks

1. **No build tooling at all** — Phase 2/3 of the ongoing migration (per project memory) is already building a real Vite+React 19+TS app in `app/`; this Phase 1 confirms the *source* prototype has zero TypeScript, zero module system, zero tests, and inline styles as JS objects throughout — every component will need real typing and prop-contract decisions made from scratch, since none exist in source.
2. **`window.*` global-coupling** is pervasive and load-order-dependent (each `<script>` block assumes earlier blocks already ran) — this pattern cannot be mechanically translated to ES modules; every cross-block dependency needs to be traced individually (many are documented above, but the full graph likely has more edges than this analysis surfaced — see §23).
3. **No client-side routing/URL sync** — the live React app persists only a single `route` string to localStorage; there is no hash/path routing, no route params, no deep-linking. A production router (already scaffolded in `app/` per project memory) will need real route parameters where the prototype currently just swaps top-level state (e.g., `viewTask`/`editTask` objects passed by reference, not by ID/URL param).
4. **Two Create-Task forms and two Task-view pages coexist** — Phase 2 needs an explicit decision on which is canonical (`CreateTaskPanelDesignChange`/`TaskViewPage` appear to be the "current" ones based on in-code comments and actual routing wiring, but this should be confirmed against the live site, not assumed).
5. **Decorative-but-wired-looking UI** is widespread: non-functional pagination buttons, hard-coded tab counts disconnected from real row counts, Export buttons with no format menu, "Save"/"Submit" actions that only flash a toast. Phase 2 must not assume every visible control is meant to be functionally replicated as-is — some are explicitly prototype placeholders (confirmed by code comments), others are silent gaps (not confirmed placeholders) — this distinction needs product/design sign-off, not inference.
6. **XLSX bulk-upload is only confirmed working for 2 of 4 master types** by direct code inspection; the other 2 are assumed identical by pattern but not independently verified.
7. **Documentation drift**: `README-html-app.txt` accurately describes architecture #2 (dead code) as if it were the current app, and claims features (theme/date-order validation) that either belong to the dead build or aren't found in the live one. **Any Phase 2 planning that consults this README without cross-checking against `index.html` directly risks building against a description of a different, non-shipping application.**
8. **Local repo is ahead of the live deployment** (§1) — if Phase 2's live-UI verification step (per standing project rule) checks the live URL, it will not see the most recent local commits (`assignment info`, `requester and assignee info`, the large `almost all the changes completed` commit). This needs to be reconciled — either by deploying local `index.html` before verification, or by explicitly treating local as authoritative per this task's own instructions (local IS the source of truth here) and noting the live gap rather than treating it as a regression.
9. **`ihub/` duplicate subtree** risks accidental reuse or confusion during Phase 2 file discovery if not explicitly excluded the same way `app/` was for this analysis.

---

## 23. Unknowns / Further Investigation Required

- **Exact byte/line-level drift between `css/tokens.css` and `index.html`'s inline tokens** was not diffed value-by-value — only confirmed they're separately maintained and the CSS file is unused.
- **Whether Task Mapping/Assignment Area Add modals genuinely use the same XLSX bulk-upload pattern** as Sub Area/Project Category was inferred from shared option-list code, not independently traced line-by-line.
- **Full extent of the `window.*` dependency graph** — this analysis traced the major globals but a single-pass, exhaustive cross-reference of every `window.X` read vs. write site was not performed (would require a dedicated pass).
- **Theme/language persistence in the live React build**: `README-html-app.txt` claims localStorage-backed persistence for theme/accent/language; only `route` persistence was confirmed in the actual `App` component code read. Needs a live-site check (toggle theme, reload, observe) to resolve.
- **Live-site interactive verification** (clicking through modals, drawers, RTL toggle, actual responsive behavior at each breakpoint) was **not performed** in this phase — this analysis relied on static HTML/JS comparison and a byte-level diff against the downloaded live `index.html`/`resources-inline.js`/`css`/`js` assets, not on driving a live browser session (no browser-automation tool was available in this session). The live prototype was used as a textual/structural reference, not a clicked-through one. If Phase 2 planning needs confirmed interactive behavior (e.g., exact drawer animation, exact mobile drawer nav interaction), a dedicated live-browser pass is recommended before implementation, consistent with the project's standing "live-UI verification via dedicated subagent" rule.
- **`ORIGINAL_SOURCE.html`, `menu-explorations/*`, `masters-menu-options.html`** were confirmed structurally disconnected from `index.html` but their *content* (e.g., whether `menu-explorations`' `NAV` tree differs meaningfully from the live `NAV_TREE`) was only spot-checked, not fully diffed.
- **The two Create-Task forms' full field-by-field parity** (which exact fields differ beyond the location-drawer/QR-scan additions) was summarized but not exhaustively diffed field-by-field.
- **`Machine Master`** was referenced in prior migration memory as one of the 5 live masters, but this analysis's direct code reads confirmed 4 by name (Project Category, Sub Area, Assignment Areas, Task Mapping) plus `masterHasPage()`'s 5-item list — the 5th name should be re-confirmed directly against `MASTERS_WITH_PAGE` (not individually quoted by the subagents).

---

## 24. Recommended Inputs Needed for Phase 2

1. **Confirmation of canonical implementations** where duplicates exist: Create Task (`CreateTaskPanel` vs. `CreateTaskPanelDesignChange`), Task View (`TaskDetailPage` vs. `TaskViewPage`), dashboard variant (only `DashboardOCC`/variation C is live-routed — confirm `DashboardCommand`/`DashboardFocus` are out of scope for migration).
2. **Product decision on decorative-but-non-functional controls** (fake pagination, hard-coded tab counts, non-wired Export/Bulk-approve buttons, `ReportsScreen`'s unimplemented result table) — which should become real in the migrated app vs. remain prototype-fidelity placeholders.
3. **Clarification on the two disconnected approval data models** (`ApprovalsScreen` vs. `ApproveRequestScreen`) — merge, or intentionally separate domains?
4. **Explicit exclusion list for Phase 2 file discovery**: `app/` (already excluded), plus this phase's findings — `ihub/`, `css/*.css`, `js/{app,router,shell,ui,data,icons,screens-core,screens-masters}.js`, `js/00-tokens.js`…`13-app.jsx`, `menu-explorations/`, `masters-menu-options.html`, `ORIGINAL_SOURCE.html`, `Claude outputs/` — so Phase 2 doesn't accidentally treat dead code as source of truth.
5. **Decision on how to treat the local-vs-live gap**: proceed from local `index.html` as-is (per this task's instructions, local is primary), and either deploy it first or accept that live-UI spot-checks during Phase 2 will show a slightly older state for the Requester/Assignment Info areas until deployed.
6. **A dedicated live-browser verification pass** (per the project's existing standing rule) before Phase 2 implementation begins on any screen this report flagged as "not interactively verified" — most importantly the mobile/RTL/theme-persistence unknowns in §23.
7. **Sign-off on the shared-component candidate list (§7)** and shared-functionality candidates (§8) as the working list Phase 2's architecture design should evaluate — this phase deliberately does not design the final shared-component architecture.

---

This concludes the Phase 1 Analysis Report. I have not modified, refactored, or created any files, and have not started Phase 2 or touched `app/`. Awaiting your approval before proceeding.