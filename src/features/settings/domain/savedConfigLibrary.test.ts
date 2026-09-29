import { describe, expect, it } from 'vitest';

import {
  duplicateLibraryEntry,
  incrementLibraryEntryUses,
  removeLibraryEntry,
  sortLibraryEntries,
  toggleLibraryEntryFavorite,
  upsertLibraryEntryByScopeKey,
} from './savedConfigLibrary';
import type { SavedConfigEntry } from '../types/dashboardConfig.types';

const cfg = { cols: 2, dnd: true, hide: true, ids: ['metrics'], lock: false } as const;

const entries: readonly SavedConfigEntry[] = [
  { applied: 'A', by: 'Alex Morgan', cfg, date: '2026-05-01', fav: true, id: 'L1', name: 'One', status: 'Active', uses: 5 },
  { applied: 'B', by: 'Sarah Connor', cfg, date: '2026-05-03', fav: false, id: 'L2', name: 'Two', status: 'Draft', uses: 20 },
];

describe('sortLibraryEntries', () => {
  it('sorts by most-recent date', () => {
    expect(sortLibraryEntries(entries, 'recent').map((e) => e.id)).toEqual(['L2', 'L1']);
  });

  it('sorts by descending uses for popular', () => {
    expect(sortLibraryEntries(entries, 'popular').map((e) => e.id)).toEqual(['L2', 'L1']);
  });
});

describe('upsertLibraryEntryByScopeKey', () => {
  it('inserts a new entry at the front when no scopeKey matches', () => {
    const next = upsertLibraryEntryByScopeKey(entries, 'default', () => ({
      applied: 'C', by: 'Alex Morgan', cfg, date: '2026-05-04', fav: false, id: 'L3', name: 'Three', scopeKey: 'default', status: 'Active', uses: 0,
    }));
    expect(next.map((e) => e.id)).toEqual(['L3', 'L1', 'L2']);
  });

  it('replaces the existing entry in place, preserving position', () => {
    const fallback = entries[1];
    if (!fallback) throw new Error('fixture missing entry');
    const withScope = entries.map((e) => (e.id === 'L2' ? { ...e, scopeKey: 'default' } : e));
    const next = upsertLibraryEntryByScopeKey(withScope, 'default', (existing) => ({
      ...(existing ?? fallback),
      uses: (existing?.uses ?? 0) + 1,
    }));
    expect(next).toHaveLength(2);
    expect(next[1]?.uses).toBe(21);
  });
});

describe('incrementLibraryEntryUses / toggleLibraryEntryFavorite / removeLibraryEntry', () => {
  it('increments only the matching entry', () => {
    expect(incrementLibraryEntryUses(entries, 'L1').find((e) => e.id === 'L1')?.uses).toBe(6);
  });

  it('toggles fav without affecting sort inputs', () => {
    const next = toggleLibraryEntryFavorite(entries, 'L2');
    expect(next.find((e) => e.id === 'L2')?.fav).toBe(true);
  });

  it('removes the matching entry only', () => {
    expect(removeLibraryEntry(entries, 'L1').map((e) => e.id)).toEqual(['L2']);
  });
});

describe('duplicateLibraryEntry', () => {
  it('clones with a new id, draft status, reset uses, today’s date and the fixed author', () => {
    const next = duplicateLibraryEntry(entries, 'L1', {
      by: 'Alex Morgan',
      copySuffix: '(copy)',
      newId: 'L99',
      today: '2026-09-29',
    });
    expect(next[0]).toEqual({
      applied: 'A',
      by: 'Alex Morgan',
      cfg,
      date: '2026-09-29',
      fav: true,
      id: 'L99',
      name: 'One (copy)',
      scopeKey: undefined,
      status: 'Draft',
      uses: 0,
    });
    expect(next).toHaveLength(3);
  });

  it('is a no-op when the id does not exist', () => {
    expect(duplicateLibraryEntry(entries, 'missing', { by: 'x', copySuffix: 'y', newId: 'z', today: 't' })).toEqual(entries);
  });
});
