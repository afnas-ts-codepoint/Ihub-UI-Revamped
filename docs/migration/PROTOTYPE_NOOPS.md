# Prototype No-Ops

Track visible prototype controls that intentionally remain non-functional.

| ID                 | Feature   | Control                  | Prototype reference          | Current behavior                                                                            | Migration decision                                                                                    | Phase | Status |
| ------------------ | --------- | ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----- | ------ |
| PROTOTYPE-NOOP(D2) | Appraisal | `TabbedTable` pagination | `index.html` lines 8181-8226 | Previous, pages 1-3, and next render but do not change the five displayed rows or navigate. | Preserve the visible inert controls for prototype parity; functional table pagination begins in M4.1. | M3.2  | Active |
