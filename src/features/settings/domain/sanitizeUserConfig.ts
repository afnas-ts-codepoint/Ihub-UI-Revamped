import type { DashboardConfig } from '../types/dashboardConfig.types';

export type UserConfigInput = Readonly<{
  cols?: DashboardConfig['cols'];
  ids: readonly string[];
}>;

/**
 * A locally-typed stand-in for `Array.isArray` (which widens to `arg is
 * any[]`): keeps the already-known `readonly string[]` type instead of
 * collapsing it to `any[]` after the guard.
 */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value);
}

/**
 * Re-applies the admin's Default-scope rules to a personal (User
 * Configuration) config — used whenever a personal config is loaded,
 * imported, or read back for the live preview. This is the one place the
 * admin→personal inheritance rules live, so Load/Import/render all agree:
 *
 * - filter ids down to the admin's Default ids (a widget the admin removed
 *   from Default is never selectable in the personal builder);
 * - if hiding is disallowed, force-append any admin ids missing from the
 *   imported config;
 * - if reordering is disallowed, force the id order back to the admin's
 *   order;
 * - if locking is on, ensure mandatory ids are present.
 *
 * Returns `null` when `imported` has no usable `ids` array (nothing to
 * sanitize), matching the prototype's own null-guard.
 * @prototype index.html:L7166-L7170 (`sanitizeMe`)
 */
export function sanitizeUserConfig(
  imported: UserConfigInput | null | undefined,
  orgConfig: DashboardConfig,
  mandatoryIds: readonly string[],
): DashboardConfig | null {
  if (!imported || !isStringArray(imported.ids)) return null;

  let ids = imported.ids.filter((id) => orgConfig.ids.includes(id));

  if (!orgConfig.hide) {
    ids = ids.concat(orgConfig.ids.filter((id) => !ids.includes(id)));
  }

  if (!orgConfig.dnd) {
    ids = orgConfig.ids.filter((id) => ids.includes(id));
  }

  if (orgConfig.lock) {
    ids = mandatoryIds
      .filter((id) => orgConfig.ids.includes(id) && !ids.includes(id))
      .concat(ids);
  }

  return { ...orgConfig, cols: imported.cols || orgConfig.cols, ids };
}
