# Phase 3 — Controlled Migration Plan

**Baseline:** the prototype repository at commit `273abc8` ("assignment info", 2026-09-24), file `index.html`. Every line reference below points to that commit. The production app is built in a new, separate repository. The prototype repository stays read-only.

**ID prefixes:**
- **M** — migration phase
- **D** — product decision (Phase 2 §32)
- **Q** — confirmation question (§0)
- **G** — quality gate (§4)
- **R** — operating rule (§2)

---

## 0. Pre-plan check: does anything block sequencing?

**No remaining question prevents sequencing.** Three open items were settled by checking the prototype in this phase:

- **D7 is resolved.** Only the Project Category and Sub Area add dialogs have bulk upload (file input + SheetJS, 3751–3988). Task Mapping (4013) and Assignment Areas (4105) have none, so there is no parity work.
- **Volatility was measured (§8).** Tasks, the Settings dashboard-config builders, the Home banner and `MasterRecordForm` are still changing. The shell and the portal screens are stable. This drives the order.
- **The first real submit form** is the SLA work-area mapping editor (`saveEdit`, 21820). Area is required there, and an invalid save is a silent no-op. React Hook Form and Yup enter at that phase.

The questions below have defaults. Each one gates only the phase named; none blocks the plan.

| # | Question | Gates | Default if unanswered |
|---|---|---|---|
| Q1 | Name and owner of the new repository; Codex branch and PR permissions | M0.1 | team decides; Codex works through PRs only |
| Q2 | Will the prototype keep changing during migration? | every phase | yes; baseline pinned at `273abc8`, with delta intake at every phase start (R6) |
| Q3 | Can CI read the prototype repository for automated visual diffs? | M2.2 | no; visual QA runs locally, CI runs the non-visual gates |
| Q4 | Package manager and Node version | M1.1 | npm and the current Node LTS |
| Q5 | Does the font licence allow the brand fonts in the new repository? | M1.2 | yes (they already ship in the prototype repository) |
| Q6 | Are PR preview deployments wanted? | M1.1 | no; reviewers run the branch locally |

The product decisions (D-items) are mapped to their gating phases in §9.

## 1. Fixed inputs from the Phase 2 approval

- **Architecture:** Phase 2 is approved (`PHASE_2_TARGET_ARCHITECTURE.md`), including the folder deviations: providers and layouts under `src/app/`, utilities under `src/shared/lib`, feature layouts inside their features.
- **Repositories:** the production app goes in a new, separate GitHub repository. The prototype repository is a read-only reference, and `app/` stays excluded.
- **Baseline:** the current local prototype is the source of truth and the QA baseline. The live URL is secondary.
- **Excluded from migration:** D3 (unreachable approval screens), D9 (Tweaks-only variants), D11 (unreachable or superseded components) and D15 (FeedbackWidget).
- **D1:** analyse the five legacy `CreateTaskPanel` usages first. Prefer one canonical task form with explicit modes (Stage 9).
- **Incremental build:** dependencies and infrastructure arrive with their first consumer, and there are no empty feature folders.
- **Deferred stack items:** TanStack Query and Axios stay in the target stack, but are not installed or mounted until real server state exists (§11).

## 2. Operating rules

| # | Rule |
|---|---|
| R1 | **One phase at a time.** Each phase ends with a report and a stop for human approval. The next phase starts only after approval. |
| R2 | **Infrastructure arrives with its first consumer.** A shared component, hook or utility is created only in the phase whose screen needs it, and is used in that same phase. |
| R3 | **Packages arrive with their first consumer.** A phase adds only the packages its card lists. |
| R4 | **A feature folder is created when that feature's migration begins.** |
| R5 | **Two different placeholders.** `PlaceholderPage` reproduces the prototype's own StubScreen and is final. `MigrationPending` marks prototype functionality that isn't migrated yet: visually distinct, dev-only, and it must reach zero before release. |
| R6 | **Delta intake.** At phase start, diff the prototype's current HEAD against the baseline for that phase's source ranges. If anything changed, report it; a human chooses to **adopt** it (recorded as a per-feature baseline bump) or **defer** it. |
| R7 | **Fidelity first.** Reproduce the canonical UI and behavior. Prototype no-ops stay inert, are tagged `PROTOTYPE-NOOP(Dn)`, and are registered. Nothing is "fixed" silently. |
| R8 | **Excluded code is never ported.** That covers D3, D9, D11 and D15 components, the Tweaks panel, the edit-mode `postMessage` bridge, the `?ihubPreview` hook and the diagnostic overlay. |
| R9 | **Business rules are unit-tested**, with golden fixtures from the running prototype wherever the function is reachable (§3.4). |
| R10 | **Registers (§10) are updated in every phase.** |

## 3. Verification method (local prototype baseline)

### 3.1 Serving the prototype

`npm run prototype:serve` serves `PROTOTYPE_DIR` (checked out at the baseline) from a static server on a fixed port. The new app runs on its own port.

### 3.2 Driving the prototype to a given state

- **Nav screens:** set `localStorage['ihub.route'] = '<nav id>'` before loading. The prototype only restores ids that exist in `NAV_INDEX`.
- **Home tabs, Work Centre sections and dialogs:** use scripted clicks.
- **Theme:** click the top-bar toggle.
- **Arabic:**
  1. Run `window.postMessage({type:'__activate_edit_mode'}, '*')`.
  2. Click "العربية" in the Tweaks panel.
  3. Post `__deactivate_edit_mode` before capturing.
- **Task Edit shortcut:** `?ihubPreview=taskScope`.
- **Determinism:** install a fixed clock in both apps (Playwright clock). Where the prototype uses randomness (the QR scan), stub `Math.random` identically in both.

### 3.3 QA matrix

| Matrix | Captures per state | Used in |
|---|---|---|
| **Full** | widths 1440 / 1040 / 760 / 390 × Paper / Ink × EN / AR (16) | M2.2, M2.3, M3.1, M5.1, M10.2, M12.1 |
| **Reduced** | 1440 Paper EN, 1440 Ink EN, 1440 Paper AR, 760 Paper EN, 390 Paper EN (5) | every other UI phase |

Each phase card names the states to capture. Comparison is side by side. Pixel diffs help, but people decide.

### 3.4 Golden fixtures from the running prototype

Top-level functions and constants in the prototype's classic scripts can be called through `page.evaluate`. Examples: `navSearch`, `slaOf`, `scoreAction`, `scoreIncident`, `rankActions`, `masterFormMissing`.

`scripts/golden/*` evaluates them against fixed input sets and writes JSON fixtures, which the new app's unit tests must match. Logic hidden inside closures is checked through the UI instead. Fixtures are regenerated only on an approved baseline bump.

### 3.5 Behavior checklists

Each phase lists its interactions: open/close, keyboard, validation gating, state changes and navigation. Each one is run in both apps and the result is recorded.

### 3.6 Materiality rule

- **Minor (log and continue):** anti-aliasing, spacing of 2px or less, font hinting, scrollbar or native focus rendering.
- **Material (fix before approval):** layout structure, missing or extra controls, wrong labels/data/counts, wrong behavior or state, wrong component type, RTL mirroring errors, token or theme errors.

### 3.7 Evidence pack (attached to every phase PR)

- captures for every state and matrix cell (prototype and new side by side)
- checklist results
- gate output
- register changes

## 4. Standard quality gates

