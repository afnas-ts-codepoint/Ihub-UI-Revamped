import { describe, expect, it } from 'vitest';

import arHistory from '@/shared/i18n/locales/ar/history.json';
import enHistory from '@/shared/i18n/locales/en/history.json';
import type { HistoryAction, HistoryTone } from '../types/history.types';
import { generateHistoryRows } from './generateHistoryRows';

const ACTION_SEQUENCES: Readonly<Record<number, readonly HistoryAction[]>> = {
  0: ['created', 'verified', 'edited', 'submitted', 'returned', 'closed', 'approved', 'rejected', 'created', 'verified'],
  1: ['submitted', 'returned', 'closed', 'approved', 'rejected', 'created', 'verified', 'edited', 'submitted', 'returned'],
  2: ['approved', 'rejected', 'created', 'verified', 'edited', 'submitted', 'returned', 'closed', 'approved', 'rejected'],
  3: ['verified', 'edited', 'submitted', 'returned', 'closed', 'approved', 'rejected', 'created', 'verified', 'edited'],
  4: ['returned', 'closed', 'approved', 'rejected', 'created', 'verified', 'edited', 'submitted', 'returned', 'closed'],
  5: ['rejected', 'created', 'verified', 'edited', 'submitted', 'returned', 'closed', 'approved', 'rejected', 'created'],
  6: ['edited', 'submitted', 'returned', 'closed', 'approved', 'rejected', 'created', 'verified', 'edited', 'submitted'],
  7: ['closed', 'approved', 'rejected', 'created', 'verified', 'edited', 'submitted', 'returned', 'closed', 'approved'],
};

const USER_SEQUENCES: Readonly<Record<number, readonly string[]>> = {
  0: ['A. Al-Rashid', 'S. Al-Qahtani', 'L. Haddad', 'M. Faris', 'O. Najjar', 'R. Salem', 'CEO Office', 'A. Al-Rashid', 'S. Al-Qahtani', 'L. Haddad'],
  1: ['S. Al-Qahtani', 'L. Haddad', 'M. Faris', 'O. Najjar', 'R. Salem', 'CEO Office', 'A. Al-Rashid', 'S. Al-Qahtani', 'L. Haddad', 'M. Faris'],
  2: ['L. Haddad', 'M. Faris', 'O. Najjar', 'R. Salem', 'CEO Office', 'A. Al-Rashid', 'S. Al-Qahtani', 'L. Haddad', 'M. Faris', 'O. Najjar'],
  3: ['M. Faris', 'O. Najjar', 'R. Salem', 'CEO Office', 'A. Al-Rashid', 'S. Al-Qahtani', 'L. Haddad', 'M. Faris', 'O. Najjar', 'R. Salem'],
  4: ['O. Najjar', 'R. Salem', 'CEO Office', 'A. Al-Rashid', 'S. Al-Qahtani', 'L. Haddad', 'M. Faris', 'O. Najjar', 'R. Salem', 'CEO Office'],
  5: ['R. Salem', 'CEO Office', 'A. Al-Rashid', 'S. Al-Qahtani', 'L. Haddad', 'M. Faris', 'O. Najjar', 'R. Salem', 'CEO Office', 'A. Al-Rashid'],
  6: ['CEO Office', 'A. Al-Rashid', 'S. Al-Qahtani', 'L. Haddad', 'M. Faris', 'O. Najjar', 'R. Salem', 'CEO Office', 'A. Al-Rashid', 'S. Al-Qahtani'],
};

const TONES: Readonly<Record<HistoryAction, HistoryTone>> = {
  approved: 'ok',
  closed: 'ok',
  created: '',
  edited: '',
  rejected: 'bad',
  returned: 'bad',
  submitted: 'warn',
  verified: 'ok',
};

const DATES = [
  '23 Jul 2026', '22 Jul 2026', '21 Jul 2026', '20 Jul 2026', '18 Jul 2026',
  '17 Jul 2026', '15 Jul 2026', '12 Jul 2026', '09 Jul 2026', '05 Jul 2026',
] as const;

const REFERENCE_NUMBERS = [
  2_026_000, 2_025_993, 2_025_986, 2_025_979, 2_025_972,
  2_025_965, 2_025_958, 2_025_951, 2_025_944, 2_025_937,
] as const;

const scopeCases = [
  ['history', 'HIS', 7, 0, 5, 5],
  ['workCentre', 'WOR', 3, 4, 2, 3],
  ['tasks', 'TAS', 5, 5, 3, 4],
  ['enquiry', 'ENQ', 7, 0, 3, 4],
  ['observations', 'OBS', 4, 5, 1, 2],
  ['incidents', 'INC', 1, 2, 7, 0],
  ['checklists', 'CHE', 2, 3, 6, 0],
  ['priceChange', 'PRI', 4, 5, 3, 4],
  ['promotions', 'PRO', 2, 3, 6, 6],
  ['financeBudgets', 'FIN', 1, 3, 3, 5],
  ['newBudget', 'NEW', 2, 3, 5, 6],
  ['additionalBudget', 'ADD', 1, 3, 6, 0],
  ['transferFund', 'TRA', 5, 6, 5, 6],
  ['paymentSettlement', 'PAY', 2, 4, 7, 1],
  ['pettyCash', 'PET', 2, 3, 7, 0],
  ['hr', 'HR', 2, 2, 7, 1],
  ['overtime', 'OVE', 0, 1, 5, 6],
  ['investigations', 'INV', 6, 0, 1, 2],
  ['violations', 'VIO', 2, 3, 1, 2],
  ['loan', 'LOA', 4, 4, 6, 6],
  ['endOfProbation', 'END', 0, 2, 2, 4],
  ['exitInterview', 'EXI', 6, 0, 3, 5],
  ['appraisal', 'APP', 1, 2, 7, 0],
  ['qualityCompliance', 'QUA', 4, 6, 0, 2],
  ['qualityAssuranceChecklists', 'QUA', 4, 0, 4, 5],
  ['purchasing', 'PUR', 2, 3, 1, 2],
  ['sopChecklist', 'SOP', 5, 6, 5, 0],
] as const;

function assertExactRows(
  scopeLabel: string,
  prefix: string,
  actionSequence: number,
  userSequence: number,
) {
  const rows = generateHistoryRows(scopeLabel);
  const actions = ACTION_SEQUENCES[actionSequence];
  const users = USER_SEQUENCES[userSequence];
  expect(actions).toBeDefined();
  expect(users).toBeDefined();
  expect(rows).toHaveLength(10);
  expect(rows.map((row) => row.date)).toEqual(DATES);
  expect(rows.map((row) => row.ref)).toEqual(
    REFERENCE_NUMBERS.map((number) => `${prefix}-${String(number)}`),
  );
  expect(rows.map((row) => row.action)).toEqual(actions);
  expect(rows.map((row) => row.by)).toEqual(users);
  expect(rows.map((row) => row.tone)).toEqual(
    actions?.map((action) => TONES[action]),
  );
}

describe('prototype-exact History row generation', () => {
  it.each(scopeCases)(
    'matches all 10 English rows for %s',
    (scopeKey, prefix, actionSequence, userSequence) => {
      assertExactRows(
        enHistory.scopes[scopeKey],
        prefix,
        actionSequence,
        userSequence,
      );
    },
  );

  it.each(scopeCases)(
    'matches all 10 Arabic rows for %s',
    (scopeKey, _prefix, _enAction, _enUser, actionSequence, userSequence) => {
      assertExactRows(
        arHistory.scopes[scopeKey],
        'REC',
        actionSequence,
        userSequence,
      );
    },
  );
});
