import type { SavedConfigEntry } from '../types/dashboardConfig.types';

export type LibrarySort = 'popular' | 'recent';

/** Recent (by date, most recent first) / Popular (by uses, descending). */
export function sortLibraryEntries(
  entries: readonly SavedConfigEntry[],
  sort: LibrarySort,
): SavedConfigEntry[] {
  return [...entries].sort((a, b) =>
    sort === 'popular' ? b.uses - a.uses : b.date.localeCompare(a.date),
  );
}

/**
 * Create-or-replace the entry matching `scopeKey` (Save writes one library
 * row per scope). `build` receives the existing entry (if any) so its
 * `id`/`uses`/`fav` can be preserved across re-saves of the same scope.
 * @prototype index.html:L7225-L7226, L7236-L7237
 */
export function upsertLibraryEntryByScopeKey(
  entries: readonly SavedConfigEntry[],
  scopeKey: string,
  build: (existing: SavedConfigEntry | undefined) => SavedConfigEntry,
): SavedConfigEntry[] {
  const index = entries.findIndex((entry) => entry.scopeKey === scopeKey);
  const built = build(index >= 0 ? entries[index] : undefined);
  return index >= 0
    ? entries.map((entry, position) => (position === index ? built : entry))
    : [built, ...entries];
}

/** Load increments the entry's `uses` immediately (even though loading does not save). */
export function incrementLibraryEntryUses(
  entries: readonly SavedConfigEntry[],
  id: string,
): SavedConfigEntry[] {
  return entries.map((entry) =>
    entry.id === id ? { ...entry, uses: entry.uses + 1 } : entry,
  );
}

/**
 * The star toggle persists `fav` but nothing else in the prototype reads
 * it — sort only supports Recent/Popular. This is a genuine prototype
 * quirk (`PROTOTYPE-NOOP(D2)`), preserved as-is, not wired into sorting.
 */
export function toggleLibraryEntryFavorite(
  entries: readonly SavedConfigEntry[],
  id: string,
): SavedConfigEntry[] {
  return entries.map((entry) =>
    entry.id === id ? { ...entry, fav: !entry.fav } : entry,
  );
}

export function removeLibraryEntry(
  entries: readonly SavedConfigEntry[],
  id: string,
): SavedConfigEntry[] {
  return entries.filter((entry) => entry.id !== id);
}

/**
 * Clones the entry with a new id, appends the copy suffix to the name,
 * forces `status: 'Draft'`, `uses: 0`, today's date and the fixed current
 * user, and unshifts into the library.
 * @prototype index.html:L7416
 */
export function duplicateLibraryEntry(
  entries: readonly SavedConfigEntry[],
  id: string,
  options: Readonly<{ by: string; copySuffix: string; newId: string; today: string }>,
): SavedConfigEntry[] {
  const source = entries.find((entry) => entry.id === id);
  if (!source) return [...entries];

  const clone: SavedConfigEntry = {
    ...source,
    by: options.by,
    date: options.today,
    id: options.newId,
    name: `${source.name} ${options.copySuffix}`,
    scopeKey: undefined,
    status: 'Draft',
    uses: 0,
  };

  return [clone, ...entries];
}