| Gate | Check | Pass criterion | Active from |
|---|---|---|---|
| G1 | `npm run typecheck` | 0 errors (strict) | M1.1 |
| G2 | `npm run lint` | 0 errors: boundaries, no `any`, no JSX text literals, no physical-direction or palette classes | M1.1 |
| G3 | `npm run test` | all pass; every new rule or shared component has tests | M1.1 |
| G4 | `npm run build` + `check:bundle` | builds; no prototype-tooling strings; lazy chunks intact | M1.1 |
| G5 | i18n parity test | en and ar key sets identical | M1.3 |
| G6 | nav↔route parity test | every nav node resolves; unknown paths → 404 | M2.1 |
| G7 | fidelity evidence | §3 evidence complete; no open material difference | M2.2 |
| G8 | no speculative code | every new shared export has a consumer in the same phase (review, plus `knip` if approved) | M1.1 |
| G9 | dependency diff | only the packages the phase card lists | M1.1 |
| G10 | registers | NOOPs, pending markers, deviations and deltas updated | M1.1 |

## 5. Standard phase workflow and report

**Workflow (Codex):**
1. Read the phase card and the Phase 2 sections it references.
2. Run delta intake (R6). If the prototype changed, stop for a decision.
3. Study the prototype source ranges and the running screens; write the behavior checklist.
4. Implement exactly the card's scope, infrastructure and packages.
5. Add unit, golden and component tests; run G1–G6.
6. Run visual and behavior QA (§3) and fix material differences.
7. Update the registers.
8. Open one PR on branch `mig/<id>-<slug>` containing the phase report, then **stop**.

**Phase report template:**
- phase ID and title
- delivered scope
- files and folders created
- shared infrastructure introduced
- packages added, with exact versions
- delta intake result
- G1–G10 results
- QA evidence
- differences (minor ones logged, material ones fixed)
- NOOPs added
- `MigrationPending` markers added or removed
- open questions
- approval request

## 6. Plan overview

Phases run in ID order. Within Stages 3, 6 and 7, phases may be reordered with approval, as long as "Depends on" is respected. **Size** is prototype source volume: S = under 300 lines, M = 300–800, L = over 800 or high complexity.

| ID | Phase | Size | Depends on | Shared infrastructure introduced | Packages added | Gates |
|---|---|---|---|---|---|---|
| M0.1 | New repository | — | — | — | — | Q1 |
| M0.2 | Prototype reference checkout | — | — | — | — | — |
| M0.3 | Planning docs in the new repo | — | M0.1 | — | — | — |
| M1.1 | Scaffold & quality gates | S | M0.* | lint/test/CI tooling, registers | react, react-dom, typescript, vite, @vitejs/plugin-react, eslint, @eslint/js, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-jsx-a11y, prettier, vitest, jsdom, @testing-library/{react,user-event,jest-dom} | Q4, Q6 |
| M1.2 | Tokens, fonts, Tailwind | M | M1.1 | tokens.css, fonts.css, base.css, `@theme`, `cn` | tailwindcss, @tailwindcss/vite, prettier-plugin-tailwindcss, clsx, tailwind-merge | D18, Q5 |
| M1.3 | i18n, preferences, direction | M | M1.2 | shared/i18n, preferences store, bootstrap, string-extraction script | i18next, react-i18next, zustand | D5, D20 |
| M1.4 | Router, errors, migration markers | S | M1.3 | router core, ErrorBoundary, RouteErrorPage, NotFoundPage, logger, env, MigrationPending | react-router | — |
| M2.1 | Navigation model & route map | M | M1.4 | nav config/model, `paths.ts`, PlaceholderPage, masters catalogue | — | D10, D13, D14 |
| M2.2 | Shell chrome & QA harness | M | M2.1 | AppShell, TopNav, MegaMenu, MobileNavDrawer, SecondaryNav, UnderlineTabs/SegmentedControl/LinkTabs, icon registry, Chip, Drawer parts, DirectionProvider, Playwright harness | radix-ui, vaul, lucide-react, @playwright/test, a static file server | shell sign-off |
| M2.3 | Top-bar actions | M | M2.2 | CommandSearch, golden scripts, NotificationsMenu, useCurrentUser, Avatar | — | D8, D19 |
| M3.1 | Section/Report template | L | M2.3 | SectionLayout, SectionReport, RecordFilter, shared/filter, Select, MultiSelectChips, DateField, DateRangeField, Checkbox, Field, Dialog, DropdownMenu, Toaster, file csv/download/print, useSearchParamState | — | template sign-off |
| M3.2 | Appraisal | S | M3.1 | Table primitives, TabbedTable, TablePagination (inert), EmptyState | — | — |
| M3.3 | HR (Overtime) | S | M3.2 | StatTile | — | D14 |
| M3.4 | Notifications page | S | M3.2 | — | — | — |
| M3.5 | Quality: Checklist | S | M3.2 | — | — | D14 |
| M3.6 | History | S | M3.2 | — | — | — |
| M3.7 | Workflows | M | M3.1 | Switch | — | — |
| M3.8 | SLA & Compliance | M | M3.1 | ProgressBar, RHF adapters, TextInput, TextArea, yupLocale, requiredText | react-hook-form, @hookform/resolvers, yup | — |
| M3.9 | Reports library | S | M3.4 | FilterForm promoted to shared | — | D12 |
| M4.1 | Master listing | M | M3.2 | table engine, DataTableView, TablePagination (functional), ColumnSettingsDialog, RowActions, TableToolbar, ConfirmDialog | @tanstack/react-table | D10 |
| M4.2 | Master record forms | M | M4.1, M3.8 | FormGrid, FormActions, RepeatableRows, SegmentedRadio, SwatchRadio | — | delta intake |
| M4.3 | Bulk import | S | M4.2 | file/xlsx (lazy), readFile | xlsx (SheetJS ≥ 0.20.2) | — |
| M5.1 | Home layout & banner | M | M3.5, M3.8 | ProgressRing, useNow | — | delta intake |
| M6.1 | Budgeting (section variant) | M | M3.2 | first chart component | recharts (only if it can match) | — |
| M6.2 | Budgeting (home variant) | M | M6.1, M5.1 | — | — | — |
| M6.3 | Purchasing: requests & review | M | M5.1, M3.8 | — | — | — |
| M6.4 | Purchasing: purchase orders | M | M6.3 | AttachmentList, file picker | — | — |
| M6.5 | Purchasing: quotations | M | M6.4 | CollapsibleCard | — | — |
| M6.6 | Payment settlement: layout & action sheets | M | M5.1, M6.4 | — | — | — |
| M6.7 | Payment settlement: petty cash | M | M6.6 | — | — | — |
| M6.8 | Payment settlement: add a supplier | S | M6.6 | — | — | — |
| M7.1 | Work Centre hub | M | M5.1 | — | — | — |
| M7.2 | Enquiries | S | M7.1, M6.4 | captionedFiles schema helper | — | — |
| M7.3 | Observations | M | M7.2 | — | — | D16 |
| M7.4 | Snag lists | S | M7.1 | — | — | — |
| M7.5 | Incident workspace | M | M7.1 | Timeline, TimelineItem, HistoryRail, useRecordHistory, tracking store | — | — |
| M7.6 | Work Centre checklist sub-views | S | M7.1, M3.5 | — | — | — |
| M8.1 | Task list | M | M7.1, M4.1 | SegmentBar, column ordering/grouping | — | delta intake |
| M8.2 | Task analytics & workload heatmap | L | M8.1 | remaining charts, task dashboard config store | recharts (if not added yet) | delta intake |
| M8.3 | Create Task (canonical) | L | M8.1, M6.5 | FileDropZone, AttachmentPreviewDialog, useObjectUrl, seedable random | — | delta intake |
| M8.4 | Task View | L | M8.3 | GanttChart, working-days util | — | delta intake |
| M8.5 | Task Edit: cards, comments, history | L | M8.4 | — | — | delta intake |
| M8.6 | Task Edit: dialogs & action bar | L | M8.5 | — | — | delta intake |
| M9.1 | Task-form analysis (document only) | S | M8.3, M7.5 | — | — | **D1 approval** |
| M9.2 | Task-form modes + incident "Raise a task" | M | M9.1 | TaskFormDialog (tasks public API) | — | — |
| M10.1 | Queues, workflow drawer, Approvals | L | M6.6, M6.7, M9.2 | homeQueue store | — | — |
| M10.2 | Overview | L | M10.1, M8.2, M3.8, M7.5 | — | — | D4 |
| M10.3 | Assigned, live incidents, tracker | M | M10.2 | — | — | D16 |
| M10.4 | Company, Home tasks, Home reports | S | M10.1 | — | — | D12 |
| M11.1 | Configuration: user administration | S | M2.3 | — | — | — |
| M11.2 | Dashboard configuration builders | L | M11.1, M8.2, M10.2 | file/json | — | delta intake |
| M12.1 | Full regression | — | all | — | — | — |
| M12.2 | Production readiness | — | M12.1 | — | — | D17 |
| M12.3 | Release sign-off | — | M12.2 | — | — | final approval |

