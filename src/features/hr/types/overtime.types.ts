import type { StatTileTone } from '@/shared/ui/stat/StatTile';

export type OvertimeStatus = 'Above budget' | 'Approved' | 'Pending' | 'Verified';

export type OvertimeRecord = Readonly<{
  amount: string;
  date: string;
  dept: string;
  employee: string;
  hours: number;
  id: string;
  status: OvertimeStatus;
}>;

export type OvertimeTabId =
  | 'above'
  | 'correct'
  | 'edit'
  | 'just'
  | 'records'
  | 'todo'
  | 'verify';

/** Literal prototype tab counts (`PROTOTYPE-NOOP(D2)`); never derived from row data. */
export type OvertimeTab = Readonly<{
  displayCount: number;
  id: OvertimeTabId;
}>;

export type OvertimeStat = Readonly<{
  key: 'actual' | 'budgeted' | 'variance';
  tone?: StatTileTone;
}>;
