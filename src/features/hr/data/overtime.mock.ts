import type {
  OvertimeRecord,
  OvertimeStat,
  OvertimeTab,
} from '../types/overtime.types';

/** @prototype index.html:L8285-L8317 — literal, never derived from `overtimeRecords`. */
export const OVERTIME_TABS: readonly OvertimeTab[] = [
  { id: 'todo', displayCount: 14 },
  { id: 'verify', displayCount: 6 },
  { id: 'edit', displayCount: 3 },
  { id: 'correct', displayCount: 2 },
  { id: 'above', displayCount: 4 },
  { id: 'just', displayCount: 1 },
  { id: 'records', displayCount: 92 },
];

/** @prototype index.html:L8440-L8455 */
export const OVERTIME_STATS: readonly OvertimeStat[] = [
  { key: 'budgeted' },
  { key: 'actual', tone: 'ok' },
  { key: 'variance', tone: 'bad' },
];

/** @prototype index.html:L8379-L8433 */
export const overtimeRecords: readonly OvertimeRecord[] = [
  {
    id: 'OT-2451',
    employee: 'Khaled Ibrahim',
    dept: 'Operations',
    date: 'Apr 28',
    hours: 4.5,
    amount: '180.00',
    status: 'Pending',
  },
  {
    id: 'OT-2450',
    employee: 'Layla Haddad',
    dept: 'Marketing',
    date: 'Apr 28',
    hours: 3,
    amount: '142.50',
    status: 'Approved',
  },
  {
    id: 'OT-2449',
    employee: 'Mohammed Al-Otaibi',
    dept: 'Finance',
    date: 'Apr 27',
    hours: 6,
    amount: '320.00',
    status: 'Pending',
  },
  {
    id: 'OT-2448',
    employee: 'Sara Al-Qahtani',
    dept: 'Marketing',
    date: 'Apr 27',
    hours: 2.5,
    amount: '125.00',
    status: 'Above budget',
  },
  {
    id: 'OT-2447',
    employee: 'Yousef Al-Mutairi',
    dept: 'IT',
    date: 'Apr 26',
    hours: 5,
    amount: '210.00',
    status: 'Approved',
  },
  {
    id: 'OT-2446',
    employee: 'Rania Salem',
    dept: 'HR',
    date: 'Apr 26',
    hours: 1.5,
    amount: '64.00',
    status: 'Verified',
  },
];