---

## 7. Phase cards

Every phase must pass G1–G10 and end with a stop for approval. The cards list only what is specific to each phase.

### Stage 0 — Prerequisites (human-led)

**M0.1 — New repository**
- **Scope:** create the separate GitHub repository (Q1) with default branch `main`. Protect it with required PRs, passing CI and one approval. Give Codex access to push branches and open PRs.
- **Acceptance:** Codex can open a PR against `main`.

**M0.2 — Prototype reference checkout**
- **Scope:** a local clone of the prototype repository checked out at `273abc8`, used read-only. Its path is exported as `PROTOTYPE_DIR`.
- **Acceptance:** `index.html` served from `PROTOTYPE_DIR` renders the Home dashboard.

**M0.3 — Planning documents in the new repository**
- **Scope:** copy the Phase 2 architecture into `docs/architecture/` and this plan into `docs/migration/`. Recommended: also save the Phase 1 and Phase 1.5 reports, which exist only in chat today.
- **Acceptance:** documents present; plan version recorded.

### Stage 1 — Foundation

**M1.1 — Scaffold and quality gates**
- **Scope:**
  - Vite + React 19 + TypeScript, using the Phase 2 §26 compiler flags and the `@/` alias.
  - `src/main.tsx` and `src/app/App.tsx` render an empty root.
  - ESLint flat config:
    - typescript-eslint (strict), react-hooks, jsx-a11y, and `no-explicit-any`;
    - `no-restricted-imports` boundary rules (Phase 2 §6, §30);
    - `no-restricted-syntax` rules flagging JSX text literals, physical-direction classes and default-palette classes.
  - Prettier.
  - Vitest + Testing Library + jsdom (`src/test/setup.ts`).
  - Scripts: `typecheck`, `lint`, `test`, `build`, `check:bundle`.
  - GitHub Actions running G1–G4 on every PR.
  - Empty register templates in `docs/migration/`.
- **Introduces:** tooling only. No `src/` folder may exist without files.
- **Packages:** as listed in §6. Optional if approved: eslint-plugin-import-x (cycle detection), knip (unused exports).
- **Acceptance:**
  - All scripts green locally and in CI.
  - A scratch branch shows lint failing on a deep feature import, an `any`, a JSX literal and `pl-4`. The failures appear in the report; the branch is not merged.

**M1.2 — Design tokens, fonts, base CSS, Tailwind**
- **Source:** `installGlobalStyles` 134–612 (fonts 139–201, Paper tokens 203–261, Ink 263–285, base rules 287–612); head styles 6–41; runtime accent 22380–22388.
- **Scope:**
  - `styles/tokens.css`: prototype names and values verbatim, including `--accent-dim: #93358D24`; Ink under `:root[data-theme="ink"]`.
  - `styles/fonts.css` + `assets/fonts/`: Zarid Sans, BCN Arabic, GE SS, Cormorant italic and `NumCalibri`, self-hosted, no base64.
  - `styles/base.css`: body type, RTL font stack and 1.58 line-height, focus ring, scrollbars, emphasis motif, `.num` tabular numerals, logo swap, sRGB chip-tone `@utility`.
  - `styles/index.css`: `@theme inline` aliases (Phase 2 §22), invariant scales, desktop-first breakpoints (1041 / 761 / 481), default palette and radius reset.
  - `shared/lib/cn.ts` with `extendTailwindMerge`.
- **Acceptance:**
  - Token parity test passes 100%. It compares against a fixture of prototype values with line references.
  - Setting `data-theme` on `<html>` switches every surface.
  - `dir="rtl"` switches the font stack and line-height.
  - A default-palette class compiles to nothing.
  - `cn` merge tests pass, including `text-fg-2` vs `text-sm`.
  - No base64 fonts in the bundle.
- **Gates:** D18 (missing fonts), Q5 (licence).

**M1.3 — i18n, preferences, direction**
- **Source:** `T` helper 2614; locale and theme effects 22379–22388; date-picker labels 1526–1529; profile clock fixed to Asia/Bahrain (~15001).
- **Scope:**
  - `shared/i18n`:
    - i18next instance with a lazy namespace backend (`import.meta.glob`);
    - `common` and `validation` namespaces (only the keys used so far);
    - `format.ts` (KWD with 3 decimals, digits per D20, Asia/Bahrain helper);
    - `calendar.ts` (explicit month and weekday resources);
    - `localized.ts` (`LocalizedText`) and `useDirection`.
  - `app/i18n.d.ts` for typed keys.
  - `store/preferences.store.ts`: theme and locale; persistence per D5 through a try/catch storage adapter under key `ihub.v2.preferences`.
  - `app/bootstrap.ts`: applies `lang`, `dir` and `data-theme` to `<html>` before first render and syncs i18next.
  - A dev-only `?lng=` switch (removed from production builds) until D8 is implemented.
  - `scripts/extract-strings`: turns `T('en','ar')` pairs from a prototype line range into draft namespace JSON.
- **Acceptance:**
  - The en/ar parity test fails on a missing key.
  - Formatter tests pass: `1,234.500 KWD`, Latin digits in Arabic, Asia/Bahrain time.
  - Switching locale flips `dir` and `lang` without a reload.
  - The production bundle has no `?lng` handler.
  - The extraction script reproduces a sample range verbatim.
- **Gates:** D5, D20.

**M1.4 — Router skeleton, error handling, migration markers**
- **Source:** mount and error overlay 22548–22586 (the overlay is excluded).
- **Scope:**
  - `app/router/router.tsx`: browser or hash mode via `VITE_ROUTER_MODE`, `basename` from `VITE_BASE_PATH`.
  - Root route with `RouteErrorPage` and `NotFoundPage`.
  - `AppErrorBoundary`, built from `shared/ui/feedback` `ErrorBoundary` + `ErrorFallback`.
  - `shared/lib/logger`; React 19 `createRoot` error hooks.
  - The `MigrationPending` marker component plus a `report:pending` script that lists markers and fails in `--release` mode.
  - `shared/config/env.ts`.
- **Acceptance (all tested):**
  - An unknown path shows NotFound.
  - A throwing route shows `RouteErrorPage` inside the root.
  - A crash above the router shows `AppErrorBoundary`.
  - Both router modes work.
  - `report:pending --release` fails while any marker exists.

