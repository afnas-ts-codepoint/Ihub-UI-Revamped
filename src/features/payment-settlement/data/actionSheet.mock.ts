import type {
  ActionSheetCostRow,
  ActionSheetEditRow,
  ActionSheetHistoryRow,
  ActionSheetMissingRow,
  ActionSheetPrepayRow,
} from '../types/paymentSettlement.types';

/**
 * Row status/action values stay literal English only, matching the
 * established fixture convention across Purchasing/Budgeting (their row
 * values are never re-rendered through `T(en, ar, locale)` in production,
 * even where the prototype technically wraps them) — only chrome, labels
 * and headings are translated.
 * @prototype index.html:L17189-L17193 `editRows`
 */
export const actionSheetEditRows: readonly ActionSheetEditRow[] = [
  { dept: 'Operations', id: 'AS-318', status: 'Draft', title: 'Q2 Venue Safety Audit', tone: 'warn', type: 'Regular', value: '2,450.000' },
  { dept: 'Facilities', id: 'AS-317', status: 'Submitted', title: 'Arcade Refresh Fit-out', tone: 'ok', type: 'Scheduled', value: '18,900.000' },
  { dept: 'IT', id: 'AS-316', status: 'Returned', title: 'POS Maintenance Contract', tone: 'bad', type: 'Regular', value: '3,200.000' },
];

/** @prototype index.html:L17203-L17207 `missRows` */
export const actionSheetMissingRows: readonly ActionSheetMissingRow[] = [
  { days: '6', id: 'AS-311', missing: ['Invoice', 'GRN'], supplier: 'Advanced Tech Systems', title: 'Cinema Projector Units ×2' },
  { days: '3', id: 'AS-309', missing: ['GRN'], supplier: 'National Cleaning Co.', title: 'Deep Cleaning — Q2' },
  { days: '9', id: 'AS-305', missing: ['Invoice'], supplier: 'Oasis Catering Services', title: 'Catering — Board Meeting' },
];

/** @prototype index.html:L17218-L17222 `prepayRows` */
export const actionSheetPrepayRows: readonly ActionSheetPrepayRow[] = [
  { advance: '1,225.000', ccy: 'KWD', date: '12 Jul 2026', id: 'AS-318', status: 'Paid', supplier: 'Gulf Facilities Services Co.', tone: 'ok' },
  { advance: '4,500.000', ccy: 'KWD', date: '08 Jul 2026', id: 'AS-314', status: 'Pending', supplier: 'Al Mulla Trading Co.', tone: 'warn' },
  { advance: '900.000', ccy: 'KWD', date: '01 Jul 2026', id: 'AS-310', status: 'Paid', supplier: 'Prime Maintenance Ltd.', tone: 'ok' },
];

/** @prototype index.html:L17233-L17237 `costRows` */
export const actionSheetCostRows: readonly ActionSheetCostRow[] = [
  { id: 'AS-301', line: 'OPX · Marketing', recorded: '780.000', status: 'Recorded', title: 'Safety Signage', tone: 'ok', variance: '−20.000', vTone: 'ok' },
  { id: 'AS-298', line: 'CAPX · Facilities', recorded: '5,600.000', status: 'Over budget', title: 'HVAC Repair', tone: 'bad', variance: '+350.000', vTone: 'bad' },
  { id: 'AS-295', line: 'OPX · HR', recorded: '1,120.000', status: 'Recorded', title: 'Staff Uniforms', tone: 'ok', variance: '0.000', vTone: '' },
];

/** @prototype index.html:L17247-L17252 `histRows` */
export const actionSheetHistoryRows: readonly ActionSheetHistoryRow[] = [
  { action: 'Created', by: 'A. Al-Rashid', date: '20 Jul 2026', id: 'AS-318', kind: 'purchase', note: 'Draft saved with 2 attachments.', tone: '' },
  { action: 'Submitted', by: 'L. Haddad', date: '19 Jul 2026', id: 'AS-317', kind: 'service', note: 'Sent for CEO sign-off.', tone: 'ok' },
  { action: 'Returned', by: 'CEO Office', date: '18 Jul 2026', id: 'AS-316', kind: 'service', note: 'Missing GRN attachment — please re-submit.', tone: 'bad' },
  { action: 'Paid', by: 'Finance', date: '17 Jul 2026', id: 'AS-314', kind: 'purchase', note: 'Advance payment released to supplier.', tone: 'ok' },
];

/** @prototype index.html:L17041-L17048 */
export const ACTION_SHEET_LOCATIONS = ['360 Mall', 'The Gate Mall', 'Al Kout Mall', 'Assima Mall', 'All locations'] as const;
export const ACTION_SHEET_ZONES = ['Fun Tiki', 'The Bowl Room', 'Wonder Zone', 'Jump', 'The Court', 'Planet Laser', 'Pixel Run', 'Sky Zone', 'Make*', 'Retail'] as const;
export const ACTION_SHEET_DEPARTMENTS = ['Operations', 'Total Experience (TX)', 'Guest Services', 'Facilities', 'Maintenance', 'Marketing', 'Procurement', 'Finance', 'HR', 'IT', 'QA & Compliance', 'Franchise Operations', 'Development'] as const;
export const ACTION_SHEET_YEARS = ['2024', '2025', '2026', '2027'] as const;
export const ACTION_SHEET_CATEGORIES = ['Equipment', 'Services', 'Supplies', 'Maintenance', 'Marketing', 'IT', 'Utilities', 'Other'] as const;
export const ACTION_SHEET_SUPPLIERS = ['Gulf Facilities Services Co.', 'Al Mulla Trading Co.', 'Kuwait Supplies Group', 'Advanced Tech Systems', 'National Cleaning Co.', 'Oasis Catering Services', 'Prime Maintenance Ltd.', 'Other'] as const;
