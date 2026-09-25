# Phase 2 — Target Architecture Design

**Basis:** the Phase 1 and 1.5 reports, plus targeted re-checks of the local `index.html`. The local file is the primary source; the live URL is secondary. None of the excluded paths were consulted. **Verified** means checked against `index.html` line numbers. **Default assumption** marks a placeholder answer that needs your confirmation.

---

## 0. Verification notes: new facts that change Phase 1.5

| # | Verified finding | Evidence (`index.html`) | Effect on this design |
|---|---|---|---|
| V1 | The legacy `CreateTaskPanel` is rendered from **5** places, not 1: Incident Workspace "Raise a task"; Home's incident action; Home tracker click; Home › Assigned › Assigned Tasks card click; and that card's **Edit** button. In the Home cases it acts as a **prefilled edit/detail modal for existing job orders**. | 8849, 14391, 14652, 14730, 14739 | Decision D1 is wider than Phase 1.5 said. The task form must support modal and prefill modes. |
| V2 | These components are never rendered: `ApprovalsScreen`, `TeamScreen`, `AttendanceScreen`, `ActionSheetScreen`, `CreateTaskForm`, `TopNavItem`. `TaskDetailPage` and `JobOrderModal` render only as fallbacks that never trigger. `ApproveRequestScreen` sits in the App switch, but nothing navigates to `approve`, and reload-restore rejects it. | render-site greps, 22326 | The only reachable approval surface is Home's `ACTIONS` queue. |
| V3 | The App routes `joborders`, `processes`, `purchasing` and `pettycash` are unreachable. Those screens are reachable only embedded in Home tabs or Work Centre. | 14809–14862 | URLs mount them under `/home/…`. |
| V4 | Locale changes **only** through the Tweaks panel, which opens only when a parent design tool posts `__activate_edit_mode`. The same applies to accent, card style, sidebar layout and dashboard variant. The only end-user preference control is the theme toggle. | 22243, 22394, 3336 | There is no end-user language switch today (decision D8). |
| V5 | Breadcrumbs and the ContextPicker render only in the dev-only sidebar layout. The canonical top-nav layout relies on SecondaryNav strips instead: L2 underline, L3 segmented, L4 links. | 5172–5244 | Breadcrumb data is derived but not rendered by default. |
| V6 | Nav ids take the form `parentId/slug(label)` unless `route` overrides them. Many nav leaves fall through to `StubScreen`: every HR child (the HR root itself shows Overtime), Quality & Compliance children except SLA, Settings children except Configuration, every Reports leaf, and Home's own nav children when opened from the mobile drawer or search. | 2595, 22416–22528 | Routing needs a nav-driven placeholder resolver. |
| V7 | Two "Analytics & Reports" implementations are reachable: the Home tab view and `ReportsScreen` (via search and the mobile drawer). The per-section Section/Report toggle is a third report surface. | 14811, 22484, 1802 | Decision D12. |
| V8 | Cross-feature state today: `TASKS` is a mutable module array; `taskDashConfig` plus the `ihub:taskdash` event links Settings to the Tasks dashboard; `__ihubTrack` links Incidents to the Home tracker; Home reads `SLA_LEVELS`/`SLA_PERF`. | 15976, 19979, 20648, 16909–16951, 8729→14274 | Justifies exactly the stores and dependency edges defined below. |
| V9 | A global `React.createElement` patch turns every non-multiple `<select>` into a searchable combobox and every `<input type=date>` into a custom date field. | 50–96 | These become explicit shared controls. |
| V10 | HomeTopBanner renders on Home and above Task View/Edit only. | 22431–22462 | Layout routes. |
| V11 | The vendored SheetJS is **0.18.5**, the npm-registry build with known CVEs (CVE-2023-30533, CVE-2024-22363). React is 18.3.1. | file headers | Upgrade path (§20). |
| V12 | The effective `--accent-dim` is `#93358D24`, set at runtime, not the `:root` default `#93358D1F`. | 22383 | Tokens use the runtime-effective values. |
| V13 | The prototype's RTL drawer rule (`body[dir="rtl"] @keyframes`) is invalid CSS and is ignored. The date picker's Arabic weekday labels (أح، إن…) are not what `Intl` produces. | 15183, 1526–1529 | RTL drawer behavior needs a live check; calendar labels stay explicit. |

---

## 1. Architecture goals

1. **Fidelity:** reproduce the canonical implementations' visuals and behavior, including inert controls, until you decide otherwise.
2. **Real routing:** real URLs replace the in-state route string, so deep links, reload and back all work.
3. **Clear ownership:** feature ownership, acyclic dependencies, and **no `window` globals**.
4. **Mock → API seam:** presentation components don't change when a backend arrives.
5. **One token source:** CSS variables feed Tailwind. Paper/Ink and RTL are first-class.
6. **i18n:** English and Arabic, with no hardcoded UI strings.
7. **Quality:** strict TypeScript, unit-testable business rules, lint-enforced boundaries.
8. **Clean builds:** prototype-only tooling never ships.

## 2. Architecture principles

1. **Domain-first features.** A feature is one business domain: its screens, data and rules. Navigation sections and hub pages (Home, Work Centre, Payment settlement) are compositions assembled by routes.
2. **One composition root.** Only `src/app/` knows every feature: routes, navigation, shell and providers.
3. **Public APIs over an allow-listed, acyclic graph.** Features consume each other only through `index.ts`.
4. **Lowest sufficient state.** Prefer local state, then a feature store, then a global store; use the URL for navigational state and server cache later. Promote state only when a second consumer is named.
5. **Data through hooks.** Components never import mock data. Hooks return query-shaped results.
6. **Composition over mega-components.** Use configuration objects only where the UI is genuinely data-driven: nav, columns, filter fields, master definitions.
7. **Tokens, not literals.** Use logical, RTL-safe properties only.
8. **Fidelity over improvement.** Every intentional no-op is tagged `PROTOTYPE-NOOP(Dn)`.
9. **No speculative abstraction.** No repositories, DI containers, event buses or domain layers beyond pure rule functions.

---

## 3. Proposed complete `src/` directory structure

