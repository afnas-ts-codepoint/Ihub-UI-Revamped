import { useTranslation } from 'react-i18next';

import { checklistStatusKeys, checklistStatusTones } from '../domain/status';
import type { ChecklistRecord, ChecklistTab } from '../types/checklist.types';
import { TabbedTable, type TableColumn } from '@/shared/table';
import { Chip } from '@/shared/ui/chip/Chip';

type ChecklistTableProps = Readonly<{
  rows: readonly ChecklistRecord[];
  tabs: readonly ChecklistTab[];
}>;

/** @prototype index.html:L8570-L8660 ChecklistScreen */
export function ChecklistTable({ rows, tabs }: ChecklistTableProps) {
  const { t } = useTranslation('checklists');
  const columns: readonly TableColumn<ChecklistRecord>[] = [
    { key: 'id', label: t('columns.id') },
    { key: 'title', label: t('columns.title') },
    { key: 'site', label: t('columns.site'), muted: true },
    { key: 'submitted', label: t('columns.submitted'), muted: true },
    { key: 'by', label: t('columns.by'), muted: true },
    {
      key: 'progress',
      label: t('columns.progress'),
      align: 'end',
      render: (row) => <span className="num">{row.progress}</span>,
    },
    {
      key: 'status',
      label: t('columns.status'),
      render: (row) => (
        <Chip
          className="px-[9px] py-0.5 text-xs"
          tone={checklistStatusTones[row.status]}
        >
          {t(`status.${checklistStatusKeys[row.status]}`)}
        </Chip>
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
