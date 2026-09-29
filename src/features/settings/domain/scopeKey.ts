import type { ScopeKey, ScopeTargetState } from '../types/dashboardConfig.types';

const MULTI_SCOPES = new Set<ScopeKey>(['dept', 'user']);

export function isMultiTargetScope(scope: ScopeKey): boolean {
  return MULTI_SCOPES.has(scope);
}

/** The selected target(s) for a scope, always as a list (role is single-select). */
export function scopeTargetList(
  scope: ScopeKey,
  target: ScopeTargetState,
): readonly string[] {
  if (scope === 'default') return [];
  if (scope === 'role') return target.role ? [target.role] : [];
  return target[scope];
}

/**
 * The working-state key for the current scope + target. Admin `default`
 * uses the fixed key `'default'`; role uses the selected role; department
 * and user scopes sort their multi-select so the same set of targets always
 * resolves to the same saved-configuration entry regardless of pick order.
 * Personal (User Configuration) mode always resolves to `'me'`.
 * @prototype index.html:L7204 (`key`)
 */
export function computeScopeKey(
  mode: 'admin' | 'user',
  scope: ScopeKey,
  target: ScopeTargetState,
): string {
  if (mode === 'user') return 'me';
  if (scope === 'default') return 'default';
  if (scope === 'role') return `role:${target.role}`;
  return `${scope}:${[...target[scope]].sort().join('|')}`;
}

/**
 * `dept`/`user` scopes with nothing selected block Save (editing widgets
 * while untargeted is still allowed) — `default` and `role` (always has a
 * selection) can never be "untargeted".
 * @prototype index.html:L7188 (`noTarget`)
 */
export function isScopeTargetMissing(
  scope: ScopeKey,
  target: ScopeTargetState,
): boolean {
  return scope !== 'default' && scopeTargetList(scope, target).length === 0;
}
