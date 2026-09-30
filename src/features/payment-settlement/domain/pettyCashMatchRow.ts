import type { RecordFilterValue } from '@/features/organization';

/**
 * Structurally-permissive: listing/edit/history rows each carry a different
 * subset of these fields and the prototype predicate skips absent ones.
 * @prototype index.html:L9661-L9668 `pcMatch`
 */
export type PettyCashMatchableRow = Readonly<{
  action?: string;
  by?: string;
  dept?: string;
  employee?: string;
  id?: string;
  note?: string;
  purpose?: string;
  status?: string;
}>;

/** @prototype index.html:L9661-L9668 `pcMatch` */
export function pettyCashMatchRow(row: PettyCashMatchableRow, filter: RecordFilterValue): boolean {
  const haystack = [row.id, row.employee, row.dept, row.status, row.action, row.by, row.note, row.purpose]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (filter.num && !haystack.includes(filter.num.trim().toLowerCase())) return false;
  if (filter.dept && row.dept && row.dept !== filter.dept) return false;
  if (filter.status && row.status && row.status !== filter.status) return false;
  return true;
}

/** @prototype index.html:L9669 `pcRows` */
export function pettyCashRowsF<Row extends PettyCashMatchableRow>(
  rows: readonly Row[],
  filter: RecordFilterValue,
): Row[] {
  return rows.filter((row) => pettyCashMatchRow(row, filter));
}
