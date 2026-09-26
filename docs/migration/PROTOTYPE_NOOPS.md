# Prototype No-Ops

Track visible prototype controls that intentionally remain non-functional.

| ID                 | Feature   | Control                  | Prototype reference          | Current behavior                                                                            | Migration decision                                                                                    | Phase | Status |
| ------------------ | --------- | ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----- | ------ |
| PROTOTYPE-NOOP(D2) | Appraisal | `TabbedTable` pagination | `index.html` lines 8181-8226 | Previous, pages 1-3, and next render but do not change the five displayed rows or navigate. | Preserve the visible inert controls for prototype parity; functional table pagination begins in M4.1. | M3.2  | Active |
| PROTOTYPE-NOOP(D2) | HR (Overtime) | Overtime tab literal counts | `index.html` lines 8289-8317 | The seven tab badges (14, 6, 3, 2, 4, 1, 92) are hardcoded and do not match the six-row mock dataset; clicking a tab does not filter or recompute the badge or the displayed rows. | Preserve the literal `displayCount` values for prototype parity; not a bug, no dynamic/recomputed count is introduced. | M3.3  | Active |
| PROTOTYPE-NOOP(D2) | HR (Overtime) | `TabbedTable` pagination | `index.html` lines 8181-8226 | Previous, pages 1-3, and next render but do not change the six displayed rows or navigate. | Preserve the visible inert controls for prototype parity; functional table pagination begins in M4.1. | M3.3  | Active |
