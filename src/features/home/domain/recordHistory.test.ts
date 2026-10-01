import { describe, expect, it } from 'vitest';

import { recordHistory, type RecordHistoryKind } from './recordHistory';

/**
 * Golden values computed by running the prototype's own `HUD_HISTORY`
 * (ihub/index.html:L1243-L1256) in node via `vm`.
 * Each row: id, kind, then `[text, tone, by, when]` per entry (oldest first).
 */
const GOLDEN: readonly (readonly [string, RecordHistoryKind, readonly (readonly [string, string, string, string])[]])[] = [
  ['A2', 'request', [['Request submitted', 'created', 'M. Faris', '6 hours ago'], ['Budget line checked', 'update', 'L. Haddad', '2 hours ago'], ['Sent to committee', 'warn', 'K. Ibrahim', '48 min ago']]],
  ['A6', 'request', [['Request submitted', 'created', 'O. Najjar', '6 hours ago'], ['Budget line checked', 'update', 'M. Faris', '2 hours ago'], ['Sent to committee', 'warn', 'L. Haddad', '48 min ago']]],
  ['A7', 'request', [['Request submitted', 'created', 'M. Faris', '6 hours ago'], ['Budget line checked', 'update', 'L. Haddad', '2 hours ago'], ['Sent to committee', 'warn', 'K. Ibrahim', '48 min ago']]],
  ['A8', 'request', [['Request submitted', 'created', 'L. Haddad', '6 hours ago'], ['Budget line checked', 'update', 'K. Ibrahim', '2 hours ago'], ['Sent to committee', 'warn', 'R. Salem', '48 min ago']]],
  ['INC-2041', 'incident', [['Reported', 'created', 'K. Ibrahim', 'yesterday'], ['Acknowledged by duty manager', 'update', 'R. Salem', '6 hours ago'], ['Severity confirmed', 'update', 'O. Najjar', '2 hours ago'], ['Assigned for follow-up', 'update', 'M. Faris', '48 min ago']]],
  ['INC-2039', 'incident', [['Reported', 'created', 'O. Najjar', 'yesterday'], ['Acknowledged by duty manager', 'update', 'M. Faris', '6 hours ago'], ['Severity confirmed', 'update', 'L. Haddad', '2 hours ago'], ['Assigned for follow-up', 'update', 'K. Ibrahim', '48 min ago']]],
  ['JO-7782', 'task', [['Task created', 'created', 'O. Najjar', 'yesterday'], ['Owner assigned', 'update', 'M. Faris', '6 hours ago'], ['Stage moved to Ongoing', 'update', 'L. Haddad', '2 hours ago'], ['Progress note added', 'update', 'K. Ibrahim', '48 min ago']]],
  ['JO-7770', 'task', [['Task created', 'created', 'L. Haddad', 'yesterday'], ['Owner assigned', 'update', 'K. Ibrahim', '6 hours ago'], ['Stage moved to Ongoing', 'update', 'R. Salem', '2 hours ago'], ['Progress note added', 'update', 'O. Najjar', '48 min ago']]],
  ['JO-7768', 'task', [['Task created', 'created', 'R. Salem', 'yesterday'], ['Owner assigned', 'update', 'O. Najjar', '6 hours ago'], ['Stage moved to Ongoing', 'update', 'M. Faris', '2 hours ago'], ['Progress note added', 'update', 'L. Haddad', '48 min ago']]],
];

describe('recordHistory (HUD_HISTORY port)', () => {
  it.each(GOLDEN)('matches the prototype output for %s (%s)', (id, kind, entries) => {
    expect(recordHistory(id, kind).map((entry) => [entry.text, entry.tone, entry.by, entry.when])).toEqual(entries);
  });

  it('is deterministic and keeps the last N of the seven times', () => {
    expect(recordHistory('A2', 'request')).toEqual(recordHistory('A2', 'request'));
    expect(recordHistory('X', 'incident').map((entry) => entry.when)).toEqual(['yesterday', '6 hours ago', '2 hours ago', '48 min ago']);
  });
});
