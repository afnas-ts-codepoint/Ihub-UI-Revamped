import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import type { TFunction } from 'i18next';

import { createDataTableColumnHelper } from '@/shared/table/dataTable';
import { RowActions } from '@/shared/table/RowActions';
import type { MasterDefinition, MasterRow } from '../domain/types';

const helper = createDataTableColumnHelper<MasterRow>();

type UseMasterColumnsOptions = Readonly<{
  definition: MasterDefinition;
  onDelete: (row: MasterRow) => void;
  onToggleStatus: (code: string) => void;
  t: TFunction<'masters'>;
}>;

/**
 * Builds the tanstack column list for one Master's definition-driven table:
 * a select checkbox, row number, the mode's data columns (status included),
 * and the row-actions cell. Column visibility is state-driven (see
 * `useMasterListing`), not a static column list, so every column is always
 * present here.
 * @prototype index.html:L4592-L4620,L4757-L4766,L4958-L4983 (`allCols`, `rowAction`, header/body rows)
 */
export function useMasterColumns({
  definition,
  onDelete,
  onToggleStatus,
  t,
}: UseMasterColumnsOptions) {
  return useMemo(
    () => [
      helper.display({
        cell: (info) => (
          <input
            aria-label={t('select.label')}
            checked={info.row.getIsSelected()}
            className="size-3.75 cursor-pointer accent-accent"
            onChange={info.row.getToggleSelectedHandler()}
            type="checkbox"
          />
        ),
        enableHiding: false,
        header: ({ table }) => (
          <input
            aria-label={t('select.label')}
            checked={table.getIsAllPageRowsSelected()}
            className="size-3.75 cursor-pointer accent-accent"
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            ref={(element) => {
              if (element) {
                element.indeterminate =
                  !table.getIsAllPageRowsSelected() &&
                  table.getIsSomePageRowsSelected();
              }
            }}
            type="checkbox"
          />
        ),
        id: 'select',
        meta: { cellStyle: { width: 38 }, headerStyle: { width: 38 } },
      }),
      helper.display({
        cell: ({ row }) => (
          <span className="text-fg-3">{row.getDisplayIndex() + 1}</span>
        ),
        enableHiding: false,
        header: '#',
        id: 'rowNumber',
      }),
      ...definition.columns.map((column) =>
        helper.display({
          cell: (info) =>
            column.render(info.row.original, { onToggleStatus, t }),
          header: t(column.labelKey, { defaultValue: column.labelKey }),
          id: column.id,
        }),
      ),
      helper.display({
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                icon: Eye,
                key: 'view',
                label: t('actions.view'),
                onClick: () => undefined,
              },
              {
                icon: Pencil,
                key: 'edit',
                label: t('actions.edit'),
                onClick: () => undefined,
              },
              {
                icon: Trash2,
                key: 'delete',
                label: t('actions.delete'),
                onClick: () => {
                  onDelete(row.original);
                },
                tone: 'danger',
              },
            ]}
          />
        ),
        enableHiding: false,
        header: '',
        id: 'actions',
      }),
    ],
    [definition, onDelete, onToggleStatus, t],
  );
}