### Stage 2 — Application shell

**M2.1 — Navigation model and route map**
- **Source:** `NAV_TREE` 2460–2591; nav helpers 2592–2613; `MASTERS_CATEGORIES` 2423–2457; `MASTERS_WITH_PAGE` 2458; App route switch 22416–22528; `StubScreen` 7856–7937 and App stub text 22524–22528.
- **Scope:**
  - `app/navigation/*`:
    - typed config, keeping prototype ids in `NavNode.id`;
    - labels in the `nav` namespace, extracted verbatim;
    - a pure model with tests, plus `useNavTrail`.
  - `features/masters/catalogue/` + `features/masters/index.ts` (catalogue only).
  - `shared/config/paths.ts`.
  - Route areas implementing the Phase 2 §11 URL map:
    - screens that exist in the prototype render `MigrationPending`;
    - prototype stub leaves render `PlaceholderPage`: title, "Module landing — connect your data to see live content." and the scaffold body;
    - redirects for `/`, `/home` and first-leaf (D10);
    - Home nav children mapped per D13; `homeTab` route handles;
    - no routes for D11 items.
- **Acceptance:**
  - G6 parity test green.
  - Placeholder titles match the prototype in EN and AR.
  - The URL map matches Phase 2 §11 row by row.
  - Unit tests cover trail, first leaf and ancestor.
- **Gates:** D10, D13, D14.
- **Interim:** placeholders render without the Section/Report toggle until M3.1 (logged as pending).

**M2.2 — Shell chrome and visual-QA harness**
- **Source:** Shell top-nav branch 5180–5192; `TopNav` 3023–3121; `MegaMenuNavItem` 2897–3022; `NavTree` 2661–2709; `SecondaryNav` 5093–5171; `L2TabStrip` 5021–5092; `Logo` 2615–2660; icons 614–1097; responsive rules 489–540.
- **Scope:**
  - `AppShell`.
  - `TopNav`: flat buttons and active state; burger at ≤1040px; compact bar at ≤480px.
  - `MegaMenu`: click to open; 1180px panel centered and clamped; 186px category rail; 3-column items; opens on the current category; overlay click closes.
  - `MobileNavDrawer` + `NavTreeList`.
  - `SecondaryNav`: L2/L3/L4; hidden on `/home` and `/masters`; `/masters-list` uses L2 for both levels.
  - `Logo`, colour or white per theme.
  - Icon registry: Lucide at 1.6 stroke plus custom glyphs, documented in `docs/migration/ICON_MAP.md`.
  - `UnderlineTabs`, `SegmentedControl`, `LinkTabs`, `Chip` (badge).
  - `AppProviders` with Radix `DirectionProvider`.
  - QA harness: `prototype:serve`; Playwright drivers for route, theme, Arabic via Tweaks `postMessage` and a fixed clock; a side-by-side capture script.
- **Acceptance:**
  - Full matrix for these states: default top nav; each top-level section active; mega menu open on every category; mobile drawer open with the tree expanded; SecondaryNav L2, L3 and L4 examples; Masters (List) strips.
  - Escape closes the mega menu and the drawer, and focus returns to the trigger.
  - RTL mirroring is correct.
  - Vaul confirmed on React 19; if not, a fallback is recorded (risk R8).
- **Gate:** shell sign-off and icon-map approval.

**M2.3 — Top-bar actions**
- **Source:** `NAV_SEARCH_INDEX` 3127–3147; `navSearch` 3148–3170; `SearchHighlight` 3171–3183; `SearchBox` 3184–3335; `ThemeToggle` 3336–3345; `NotificationsBell` 3346–3372; `TopBarActions` 3373–3401; `Avatar` 3402–3428.
- **Scope:**
  - `CommandSearch`: index build, scoring, top 12 results, highlight, keyboard.
  - `ThemeToggle`.
  - Settings link to `/settings/configuration`.
  - `features/notifications` begins: bell data as `LocalizedText`; `NotificationsMenu` with All/Unread, unread dot, and "View all" to `/notifications`.
  - `features/organization` begins: current-user mock and `useCurrentUser`.
  - `Avatar`.
  - Language switch per D8.
- **Introduces:** golden-fixture scripts (`scripts/golden/*`).
- **Acceptance:**
  - Golden search parity: for 40 or more EN/AR queries, the new ordered results equal the prototype's `navSearch` output.
  - ↑, ↓, Enter and Escape behave as in the prototype.
  - Bell tabs and counts match.
  - Theme persists per D5.
- **Gates:** D8, D19.

### Stage 3 — Section template and stable sections

**M3.1 — Section/Report template, RecordFilter, export**
- **Source:** `SectionShell` 1802–1815; `REPORT_DEFS`/`SR_DEF`/`SectionReport` 1729–1801; `RF_*` 1416–1455; `RFExport` 1457–1488; `RFDate` 1489–1564; `__DateField` 1565–1576; `RecordFilter` 1577–1727; select and date patch behavior 50–96.
- **Scope:**
  - `SectionLayout` (`?view=report`, resets on path change), inserted into the route tree for every wrapped area (Phase 2 §10) with `reportKey` handles.
  - `features/reports` begins: `SectionReport` plus the reachable `REPORT_DEFS` keys. Reachability is verified at phase start; unreachable keys are listed under D11.
  - `features/organization` adds the RF vocabulary, `RecordFilter` and reference hooks.
  - `shared/filter/*`.
  - `shared/form`: `Select` (searchable combobox), `MultiSelectChips`, `DateField`, `DateRangeField`, `Checkbox`, `Field`, `FieldLabel`.
  - `shared/ui/overlay`: `Dialog` parts, `DropdownMenu`.
  - `Toaster`.
  - `shared/file`: csv, download, print.
  - Chip tones.
  - Placeholders now render inside `SectionLayout`.
- **Acceptance:**
  - Report tab parity on every wrapped section route (explicit keys) and on placeholder routes (fallback definition).
  - RecordFilter parity for each kind: fields, quick flags, applied chips, clear all, date min/max linkage.
  - CSV export is byte-identical to the prototype's for the same data (golden file); the Excel variant's MIME type and filename match.
  - PDF and Print both call `window.print`.
  - Select: type-to-search, ↑/↓, Enter, Escape, "No matches".
  - DateField: Today, Clear, out-of-range days disabled, Arabic month and weekday labels.
- **Gate:** template sign-off (about 12 screens reuse it).

**M3.2 — Appraisal**
- **Source:** `AppraisalScreen` 8466–8569; `TabbedTable` 8070–8227; `STATUS_PILL` 8271–8284.
- **Scope:**
  - `features/appraisal`.
  - `shared/table` primitives, `TabbedTable`, and `TablePagination` in inert mode (`PROTOTYPE-NOOP(D2)`).
  - `EmptyState`.
  - Score-band rule in `domain/`: ≥4 ok, ≥3 neutral, otherwise bad.
- **Acceptance:** reduced matrix; rows, pills and counts identical; score-band tests; inert pagination registered.

**M3.3 — HR (Overtime)**
- **Source:** `OvertimeScreen` 8285–8465; `StatRow` 8228–8270.
- **Scope:** `features/hr` at `/hr`; `StatTile`; RecordFilter kind `budget`.
- **Acceptance:** 7 tabs with the prototype's literal counts, stored as `displayCount` and registered as NOOPs; the three stat cards; HR child leaves stay placeholders (D14).

**M3.4 — Notifications page**
- **Source:** `NotificationsScreen` 12032–12129; `FilterForm` 7947–8069.
- **Scope:** `NotificationsPage` at `/notifications`: All/Unread tabs, stat row, and `FilterForm` kept local until a second consumer appears (M3.9). The bell's "View all" link goes live.
- **Acceptance:** parity; the decorative filter fields stay inert and are registered.