```
src/
├── main.tsx                         # imports styles; runs app/bootstrap; createRoot with React 19 error hooks
├── vite-env.d.ts
│
├── app/                             # COMPOSITION ROOT: the only layer that knows every feature
│   ├── App.tsx                      # AppErrorBoundary > AppProviders > RouterProvider
│   ├── bootstrap.ts                 # hydrate preferences → <html lang/dir/data-theme>; init i18n; subscribe to changes
│   ├── i18n.d.ts                    # i18next CustomTypeOptions: typed keys for every namespace
│   ├── providers/
│   │   ├── AppProviders.tsx         # fixed provider order (§12)
│   │   └── queryClient.ts           # QueryClient defaults (§15)
│   ├── router/
│   │   ├── router.tsx               # createBrowserRouter | createHashRouter (env switch), basename
│   │   ├── routes.tsx               # root route tree; imports area files
│   │   ├── areas/                   # home.routes.tsx, tasks.routes.tsx, finance.routes.tsx, hr.routes.tsx,
│   │   │                            # quality.routes.tsx, masters.routes.tsx, history.routes.tsx,
│   │   │                            # settings.routes.tsx, misc.routes.tsx
│   │   ├── handles.ts               # RouteHandle type + helpers (useRouteHandle)
│   │   ├── NavLeafRoute.tsx         # nav path without a screen → PlaceholderPage; unknown → NotFoundPage
│   │   ├── PlaceholderPage.tsx      # StubScreen equivalent
│   │   ├── NotFoundPage.tsx
│   │   └── RouteErrorPage.tsx       # errorElement
│   ├── navigation/
│   │   ├── nav.types.ts
│   │   ├── nav.config.ts            # IA tree (NAV_TREE equivalent); masters subtree built from masterCatalogue
│   │   ├── nav.model.ts             # pure: buildIndex, findTrailByPath (longest prefix), firstLeaf, isAncestor
│   │   ├── useNavTrail.ts
│   │   └── i18n/ en.json ar.json    # "nav" namespace
│   └── layouts/
│       ├── app-shell/
│       │   ├── AppShell.tsx         # sticky header (TopNav + SecondaryNav) + <main> container + <Outlet/>
│       │   ├── TopNav.tsx
│       │   ├── MegaMenu.tsx         # Masters mega menu (category rail + 3-column grid)
│       │   ├── MobileNavDrawer.tsx  # < 1040px
│       │   ├── NavTreeList.tsx
│       │   ├── SecondaryNav.tsx     # L2 UnderlineTabs / L3 SegmentedControl / L4 LinkTabs from nav trail
│       │   ├── TopBarActions.tsx    # search, theme, settings link, notifications, avatar (+ language switch per D8)
│       │   ├── ThemeToggle.tsx
│       │   ├── Logo.tsx
│       │   └── command-search/
│       │       ├── CommandSearch.tsx
│       │       ├── navSearchIndex.ts
│       │       └── navSearch.ts     # pure scoring (ported from navSearch, 3148)
│       └── section/
│           └── SectionLayout.tsx    # "Section / Report" toggle (?view=report) around <Outlet/>
│
├── features/                        # see §5 for ownership; the folder vocabulary is fixed (below)
│   ├── organization/  home/  tasks/  work-centre/  incidents/  enquiries/  observations/
│   ├── snag-lists/  checklists/  sla/  budgeting/  purchasing/  payment-settlement/
│   ├── hr/  appraisal/  workflows/  masters/  history/  reports/  notifications/  settings/
│   └── (feedback/ only if D15 = keep)
│
├── store/                           # cross-feature client state ONLY
│   ├── preferences.store.ts         # theme, locale (+ persistence policy per D5)
│   └── tracking.store.ts            # "Track this item" list (incidents → home)
│
├── shared/                          # domain-agnostic; imports only libraries and other shared modules
│   ├── ui/
│   │   ├── button/      Button, IconButton
│   │   ├── chip/        Chip, ChipList, CountBadge
│   │   ├── card/        Card, CollapsibleCard
│   │   ├── page/        PageHeader (italic-magenta emphasis motif), SectionHead
│   │   ├── icon/        Icon (name → Lucide | custom), icons.registry.ts, custom/*.tsx
│   │   ├── avatar/      Avatar (deterministic hue)
│   │   ├── progress/    ProgressBar, ProgressRing, SegmentBar
│   │   ├── tabs/        UnderlineTabs, SegmentedControl, LinkTabs
│   │   ├── overlay/     Dialog (parts), ConfirmDialog, Drawer (parts), Popover, DropdownMenu
│   │   ├── feedback/    Toaster + toast(), EmptyState, InlineAlert, ErrorBoundary, ErrorFallback
│   │   ├── timeline/    Timeline, TimelineItem, HistoryRail
│   │   ├── stat/        StatTile
│   │   └── charts/      DonutChart, HBarChart, VBarChart, Sparkline, TrendChart (Recharts); GanttChart (SVG)
│   ├── form/
│   │   ├── field/       Field, FieldLabel (kicker + required mark), FieldHint, FieldError
│   │   ├── controls/    TextInput, TextArea (counter), Select (searchable combobox), MultiSelectChips,
│   │   │                DateField, DateRangeField, SegmentedRadio, SwatchRadio, Checkbox, Switch
│   │   ├── attachments/ FileDropZone, AttachmentList, AttachmentPreviewDialog
│   │   ├── layout/      FormSection, FormGrid, FormActions, RepeatableRows
│   │   ├── rhf/         Form, FormField bindings (useController adapters for each control)
│   │   └── schema/      yupLocale.ts (message keys), helpers: requiredText, maxChars, dateOrder, captionedFiles
│   ├── table/           Table primitives, DataTableView, SortableHeader, TablePagination, ColumnSettingsDialog,
│   │                    RowActions, TableToolbar, TabbedTable, useDataTable.ts, exportRows.ts
│   ├── filter/          FilterBar, FilterDialog, FilterFieldRenderer, AppliedFilterChips, filter.types.ts, useFilterState.ts
│   ├── file/            download.ts, csv.ts, xlsx.ts (lazy SheetJS), json.ts, readFile.ts, print.ts, useObjectUrl.ts
│   ├── i18n/            i18n.ts (instance + lazy namespace backend), locales/{en,ar}/{common,validation}.json,
│   │                    format.ts, calendar.ts, localized.ts (LocalizedText), useDirection.ts
│   ├── theme/           theme.ts (Theme type, applyThemeAttributes)
│   ├── lib/             cn.ts, date.ts (ISO, working days with Fri–Sat weekend), random.ts (seedable),
│   │                    id.ts, string.ts, logger.ts, assert.ts
│   ├── hooks/           useDisclosure, useNow, useSearchParamState, useDebouncedValue, useEventListener
│   ├── types/           common.types.ts (Tone, Option, Locale, Direction), query.types.ts, priority.types.ts
│   ├── config/          env.ts (typed import.meta.env), paths.ts (URL contract, §11)
│   └── api/             ← created with the FIRST real endpoint only (§15)
│
├── styles/              index.css (Tailwind + @theme), tokens.css, fonts.css, base.css
├── assets/              fonts/ (self-hosted, no base64), images/ (logos, shapes)
└── test/                setup.ts, renderWithProviders.tsx, createTestRouter.tsx
```

**Fixed feature folder vocabulary.** Create a folder only when it has content.

| Entry | Contents | Rule |
|---|---|---|
| `index.ts` | public API | named exports only, no `export *` |
| `pages/` | route elements `*Page.tsx` | thin: compose components and hooks |
| `layouts/` | feature-owned layout routes `*Layout.tsx` | render `<Outlet/>` |
| `components/` | feature UI, in sub-area folders | no data imports |
| `hooks/` | data-access hooks and feature UI hooks | the only readers of `data/` and `store/` for UI |
| `store/` | feature-scoped Zustand | only with a documented reason |
| `data/` | `*.mock.ts` typed seeds and generators | importable only by `hooks/`, `store/` and tests |
| `domain/` | pure business-rule functions | no React, no I/O, time injected |
| `schemas/` | Yup schemas and inferred value types | |
| `constants/` | static configuration (tabs, option lists, catalogues) | |
| `types/` | domain types | |
| `api/` | future: DTOs, mappers, requests, query options | not created now |
| `i18n/` | `en.json`, `ar.json` | feature namespace = folder name |

**Largest feature trees**, which Codex must follow:

```
features/tasks/
├── index.ts          TaskListPage, CreateTaskPage, TaskViewPage, TaskEditPage, WorkloadHeatmap,
│                     TaskFormDialog (D1), useTaskDashboardConfig, TASK_DASH_WIDGETS, Task types
├── pages/            TaskListPage (JobOrdersScreen), CreateTaskPage (CreateTaskPanelDesignChange),
│                     TaskViewPage + TaskEditPage (both → components/details/TaskDetailsView mode="view"|"edit")
├── components/
│   ├── list/         TasksTable, TaskCardGrid, TaskBoard, TaskListView, TaskListToolbar, TaskListSettingsDialog, taskColumns.tsx
│   ├── create/       CreateTaskForm + one file per section: Basics, Classification, LocationProfiles (+LocationProfileDrawer),
│   │                 AssetDetails (+QrScanDialog), RequesterInfo, ReferenceNumbers, Labels, Assignment, Team, Checklist,
│   │                 DependencyLinks, Attachments
│   ├── details/      TaskDetailsView + one card per panel (SubTasksProgress, TaskInfo, Classification, RequesterInfo,
│   │                 LocationZone, ReferenceNumbers, SlaPerformance, Attachments, AssignmentInfo, Dependencies,
│   │                 AddComment [edit only], LogNotes, ActivityHistory) + TaskActionBar [edit only]
│   ├── dialogs/      CeoComments, ApproveTask, RejectTask, CloseTask, RedirectTask, AddDependency, UpdateSubTasks,
│   │                 CopyMoveSubTasks, SubTaskHistory (timeline + gantt), DependencyReminder
│   ├── analytics/    TasksAnalytics, WorkloadHeatmap, SlaGaugeStrip, ComplianceTrend, ImpactedAreas …
│   └── legacy/       TaskFormDialog (exists only if D1 keeps the legacy form)
├── hooks/            useTasks, useTask, useCreateTask, useUpdateTask, useHideTask, useDependencyReminder, useTaskDashboardConfig
├── store/            tasks.store.ts (seeded; in-session create/update/hide)
│                     taskDashboardConfig.store.ts (persisted; written by settings)
├── data/             tasks, taskTypes (7 flows + roadmaps), locationRegistry, taskDetails generators, analytics, workload,
│                     sampleAttachments (canvas PNG + PDF demo files)
├── domain/           subTaskWeights (≤100%), dependencyReminder (5 working days), locationProfile, taskStages,
│                     buildTaskRecord, taskProgress
├── schemas/          createTask, locationProfile, addDependency, rejectTask, closeTask, redirectTask, slaTarget,
│                     updateSubTasks, addComment, ceoComments
├── constants/        taskDashWidgets, dependencyTypes (FS/SS/FF/SF/Concurrent), taskFlows
├── types/  i18n/

features/home/
├── index.ts          HomeLayout, HomeBannerLayout, OverviewPage, ApprovalsPage, AssignedPage, LiveIncidentsPage,
│                     CompanyPage, HomeTasksPage, HomeReportsPage, useHomeWidgetPreviews (for settings)
├── layouts/          HomeLayout (banner + tab bar + <Outlet/> + WorkflowDrawer host), HomeBannerLayout (no active tab)
├── pages/            (as exported)
├── components/       banner/ (HomeTopBanner, Greeting, ProfileClock, HeroCarousel, PulseStrip, HomeTabBar)
│                     recommended/ actions/ (ActionCard, ActionList, BatchActionBar, SendBackDialog, TrackPromptDialog)
│                     incidents/ (IncidentCard, IncidentActionMenu, IncidentCenter, LiveFeed) sla/ (SlaBadge, OnTheClockSection)
│                     job-orders/ sheets/ tracker/ analytics/ (AnalyticsOverview, HomeReportsView) company/
│                     form-preview/ (FormPreviewDialog) workflow-drawer/ (WorkflowDrawer, Action|Incident|JobOrder bodies,
│                     DrawerSteps, DrawerFooter, MetaCell)
├── hooks/            useActionQueue, useIncidentQueue, useJobOrders, useAssignedSheets, useHomeCounts, useWorkflowDrawer
├── store/            homeQueue.store.ts (queues, batch selection, drawer; reason: layout + routed pages + drawer share it)
├── data/             actions, incidents (live), jobOrders, assignedSheets, analytics (ANLY_*), company, hero
├── domain/           sla (slaOf/slaDur/slaLabelOf), prioritization (score/rank), escalation, referenceCode (asgCode),
│                     jobOrderProgress, approvalGroups
├── constants/        homeTabs, slaPolicy (targets/fractions/overrides), priorityWeights, incidentActions, sendBackReasons
├── types/  i18n/

features/masters/
├── index.ts          masterCatalogue, MasterPage, MasterPendingPage, master types
├── catalogue/        masterCatalogue.ts (4 categories, 78 items, slugs, label keys), mastersWithPage.ts (5 items)
├── definitions/      registry index + projectCategory, assignmentArea, subArea, taskMapping, machine (generic)
├── pages/            MasterPage (definition-driven listing), MasterPendingPage
├── components/       MasterListToolbar, MasterStatusChips, MasterTable, MasterSettingsDialog, MasterFilterDialog,
│                     MasterRecordDialog (view/edit), add/ (one dialog per definition + generic), BulkNamesUpload, SampleCsvLink
├── hooks/            useMasterRecords (page-local, seeded), useMasterListState
├── data/  domain/    requiredFields (masterFormMissing), zonesForLocation, bulkNames (header strip/dedupe/merge), flattenMultiValues
├── schemas/  types/  i18n/
```

