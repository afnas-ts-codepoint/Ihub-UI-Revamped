import { Eye, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { overtimeStatusKeys, overtimeStatusTones } from '../domain/status';
import type { OvertimeRecord, OvertimeTab } from '../types/overtime.types';
import { Chip } from '@/shared/ui/chip/Chip';
import { TabbedTable, type TableColumn } from '@/shared/table';

type OvertimeTableProps = Readonly<{
  rows: readonly OvertimeRecord[];
  tabs: readonly OvertimeTab[];
}>;

/** @prototype index.html:L8285-L8462 */
export function OvertimeTable({ rows, tabs }: OvertimeTableProps) {
  const { t } = useTranslation('hr');
  const columns: readonly TableColumn<OvertimeRecord>[] = [
    { key: 'id', label: t('columns.id') },
    { key: 'employee', label: t('columns.employee') },
    { key: 'dept', label: t('columns.department'), muted: true },
    { key: 'date', label: t('columns.date'), muted: true },
    {
      key: 'hours',
      label: t('columns.hours'),
      align: 'end',
      render: (row) => (
        <span className="num font-semibold">{row.hours}</span>
      ),
    },
    {
      key: 'amount',
      label: t('columns.amount'),
      align: 'end',
      render: (row) => <span className="num">{row.amount}</span>,
    },
    {
      key: 'status',
      label: t('columns.status'),
      render: (row) => (
        <Chip
          className="px-[9px] py-0.5 text-xs"
          tone={overtimeStatusTones[row.status]}
        >
          {t(`status.${overtimeStatusKeys[row.status]}`)}
        </Chip>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'end',
      render: () => (
        <div className="flex justify-end gap-1">
          <button
            aria-label={t('actions.view')}
            className="rounded-lg p-[5px] text-fg-3 hover:bg-inset"
            type="button"
          >
            <Eye size={14} />
          </button>
          <button
            aria-label={t('actions.edit')}
            className="rounded-lg p-[5px] text-fg-3 hover:bg-inset"
            type="button"
          >
            <Pencil size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <TabbedTable
      columns={columns}
      emptyDescription={t('empty.description')}
      emptyTitle={t('empty.title')}
      paginationLabels={{
        next: t('pagination.next'),
        page: t('pagination.page'),
        previous: t('pagination.previous'),
        summary: t('pagination.summary', {
          shown: rows.length,
          total: rows.length,
        }),
      }}
      rows={rows}
      tabs={tabs.map((tab) => ({
        id: tab.id,
        count: tab.displayCount,
        label: t(`tabs.${tab.id}`),
      }))}
    />
  );
}
