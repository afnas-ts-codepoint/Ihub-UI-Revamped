export type CsvCell = string | number | boolean | null | undefined;

const quote = (value: CsvCell) =>
  `"${String(value ?? '').replaceAll('"', '""')}"`;

/** @prototype index.html:L1467-L1468, L1760-L1761 */
export function toCsv(
  columns: readonly CsvCell[],
  rows: readonly (readonly CsvCell[])[],
) {
  return [columns, ...rows].map((row) => row.map(quote).join(',')).join('\n');
}

export function csvBytes(
  columns: readonly CsvCell[],
  rows: readonly (readonly CsvCell[])[],
) {
  return new TextEncoder().encode(toCsv(columns, rows));
}