The other features use the same vocabulary. Each gets `pages/`, `components/`, `data/`, `types/` and `i18n/` as needed; `schemas/` where forms exist; and `domain/` where rules exist. Examples: purchasing (currency conversion, row matching), appraisal (score band), workflows (duration, escalation-on-breach), settings (dashboard-config validation, sanitizing and inheritance) and sla (on-time percentage).

## 4. Responsibility of every major directory

| Directory | Responsibility | May import |
|---|---|---|
| `app/` | Composition: providers, router, URL→page mapping, navigation IA, shell, section layout, placeholder/404/error pages | everything |
| `features/<f>/` | One business domain: pages, UI, data access, rules, schemas, types, strings | `shared`, `store`, allow-listed features' `index.ts` |
| `store/` | Client state shared by **unrelated** features (preferences, tracking) | `shared` |
| `shared/` | Domain-agnostic building blocks: UI, form, table, filter, file, i18n, theme, lib, hooks, types, config | libraries only |
| `styles/` | Tokens, fonts, base CSS, Tailwind theme mapping | — |
| `assets/` | Fonts and images | — |
| `test/` | Test setup and render helpers | everything (tests only) |

**Deviations from the suggested starting structure:**
- There is no top-level `utils/`. That code lives in `shared/lib`, so helpers have one home.
- There is no top-level `providers/` or `layouts/`. They live inside `app/`. Layouts need the navigation model and feature widgets (notifications bell, section report), so keeping them in the composition root avoids an app↔layouts cycle.
- Feature-owned layouts such as `HomeLayout` stay in their feature.
- Added `styles/`, `test/`, and feature-level `domain/`, `store/` and `i18n/`.

## 5. Feature boundaries

| Feature | Owns (prototype source) | Public API | Mounted at |
|---|---|---|---|
| **organization** | Cross-feature operational reference data: the `RF_*` vocabulary, `RecordFilter` (1416–1727), the record-history generator (`HUD_HISTORY`), and the mock current user | `RecordFilter`, `useLocations/useZones/useDepartments/usePeople/useCurrentUser`, `useRecordHistory` | consumed by features |
| **home** | `DashboardOCC` and everything in §3's home tree; the `ACTIONS`/`INCIDENTS`/`JOBORDERS`/`ASSIGNED_SHEETS` datasets; the SLA and scoring engine (12130–15845) | layouts and pages listed in §3 | `/home/*`; banner on `/tasks/*` |
| **tasks** | `TASKS` and the analytics datasets; `TasksTable`, `Board`, `ListView`, `JobOrdersScreen`; `TaskEditPage` (+ readOnly); `CreateTaskPanelDesignChange`; the dependency reminder; `TASK_DASH_WIDGETS`/config (15846–20862) | see tree | `/home/work-centre/{create-task,tasks}`, `/tasks/:taskId(/edit)` |
| **work-centre** | `ProcessesScreen` chrome (General/Commercial groups, section pills, child links) and the generic Open/Closed fallback listing | `WorkCentreLayout`, `WorkCentreFallbackPage` | `/home/work-centre/*` |
| **incidents** | `IncidentWorkspace` (8665): records, detail, action menu, convert-to-task | `IncidentWorkspacePage` | `/home/incidents/reports`, `/home/work-centre/incidents/*` |
| **enquiries** / **observations** / **snag-lists** | `EnquiryView` (9144) / `ObservationsView` (9000) / `SnagListView` (9220) | their pages | `/home/work-centre/{enquiry,observations,snag-lists}/*` |
| **checklists** | `ChecklistScreen` (8570) and Work Centre checklist sub-views | `ChecklistPage` and sub-pages | `/quality`, `/home/sop-checklist`, `/home/work-centre/checklists/*` |
| **sla** | `SLAScreen` and `SLA_*` data (21660–22070) | `SlaPage`, `useSlaLevels`, `useSlaPerformance` | `/quality/sla`, `/home/sla` |
| **budgeting** | `BudgetingScreen` (section and home variants), NewBudget/BudgetSheet/ActivityMaster views | `BudgetingPage` | `/finance/*`, `/home/budgets/*` |
| **purchasing** | `PurchasingScreen` (10033) | `PurchasingPage` | `/home/purchasing/*` |
| **payment-settlement** | `ActionSheetSection`, `CreateActionSheetPanel`, `PettyCashScreen`, petty-cash create/reimburse, `AddSupplierPanel` | `PaymentSettlementLayout`, three pages, `ActionSheetForm`, `PettyCashRequestForm` | `/home/payment-settlement/*` |
| **hr** / **appraisal** / **workflows** / **history** | `OvertimeScreen` / `AppraisalScreen` / `WorkflowsScreen` / `HistoryScreen` | one page each | `/hr`, `/appraisal`, `/workflows`, `/history/*` |
| **masters** | Catalogue, definitions, listing, dialogs, seeds (2355–5021) | `masterCatalogue`, `MasterPage`, `MasterPendingPage` | `/masters/:category/:item` (+ `/masters-list/…` per D10) |
| **reports** | `ReportsScreen` (9609), `SectionReport` and `REPORT_DEFS` (1729–1815) | `ReportsLibraryPage`, `SectionReport` | `/reports/*`, SectionLayout |
| **notifications** | Bell panel data (3346) and `NotificationsScreen` (12032) | `NotificationsMenu`, `NotificationsPage` | shell, `/notifications` |
| **settings** | `UserConfigScreen` (6909) with the Admin/User/Task dashboard-config builders (6947, 7143) | `ConfigurationPage` | `/settings/configuration` |

**Decision AD-01: domain-based features**
- **Problem:** nav sections overlap. Observations sit under both Quality and Work Centre; checklists under Home, Quality and Work Centre; budgeting under Home and Finance.
- **Decision:** features follow business domains. Hubs are nested layout routes composed in `app/`.
- **Reason:** each record type has one owner, whichever menu shows it.
- **Trade-off:** more features (about 21), and route files carry the composition.

## 6. Feature dependency rules

```
app ─► features ─► store ─► shared
         │  └──► allow-listed features (index.ts only)
         └────────────────────────────► shared
```

| From | May import (public API only) | Reason (verified) |
|---|---|---|
| home | tasks, sla, payment-settlement, organization | workload heatmap and legacy task modal (V1); compliance panel data (V8); form modal renders action-sheet and petty-cash create panels (14873) |
| incidents | tasks, organization | "Raise a task" form (8849) |
| settings | tasks, home, organization | task-dashboard config (V8); widget previews |
| every other feature | organization | `RecordFilter` and reference data |
| organization | — | leaf |

- No other feature-to-feature edges are allowed, and no cycles.
- Nothing may import `home` except `settings`. Nothing may import `settings`.
- A new edge needs an update to this table and a reviewer's sign-off.

## 7. Shared-layer boundaries

- **Belongs in shared:** code with no business vocabulary.
- **Promotion rule:** move code to shared when a second, unrelated feature needs the same responsibility, not merely something that looks the same.
- **Demotion rule:** if a shared API grows feature-specific props, move it back to the feature.
- **Shared must not hold:** mock data, business rules, domain status→tone mappings (these stay feature-local until two features share an identical mapping), or route knowledge. The one documented exception is `shared/config/paths.ts`, a leaf module of pure path builders (§11).
- **Import style:** import shared by module path (`@/shared/ui/chip`), not through one mega-barrel.

## 8. Shared-component strategy

