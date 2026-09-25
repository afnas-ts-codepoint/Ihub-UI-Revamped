# Blocked Migration Tasks

| Task ID | Blocker | Owner | Required action | Status |
|---|---|---|---|---|
| [M0.1](phases/M0.1.md) | The remote default resolves to `origin/main`, but branch protection, required CI/approval policy, and Codex branch/PR access are not proven. The local worktree is on `master`. | Not assigned | Verify the remaining GitHub repository prerequisites and record evidence. | Blocked |
| [M0.2](phases/M0.2.md) | The prototype is at `3c391b4b5ccbc3fa0bb0ff56d5c8eda6bc6f80ff`, not `273abc8`, and `PROTOTYPE_DIR` is unset. | Not assigned | Provide a read-only baseline checkout at `273abc8`, set `PROTOTYPE_DIR`, and verify the Home dashboard renders. | Blocked |