**M3.5 — Quality & Compliance: Checklist**
- **Source:** `ChecklistScreen` 8570–8664.
- **Scope:** `features/checklists` begins with `ChecklistPage` at `/quality` (2 tabs), using RecordFilter kind `sheet`.
- **Acceptance:** parity; Quality & Compliance stub leaves stay placeholders (D14).

**M3.6 — History**
- **Source:** `HistoryScreen` 9729–9780.
- **Scope:** `features/history` at `/history/*`, reading module and category from the path. Row generation (scope → prefix, kind, 10 rows) is ported as a pure function.
- **Acceptance:** for every History nav leaf, refs, actions, users, dates, tones and the RecordFilter kind all equal the prototype (checked through the UI).

**M3.7 — Workflows**
- **Source:** Workflows block 21190–21528.
- **Scope:**
  - `features/workflows` with 4 tabs.
  - A rules table with expandable rows, built on plain primitives.
  - `Switch`, the KPI strip and the step timeline.
  - SLA & escalation table with the derived "next owner / Department Head" rule.
  - New Rule, row Edit, Discard, Save Draft and Publish stay inert and registered.
  - The version badge.
- **Acceptance:** parity on every tab; `durMins`, `fmtTotal` and escalation logic unit-tested against values the prototype renders.

**M3.8 — SLA & Compliance**
- **Source:** SLA block 21660–22070 (`saveEdit` at 21820).
- **Scope:**
  - `features/sla` at `/quality/sla`.
  - Overview: clock-rules card, department table, and an item drill-in dialog with an inert preview and a time-used progress bar.
  - Work-area mapping: search, priority filter, and an add/edit/remove dialog.
  - Public hooks `useSlaLevels` and `useSlaPerformance`.
- **Introduces:** `ProgressBar`; React Hook Form + Yup, with `shared/form/rhf` adapters, `TextInput`, `TextArea`, `yupLocale` and `requiredText`.
- **Fidelity rules to keep:** area is required, and an invalid save stays a **silent no-op**; empty priorities default to P3.
- **Acceptance:** parity; on-time % and the save/default rules unit-tested; no error text appears where the prototype shows none.

**M3.9 — Reports library**
- **Source:** `ReportsScreen` 9609–9728.
- **Scope:** `ReportsLibraryPage` at `/reports`: the 17 reports and their group chips. `FilterForm` is promoted to `shared/filter` (its second consumer). The "Run search" preview stays a placeholder and is registered.
- **Gate:** D12 (default: keep both this page and the Home tab view).

### Stage 4 — Masters

**M4.1 — Master listing**
- **Source:** `MasterListingMock` 4520–5020; `MasterFilterModal` 3624–3731; `MasterPagePending` 4241–4265; `MasterDeleteModal` 4492–4519; seed rows 3489–3623.
- **Scope:**
  - Definition-driven `MasterPage` for the five `MASTERS_WITH_PAGE` items:
    - search, status chips and an in-row status toggle;
    - a settings dialog for column, chip and filter-field visibility (Select all / Deselect all);
    - 10 rows per page, "Showing X of Y records" and pagination;
    - row actions;
    - the Export button, verified at phase start and inert by default;
    - a mode-specific filter dialog;
    - delete confirmation.
  - `MasterPendingPage` for every other item.
  - The Masters (List) variant per D10.
- **Introduces:** table engine, `DataTableView`, functional `TablePagination`, `ColumnSettingsDialog`, `RowActions`, `TableToolbar`, `ConfirmDialog`.
- **Acceptance:** per-mode columns and filters match (PC, AA, SA, TM, generic); pagination and visibility behave identically; delete text matches; reduced matrix for each of the five masters.

**M4.2 — Master record forms**
- **Source:** `MasterRecordForm` 4306–4449 (**volatile**); view and edit modals 4450–4491; add modals 3751–4240; `masterFormMissing` 4281–4305; `MASTER_ADD_OPTIONS` 3732–3748; zone cascade 3552–3559; `TmMultiSelect` 3989–4012.
- **Scope:**
  - View and edit dialogs; four add dialogs by definition plus a generic multi-row add.
  - Required-field rules as Yup schemas and `domain/requiredFields`.
  - Zone options narrowed by location.
  - Task Mapping: chips, severity swatches, priority radio.
  - The note "Separate Sub area will be created for each area".
- **Introduces:** `FormGrid`, `FormActions`, `RepeatableRows`, `SegmentedRadio`, `SwatchRadio`.
- **Acceptance:**
  - Golden parity of `masterFormMissing` for every mode.
  - Submit-disabled behavior matches.
  - Multi-value flattening on edit matches.
  - Add still closes without persisting, as in the prototype (registered under D2).

**M4.3 — Bulk import (Project Category, Sub Area)**
- **Source:** `PcCategoryAddModal` 3751–3867; `SubAreaAddModal` 3871–3988.
- **Scope:**
  - `shared/file/xlsx.ts` (lazy SheetJS) and `readFile.ts`.
  - Masters `domain/bulkNames`: first column, header-word strip, trim, dedupe, merge into editable rows.
  - Status chip "N records added from …", the error note, and "Download Sample CSV".
  - Only these two masters get upload (D7 is verified).
- **Acceptance:** the same fixtures (CSV, XLSX and XLS, with and without a header row) produce identical rows in both apps; SheetJS loads only on upload; the reader-failure message matches.

### Stage 5 — Home frame

**M5.1 — Home layout and banner**
- **Source:** `HomeTopBanner` 14983–15161; `HeroCarousel` 14899–14976 (**volatile**); `PulseStrip` 12678–12783; `TabBar` 12521–12574; `AiSubscriptionMenu` 5819–5853; OCC datasets 12130–12459; `ProgressRing` 1817–1871; incidents sub-tab switch 14746–14778.
- **Scope:**
  - `features/home` begins: `HomeLayout`, `HomeBannerLayout`, `HomeTopBanner`.
  - The banner includes:
    - greeting and a profile clock fixed to Asia/Bahrain;
    - a 4-slide carousel (6s auto-advance, pause on hover or focus, dots, next);
    - the AI subscription menu;
    - the pulse strip;
    - the tab bar with counts.
  - Home datasets with read hooks and count derivation (no store yet).
  - `/home/*` tab routes render `MigrationPending`, except **SOP Checklist** (M3.5) and **SLA** (M3.8), which go live.
  - The incidents sub-tab switch.
  - Task routes wrapped in `HomeBannerLayout`.
- **Introduces:** `ProgressRing`, `useNow`. No chart library is needed here (verified: the banner uses only `ProgressRing`).
- **Acceptance:** full matrix for the banner (each slide and the paused state); tab counts equal the prototype; clock correct under a fixed time; carousel timing tested with fake timers.

### Stage 6 — Finance hub screens

**M6.1 — Budgeting (section variant)**
- **Source:** `BudgetingScreen` 11309–11666 (section mode).
- **Scope:** `features/budgeting` at `/finance`, `/finance/dashboard` and `/finance/budgeting`:
  - dashboard and budgeting sections;
  - sub-tabs: balance report (including the negative "Overspent" row), CEO payment approval, pre-approved, on hold/partial, rejected, history;
  - the projected-vs-actual revenue chart.
- **Introduces:** the first `shared/ui/charts` component. Use Recharts only if it can reproduce the prototype chart; otherwise build a bespoke SVG component and record the choice.
- **Acceptance:** parity; literal counts registered.

