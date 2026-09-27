import type { CSSProperties } from 'react';
import {
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  tableFeatures,
  useTable,
  type ReactTable,
  type RowData,
  type TableFeatures,
  type TableOptions,
} from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // Generic arity must match the library's `ColumnMeta` for declaration
  // merging; this extension doesn't need any of the three itself.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue,
  > {
    /** Applied to the `<th>` for this column; layout only (e.g. fixed widths). */
    headerStyle?: CSSProperties;
    /** Applied to every `<td>` for this column; layout only. */
    cellStyle?: CSSProperties;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

/**
 * The M4.1 table engine: column visibility, row selection (used for bulk
 * actions) and pagination. Masters is the first and only consumer; no
 * sorting, filtering or grouping feature is registered because every Master
 * listing filters its rows itself before handing them to the table (see
 * `useMasterListing`).
 */
export const dataTableFeatures = tableFeatures({
  columnVisibilityFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowPaginationFeature,
  rowSelectionFeature,
});

export type DataTableFeatures = typeof dataTableFeatures;
export type DataTable<TData extends RowData> = ReactTable<
  DataTableFeatures,
  TData
>;

export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

type DataTableOptions<TData extends RowData> = Omit<
  TableOptions<DataTableFeatures, TData>,
  'features'
>;

export function useDataTable<TData extends RowData>(
  options: DataTableOptions<TData>,
): DataTable<TData> {
  return useTable<DataTableFeatures, TData>({
    features: dataTableFeatures,
    ...options,
  });
}
