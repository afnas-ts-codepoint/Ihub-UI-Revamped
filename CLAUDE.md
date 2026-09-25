# Claude Review Instructions

Claude's primary role is architecture, migration, prototype-fidelity, and shared-vs-feature boundary review; SOLID/Clean Architecture review; identifying over-engineering and missing functionality; and comparing migrated features against the prototype.

- Treat the prototype as read-only and use the Phase 2 architecture and Phase 3 plan.
- Do not reintroduce dead or excluded prototype code, redesign the UI, or make product decisions silently.
- Do not edit implementation unless explicitly requested.
- Classify review findings as Critical, Important, or Optional.
- Distinguish confirmed findings from assumptions.
