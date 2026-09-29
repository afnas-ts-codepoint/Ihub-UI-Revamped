import { MAX_WIDGETS } from './dashboardConfigDefaults';
import { parseJson, toJson } from '@/shared/file/json';
import type { DashboardConfig } from '../types/dashboardConfig.types';

export type DashboardConfigFile = Readonly<{
  config: DashboardConfig;
  scope: string;
}>;

/** @prototype index.html:L7247-L7249 (`exportCfg`) */
export function exportDashboardConfig(
  scopeKey: string,
  config: DashboardConfig,
): string {
  return toJson({ config, scope: scopeKey } satisfies DashboardConfigFile);
}

/** @prototype index.html:L7248 (`a.download`) */
export function dashboardConfigFilename(
  dashboardId: string,
  scopeKey: string,
): string {
  const slug = scopeKey.replaceAll(/[^a-z0-9]+/gi, '-').toLowerCase();
  return `${dashboardId}-dashboard-${slug}.json`;
}

/**
 * A patch to merge on top of the current in-progress config — mirrors the
 * prototype's `upd(...)`: only fields actually present in the imported file
 * are copied through, and they are copied through **unvalidated** (no type
 * or range checking on `cols`/`dnd`/`hide`/`lock` at all). `ids` is the one
 * field this function does normalize: unknown ids are silently dropped and
 * the list is silently truncated to `max`.
 */
export type DashboardConfigPatch = Readonly<Record<string, unknown>> & {
  ids: string[];
};

export type ImportDashboardConfigResult =
  | Readonly<{ ok: false }>
  | Readonly<{ ok: true; patch: DashboardConfigPatch }>;

function hasArrayIds(value: unknown): value is { ids: unknown[] } & Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { ids?: unknown }).ids)
  );
}

/**
 * Imports a dashboard configuration file. Accepts either
 * `{ scope, config: {...} }` or a bare config object; the *entire*
 * validation surface is "`ids` must be an array" — matching the prototype
 * exactly:
 * - unknown widget ids are silently dropped (filtered against
 *   `availableIds`), not flagged as an error;
 * - a config with more than `max` ids is silently truncated, not rejected;
 * - `cols`/`dnd`/`hide`/`lock` are copied through with no validation at
 *   all — an absurd `cols` value is accepted as-is.
 * Do not make this stricter than the prototype; that would itself be an
 * undocumented behavior change.
 * @prototype index.html:L7250-L7255 (`importCfg`)
 */
export function importDashboardConfig(
  raw: string,
  availableIds: readonly string[],
  max: number = MAX_WIDGETS,
): ImportDashboardConfigResult {
  // Typed as `unknown`, not `Record<string, unknown>`: `JSON.parse` can
  // return `null` or a primitive at runtime (e.g. the raw text `"null"` or
  // `"42"`), which a more specific type parameter would (incorrectly) rule
  // out at compile time.
  const parsed = parseJson(raw);
  if (!parsed.ok) return { ok: false };

  const candidate = parsed.value;
  const configCandidate: unknown =
    candidate && typeof candidate === 'object' && 'config' in candidate
      ? ((candidate as { config?: unknown }).config ?? candidate)
      : candidate;

  if (!hasArrayIds(configCandidate)) return { ok: false };

  const ids = configCandidate.ids
    .filter((id): id is string => typeof id === 'string')
    .filter((id) => availableIds.includes(id))
    .slice(0, max);

  return { ok: true, patch: { ...configCandidate, ids } };
}
