# Master Migration Task List

This table operationalizes the executable tasks in [Phase 3](../migration/PHASE_3_MIGRATION_PLAN.md). Phase 3 remains authoritative for scope, sequence, dependencies, and gates.

| ID | Task | Status | Owner | Depends On | PR | Approval |
|---|---|---|---|---|---|---|
| [M0.1](phases/M0.1.md) | New repository | Blocked | Not assigned | None | TBD | Required |
| [M0.2](phases/M0.2.md) | Prototype reference checkout | Blocked | Not assigned | None | TBD | Required |
| [M0.3](phases/M0.3.md) | Planning documents in the new repository | Completed | Not assigned | M0.1 | TBD | Approved |
| [M1.1](phases/M1.1.md) | Scaffold and quality gates | Completed | Codex | M0.* | Not opened | Approved |
| [M1.2](phases/M1.2.md) | Design tokens, fonts, base CSS, Tailwind | Completed | Codex | M1.1 | Not opened | Approved |
| [M1.3](phases/M1.3.md) | i18n, preferences, direction | Completed | Codex | M1.2 | Not opened | Approved |
| [M1.4](phases/M1.4.md) | Router skeleton, error handling, migration markers | Completed | Codex | M1.3 | Not opened | Approved |
| [M2.1](phases/M2.1.md) | Navigation model and route map | Active | Codex | M1.4 | TBD | Required |
| [M2.2](phases/M2.2.md) | Shell chrome and visual-QA harness | Pending | Not assigned | M2.1 | TBD | Required |
| [M2.3](phases/M2.3.md) | Top-bar actions | Pending | Not assigned | M2.2 | TBD | Required |
| [M3.1](phases/M3.1.md) | Section/Report template, RecordFilter, export | Pending | Not assigned | M2.3 | TBD | Required |
| [M3.2](phases/M3.2.md) | Appraisal | Pending | Not assigned | M3.1 | TBD | Required |
| [M3.3](phases/M3.3.md) | HR (Overtime) | Pending | Not assigned | M3.2 | TBD | Required |
| [M3.4](phases/M3.4.md) | Notifications page | Pending | Not assigned | M3.2 | TBD | Required |
| [M3.5](phases/M3.5.md) | Quality & Compliance: Checklist | Pending | Not assigned | M3.2 | TBD | Required |
| [M3.6](phases/M3.6.md) | History | Pending | Not assigned | M3.2 | TBD | Required |
| [M3.7](phases/M3.7.md) | Workflows | Pending | Not assigned | M3.1 | TBD | Required |
| [M3.8](phases/M3.8.md) | SLA & Compliance | Pending | Not assigned | M3.1 | TBD | Required |
| [M3.9](phases/M3.9.md) | Reports library | Pending | Not assigned | M3.4 | TBD | Required |
| [M4.1](phases/M4.1.md) | Master listing | Pending | Not assigned | M3.2 | TBD | Required |
| [M4.2](phases/M4.2.md) | Master record forms | Pending | Not assigned | M4.1, M3.8 | TBD | Required |
| [M4.3](phases/M4.3.md) | Bulk import (Project Category, Sub Area) | Pending | Not assigned | M4.2 | TBD | Required |
| [M5.1](phases/M5.1.md) | Home layout and banner | Pending | Not assigned | M3.5, M3.8 | TBD | Required |
| [M6.1](phases/M6.1.md) | Budgeting (section variant) | Pending | Not assigned | M3.2 | TBD | Required |
| [M6.2](phases/M6.2.md) | Budgeting (home variant) and sub-views | Pending | Not assigned | M6.1, M5.1 | TBD | Required |
| [M6.3](phases/M6.3.md) | Purchasing: requests and review | Pending | Not assigned | M5.1, M3.8 | TBD | Required |
| [M6.4](phases/M6.4.md) | Purchasing: purchase orders | Pending | Not assigned | M6.3 | TBD | Required |
| [M6.5](phases/M6.5.md) | Purchasing: supplier quotations | Pending | Not assigned | M6.4 | TBD | Required |
| [M6.6](phases/M6.6.md) | Payment settlement: layout and action sheets | Pending | Not assigned | M5.1, M6.4 | TBD | Required |
| [M6.7](phases/M6.7.md) | Payment settlement: petty cash | Pending | Not assigned | M6.6 | TBD | Required |
| [M6.8](phases/M6.8.md) | Payment settlement: add a supplier | Pending | Not assigned | M6.6 | TBD | Required |
| [M7.1](phases/M7.1.md) | Work Centre hub | Pending | Not assigned | M5.1 | TBD | Required |
| [M7.2](phases/M7.2.md) | Enquiries | Pending | Not assigned | M7.1, M6.4 | TBD | Required |
| [M7.3](phases/M7.3.md) | Observations | Pending | Not assigned | M7.2 | TBD | Required |
| [M7.4](phases/M7.4.md) | Snag lists | Pending | Not assigned | M7.1 | TBD | Required |
| [M7.5](phases/M7.5.md) | Incident workspace | Pending | Not assigned | M7.1 | TBD | Required |
| [M7.6](phases/M7.6.md) | Work Centre checklist sub-views | Pending | Not assigned | M7.1, M3.5 | TBD | Required |
| [M8.1](phases/M8.1.md) | Task list | Pending | Not assigned | M7.1, M4.1 | TBD | Required |
| [M8.2](phases/M8.2.md) | Task analytics, workload heatmap, dashboard config store | Pending | Not assigned | M8.1 | TBD | Required |
| [M8.3](phases/M8.3.md) | Create Task (canonical) | Pending | Not assigned | M8.1, M6.5 | TBD | Required |
| [M8.4](phases/M8.4.md) | Task View | Pending | Not assigned | M8.3 | TBD | Required |
| [M8.5](phases/M8.5.md) | Task Edit: cards, comments, notes, history | Pending | Not assigned | M8.4 | TBD | Required |
| [M8.6](phases/M8.6.md) | Task Edit: dialogs and action bar | Pending | Not assigned | M8.5 | TBD | Required |
| [M9.1](phases/M9.1.md) | Analysis of the five legacy usages (document only) | Pending | Not assigned | M8.3, M7.5 | TBD | Required |
| [M9.2](phases/M9.2.md) | Implement the approved task-form modes and incident "Raise a task" | Pending | Not assigned | M9.1 | TBD | Required |
| [M10.1](phases/M10.1.md) | Queues, workflow drawer, Approvals view | Pending | Not assigned | M6.6, M6.7, M9.2 | TBD | Required |
| [M10.2](phases/M10.2.md) | Overview | Pending | Not assigned | M10.1, M8.2, M3.8, M7.5 | TBD | Required |
| [M10.3](phases/M10.3.md) | Assigned, live incidents, tracker, legacy-form entry points | Pending | Not assigned | M10.2 | TBD | Required |
| [M10.4](phases/M10.4.md) | Company, Home tasks, Home analytics & reports | Pending | Not assigned | M10.1 | TBD | Required |
| [M11.1](phases/M11.1.md) | Configuration: user administration | Pending | Not assigned | M2.3 | TBD | Required |
| [M11.2](phases/M11.2.md) | Dashboard configuration builders | Pending | Not assigned | M11.1, M8.2, M10.2 | TBD | Required |
| [M12.1](phases/M12.1.md) | Full regression | Pending | Not assigned | all | TBD | Required |
| [M12.2](phases/M12.2.md) | Production readiness | Pending | Not assigned | M12.1 | TBD | Required |
| [M12.3](phases/M12.3.md) | Release sign-off | Pending | Not assigned | M12.2 | TBD | Required |

## Status values

Only these values are valid: Pending, Ready, Active, Blocked, Review, Approved, Completed, Deferred.

A task becomes Completed only after human approval. Updating this table never authorizes implementation or the next task.