**M6.2 — Budgeting (home variant) and sub-views**
- **Source:** `BudgetingScreen` home mode; `NewBudgetView`, `BudgetSheetView`, `ActivityMasterView` (rendered at 11662).
- **Scope:** `/home/budgets/:section?` covering sheet, activities, new budget, additional budget, transfer fund and report; the budget-sheet export.
- **Acceptance:** parity for every section; export golden file.

**M6.3 — Purchasing: requests and review**
- **Source:** `PurchasingScreen` 10033–11308 (request segments, `pcMatchRow`, review modal around 10254–10317).
- **Scope:**
  - `features/purchasing` at `/home/purchasing/:section?`.
  - Request segments: create, pending, edit, review, to-do, missing, history, report.
  - The row-filter domain.
  - Review dialog: only the supplier is editable, and it locks after a single submit.
- **Acceptance:** row-matching unit tests; lock rule; parity.

**M6.4 — Purchasing: purchase orders**
- **Scope:**
  - PO tabs: to-do, history, report.
  - PO attach dialog: recap, captioned attachments, PO number, actual value, remarks.
  - Attach closes without validation, as in the prototype.
- **Introduces:** `AttachmentList` with required captions and a file-picker button. Drag-and-drop is added only if this screen has it.
- **Acceptance:** caption highlighting and list behaviors match.

**M6.5 — Purchasing: supplier quotations**
- **Scope:**
  - Quotation tabs.
  - Add-quotation builder:
    - lettered suppliers A–H in collapsible cards;
    - conversion using the CBK FX table, with a user-override flag;
    - captioned attachments.
- **Introduces:** `CollapsibleCard`; `domain/currencyConversion`.
- **Acceptance:** conversion tests against prototype values; override flag behavior; parity.

**M6.6 — Payment settlement: layout and action sheets**
- **Source:** `CreateActionSheetPanel` 20922–21040; `ActionSheetSection` 21041 onward.
- **Scope:**
  - `features/payment-settlement`.
  - `PaymentSettlementLayout` with Action Sheet, Petty Cash and Add a Supplier.
  - Action-sheet screens and the create/review panel (review, resubmit and verify modes).
  - `ActionSheetForm` exported for Home.
- **Acceptance:** parity for every panel mode.

**M6.7 — Payment settlement: petty cash**
- **Source:** `PettyCashScreen` 11667–11874; `PettyCashRequestCreate` 9862–9948; `ReimbursePettyCashCreate` 9781–9861. `PCRequestCreate` (9949) reachability is checked at phase start.
- **Scope:**
  - Request, reimburse and settle flows with their inner tabs.
  - The settle reconciliation keeps the prototype's literal statuses.
  - `PettyCashRequestForm` exported for Home.
- **Acceptance:** parity for each flow.

**M6.8 — Payment settlement: add a supplier**
- **Source:** `AddSupplierPanel` 20863–20921.
- **Scope:** the supplier form and its submit feedback.
- **Acceptance:** parity.

### Stage 7 — Work Centre and operational records

**M7.1 — Work Centre hub**
- **Source:** `ProcessesScreen` 9373–9608.
- **Scope:**
  - `features/work-centre`: `WorkCentreLayout` (General/Commercial tabs, section pills, child links; the hidden legacy create tab is excluded).
  - Section config.
  - A fallback Open/Closed listing for sections without dedicated views (price change and promotions are checked at phase start).
  - `/home/work-centre/*` goes live. Create Task and Tasks stay `MigrationPending` until Stage 8.
- **Acceptance:**
  - Navigation parity: the default section is Create a New Task, and switching group lands on the first visible section (9542).
  - Fallback listing parity.

**M7.2 — Enquiries**
- **Source:** `EnquiryView` 9144–9219.
- **Scope:** `features/enquiries` (add, history). Submit is enabled only when subject, priority and every file caption are present.
- **Introduces:** the `captionedFiles` schema helper.
- **Acceptance:** gating tests; parity.

**M7.3 — Observations**
- **Source:** `ObservationsView` 9000–9143. The duplicate rows in `ProcessesScreen` stay separate (D16).
- **Scope:**
  - `features/observations`: add, assign, history, and a report via `SectionReport`.
  - Fields: severity pills, matrix partners, priority radio, linked records (Link → chips), captioned attachments.
  - Submit is gated by captions only; the subject inconsistency is preserved (D2).
- **Acceptance:** parity; gating tests.

**M7.4 — Snag lists**
- **Source:** `SnagListView` 9220–9372.
- **Scope:** `features/snag-lists`: open, add, list, closed, report.
- **Acceptance:** parity.

**M7.5 — Incident workspace**
- **Source:** `IncidentWorkspace` 8665–8999; `RecordHUD` 1392–1411; `HUD_HISTORY` 1377–1391.
- **Scope:**
  - `features/incidents` at `/home/work-centre/incidents/*` and `/home/incidents/reports`.
  - Report form, list (RecordFilter `incident`) and detail view.
  - Action menu: Track, Compensate, Request investigation, Write feedback, Callback request, Close case. **Raise a task** stays `MigrationPending` until M9.2.
  - `convertToTask` as a domain function.
  - The History & updates rail.
- **Introduces:** `Timeline`, `TimelineItem`, `HistoryRail`; organization `useRecordHistory`; `store/tracking.store.ts`.
- **Acceptance:** parity; `convertToTask` tests cover the ref format, status and log entry; Track adds the item to the tracking store.

**M7.6 — Work Centre checklist sub-views**
- **Source:** the checklists children (create, sequence, fill, edit fill) in `ProcessesScreen`.
- **Scope:** migrate as found — real screens or placeholders, verified at phase start.
- **Acceptance:** parity.

### Stage 8 — Tasks (most volatile, scheduled late)

**M8.1 — Task list**
- **Source:** `JobOrdersScreen`/`ListView` 16814–17278; `TasksTable` 16379–16513; `Board` 16665–16813; `TASKS` 15976 onward.
- **Scope:**
  - `features/tasks` begins at `/home/work-centre/tasks`.
  - List, board and card views; settings dialog; RecordFilter `task`; internal/external kinds.
  - Table:
    - drag column reorder and grouping by status, priority, assignee or department;
    - clickable progress segments;
    - row actions: view → `/tasks/:id`, edit → `/tasks/:id/edit`, delete confirmation that hides the row client-side.
  - QA rows not editable on the board.
  - Seeded `tasks.store` plus `useTasks` and `useTask`.
- **Introduces:** `SegmentBar`; column ordering and grouping on the table engine.
- **Acceptance:** parity for each view; grouping, ordering and delete-hide behaviors match.

**M8.2 — Task analytics, workload heatmap, dashboard config store**
- **Source:** task datasets and chart primitives 15846–16095; soft widgets 16106–16283; `Workload` 16297–16359; `TASK_DASH_WIDGETS` and config 16909–16951.
- **Scope:**
  - The tasks analytics dashboard.
  - `WorkloadHeatmap`: 5-tier legend, department/employee toggle, filters, row expand with an inline Gantt.
  - `taskDashboardConfig.store`, persisted under `ihub.v2.taskdash.*`, replacing the `ihub:taskdash` event.
- **Introduces:** the remaining chart components (Recharts or bespoke, whichever matches).
- **Acceptance:** parity for every widget; heatmap colors and tiers; store unit tests.

