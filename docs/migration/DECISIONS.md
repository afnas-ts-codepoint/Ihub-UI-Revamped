# Decisions

Track approved architecture and product decisions from Phases 2 and 3. Unresolved D/Q items belong in the source plans until approved.

| Decision | Status |
| --- | --- |
| Production application is in a separate repository. | Approved |
| Prototype repository is read-only. | Approved |
| Local prototype is the migration/QA baseline. | Approved |
| Prototype `app/` is excluded. | Approved |
| Dead, unreachable, and superseded prototype implementations are excluded. | Approved |
| Tweaks-only variants are excluded. | Approved |
| FeedbackWidget is excluded from production. | Approved |
| Infrastructure is introduced only with its first real consumer. | Approved |
| Dependencies are installed incrementally. | Approved |
| No empty feature folders. | Approved |
| No fake API layer. | Approved |
| Axios and TanStack Query wait for real backend endpoints. | Approved |
| One migration phase is executed at a time. | Approved |
| Every phase stops for human approval. | Approved |
| One canonical task-form architecture is preferred; legacy usages are analysed in M9.1 before final unification. | Approved |
| Q5: Existing brand-font assets may be copied from the prototype into the production repository. | Approved for M1.2; the files already ship in the prototype repository. |
| D18: Omit the missing Myriad Pro and GE SS Light Italic `@font-face` declarations. | Approved for M1.2; no substitute assets were invented. |
| D5: Persist both theme and locale under `ihub.v2.preferences`. | Approved default applied for M1.3. |
| D20: Use Western/Latin digits for Arabic locale formatting. | Approved default applied for M1.3. |
| D8: Add the production EN/AR language switch to the top bar next to `ThemeToggle`. | Approved intentional production difference implemented in M2.3. |
| D19: Use the local prototype current user, Ahmad Al Osaimi. | Approved default implemented in M2.3; no live-site identity was substituted. |
| D14: Screenless HR nav leaves stay faithful prototype placeholders. | Re-confirmed for M3.3; `/hr/dashboard`, `/hr/workforce-statistics`, the seven `/hr/overtime/*` tab leaves, `/hr/investigations`, `/hr/violations`, `/hr/loan`, `/hr/end-of-probation`, and `/hr/exit-interview` remain `PlaceholderPage` and were not migrated. |
| M3.4 Notifications uses the shared `RecordFilter kind="history"`, not `FilterForm`. | Human decision, 2026-09-26: the M3.4 phase card referenced `FilterForm`, but `NotificationsScreen` (`index.html` 12032-12129) actually renders `RecordFilter kind="history"`; `FilterForm` (`index.html` 7947-8069) is used only by the out-of-scope Reports Library (M3.9). Adopted current prototype behavior; no unused local `FilterForm` was created. |
| M3.4 Notifications has no stat row. | Human decision, 2026-09-26: the M3.4 phase card required a stat row, but `NotificationsScreen` never calls `StatRow`. Adopted current prototype behavior; `NotificationsPage` renders no stat cards. |
| D14: Screenless Quality & Compliance nav leaves stay faithful prototype placeholders. | Re-confirmed for M3.5; `/quality/dashboard`, `/quality/observations`, `/quality/quality-assurance-checklists`, and its eight descendants remain `PlaceholderPage`. `/quality/sla` remains the separate M3.8 `MigrationPending` screen. |
| M3.8 SLA Overview omits the dead `clockCard`. | Human decision, 2026-09-26: `SLAScreen` defines `clockCard` at `index.html` line 21806 but the returned Overview tree at lines 22058-22063 never renders it. Adopted current rendered prototype behavior; production must not introduce the absent card. |
| D12: Keep the standalone `/reports` library and future `/home/reports` as separate views. | Human decision, 2026-09-26: preserve both reachable prototype representations; M3.9 migrates only `/reports`, while `/home/reports` remains `MigrationPending` for M10.4. |
| M3.9 Reports Library uses a feature-local `FilterForm`. | Human decision, 2026-09-26: current prototype and production inspection found Reports is its only real consumer. Do not promote it to `shared/filter`; preserve G8 and the architecture second-consumer rule. |
| M3.9 standalone catalogue contains 18 reports while its subtitle source says 17. | Human decision, 2026-09-26: adopt current standalone `ReportsScreen` fidelity, including `Revenue Projection`, and preserve the literal “17 standard reports” source text without silently correcting it. Heading parity review on 2026-09-26 confirmed that the prototype `PageHeader` suppresses its `sub` prop, so production retains the literal locale resource but does not render it. |
| M3.9 standalone internal labels remain English in Arabic mode. | Human decision, 2026-09-26: preserve the current standalone screen rather than substituting the separate Home/navigation bilingual catalogue. The header remains translated and the layout remains RTL. |
