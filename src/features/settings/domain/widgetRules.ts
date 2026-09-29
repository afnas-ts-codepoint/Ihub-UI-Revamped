import { MAX_WIDGETS } from './dashboardConfigDefaults';

export type ToggleBlockReason = 'hide-disallowed' | 'locked' | 'max-reached';

export type ToggleWidgetResult =
  | Readonly<{ ids: string[]; ok: true }>
  | Readonly<{ ok: false; reason: ToggleBlockReason }>;

/**
 * Turning a widget off is blocked (message-only, no state change) when
 * hiding is disallowed for the current mode/scope, or the widget is locked
 * as mandatory. Turning a widget on is blocked past `MAX_WIDGETS`.
 * @prototype index.html:L7211-L7214 (`toggleW`)
 */
export function toggleWidgetId(
  ids: readonly string[],
  id: string,
  options: Readonly<{
    hideDisallowed: boolean;
    locked: readonly string[];
    max?: number;
  }>,
): ToggleWidgetResult {
  const max = options.max ?? MAX_WIDGETS;
  const isOn = ids.includes(id);

  if (isOn) {
    if (options.hideDisallowed) return { ok: false, reason: 'hide-disallowed' };
    if (options.locked.includes(id)) return { ok: false, reason: 'locked' };
    return { ids: ids.filter((existing) => existing !== id), ok: true };
  }

  if (ids.length >= max) return { ok: false, reason: 'max-reached' };
  return { ids: [...ids, id], ok: true };
}

/**
 * Native HTML5 drag-and-drop reorder: move `from` to just before `to`
 * (append at the end when `to` is `null`). No-op when reordering is
 * disallowed, `from` is missing, or dropped on itself.
 * @prototype index.html:L7215 (`move`)
 */
export function reorderWidgetIds(
  ids: readonly string[],
  from: string | null,
  to: string | null,
  dndAllowed: boolean,
): string[] {
  if (!from || from === to || !dndAllowed) return [...ids];
  const remaining = ids.filter((existing) => existing !== from);
  const targetIndex = to ? remaining.indexOf(to) : remaining.length;
  const insertAt = targetIndex < 0 ? remaining.length : targetIndex;
  const next = [...remaining];
  next.splice(insertAt, 0, from);
  return next;
}

/**
 * "Select all" appends every not-yet-shown widget, capped at `max`.
 * @prototype index.html:L7363
 */
export function selectAllWidgetIds(
  currentIds: readonly string[],
  availableIds: readonly string[],
  max = MAX_WIDGETS,
): string[] {
  return [
    ...currentIds,
    ...availableIds.filter((id) => !currentIds.includes(id)),
  ].slice(0, max);
}

/**
 * "Clear" resets to only the currently-locked/mandatory widgets; mandatory
 * widgets survive Clear.
 * @prototype index.html:L7364
 */
export function clearWidgetIds(
  currentIds: readonly string[],
  lockedIds: readonly string[],
): string[] {
  return currentIds.filter((id) => lockedIds.includes(id));
}