**M8.3 — Create Task (canonical)**
- **Source:** `CreateTaskPanelDesignChange` 20196–20862; `ctpSampleAttachments` 19521–19546.
- **Scope:** `/home/work-centre/create-task` with every section:
  - Location profiles in a drawer: a separate form instance; add another, edit and delete; the "Please fill in required fields: …" summary.
  - QR scan dialog: random registry pick via the seedable `random`, then the `applyLocProfile` fill.
  - Chips, team auto-suggest from the task-type roadmap, and a checklist with assignee pickers.
  - Dependency links with relationship types.
  - Attachments: drag-drop, preview, download, remove, and the demo files.
  - Requester auto-fill.
  - Submit writes to `tasks.store`. Post-submit behavior is verified at phase start. There is no blocking validation (D2).
- **Introduces:** `FileDropZone`, `AttachmentPreviewDialog`, `useObjectUrl`, seedable `random`.
- **Acceptance:** parity per section; the QR fill is identical with `Math.random` stubbed in both apps; the new task appears in the list.

**M8.4 — Task View**
- **Source:** `TaskEditPage` 17892–19510 (read-only paths); `TaskViewPage` 19512; `StageMarkerBadge` and the dependency reminder 17279–17370.
- **Scope:** `/tasks/:taskId` in `HomeBannerLayout`:
  - `TaskDetailsView mode="view"`: every card read-only, in the view-mode column order.
  - Attachment view and download.
  - Sub-task history dialog with a timeline and a Gantt (Day/Week/Month).
  - The dependency reminder shows immediately.
  - "Edit Task" button in the header.
- **Introduces:** `GanttChart`, working-days utility.
- **Acceptance:** parity; reminder rule tested (5 working days, Fri–Sat weekend, overdue); an unknown id shows a not-found state.

**M8.5 — Task Edit: cards, comments, notes, history**
- **Source:** `TaskEditPage` edit paths (**most volatile**).
- **Scope:** `/tasks/:taskId/edit`:
  - Editable cards in the edit-mode column order.
  - SLA target edit (requires date and justification) with its change history.
  - Add Comment, with repeatable activity + expense rows and drag-drop attachments.
  - Log Notes (@mentions stay literal text).
  - Activity History table: sort, draggable columns, expandable rows, filters, pagination.
  - The dependency reminder appears after 2 seconds.
- **Acceptance:** parity; SLA-edit gating tests.

**M8.6 — Task Edit: dialogs and action bar**
- **Scope:**
  - CEO Comments; Approve; Reject and Close (remarks up to 500 characters, with a counter).
  - Redirect (owner and assignee required).
  - Add Dependency (category and lead time; a showstopper requires an impacted date).
  - Update Sub Tasks: a weight total over 100% shows a banner and blocks save; grouping; bulk mark and delete; copy/move.
  - Sticky action bar, edit mode only, with More → Redirect, Log Note, Export, Print.
  - The CEO Comments "required" note stays unenforced (D2).
- **Acceptance:** every gating rule tested; parity for each dialog; no action bar in view mode.

### Stage 9 — Task-form unification (D1)

**M9.1 — Analysis of the five legacy usages (document only)**
- **Source:** legacy `CreateTaskPanel` 19547–20195; canonical form 20196–20862; usages at 8849, 14391, 14652, 14730 and 14739.
- **Deliverable:** `docs/migration/TASK_FORM_ANALYSIS.md`, containing:
  - A behavior matrix per usage: props, prefill shape, sections shown, footer actions, close and submit effects, presentation.
  - A field-by-field comparison against the canonical form, covering normal create, modal create, prefilled create, existing-task preview/edit, and incident → task conversion.
  - A recommendation for one canonical task form with explicit `mode` and `presentation` options. A distinct implementation is kept only where a verified difference requires it.
- **Gate:** **human approval of the approach** before M9.2 starts.

**M9.2 — Implement the approved task-form modes and incident "Raise a task"**
- **Scope:**
  - Implement the approved modes (for example `TaskFormDialog`) with no user-visible change.
  - Wire the Incident Workspace "Raise a task" action, with `convertToTask` on confirm. This closes the M7.5 marker.
- **Acceptance:** each matrix row verified side by side; no behavior change.

### Stage 10 — Home pages

**M10.1 — Queues, workflow drawer, Approvals view**
- **Source:** `ACTIONS` and groups 12135–12272; SLA and scoring 12401–12450; `FilterChips` 12577–12675; `ActionCard` 12985–13190; `ActionList` 13354–13427; `WorkflowDrawer` 15166–15845; the form modal, send-back and track prompts in `DashboardOCC` 14213–14895.
- **Scope:**
  - `homeQueue.store`: approve, reject, send back, pin, escalate, batch actions.
  - `domain/` for SLA, scoring, escalation and reference codes.
  - `/home/approvals`: group chips and the batch bar.
  - `WorkflowDrawer`:
    - action, incident and job-order bodies; Escape and scrim close it; it opens on the inline-end side;
    - a Form Preview dialog with the payment-settlement forms;
    - action-sheet, petty-cash and budget kinds open that dialog instead of the drawer.
  - Send-back dialog and track prompt.
- **Budget-kind forms:** if the budget kinds need a budgeting component, add the home → budgeting dependency through Phase 2 §6 change control.
- **Acceptance:**
  - Golden parity for `scoreAction`, `scoreIncident`, `rankActions` and SLA states and labels.
  - Queue rules hold: escalation forces critical/today; the incident severity ladder; terminal decisions prompt tracking.

**M10.2 — Overview**
- **Source:** `RecommendedNextAction` 12786–12978; `IncidentCenter` 13719–13766; `SLASection` 13253–13351; `AnalyticsOverview` and `ANLY_*` 14100–14211; `LiveFeed`/`FeedTimeline` 13769–13918; company cards 14049–14062; mobile overview rules 16–41.
- **Scope:** `/home/overview`:
  - recommended next action (the ≥ KWD 40,000 rule);
  - "Needs you now";
  - incident center with search;
  - "On the clock", including the monthly compliance panel from sla;
  - workload heatmap from tasks;
  - analytics overview;
  - tracker (tracking store);
  - live feed and calendar.
- **Acceptance:** full matrix, including the ≤760px phone layout; the two SLA models stay separate (D4).

**M10.3 — Assigned, live incidents, tracker, legacy-form entry points**
- **Source:** Assigned view 14496–14727; Incidents view 14746–14778; `IncidentCard` 13590–13718; `JobOrderCard` 13430–13560; `SheetRow` 13921–14032.
- **Scope:**
  - `/home/assigned/:queue` for Approvals, Verify and Assigned Tasks. Record type, sub-type, priority, search and reset live in search params.
  - `/home/incidents/live`.
  - The incident action menu, including Close case.
  - The four Home task-form entry points, wired per the M9.1 decision.
  - The tracking store replaces `__ihubTrack`.
- **Acceptance:** parity; each entry point matches the M9.1 matrix.
- **Gate:** D16.

**M10.4 — Company, Home tasks, Home analytics & reports**
- **Source:** `BusinessView` 14049–14062; job-orders view 14438–14453; reports view 14461–14515 and 14811.
- **Scope:** `/home/company`; `/home/tasks` with the internal/external filter; `/home/reports` with category tabs, sub-items and export.
- **Gate:** D12.

### Stage 11 — Settings

**M11.1 — Configuration: user administration**
- **Source:** `UserConfigScreen` 6909–7015.
- **Scope:** `features/settings` begins: user list and search, profile, permissions, notification channels, limits, MFA, delegate and status, all in local state.
- **Acceptance:** parity.

