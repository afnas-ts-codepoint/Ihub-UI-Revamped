import type {
  PettyCashEditRow,
  PettyCashHistoryRow,
  PettyCashListingRow,
  PettyCashSettleRow,
} from '../types/paymentSettlement.types';

/**
 * Row status/action values stay literal English only (established fixture
 * convention — see `actionSheet.mock.ts`). The Petty Cash screen's own row
 * fixtures are plain untranslated strings in the prototype too.
 * @prototype index.html:L9597-L9624 `rows`
 */
export const pettyCashListingRows: readonly PettyCashListingRow[] = [
  { dept: 'Marketing', employee: 'L. Haddad', id: 'PCR-0421', status: 'Pending CEO', submitted: 'Apr 28', title: 'Client meeting transport (3 trips)', tone: 'warn', value: '42.500' },
  { dept: 'HR', employee: 'R. Salem', id: 'PCR-0420', status: 'Pending CEO', submitted: 'Apr 27', title: 'Office supplies — printer toner', tone: 'warn', value: '78.000' },
  { dept: 'Executive', employee: 'A. Al-Rashid', id: 'PCR-0419', status: 'Approved', submitted: 'Apr 26', title: 'Hospitality — board meeting', tone: 'ok', value: '124.250' },
];

/** @prototype index.html:L9643-L9647 `pcEditRows` */
export const pettyCashEditRows: readonly PettyCashEditRow[] = [
  { amount: '42.500', dept: 'Marketing', employee: 'L. Haddad', id: 'PCR-0421', status: 'Draft', submitted: 'Apr 28', tone: 'warn' },
  { amount: '78.000', dept: 'HR', employee: 'R. Salem', id: 'PCR-0420', status: 'Draft', submitted: 'Apr 27', tone: 'warn' },
  { amount: '55.000', dept: 'Operations', employee: 'M. Faris', id: 'PCR-0417', status: 'Returned', submitted: 'Apr 25', tone: 'bad' },
];

/** @prototype index.html:L9655-L9659 `pcHistRows` */
export const pettyCashHistoryRows: readonly PettyCashHistoryRow[] = [
  { action: 'Submitted', by: 'L. Haddad', date: 'Apr 28', id: 'PCR-0421', note: 'Sent for CEO sign-off.', tone: 'warn' },
  { action: 'Approved', by: 'CEO Office', date: 'Apr 27', id: 'PCR-0419', note: 'Approved — released to employee.', tone: 'ok' },
  { action: 'Returned', by: 'Finance', date: 'Apr 25', id: 'PCR-0417', note: 'Receipt missing — resubmit.', tone: 'bad' },
];

/** @prototype index.html:L9725-L9729 `settleRows` — literal statuses, including the 0.000-balance "To settle" row. */
export const pettyCashSettleRows: readonly PettyCashSettleRow[] = [
  { advance: '150.000', balance: '17.500', employee: 'L. Haddad', id: 'PCF-0210', spent: '132.500', status: 'To settle', tone: 'warn' },
  { advance: '200.000', balance: '0.000', employee: 'R. Salem', id: 'PCF-0208', spent: '200.000', status: 'To settle', tone: 'warn' },
  { advance: '100.000', balance: '13.750', employee: 'A. Al-Rashid', id: 'PCF-0205', spent: '86.250', status: 'Settled', tone: 'ok' },
];

/**
 * Literal, non-derived tab counts (the prototype hardcodes them; they never
 * follow the filtered/total row count).
 * @prototype index.html:L9692 (Pending 2 / All 134); L9733 (To settle 2 / All 58)
 */
export const PETTY_CASH_LISTING_COUNTS = { all: 134, pending: 2 } as const;
export const PETTY_CASH_SETTLE_COUNTS = { all: 58, open: 2 } as const;