**Decision AD-09: behavior primitives**
- **Problem:** the prototype hand-rolls about 30 modals and about 10 popovers, with manual portals, scroll locks, Escape handling and viewport clamping. It also relies on a `createElement` monkey-patch.
- **Decision:** use `radix-ui` (Dialog, Popover, DropdownMenu, Collapsible, DirectionProvider) plus Vaul as unstyled behavior, styled by our shared components. Replace the patch with explicit `Select` and `DateField` controls.
- **Reason:** Vaul is already built on Radix Dialog, so nested overlays (drawer → form preview) stay in one focus and dismiss system. RTL-aware positioning comes built in.
- **Trade-off:** one added dependency (approval A1). The component styling is ours.

| Candidate | Verdict | Shape | Responsibility | Customization |
|---|---|---|---|---|
| Modal shell | **Shared, composed parts** | `Dialog`, `DialogContent size`, `DialogHeader icon tone`, `DialogBody`, `DialogFooter` | a11y, focus, scroll lock, chrome | children and slots; no 20-prop `Modal` |
| Delete confirmation | **Shared** | `ConfirmDialog` (built from Dialog) | danger confirm pattern (masters and tasks) | `tone`, `icon`, `title`, `description`, labels, `onConfirm`, `pending` |
| Multi-select chip picker | **Shared control** | `MultiSelectChips` (combines 3 implementations) | pick from remaining options; remove via chip | `value[]`, `options`, `onChange`, `renderChip?`; read-only lists use `ChipList` |
| Tab strip / segmented | **Shared, 3 components** | `UnderlineTabs` (scroll arrows), `SegmentedControl`, `LinkTabs` + form `SegmentedRadio` | tab vs radio semantics | `items`, `value`, `onValueChange` or link mode (NavLink) |
| File drop zone | **Shared** | `FileDropZone` + `AttachmentList` + `AttachmentPreviewDialog` | drag/drop/browse, list, preview, download, remove, optional caption | `accept`, `multiple`, `onFiles`, `captionRequired`, `readOnly` |
| Accordion card | **Shared** | `CollapsibleCard` (Radix Collapsible) | independent open/close (not exclusive) | controlled `open`, header `icon/title/badge/actions` slots |
| Progress bar | **Shared** | `ProgressBar`, `ProgressRing`, `SegmentBar` | display only | `value`, `tone`, `size`; tone mapping comes from features |
| Status/chip system | **Shared primitive; mappings stay in features** | `Chip tone=neutral\|ok\|warn\|bad\|info\|accent`, `CountBadge` | visuals only | `PRIO_CHIP`/`SEV_COLOR`/`SLA_TONE` stay in home (both copies are in home) until the promotion rule fires |
| CSV/XLSX upload flow | **Split** | generic reading in `shared/file`; `BulkNamesUpload` UI stays **in masters** | all consumers are masters dialogs | definitions supply header words and mapping |
| Timeline/feed | **Shared** | `Timeline`, `TimelineItem`, `HistoryRail` | dot/line/card layout, collapsible rail | `tone`, `time`, `actor`, content slot; data from feature hooks |

**Other shared components confirmed by usage:**
- `Select` (searchable combobox, default for all single selects) and `DateField`/`DateRangeField`, which replace V9's patch.
- `EmptyState`, `StatTile`, `SectionHead`, `PageHeader`, `Avatar`, `Toaster`.
- The charts.
- `FilterBar` family (§18) and `TabbedTable` (about 12 portal screens).

## 9. Shared-functionality strategy

| Phase 1.5 candidate | Decision |
|---|---|
| `T(en, ar, locale)` | Replaced by i18next (§23); no `T` helper survives |
| `RFExport` | Split: `shared/file/{csv,download,print}` plus `shared/table/exportRows`; features own column mapping and the export dataset (D2) |
| Date-range cross-validation | `DateRangeField` (min/max linkage) plus the `dateOrder` schema helper; it applies to Create Task **only if D2 enables it** |
| SLA computation | **Not shared.** The two models stay in `home/domain` and `sla` (D4) |
| Required-field validation | Feature schemas plus `shared/form/schema` helpers |

Also shared:
- `shared/lib/date`: working days with a Fri–Sat weekend, used by the dependency reminder and SLA.
- `logger`, a seedable `random` (for the QR-scan simulation), `cn`.
- `useNow(interval)` for the live clock and SLA countdowns.
- `useSearchParamState` for URL-backed tabs and filters.

## 10. Layout architecture

```
AppShell  (app/layouts/app-shell)       sticky TopNav + SecondaryNav; <main max-w 1440, padding 28/28/60>
├── HomeLayout (home)                    HomeTopBanner + HomeTabBar + WorkflowDrawer host → /home/*
│   ├── WorkCentreLayout (work-centre)   group tabs + section pills + child links → /home/work-centre/*
│   └── PaymentSettlementLayout          Action Sheet / Petty Cash / Add a Supplier → /home/payment-settlement/*
├── HomeBannerLayout (home)              banner with no active tab → /tasks/:taskId, /tasks/:taskId/edit
├── SectionLayout (app/layouts/section)  Section|Report toggle → finance, hr, appraisal, quality, workflows,
│                                        history, notifications, placeholders
└── unwrapped                            masters, settings/configuration, reports (matches App's unwrapped branches)
```

- **SecondaryNav** is hidden on `/home/*` and `/masters/*`. It shows on `/masters-list/*`, using L2 underline for both levels (5100, 5117).
- **Below 1040px** the top nav collapses to a hamburger and `MobileNavDrawer`. Below 480px it compacts to the wordmark (styles 505–517).
- **Page primitives** (`PageHeader`, `SectionHead`) live in `shared/ui/page`.
- **The Task Edit bottom action bar** is tasks-local. It stays sticky at the page bottom; the page reserves its height with a bottom spacer.
- **Layouts hold no business logic.** `HomeLayout` is feature-owned business UI. `AppShell` composes navigation data plus feature widgets passed in by `app/`.

## 11. Routing architecture

**Decision AD-04: real routing**
- **Problem:** the prototype keeps one route string in state, persisted to localStorage, and has a nav tree with many screenless leaves.
- **Decision:**
  - React Router v7 in data mode (`createBrowserRouter`), with `lazy` feature chunks.
  - Real URLs; the nav config is the IA source.
  - Screenless nav paths resolve to `PlaceholderPage` by longest-prefix match on the nav index. Unknown paths go to `NotFoundPage`.
  - `shared/config/paths.ts` is the URL contract used by both routes and links.
- **Reason:** deep links, a working back button, and faithful stub behavior without hand-writing about 100 placeholder routes.
- **Trade-off:** BrowserRouter needs an SPA fallback on the host (D17). An env switch to `createHashRouter` covers hosts that can't rewrite.

**URL map.** "Default" marks a default assumption.

| Prototype | URL | Element / layout |
|---|---|---|
| `dashboard` | `/` → `/home` → `/home/overview` | HomeLayout › OverviewPage |
| Home views | `/home/{assigned/:queue(approvals\|verify\|tasks), incidents/:sub(reports\|live), budgets/:section?, purchasing/:section?, sop-checklist, sla, reports}` plus hidden `/home/{approvals, company, tasks}` | HomeLayout › feature page |
| Work Centre | `/home/work-centre/:section/:child?`; sections are create-task, tasks, enquiry, observations, incidents, checklists, snag-lists, price-change, promotions; the group is derived from the section | HomeLayout › WorkCentreLayout |
| Payment settlement | `/home/payment-settlement/:module(action-sheet\|petty-cash\|add-supplier)` | HomeLayout › PaymentSettlementLayout |
| `task-view` / `task-edit` | `/tasks/:taskId`, `/tasks/:taskId/edit`; the task is resolved from the tasks store; Back = `navigate(-1)` with fallback `/home/work-centre/tasks` | HomeBannerLayout |
| `budgeting`, `budgeting/*` | `/finance`, `/finance/dashboard`, `/finance/budgeting` | SectionLayout › BudgetingPage |
| `overtime` (HR) | `/hr` → OvertimePage; `/hr/*` nav leaves → Placeholder | SectionLayout |
| `appraisal`, `workflows`, `notifications` | same slugs | SectionLayout |
| `checklist` (Q&C), `sla` | `/quality` → ChecklistPage; `/quality/sla` → SlaPage; other leaves → Placeholder | SectionLayout |
| `history/*` | `/history/*` (module from the splat) | SectionLayout › HistoryPage |
| `masters/*` | `/masters/:category/:item`; `/masters` and `/masters/:category` → first leaf (**default**, D10) | MasterPage or MasterPendingPage |
| `masters-list/*` | `/masters-list/:category/:item`, with first-leaf redirects (per D10) | same elements |
| `settings-configuration/*` | `/settings/configuration` (unwrapped); other leaves → Placeholder in SectionLayout | |
| `reports` | `/reports` → ReportsLibraryPage; leaves → Placeholder (D12) | unwrapped |
| Home nav children (`dashboard/overview`…) | → matching `/home/:tab` where a view exists (**default**, D13) | |
| unreachable App routes (`approve`, `joborders`, `processes`, `purchasing`, `pettycash`) | not routed (D11) | |
| `*` | NotFoundPage inside AppShell | |

**Route rules:**
- The first level of in-screen navigation that the prototype drives from tabs goes in the **path**.
- Deeper in-screen tabs, list view mode, filters, search and page go in **search params**, using `replace` for rapid changes.
- Open dialogs and hover state stay **local**.

