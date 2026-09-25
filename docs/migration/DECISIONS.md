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
