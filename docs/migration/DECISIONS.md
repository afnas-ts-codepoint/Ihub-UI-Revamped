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