Other routing mechanics:
- **Route handles:** `{ reportKey?, homeTab? }`. Titles stay static by default (a deferred item).
- **Parameters** are validated against allowed values; invalid values go to 404.
- **`<ScrollRestoration/>`** is enabled.
- **`basename`** comes from `VITE_BASE_PATH`.
- **Auth seam:** a future `AuthGuard` becomes a pathless layout above AppShell, with public routes (such as login) outside it. Nothing is created now.
- **`ihub.route`** persistence is dropped; the URL replaces it.

Specification shapes:

```ts
type NavNode = { id: string /* prototype nav id */; path: string; labelKey: string; icon?: IconName;
  children?: NavNode[]; megaMenu?: true; topbar?: true; hideInTopNav?: true; firstLeafRedirect?: true };
type RouteHandle = { reportKey?: ReportKey; homeTab?: HomeTabId | null };
```

## 12. Provider architecture

```
<StrictMode>
  <AppErrorBoundary>                  last resort, outside the router
    <QueryClientProvider>             mounted at scaffold, unused until the first API (approval A5)
      <DirectionProvider dir>         Radix RTL awareness (dir from preferences.locale)
        <RouterProvider router/>      AppShell and everything else
      </DirectionProvider>
      <Toaster/>                      global toast portal
    </QueryClientProvider>
  </AppErrorBoundary>
</StrictMode>
```

**Deliberately not providers:**
- **Theme:** CSS variables plus a `data-theme` attribute applied by `bootstrap.ts`, which subscribes to the store.
- **i18n:** `initReactI18next` needs no provider.
- **Stores:** Zustand needs no provider.
- **Future auth:** will become a provider or router loader above AppShell.

## 13. State-management strategy

Rules: **local** state for UI; **feature Zustand store** only when separate route components share state; **`store/`** only for unrelated features; **URL** for navigational state; **TanStack Query** only for real server data.

| State | Prototype | Target |
|---|---|---|
| Current page, Home tab, task being viewed/edited | `route` state + `ihub.route`; `homeView` + `__ihubGoToView`; `viewTask`/`editTask` objects | URL |
| Theme, locale | Tweaks state + `__ihubToggleTheme` | `store/preferences` (persistence per D5; keys `ihub.v2.*` so stale prototype keys are never read) |
| Accent, card style, layout, dashboard variant | Tweaks | constants; knobs excluded (D9) |
| Home queues, batch selection, workflow drawer | `DashboardOCC` state | `home/store/homeQueue` (layout and routed pages share it) |
| Send-back, track prompt, form modal | `DashboardOCC` state | local to the opener |
| Tracked items | `__ihubTrack` | `store/tracking` (not persisted, as today) |
| Tasks collection | mutable `TASKS` + `window.TASKSUI` | `tasks/store/tasks` (in-memory, resets on reload as today) |
| Task dashboard config | `window.taskDashConfig` + event + localStorage | `tasks/store/taskDashboardConfig` (persisted; settings writes through the tasks API) |
| Admin/user dashboard configs | localStorage | settings-local persisted state |
| Master records, portal screen rows | local state | page-local hooks |
| Forms | many `useState`s | React Hook Form (A1) |
| Toasts | per-screen `flash` | `shared/ui/feedback` queue |
| Server data (future) | — | TanStack Query |

## 14. Mock-data architecture

**Decision AD-06: query-shaped data hooks**
- **Problem:** the future move from mocks to APIs must not touch presentation components.
- **Decision:**
  - Every read hook returns `{ data, isPending, isError, error }`, a subset of TanStack Query's result.
  - Every write hook returns `{ mutate, isPending }`.
  - Mock implementations are synchronous: no promises, no fake latency.
- **Reason:** switching to `useQuery`/`useMutation` stays inside the hook.
- **Trade-off:** consumers carry loading and error branches that mocks never trigger.

```
Now:    Component → useTasks() → tasks.store (seeded from data/tasks.mock.ts)
Later:  Component → useTasks() → useQuery(taskQueries.list(f)) → api/tasks.api.ts → backend
```

- **Mock files** use typed seeds (`satisfies readonly Task[]`) and generator functions, all in `data/`. Lint forbids importing `data/` from `components/` and `pages/`.
- **Datasets stay with their owning feature.** Duplicates stay separate, as documented (D16). The only consolidation is the single existing `RF_*` definition moving into organization.
- **Mock bilingual content** (task titles, incident text, names) uses `LocalizedText = { en: string; ar: string }`, rendered through `useLocalizedText()`. UI chrome goes in i18n resources (AD-07).
- **Decorative prototype numbers**, such as hard-coded tab counts, are kept as explicit `displayCount` constants tagged `PROTOTYPE-NOOP(D2)`. They are not computed.

## 15. Future API architecture

Nothing below is created until the first real endpoint exists. Only its placement is fixed now.

- **`shared/api/httpClient.ts`:** one `axios.create`, with `baseURL` from `env.apiBaseUrl` and a timeout.
- **`shared/api/interceptors.ts`:**
  - request: `Accept-Language` from i18n; future auth/CSRF header hook;
  - response: `normalizeError`; future 401 handling hook.
- **`shared/api/apiError.ts`:** `ApiError { kind: 'network'|'timeout'|'http'|'validation'|'unknown'; status?; code?; messageKey; fieldErrors? }`.
- **Feature modules** under `features/<f>/api/`:
  - `*.dto.ts` and `*.mappers.ts` (DTO ↔ domain; components use domain types only);
  - `*.api.ts` (request functions);
  - `*.queries.ts` (key factories and `queryOptions`).
- **Query keys:** `[feature, entity, scope, params]`, for example `['tasks','list',{filters}]` and `['tasks','detail',id]`.
- **Mutations:** in feature hooks, invalidating `lists()`. Queue actions (approve, reject, send back) need **optimistic updates** to keep the prototype's instant-removal feel.
- **QueryClient defaults:** `retry: 1`; `staleTime` set per feature; no refetch on window focus by default.

## 16. Form architecture

**Decision AD-10: forms**
- **Problem:** the forms are large: Create Task has about 30 fields and repeatable location profiles. There are field arrays for checklist items, weighted sub-tasks, supplier quotes, sub-area rows, and activity-plus-expense rows.
- **Decision:** React Hook Form with `@hookform/resolvers/yup` (approval A1). Shared controls are **controlled and library-agnostic** (`value`, `onChange`, `invalid`, `disabled`, `id`), bound through thin `shared/form/rhf` adapters, so the same controls also work in filter dialogs.
- **Reason:** field arrays, dirty tracking, fewer re-renders, and Yup error mapping come without reinventing them.
- **Trade-off:** an extra dependency. The adapter layer is small but mandatory.

Structure:
- `Field` wires the label, hint and error through `aria-describedby` and `aria-invalid`.
- `FieldLabel` renders the prototype's kicker style and required mark.
- `FormSection` uses the card or collapsible style; `FormGrid` provides responsive 3–4 column grids (`MASTER_GRID4/3`); `FormActions` holds the buttons.
- `RepeatableRows` wraps `useFieldArray`.
- Draft-in-drawer editing (the location profile drawer) uses a **separate form instance** that commits into the parent array. Cancel discards it, matching the prototype's `locBackup`.

Attachments:
- Value shape: `AttachmentValue = { id, name, size, type, file?, url?, caption?, uploadedBy, uploadedAt }`.
- Object URLs are revoked through `useObjectUrl`.
- `accept` is set per usage. Size limits are displayed but not enforced, as today (D2).

## 17. Validation architecture

- **Schemas** live in `features/<f>/schemas`, one per form. Types come from `yup.InferType`.
- **Generic helpers** live in `shared/form/schema`: `requiredText`, `maxChars(500)`, `dateOrder(from, to)`, and `captionedFiles`, which is used by observations, enquiries and purchasing.
- **Messages:** `yup.setLocale` emits **message keys** (`validation.required`), translated at render. No message strings are built inside schemas.
- **Timing matches the prototype, per form:**
  - Disable submit until valid (`mode: 'onChange'` + `isValid`): Reject and Close (remarks ≤500), Redirect (owner + assignee), SLA target (date + justification), Add Dependency (category + lead time; impacted date when marked as a showstopper), master Add/Edit (`masterFormMissing` per mode), Enquiry (subject + priority + captions), Update Sub-Tasks (weights ≤100% banner).
  - Summary message on attempt: the location drawer's "Please fill in required fields: …".
- **Not added without a decision (D2):** blocking validation on Create Task submit, start/end date order, the CEO Comments "required" note, and attachment size limits.
- **Runtime-parsed input** (dashboard-config JSON, XLSX rows) is validated with Yup against `unknown`. There is no `any`.
- **Future server errors:** 422 `fieldErrors` map to RHF `setError`.

## 18. Table architecture

**Decision AD-11: tables**
- **Problem:** several table implementations need different combinations: drag column order and grouping (Tasks); visibility, per-page and status toggle (Masters); sorting, drag columns, expandable rows and pagination (Task Edit Activity History); expandable rows (Workflows); tabs with counts (about 12 portal screens).
- **Decision:** `@tanstack/react-table` as the headless engine (approval A1), plus small presentational primitives in `shared/table`. There is no universal table.
- **Reason:** the engine covers sort, pagination, visibility, ordering, grouping and expansion once. Presentation stays composable.
- **Trade-off:** one dependency and a learning curve.

