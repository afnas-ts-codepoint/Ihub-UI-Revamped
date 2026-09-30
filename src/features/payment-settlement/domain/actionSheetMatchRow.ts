import type { RecordFilterValue } from '@/features/organization';

/**
 * A structurally-permissive shape covering every field `asMatch` reads.
 * Edit/Missing/Pre Payment/Cost/History rows each carry a different subset
 * of these fields; the prototype predicate treats absent fields as absent
 * via `.filter(Boolean)`, so every field here is optional.
 * @prototype index.html:L17257-L17265 `asMatch`
 */
export type ActionSheetMatchableRow = Readonly<{
  action?: string;
  by?: string;
  dept?: string;
  id?: string;
  status?: string;
  supplier?: string;
  title?: string;
  type?: string;
}>;

/** @prototype index.html:L17257-L17265 `asMatch` */
export function actionSheetMatchRow(row: ActionSheetMatchableRow, filter: RecordFilterValue): boolean {
  const haystack = [row.id, row.title, row.supplier, row.dept, row.status, row.action, row.by]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (filter.num && !haystack.includes(filter.num.trim().toLowerCase())) return false;
  if (filter.dept && row.dept && row.dept !== filter.dept) return false;
  if (filter.status && row.status && row.status !== filter.status) return false;
  if (filter.cat && row.type && row.type !== filter.cat) return false;
  return true;
}

/** @prototype index.html:L17266 `asRows` */
export function actionSheetRowsF<Row extends ActionSheetMatchableRow>(
  rows: readonly Row[],
  filter: RecordFilterValue,
): Row[] {
  return rows.filter((row) => actionSheetMatchRow(row, filter));
}
