# Production build and deployment runbook

This runbook covers the repository-owned production build contract. Hosting,
promotion, and rollback tooling live outside this repository.

## Supported build

Use Node.js 22 and the committed npm lockfile:

```sh
npm ci
npm run verify:release
```

`npm run build` writes the immutable static artifact to `dist/`. The production
build disables source maps. `npm run check:bundle` rejects prototype/dev-tooling
markers, source maps, JavaScript chunks over 500 KiB, eager SheetJS, and eager
chart code.

## Public configuration

| Value | Default | Purpose |
| --- | --- | --- |
| `VITE_BASE_PATH` | `/` | URL path where the app is mounted; used by both emitted assets and the router basename. |
| `VITE_ROUTER_MODE` | `browser` | `browser` uses real URLs and requires an SPA rewrite; `hash` is the fallback for hosts that cannot rewrite. |

Both values are public and embedded at build time. Never store a token,
credential, private endpoint secret, or other secret in `VITE_*` variables.
This client currently has no required backend/API environment value.

Example subpath build:

```sh
VITE_BASE_PATH=/ihub VITE_ROUTER_MODE=browser npm run build
```

On Windows PowerShell, set the variables first, or use an `.env.production`
file based on `.env.example`.

## Hosting contract (D17)

The approved default is BrowserRouter with an SPA rewrite. Serve static files
normally, and rewrite a request under the configured base path to that base
path's `index.html` only when no real file exists. This is required for direct
loads such as `/ihub/tasks/TSK-2026-001/edit`.

If the host cannot provide that fallback, rebuild with
`VITE_ROUTER_MODE=hash`; URLs then use the form `/ihub/#/home/overview` and do
not require a server rewrite.

Do not deploy a build under a different path from the `VITE_BASE_PATH` used to
create it. Static assets and lazy chunks use that build-time path.

## Pre-deployment checks

1. Start from a clean checkout and run `npm ci`.
2. Set only the two documented public configuration values.
3. Run `npm run verify:release`.
4. Confirm the build has no warnings and `report:pending --release` reports 0.
5. Serve `dist/` and smoke-test entry, deep-link refresh, Home Overview, Tasks,
   Task View/Edit, Work Centre, Approvals, Incident flows, Purchasing, Payment
   Settlement, Reports, Settings/Configuration, and the configured Tasks
   dashboard.
6. Check the browser console and network panel for errors, failed assets, and
   failed lazy chunks.

## Recovery

The repository defines no automated deployment or rollback command. Preserve
each immutable `dist/` artifact in the external hosting/release system. If a
deployment fails its smoke checks, restore the previously verified artifact
using that system; do not rebuild old source with a changed environment and
call it the same artifact.

Persisted client preferences and dashboard configuration are versioned under
`ihub.v2.*` local-storage keys. Malformed or stale stored values fall back to
safe defaults; clearing those keys is an optional client-side recovery step
and is not required for normal deployment.

## Approved production deviations

- D8 intentionally adds the persistent EN/AR top-bar switch absent from the
  prototype's normal UI.
- D25 intentionally preserves mouse-only widget reordering in the Settings
  dashboard builder; all other critical controls in the readiness smoke remain
  keyboard operable.
- Registered prototype no-ops and the deviations log remain authoritative;
  production readiness does not convert them into live backend behavior.