| Shared (`shared/table`) | Feature-specific |
|---|---|
| `Table/THead/TBody/Tr/Th/Td` primitives; `TableShell` (card and horizontal scroll) | column definitions (`columns.tsx` via `createColumnHelper<T>()`) |
| `DataTableView` (renders an engine instance: header, rows, empty row, group rows, expanded slot) | cell renderers and status→tone mapping |
| `SortableHeader`, `TablePagination`, `ColumnSettingsDialog` (Select all / Deselect all grid) | default visibility, order, grouping options, page size |
| `RowActions` (icon buttons) / `RowActionMenu` | action handlers and permissions |
| `TableToolbar` (search, filter trigger, actions, export slots) | filter field definitions and export column mapping |
| `TabbedTable` (UnderlineTabs + DataTableView + pagination) | tab lists and `displayCount`s |
| `useDataTable` (engine defaults); `exportRows(table)` | which dataset gets exported (D2) |

Behavior details:
- **Pagination** in `TabbedTable` renders **inert**, tagged `PROTOTYPE-NOOP(D2)`, to match the prototype.
- **Responsive:** horizontal scroll below 1040px. The card view stays an explicit Tasks view, not an automatic switch.
- **Loading and empty:** `EmptyState` rows now; `TableSkeleton` arrives with the API.

**Filters** (`shared/filter`):
- `FilterBar` (search + Filters button + applied chips + export slot), `FilterDialog` and `FilterFieldRenderer` are driven by a small `FilterFieldDef` union: text, select, multiselect, date range, flags.
- The organization feature composes these into `RecordFilter`, carrying the `RF_*` vocabulary and quick flags.
- The masters feature composes its own `MasterFilterDialog`, as the prototype deliberately does (3629).

## 19. Modal / drawer architecture

- **Dialogs** use the Radix-based parts from §8. Their open state is local to the opener. The Home workflow drawer is the exception: its state lives in the home store because many routed children open it.
- **Drawers** use Vaul-based `Drawer` parts with a **logical side** (`inline-end` / `inline-start` / `bottom`), mapped to Vaul's physical direction through `useDirection()`. Used for the WorkflowDrawer (inline-end), the mobile nav (inline-start) and the location profile drawer.
- **Popovers and menus** use Radix: date picker, combobox list, notifications panel, AI subscription menu, incident Action menu, More ▾, row action menus and the mega menu.
- **Nesting** (drawer → Form Preview dialog) is handled by the shared Radix layer stack. The manual body-overflow effects are deleted.
- **Toasts** replace the per-screen `flash()` implementations: a bottom-centered pill, matching the prototype's placement.

## 20. Import / export / file-handling architecture

