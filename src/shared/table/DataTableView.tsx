import type { RowData } from '@tanstack/react-table';

import type { DataTable } from './dataTable';

type DataTableViewProps<TData extends RowData> = Readonly<{
  /** Adds a class to a row's `<tr>`, e.g. to highlight a selected row. */
  getRowClassName?: (data: TData) => string | undefined;
  table: DataTable<TData>;
}>;

/**
 * Generic TanStack Table renderer: headers, body and cell markup only. Column
 * definitions, row data, filtering and every business rule stay owned by the
 * table's consumer (Masters).
 */
export function DataTableView<TData extends RowData>({
  getRowClassName,
  table,
}: DataTableViewProps<TData>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-base">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className="px-3 pb-2.5 text-start text-2xs-plus font-semibold tracking-[0.06em] whitespace-nowrap text-fg-3 uppercase"
                  key={header.id}
                  style={header.column.columnDef.meta?.headerStyle}
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              className={`border-t border-line ${getRowClassName?.(row.original) ?? ''}`}
              key={row.id}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  className="px-3 py-3 whitespace-nowrap"
                  key={cell.id}
                  style={cell.column.columnDef.meta?.cellStyle}
                >
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
