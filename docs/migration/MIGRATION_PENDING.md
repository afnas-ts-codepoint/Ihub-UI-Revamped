# Migration Pending

Track prototype functionality that has not yet been migrated.

| Feature | Route/screen | Migration phase | Status | Notes |
| --- | --- | --- | --- | --- |
| Migration infrastructure | Not routed | M1.4 | Available; active markers tracked below | `MigrationPending` and `report:pending` are introduced for later route migrations. Each marker is removed by its owning migration phase; the count must be zero before release. |
| Project Category Master | `/masters/admin/project-category-master`; `/masters-list/admin/project-category-master` | M4.1 | Active; shared source marker, 2 route variants | The prototype has a real listing screen. M2.1 routes it to the shared `MigrationPending` marker until the Masters listing phase. |
| Machine Master | `/masters/general/machine-master`; `/masters-list/general/machine-master` | M4.1 | Active; shared source marker, 2 route variants | The prototype has a real listing screen. M2.1 routes it to the shared `MigrationPending` marker until the Masters listing phase. |
| Assignment Areas | `/masters/operation/assignment-areas`; `/masters-list/operation/assignment-areas` | M4.1 | Active; shared source marker, 2 route variants | The prototype has a real listing screen. M2.1 routes it to the shared `MigrationPending` marker until the Masters listing phase. |
| Task Mapping | `/masters/operation/task-mapping`; `/masters-list/operation/task-mapping` | M4.1 | Active; shared source marker, 2 route variants | The prototype has a real listing screen. M2.1 routes it to the shared `MigrationPending` marker until the Masters listing phase. |
| Sub Area | `/masters/operation/sub-area`; `/masters-list/operation/sub-area` | M4.1 | Active; shared source marker, 2 route variants | The prototype has a real listing screen. M2.1 routes it to the shared `MigrationPending` marker until the Masters listing phase. |
