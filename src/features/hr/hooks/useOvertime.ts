import { OVERTIME_STATS, OVERTIME_TABS, overtimeRecords } from '../data/overtime.mock';

export function useOvertime() {
  return {
    rows: overtimeRecords,
    stats: OVERTIME_STATS,
    tabs: OVERTIME_TABS,
  } as const;
}