**M11.2 — Dashboard configuration builders**
- **Source:** 7016–7854 — `AdminDashConfig`, `AdminTaskDashConfig`, `UserDashConfig`, `DashPickerCard` and previews (**volatile**). `DashboardLayoutView` reachability is checked at phase start.
- **Scope:**
  - Scopes: Default, Role, Department and User.
  - Ordering, hiding and locked widgets; `MAX = 15`.
  - Admin rules and user inheritance.
  - JSON import/export with validation.
  - Live previews.
  - Writes go to `taskDashboardConfig.store`.
- **Introduces:** `shared/file/json.ts`.
- **Acceptance:**
  - JSON golden cases: valid, invalid, over the limit, unknown ids.
  - Inheritance tests.
  - The Tasks dashboard updates live.

### Stage 12 — Release

**M12.1 — Full regression**
- **Scope:**
  - Every route across the full matrix, compared against the local prototype.
  - All behavior checklists re-run.
  - RTL, Ink and responsive passes.
  - `report:pending --release` reports 0.
  - The NOOP register and the deviation log reviewed.
- **Acceptance:** no open material differences.

**M12.2 — Production readiness**
- **Scope:**
  - Bundle audit: no prototype tooling and no dev QA switches; SheetJS and charts load lazily.
  - Keyboard accessibility smoke test: shell, dialogs, drawer and menus.
  - Performance smoke test and error-boundary drills.
  - Deployment configuration (D17): base path, plus SPA fallback or hash mode.
  - README and runbook.
- **Gate:** D17.

**M12.3 — Release sign-off**
- **Scope:** human sign-off on the registers, the decisions log and the evidence; tag v1.0.

---

## 8. Ordering rationale

**Dependency order** (Phase 2 §6): organization → sla, payment-settlement, tasks → incidents → home → settings. Pages mounted inside hubs need the Home frame (M5.1) and the Work Centre hub (M7.1) first.

**Volatility** (lines changed in the prototype, `index.html`):

| Component | Size | Since initial commit (2026-09-21) | In the last three commits |
|---|---|---|---|
| `TaskEditPage` | 1,620 | 516 | 376 |
| `CreateTaskPanelDesignChange` | 667 | 667 (new) | 9 |
| `MasterRecordForm` | 144 | 144 | 144 |
| Settings dashboard config (`CATS`, `SCOPES`, `LOCKED`, `ADMIN_DASHBOARDS`, previews) | ~400 | ~350 | ~350 |
| `HeroCarousel` / `HomeTopBanner` | 84 / 208 | 79 / 59 | 79 / 5 |
| `JobOrdersScreen` / `TasksTable` / `Board` / `Workload` | 296 / 136 / 132 / 63 | 58 / 43 / 19 / 25 | 58 / 43 / 19 / 19 |
| `SearchBox` + search index | 196 | 151 | 0 |
| Portal screens: Overtime, Appraisal, Checklist, History, Workflows, SLA, Notifications, Purchasing, Budgeting, Petty Cash, Incidents, Enquiry, Observations | — | ≈ 0 | ≈ 0 |

**What this means for the order:**
- Stable areas come first and establish the shared templates: shell, Section/Report, filters, tables and forms.
- The volatile areas (Tasks, the Home pages and the Settings builders) come last, and delta intake is mandatory for them.
- Shared infrastructure grows only as it's needed:

| Phase | Infrastructure first needed |
|---|---|
| M3.1 | filters, dialogs, select/date controls |
| M3.2 | simple tables |
| M3.8 | first forms |
| M4.1 | table engine |
| M4.2 | rich forms |
| M4.3 | file parsing |
| M6.4 | attachments |
| M6.5 | collapsibles |
| M7.5 | timelines |
| M8.3 / M8.4 | drag-drop and Gantt |

## 9. Decision-gate map

| Item | Status | Resolved at | Default |
|---|---|---|---|
| D1 Legacy task form | approach approved; details pending | M9.1 (approval gate) | one canonical form with modes |
| D2 Prototype no-ops | per phase | each phase card lists its NOOPs | keep inert, tagged |
| D3 Unreachable approval screens | **confirmed excluded** | — | — |
| D4 Two SLA models | pending | M10.2 | keep separate |
| D5 Theme/locale persistence | pending | M1.3 | persist both |
| D6 Verification baseline | **resolved:** local prototype | — | — |
| D7 Bulk-upload parity | **resolved by verification:** Project Category and Sub Area only | — | — |
| D8 Language switch placement | pending | M2.3 | top bar, next to the theme toggle |
| D9 Tweaks-only variants | **confirmed excluded** | — | — |
| D10 Masters (List) duplicate; `/masters` root | pending | M2.1, M4.1 | keep both; first-leaf redirects |
| D11 Unreachable/superseded components | **confirmed excluded** | — | — |
| D12 Two Reports implementations | pending | M3.9, M10.4 | keep both |
| D13 Home nav children | pending | M2.1 | map to `/home/:tab` where a view exists |
| D14 Screenless nav leaves | pending | M2.1 (re-confirmed M3.3, M3.5) | faithful placeholders |
| D15 FeedbackWidget | **confirmed excluded** | — | — |
| D16 Duplicate datasets | pending | M7.3, M10.3 | keep separate |
| D17 Hosting / router mode | pending | M12.2 (mode switch exists from M1.4) | BrowserRouter + SPA rewrite |
| D18 Missing fonts | pending | M1.2 | drop the two missing faces |
| D19 Mock current user | pending | M2.3 | "Ahmad Al Osaimi" (as in the local prototype) |
| D20 Arabic numerals | pending | M1.3 | Latin digits |
| Q1–Q6 | pending | see §0 | see §0 |

## 10. Tracking artifacts (new repository)

| File | Contents |
|---|---|
| `docs/architecture/PHASE_2_TARGET_ARCHITECTURE.md` | approved architecture |
| `docs/migration/PHASE_3_MIGRATION_PLAN.md` | this plan (versioned) |
| `docs/migration/PROTOTYPE_DELTAS.md` | baseline, per-phase intake results, adopted or deferred deltas |
| `docs/migration/PROTOTYPE_NOOPS.md` | id, control, prototype reference, decision, phase, status |
| `docs/migration/MIGRATION_PENDING.md` | generated by `npm run report:pending` |
| `docs/migration/DEVIATIONS.md` | differences, materiality, approval |
| `docs/migration/DECISIONS.md` | D and Q items: status, answer, date |
| `docs/migration/ICON_MAP.md` | prototype icon → Lucide or custom |
| `docs/migration/TASK_FORM_ANALYSIS.md` | M9.1 deliverable |
| `docs/migration/qa/<phase-id>/` | evidence captures, or attach them to the PR if large |

## 11. Not scheduled: API enablement

- **Trigger:** the first real backend endpoint becomes available.
- **Steps:**
  1. Install Axios and TanStack Query.
  2. Create `shared/api`: client, interceptors, `ApiError`, query-key helpers.
  3. Mount `QueryClientProvider` in `AppProviders`.
  4. Convert one feature's read hooks to `useQuery` behind the existing hook contract, then its writes to `useMutation`.
  5. Add MSW for tests.
- Presentation components do not change.

## 12. Migration Definition of Done

- Every phase approved, and `report:pending --release` reports 0.
- The NOOP register is reviewed. Each item is either kept inert by decision or scheduled.
- The deviation log has no open material item.
- Every D and Q item is resolved or explicitly deferred.
- The Phase 2 §35 architecture Definition of Done is met.
- The full-matrix regression is signed off, and the app is deployed per D17.

## 13. To start

1. Approve this plan.
2. **Q1 / M0.1:** create the repository and grant Codex access.
3. **M0.2:** prototype checkout at `273abc8`.
4. Accept or change the Q2–Q6 defaults.

Codex then starts with **M1.1** and stops after it for approval.
