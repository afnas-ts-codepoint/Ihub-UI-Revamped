import type { ReactNode } from 'react';
import { useState } from 'react';

import { Table, TBody, Td, Th, THead, Tr } from './Table';
import { TablePagination } from './TablePagination';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';

export type TableColumn<Row extends object> = Readonly<{
  align?: 'end' | 'start';
  key: keyof Row;
  label: string;
  muted?: boolean;
  render?: (row: Row) => ReactNode;
  wrap?: boolean;
}>;

type TableTab = Readonly<{
  count?: number;
  id: string;
  label: string;
}>;

type TabbedTableProps<Row extends object> = Readonly<{
  columns: readonly TableColumn<Row>[];
  emptyDescription: string;
  emptyTitle: string;
  paginationLabels: Parameters<typeof TablePagination>[0]['labels'];
  rows: readonly Row[];
  tabs: readonly TableTab[];
}>;

/** @prototype index.html:L8070-L8227 */
export function TabbedTable<Row extends object>({
  columns,
  emptyDescription,
  emptyTitle,
  paginationLabels,
  rows,
  tabs,
}: TabbedTableProps<Row>) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div
        className="flex items-center gap-1 overflow-x-auto border-b border-line bg-raised px-3 pt-1"
        role="tablist"
      >
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              aria-label={
                tab.count == null
                  ? tab.label
                  : `${tab.label} ${String(tab.count)}`
              }
              aria-selected={selected}
              className="group -mb-px flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-base font-medium whitespace-nowrap text-fg-3 data-[selected=true]:border-accent data-[selected=true]:font-semibold data-[selected=true]:text-fg"
              data-selected={selected}
              key={tab.id}
              onClick={() => {
                setActive(tab.id);
              }}
              role="tab"
              type="button"
            >
              {tab.label}
              {tab.count == null ? null : (
                <span className="rounded-full bg-canvas px-[7px] py-px text-xs font-semibold text-fg-3 group-data-[selected=true]:bg-accent-dim group-data-[selected=true]:text-accent">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <THead>
            <Tr className="bg-canvas">
              {columns.map((column) => (
                <Th
                  className={`border-b border-line px-4 py-[11px] text-xs font-semibold tracking-[0.06em] whitespace-nowrap text-fg-3 uppercase ${column.align === 'end' ? 'text-end' : 'text-start'}`}
                  key={String(column.key)}
                >
                  {column.label}
                </Th>
              ))}
            </Tr>
          </THead>
          <TBody>
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <Tr
                  className="border-b border-line hover:bg-raised"
                  key={rowIndex}
                >
                  {columns.map((column) => (
                    <Td
                      className={`px-4 py-[13px] ${column.align === 'end' ? 'text-end' : 'text-start'} ${column.muted ? 'text-fg-3' : 'text-fg-2'} ${column.wrap ? 'whitespace-normal' : 'whitespace-nowrap'}`}
                      key={String(column.key)}
                    >
                      {column.render?.(row) ?? String(row[column.key])}
                    </Td>
                  ))}
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={columns.length}>
                  <EmptyState
                    description={emptyDescription}
                    title={emptyTitle}
                  />
                </Td>
              </Tr>
            )}
          </TBody>
        </Table>
      </div>
      <TablePagination labels={paginationLabels} />
    </div>
  );
}