| Generic (`shared/file`) | Feature-specific |
|---|---|
| `downloadBlob`, `downloadText` (revokes the object URL after a delay) | export column mapping and dataset choice |
| `csv.ts`: `toCsv(rows, cols)` with RFC quoting | the "Excel" variant is currently CSV with the `application/vnd.ms-excel` MIME type; kept faithful |
| `xlsx.ts`: **lazy** `import('xlsx')`; `readSpreadsheet(file) → string[][]` | masters `bulkNames`: first column, header-word allowlist, trim, dedupe, merge into editable rows |
| `readFile.ts` (text / ArrayBuffer promises), `json.ts` (`readJsonFile(file, schema)`, `downloadJson`) | settings: dashboard-config validation (`ids` array), sanitizing against the catalogue, `MAX = 15`, locked widgets, admin→user inheritance |
| `print.ts` (`window.print`, as the prototype's PDF/Print options do) + print CSS | sample CSV content; demo attachments (tasks `data/`) |

- **SheetJS:** install the current official release from the SheetJS CDN (≥0.20.2 fixes both CVEs in V11), not the stale npm-registry build. Load it only on upload (approval A1).
- **Arabic in Excel:** a UTF-8 BOM may be needed for Arabic text to open correctly. It is **not** added silently (risk R6).

## 21. Theme / design-token architecture

- **`styles/tokens.css`** ports the prototype's theme-varying tokens **verbatim, by name**. Paper values sit on `:root`; Ink overrides sit on `:root[data-theme="ink"]`.
  - The attribute moves from `body` to `<html>` so that `color-scheme` and portals inherit consistently.
  - Runtime-effective values win (V12): `--accent-dim: #93358D24`.
- **Theme-invariant scales** are defined directly in Tailwind `@theme`, reusing prototype values:
  - radius 6 / 8 / 10 / 14 plus observed 7 / 9 / 12 / 999 values;
  - font stacks, including `NumCalibri` with its unicode-range rule for numerals;
  - shadows extracted from literals: popover `0 16px 44px rgba(20,20,30,.22)`, menu `0 12px 32px rgba(20,20,30,.14)`, segment `0 1px 2px rgba(20,20,30,.10)`, drawer `0 24px 80px rgba(26,26,31,.4)`;
  - a type scale extracted from actual `fontSize` usage (frequency pass in Phase 3);
  - breakpoints.
- **Accent** is fixed to Tamdeen Magenta. **Card style** is fixed to soft. The alternative accents and card styles are dropped (D9).
- **Fonts** are self-hosted from `assets/fonts` through `fonts.css`, with no base64. The two missing files (Myriad Pro, GE SS Light Italic) are handled per D18.
- **Base rules** carried over:
  - RTL line-height 1.58 and the Arabic font stack under `[dir=rtl]`;
  - upright bold `em` in RTL;
  - `.num` tabular Calibri numerals;
  - the magenta focus ring;
  - scrollbars;
  - the ink logo swap.
- **Chart and heatmap colors:**
  - charts use `var(--token)` strings in Recharts `fill` and `stroke`;
  - the 5-tier workload legend (`#4FA87E` → `#E0538A`) stays a tasks constant.

## 22. Tailwind + CSS-variable strategy

**Decision AD-12: Tailwind over CSS variables**
- **Problem:** themes must switch at runtime without scattering literal colors, and prototype variable names collide with Tailwind namespaces (`--radius-*`, `--font-*`).
- **Decision:** Tailwind v4 CSS-first configuration:
  - `@theme inline` aliases the prototype color variables under semantic names;
  - theme-invariant scales are defined in `@theme` directly;
  - the default palette and radius scale are reset with `initial`, so literal palette classes can't be used.
- **Reason:** one source of truth, traceable to the prototype, and themes switch with zero rebuild.
- **Trade-off:** two names per color (a documented mapping), and tailwind-merge needs configuration.

| Prototype var | Tailwind token | Utility |
|---|---|---|
| `--bg` / `--bg-2` / `--bg-3` | `--color-canvas` / `raised` / `pressed` | `bg-canvas` |
| `--paper` / `--paper-2` | `--color-surface` / `inset` | `bg-surface` |
| `--line` / `--line-2` | `--color-line` / `line-strong` | `border-line` |
| `--text` … `--text-4` | `--color-fg` … `fg-4` | `text-fg-3` |
| `--ok` `--warn` `--bad` `--info` | same names | `text-ok` |
| `--accent` / `-dim` / `-ink` | `--color-accent` / `accent-dim` / `accent-ink` | `text-accent` |
| `--blue-med` / `-dark` / `-light` / `-soft` | `--color-interactive` / `-strong` / `-light` / `-soft` | `bg-interactive` |
| `--brand-*` | `--color-brand-*` | `bg-brand-mint` |

- **Chip tints:** the prototype uses `color-mix(in srgb …)`. Tailwind's opacity modifier mixes in oklab, which looks slightly different, so fidelity-critical tints are defined as `@utility chip-tone-*` with explicit sRGB mixing.
- **Breakpoints** are desktop-first to mirror the prototype's `max-width` queries: `--breakpoint-desktop: 1041px`, `tablet: 761px`, `phone: 481px`. `max-desktop:` then equals `≤1040px` exactly.
- **RTL:** only logical utilities (`ps/pe/ms/me/start/end/border-s/text-start`). Directional icons use `rtl:-scale-x-100`. CI checks forbid `pl-/pr-/ml-/mr-/left-/right-/text-left/text-right`.
- **`cn()`** is `clsx` + `tailwind-merge`, configured through `extendTailwindMerge` for our scales. Tests cover the tricky pairs (`text-fg-2` vs `text-sm`).
- **Inline `style`** is allowed only for dynamic values, passed as CSS variables (for example `--pct` or heatmap colors).

## 23. i18n / RTL architecture

**Decision AD-08: i18n**
- **Problem:** thousands of inline `T('en','ar')` pairs, Arabic plural categories, and per-feature ownership.
- **Decision:** `i18next` + `react-i18next` (approval A1):
  - namespaces `common`, `validation`, `nav`, plus one per feature;
  - JSON resources colocated (`features/<f>/i18n/{en,ar}.json`);
  - a small custom backend using `import.meta.glob` loads each namespace lazily with its route chunk;
  - typed keys through `app/i18n.d.ts`.
- **Reason:** built-in Arabic plural forms (zero, one, two, few, many, other), interpolation, fallback and missing-key handling. The lazy loading follows route splits.
- **Trade-off:** about 40KB and some typing setup. The alternative is typed dictionaries plus `Intl.PluralRules`, with plural handling and missing-key tooling written in-house.

Further rules:
- **Content vs UI strings:** bilingual mock content is data (`LocalizedText`), not i18n keys (AD-07).
- **Keys** are nested and camelCase (`tasks.create.fields.subject`). No string concatenation: use interpolation or `<Trans>`.
- **Formatting** lives in `shared/i18n/format.ts` and uses `Intl`:
  - money in KWD with 3 decimals;
  - dates and times;
  - the profile clock fixed to `Asia/Bahrain`;
  - durations (m/h/d);
  - Western digits (`nu: 'latn'`) by default (D20).
- **Calendar labels** (months, the prototype's 2-letter weekdays) are explicit resources under `common.calendar`, per V13.
- **Direction:** `bootstrap.ts` sets `<html lang dir>`. Radix gets `DirectionProvider`, Vaul gets a mapped side, and the RTL font stack applies through `[dir=rtl]`.
- **Recharts** doesn't mirror in RTL, so each chart's RTL behavior is checked against the prototype (Phase 3).
- **Language switch:** there is no end-user control today (V4). Where it goes is D8. The infrastructure doesn't depend on that answer.
- **Extraction:** Phase 3 mechanically extracts the `T()` pairs into en/ar JSON. A parity test fails the build on missing keys.

## 24. Responsive architecture

- **CSS-first**, using the three prototype breakpoints: ≤1040 (burger nav, `.grid-2` collapses to one column, the stage pipeline scrolls sideways), ≤760 (`.hide-sm`, the Home mobile overrides from `#ihub-mobile-overview`), and ≤480 (compact top bar).
- **Overflow:** tables, heatmaps and tab strips scroll horizontally in containers. The heatmap's name column is sticky on phones.
- **Positioning:** popovers use Radix collision handling. The JS measurement code is removed.
- **No `matchMedia`** unless behavior (not only style) must differ. None is needed today.
- **Containers:** `max-w-[1440px]`, padding as in the prototype.

## 25. Error-handling architecture

| Layer | Mechanism |
|---|---|
| Catastrophic | `AppErrorBoundary` outside the router: full-page fallback with reload; React 19 `createRoot({ onUncaughtError, onCaughtError })` → `logger` |
| Route | `errorElement: RouteErrorPage` on the root layout and each area. The error renders inside AppShell so navigation still works. |
| Widget | `ErrorBoundary` with an inline fallback around charts and heatmaps (optional per widget) |
| Validation | field errors from Yup; form-level `InlineAlert` |
| User actions | toasts (success and failure); failures carry an i18n `messageKey` |
| API (future) | `ApiError` normalization → messages; 401/403 hooks; field-error mapping |
| Logging | `shared/lib/logger`: console in development; a pluggable reporter later |

The prototype's `__ihubShowErr` overlay, `window.onerror` painter, `postMessage` edit-mode bridge, `?ihubPreview` hook and Tweaks panel are **excluded**. Vite's development overlay covers local development.

## 26. TypeScript / type ownership

- **Compiler flags:** `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `isolatedModules`. **`exactOptionalPropertyTypes` stays off**, because of friction with RHF and Radix props (approval A6).
- **Domain types** live in their feature's `types/` and are exported only when another feature needs them.
- **Shared types** are generic only: `Tone`, `Option<T>`, `Locale`, `Direction`, `LocalizedText`, `PriorityLevel` (the identical 4-level scale), query and mutation result shapes.
- **Literal unions** come from `as const` arrays. Variants are discriminated unions, for example the drawer: `{type:'action',item} | {type:'incident',item} | {type:'jo',item}`.
- **Configuration objects** such as master definitions are generic interfaces (`MasterDefinition<TRecord>`), not class hierarchies.
- **DTOs** exist only in `api/` (future). Components never see them.
- **No `any`** (lint). Parsed input starts as `unknown` and is validated with Yup.

## 27. Testing architecture

| Level | Tooling | Targets |
|---|---|---|
| Unit | Vitest | every `domain/` rule: SLA state and labels, scoring, escalation, ≤100% weights, dependency reminder, working days, `masterFormMissing`, bulk-name parsing, dashboard-config validation, currency conversion, score bands, nav search scoring, CSV quoting |
| Component | Testing Library + user-event + jsdom | shared controls (Select keyboard, DateField min/max, MultiSelectChips, FileDropZone, Dialog focus/Escape, table sort/visibility); feature forms (submit gating) |
| Route integration | `createMemoryRouter` | **nav↔route parity** (every nav path resolves to a page or placeholder); deep links; invalid parameters → 404 |
| i18n | Vitest | en/ar key parity; every page renders `dir="rtl"` in Arabic |
| Visual fidelity | Playwright (approval A2) | screenshots of the served local prototype vs the new app for key screens at 1440/1040/760/390 × Paper/Ink × EN/AR |
| Future API | MSW | added with the first endpoint |

Tests sit next to their source as `*.test.ts(x)`. Coverage is enforced on `domain/` and `shared/`, not as a global percentage.

## 28. SOLID application guidelines

- **Single responsibility:**
  - Break up the mega-components: `TaskEditPage` (about 1,600 lines) becomes `TaskDetailsView`, one file per card and dialog, and the hooks `useTask(id)` / `useTaskActions`.
  - `DashboardOCC` becomes layout, pages, store and components. `PurchasingScreen` becomes per-tab components and dialogs. `CreateTaskPanelDesignChange` becomes form sections.
  - Pages compose; they don't compute.
- **Open/closed:** replace mode chains with registries. For example `pcMode/aaMode/tmMode/saMode` becomes the masters definition registry: adding a master means adding a file, with no `MasterPage` edits. Nav config, filter field definitions, column definitions and home tab configuration follow the same pattern.
- **Liskov:** every form control honors the same controlled contract, so any control fits `Field` and the RHF adapters. Every Dialog and Drawer part accepts the same slot conventions.
- **Interface segregation:** keep props small. `Chip` knows nothing about priority; features map priority to tone. `RowActions` takes an `actions[]` list rather than ten callbacks.
- **Dependency inversion:**
  - Components depend on hooks, not on sources.
  - Rule functions receive `now`, policy and data as parameters (`slaOf(item, now, policy)`), so the clock is testable.
  - No DI container.

## 29. Naming conventions

- **Files and folders:**
  - folders are kebab-case (`payment-settlement`);
  - component files are PascalCase;
  - hooks are `useX.ts`;
  - stores are `x.store.ts` exporting `useXStore`;
  - `x.schema.ts` exports `xSchema` and `XValues`;
  - mocks are `x.mock.ts`, types `x.types.ts`, pure functions use verb names (`rankActions`).
- **Component suffixes:** `*Page`, `*Layout`, `*Dialog`, `*Drawer`, `*Card`, `*Section`, `*Field`, `*Menu`. Never `*Mock` in production names (`MasterListingMock` becomes `MasterPage`).
- **Code:** booleans use `is/has/can/should`; props `onX`, handlers `handleX`.
- **URLs and keys:** URL segments are kebab-case English; i18n keys are nested camelCase; stable ids use the prototype nav id in `NavNode.id`.
- **Traceability:** migrated modules carry `/** @prototype index.html:L17892 TaskEditPage */`.

## 30. Import / dependency rules

- **Alias:** `@/` → `src/`. No relative imports that leave a feature.
- **Features:** only `@/features/<name>` (the public barrel) may be imported. Deep imports are forbidden. The ESLint core rule `no-restricted-imports` enforces this, with per-folder overrides generated from §6.
- **Shared:** `shared` may not import `@/features`, `@/store` or `@/app`. `features` and `store` may not import `@/app`. `store` may not import `@/features`.
- **Cycle detection:** optional `eslint-plugin-import-x` `no-cycle` (A2).
- **Types:** use `import type`. `xlsx` is always imported lazily; charts load inside route chunks.
- **Barrels:** one per feature root. No nested barrels and no `export *`.

## 31. Architecture anti-patterns to avoid

- `window.*` communication; monkey-patching React; runtime `<style>` injection; inline style objects for static styling
- Mode-switched mega-components; `UniversalTable`, `UniversalForm` or `UniversalModal`
- Mock arrays inside components; duplicating or merging datasets without a decision; faking async latency
- `T('en','ar')` pairs or hardcoded UI strings; physical-direction CSS; literal colors (`bg-[#93358D]`)
- Route state in localStorage; objects passed through router state as the source of truth
- Global Zustand for local UI; `useEffect` for derived data; `Date.now()` inside rule functions
- Deep cross-feature imports; `export *`
- Silently "fixing" prototype no-ops; shipping Tweaks, the edit-mode bridge, the preview hook or the diagnostic overlay

---

## 32. Decisions requiring human confirmation (product and behavior)

**Blocks** means the feature or scope that can't be implemented until the decision is made. **Default** is used only if you explicitly accept it.

| # | Decision | Blocks | Default assumption |
|---|---|---|---|
| D1 | Legacy `CreateTaskPanel`'s **5** embedded uses (V1): keep a legacy `TaskFormDialog`, re-point to the canonical form in modal mode, or navigate to Task Edit (for the Assigned Tasks Edit case)? | tasks, home, incidents | none |
| D2 | Prototype no-ops: inert pagination, decorative tab counts, Reports "Run search", Workflows edit/new/save/publish, Masters Export, the unenforced CEO Comments note, Create Task with no blocking or date-order validation, Export using canned `REPORT_DEFS` rather than on-screen rows, attachment size limits | each feature | keep inert, tagged |
| D3 | Confirm that Home's `ACTIONS` queue is the approval model and that `ApprovalsScreen` and `ApproveRequestScreen` are excluded (V2) | approvals scope | exclude |
| D4 | Two SLA models (Home engine vs SLA screen) | none now | keep separate |
| D5 | Persistence of theme and locale (today neither persists; only the route does) | shell polish | persist both |
| D6 | Visual QA baseline: local prototype served locally, or deploy local to the live URL first? | Phase 3 verification method | local served build |
| D7 | Bulk-upload parity for Task Mapping and Assignment Areas | masters bulk upload | verify first |
| D8 | Where the end-user **language switch** lives (none exists today) | shell i18n UI | top bar, next to the theme toggle |
| D9 | Exclude the Tweaks-only variants: alternative accents, card styles, sidebar layout (with breadcrumbs and context picker), dashboard variants | theme and shell scope | exclude |
| D10 | Masters (List) duplicate nav (visible only in the mobile drawer and search); `/masters` root behavior | masters nav | keep both; first-leaf redirects |
| D11 | Exclude the unreachable components (V2/V3) | scope | exclude |
| D12 | Canonical Analytics & Reports: Home tab view vs `ReportsScreen` | reports | keep both, as reachable today |
| D13 | Home nav children resolve to placeholders from the drawer and search: map them to `/home/:tab`? ("Live Feed" has no matching view) | nav | map where a view exists |
| D14 | Screenless HR, Quality and Settings leaves stay placeholders (for example, HR › Overtime › To Do) | nav | faithful placeholders |
| D15 | FeedbackWidget: production feature or prototype review tool? | shell | exclude from the production build |
| D16 | Duplicate datasets: Home incidents vs Incident Workspace; Home job orders vs Tasks; the two Observations row sets; the separate location/department lists | data consolidation | keep separate |
| D17 | Hosting: SPA fallback at the base path (BrowserRouter), or hash URLs? | scaffold | BrowserRouter plus rewrite |
| D18 | Missing fonts (Myriad Pro, GE SS Light Italic; they 404 in the prototype too): source licensed files or drop the `@font-face` | styles | drop |
| D19 | Mock current user: the top bar says "Ahmad Al Osaimi"; the live site shows "Ahmad Al-Rashid" | shell and requester info | one mock user from local |
| D20 | Arabic numerals: Western (`latn`) or Arabic-Indic | formatters | `latn` |

## 33. Decisions safe to defer

- Axios client, interceptors, DTOs, MSW and optimistic-update details (until the first endpoint)
- The authentication guard and login route
- Per-route document titles (static title for now)
- A date library (native `Date` + `Intl` until complexity demands one)
- Tuning i18n lazy loading (bundle everything first if simpler)
- The logging vendor
- Accessibility improvements beyond the prototype (skip links, live regions)
- URL-backed secondary filters beyond the primary lists
- Enforcing feature boundaries with `eslint-plugin-boundaries`
- Chart RTL mirroring details, per chart
- A performance pass (memoization or virtualization of large mock lists)

## 34. Architecture risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | Fidelity drift when converting inline styles to Tailwind | token mapping table; type-scale extraction; Playwright visual diffs (A2) |
| R2 | Size of `TaskEditPage` and the Create Task form | the fixed decomposition in §3; one card or dialog per task |
| R3 | Hidden `window.*` coupling not yet traced | Phase 3 grep inventory of every `window.X` read and write before each feature migrates |
| R4 | Thousands of bilingual strings | scripted `T()` extraction plus a parity test |
| R5 | RTL defects inherited from the prototype (V13) | an explicit RTL pass per screen; logical side for drawers |
| R6 | SheetJS CVEs; Arabic in CSV opened by Excel | official ≥0.20.2 build; a BOM decision under D2 |
| R7 | BrowserRouter deep links failing on Apache hosting | D17; hash router behind an env switch |
| R8 | Radix and Vaul styling, and focus-ring fidelity; Vaul maintenance and React 19 compatibility | check Vaul at scaffold; fall back to a Radix Dialog side sheet |
| R9 | tailwind-merge misclassifying custom tokens; oklab vs sRGB tints | configure `extendTailwindMerge`; `@utility` chip tones |
| R10 | Recharts vs hand-drawn SVG mismatches | Recharts only where it can match; bespoke SVG for Gantt, ring and segments |
| R11 | Scope creep from fixing prototype bugs | the `PROTOTYPE-NOOP` register; D2 and D13 |
| R12 | Live site older than local | D6 |
| R13 | Unknown future API shapes | DTO/mapper boundary; domain types insulate the UI |

## 35. Proposed architecture Definition of Done

An implementation is architecture-compliant when all of the following hold:

- [ ] The `src/` tree matches §3, with no empty folders and no extra top-level directories.
- [ ] Lint passes: boundary rules (§6, §30), no `any`, no physical-direction classes, no literal colors.
- [ ] There are zero `window.*` app globals, no `React.createElement` patch and no runtime style injection.
- [ ] Every nav node resolves (parity test), and unknown paths render the 404 page.
- [ ] No component or page imports `data/`. Every data hook returns the query-shaped contract.
- [ ] en/ar key parity passes, and RTL rendering passes for every page.
- [ ] Paper and Ink use tokens only.
- [ ] Every intentional no-op carries `PROTOTYPE-NOOP(Dn)` and appears in the register.
- [ ] Prototype tooling is absent from the production bundle.
- [ ] `tsc` strict build passes with zero errors, and tests pass.
- [ ] Visual parity is signed off for the agreed screens and breakpoints.

---

## 1. Architecture summary

- **Structure:** a feature-first React 19 + strict TypeScript app with one composition root (`app/`). It holds the routes, IA navigation, shell and providers.
- **Features:** 21 domain features communicating only through public `index.ts` files along an explicit, acyclic dependency graph.
- **Shared layer:** domain-agnostic, built from small Radix-backed primitives rather than mega-components.
- **Routing:** real React Router URLs replace the prototype's route string and `window` hooks. Hub screens (Home, Work Centre, Payment settlement) become nested layout routes. Screenless nav leaves resolve to faithful placeholders.
- **State:**
  - URL for navigation;
  - `store/` for preferences and tracking;
  - three feature-scoped stores: home queues and drawer, the tasks collection, and task-dashboard config;
  - local state for everything else;
  - TanStack Query reserved for real server data.
- **Data seam:** data hooks return query-shaped results, so the future mock→API switch stays inside hooks.
- **Tokens:** kept verbatim in CSS variables and surfaced through Tailwind v4 `@theme inline`.
- **i18n:** i18next namespaces per feature, with RTL handled through logical CSS and direction-aware primitives.
- **Fidelity:** preserved deliberately. No-ops stay inert and tagged until you decide otherwise.

## 2. Decisions requiring our approval (architecture choices)

- **A1 — runtime packages** beyond the approved stack:
  - `radix-ui`, for overlays and direction;
  - `react-hook-form` + `@hookform/resolvers`;
  - `@tanstack/react-table`;
  - `i18next` + `react-i18next`;
  - `clsx` + `tailwind-merge`;
  - SheetJS (official CDN release), needed to keep XLSX import.
- **A2 — dev tooling:** Vitest, Testing Library, jsdom, Playwright, ESLint (typescript-eslint, react-hooks, jsx-a11y), Prettier with the Tailwind plugin, and optionally `eslint-plugin-import-x`.
- **A3 — structure deviations:** `utils/`, `providers/` and `layouts/` folded as described in §4; features gain `domain/`, `store/` and `i18n/`.
- **A4 — domain-based feature split** (AD-01) and the allowed dependency edges (§6).
- **A5 — routing:**
  - the URL scheme (§11) with friendly slugs;
  - `shared/config/paths.ts` as the shared URL contract;
  - `QueryClientProvider` mounted at scaffold but unused.
- **A6 — conventions:**
  - the query-shaped data-hook contract (AD-06);
  - `LocalizedText` for mock content;
  - TypeScript flags with `exactOptionalPropertyTypes` off;
  - Tailwind token aliases and desktop-first breakpoints (AD-12).

## 3. Questions that truly block Phase 3

1. **Packages:** do you approve A1 and A2? The foundation tasks depend on them.
2. **Project location and hosting:** where does the new app live (new folder or separate repo), and at what deployed base path? Does the host support SPA fallback (D17)? The prototype's root `index.html` can't share a folder with a Vite entry, and the old `app/` folder's future also needs deciding.
3. **Scope exclusions:** do you confirm D3, D9, D11 and D15? These define what Phase 3 plans at all.
4. **Legacy task form (D1):** the answer changes how tasks, home and incidents are ordered and connected in the plan.
5. **Verification baseline (D6):** will visual QA compare against the served local prototype or a freshly deployed live site?

Everything else in §32 can be a gate inside the Phase 3 plan.
