# Migration Pending

Track prototype functionality that has not yet been migrated.

| Feature | Route/screen | Migration phase | Status | Notes |
| --- | --- | --- | --- | --- |
| Migration infrastructure | Not routed | M1.4 | Available; active markers tracked below | `MigrationPending` and `report:pending` are introduced for later route migrations. Each marker is removed by its owning migration phase; the count must be zero before release. |
| Project Category Master | `/masters/admin/project-category-master`; `/masters-list/admin/project-category-master` | M4.1 | Active; 1 source marker, 2 route variants | The prototype has a real listing screen. M2.1 routes it to the shared `MigrationPending` marker until the Masters listing phase. |
