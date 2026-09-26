import { useTranslation } from 'react-i18next';

import type { HistoryRow } from '../types/history.types';
import { TabbedTable, type TableColumn } from '@/shared/table';
import { Chip } from '@/shared/ui/chip/Chip';

type HistoryTableProps = Readonly<{
  rows: readonly HistoryRow[];
  scopeLabel: string;
}>;

/** @prototype index.html:L9749-L9779 HistoryScreen */
export function HistoryTable({ rows, scopeLabel }: HistoryTableProps) {
  const { t } = useTranslation('history');
  const columns: readonly TableColumn<HistoryRow>[] = [
    { key: 'date', label: t('columns.date'), muted: true },
    {
      key: 'ref',
      label: t('columns.reference'),
      render: (row) => <span className="num">{row.ref}</span>,
    },
    {
      key: 'action',
      label: t('columns.action'),
      render: (row) => (
        <Chip
          className="px-[9px] py-0.5 text-xs"
          tone={row.tone || 'neutral'}
        >
          {t(`actions.${row.action}`)}
        </Chip>
      ),
    },
    { key: 'by', label: t('columns.by'), muted: true },
    {
      key: 'note',
      label: t('columns.note'),
      render: (row) => `${t(`actions.${row.action}`)} · ${scopeLabel}`,
      wrap: true,
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
      tabs={[{ id: 'all', count: rows.length, label: t('tabs.all') }]}
    />
  );
}
