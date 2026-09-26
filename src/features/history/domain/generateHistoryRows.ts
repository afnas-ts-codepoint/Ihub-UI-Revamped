import type {
  HistoryAction,
  HistoryRow,
  HistoryTone,
} from '../types/history.types';

const ACTIONS: readonly Readonly<{
  action: HistoryAction;
  tone: HistoryTone;
}>[] = [
  { action: 'created', tone: '' },
  { action: 'submitted', tone: 'warn' },
  { action: 'approved', tone: 'ok' },
  { action: 'verified', tone: 'ok' },
  { action: 'returned', tone: 'bad' },
  { action: 'rejected', tone: 'bad' },
  { action: 'edited', tone: '' },
  { action: 'closed', tone: 'ok' },
];

const USERS = [
  'A. Al-Rashid',
  'S. Al-Qahtani',
  'L. Haddad',
  'M. Faris',
  'O. Najjar',
  'R. Salem',
  'CEO Office',
] as const;

const DATES = [
  '23 Jul 2026',
  '22 Jul 2026',
  '21 Jul 2026',
  '20 Jul 2026',
  '18 Jul 2026',
  '17 Jul 2026',
  '15 Jul 2026',
  '12 Jul 2026',
  '09 Jul 2026',
  '05 Jul 2026',
] as const;

/** @prototype index.html:L9737-L9763 HistoryScreen */
export function generateHistoryRows(scopeLabel: string): readonly HistoryRow[] {
  const prefix =
    scopeLabel.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'REC';

  return DATES.map((date, index) => {
    const action = ACTIONS[(index * 3 + scopeLabel.length) % ACTIONS.length];
    const by = USERS[(index + scopeLabel.length) % USERS.length];

    if (!action || !by) throw new Error('History row seed is incomplete');

    return {
      action: action.action,
      by,
      date,
      ref: `${prefix}-${String(2_026_000 - index * 7)}`,
      tone: action.tone,
    };
  });
}
