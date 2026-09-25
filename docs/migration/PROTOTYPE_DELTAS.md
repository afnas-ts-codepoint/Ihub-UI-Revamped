# Prototype Deltas

Track prototype changes made after the approved migration baseline.

## Baseline commit

`273abc8`

| Date | Affected feature | Prototype change | Adopt or defer | Approved by | Migration phase |
| --- | --- | --- | --- | --- | --- |
| 2026-09-25 | M3.1 Section/Report template, RecordFilter, and export (`index.html` lines 50-96, 1416-1815) | Every listed M3.1 range is unchanged between baseline `273abc8` and current prototype HEAD `3c391b4`; both revisions contain the identical `index.html` blob `73325748b6e33b519ef45cc063db5bd69f079a3a`. | No source delta to adopt or defer. | N/A | M3.1 |
| 2026-09-25 | M2.3 top-bar actions (`index.html` lines 3127-3428) | `NAV_SEARCH_INDEX`, `navSearch`, `SearchHighlight`, `SearchBox`, `ThemeToggle`, `NotificationsBell`, `TopBarActions`, and `Avatar` are unchanged between baseline `273abc8` and current prototype HEAD `3c391b4`. | No source delta to adopt or defer. | N/A | M2.3 |
| 2026-09-25 | M2.2 shell chrome and visual-QA harness (`index.html` lines 489-540, 614-1097, 2615-2709, 2897-3121, 5021-5192) | All M2.2 source ranges are unchanged between baseline `273abc8` and current prototype HEAD `3c391b4`; only migration-planning files differ. | No source delta to adopt or defer. | N/A | M2.2 |
| 2026-09-25 | M2.1 full navigation model, route switch, and StubScreen (`index.html` lines 2423-2613, 7856-7937, 22416-22528) | All M2.1 source ranges are unchanged between baseline `273abc8` and current prototype HEAD `3c391b4`; only migration-planning files differ. | No source delta to adopt or defer. | N/A | M2.1 |
| 2026-09-25 | M2.1 Masters catalogue - HR and Operation (`index.html` lines 2442-2459, 2592-2613, 4241-4266, 22511-22525) | Relevant source is unchanged between baseline `273abc8` and current prototype HEAD `3c391b4`. The approved counts are 16 HR and 15 Operation. | Adopt both remaining catalogue batches; the four-category 80-entry Masters baseline is now implemented. | Human approval, 2026-09-25 | M2.1 |
| 2026-09-25 | M2.1 Masters catalogue - General (`index.html` lines 2434-2441, 2456-2459, 2592-2613, 4241-4266, 22511-22525) | Relevant source is unchanged between baseline `273abc8` and current prototype HEAD `3c391b4`. The approved General count is 22. | Adopt the approved General batch in checkpoint 2; HR and Operation remain deferred pending their explicit approvals. | Human approval, 2026-09-25 | M2.1 |
| 2026-09-25 | M2.1 Masters catalogue - Admin (`index.html` lines 2423-2433, 2456-2459, 2592-2613, 4241-4266, 22511-22525) | Relevant source is unchanged between baseline `273abc8` and current prototype HEAD `3c391b4`. The approved catalogue correction is 27 Admin + 22 General + 16 HR + 15 Operation = 80; the older 78-item planning references are stale. | Adopt the approved 80-entry catalogue baseline in four controlled M2.1 checkpoints; Admin only in checkpoint 1. | Human instruction, 2026-09-25 | M2.1 |
| 2026-09-25 | M1.1 tooling (no prototype source range) | `index.html` is unchanged between baseline `273abc8` and current prototype HEAD `3c391b4`; only migration-planning files differ. | No source delta to adopt or defer. | N/A | M1.1 |
| 2026-09-25 | M1.2 styles and fonts (`index.html` lines 6–41, 134–612, 22380–22388) | Relevant `index.html` ranges are unchanged between baseline `273abc8` and current prototype HEAD `3c391b4`; only migration-planning files differ. | No source delta to adopt or defer. | N/A | M1.2 |
| 2026-09-25 | M1.3 i18n, preferences, and direction (`index.html` lines 1526–1529, 2614, 15001, 22379–22388) | `index.html` is unchanged between baseline `273abc8` and current prototype HEAD `3c391b4`, including every M1.3 source range. | No source delta to adopt or defer. | N/A | M1.3 |
| 2026-09-25 | M1.4 mount and error handling (`index.html` lines 22548–22586) | The relevant range is unchanged between baseline `273abc8` and current prototype HEAD `3c391b4`. The diagnostic overlay in this range remains excluded. | No source delta to adopt or defer. | N/A | M1.4 |
