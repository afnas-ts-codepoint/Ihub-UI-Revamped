import type { RecordFilterValue } from '@/features/organization';

/**
 * A structurally-permissive shape covering every field `pcMatchRow` reads.
 * PC requests, missing-document rows and history rows each carry a different
 * subset of these fields; the prototype predicate treats absent fields as
 * absent via `.filter(Boolean)`, so every field here is optional.
 * @prototype index.html:L10203-L10211
 */
export type PcMatchableRow = Readonly<{
  action?: string;
  by?: string;
  dept?: string;
  id?: string;
  pcRef?: string;
  ref?: string;
  status?: string;
  supplier?: string;
  title?: string;
  vendor?: string;
}>;

/** @prototype index.html:L10203-L10210 `pcMatchRow` */
export function pcMatchRow(row: PcMatchableRow, filter: RecordFilterValue): boolean {
  const haystack = [
    row.id,
    row.title,
    row.vendor,
    row.supplier,
    row.dept,
    row.status,
    row.action,
    row.by,
    row.pcRef,
    row.ref,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (filter.num && !haystack.includes(filter.num.trim().toLowerCase())) return false;
  if (filter.dept && row.dept && row.dept !== filter.dept) return false;
  if (filter.status && row.status && row.status !== filter.status) return false;
  return true;
}

/** @prototype index.html:L10211 `pcRowsF` */
export function pcRowsF<Row extends PcMatchableRow>(rows: readonly Row[], filter: RecordFilterValue): Row[] {
  return rows.filter((row) => pcMatchRow(row, filter));
}
