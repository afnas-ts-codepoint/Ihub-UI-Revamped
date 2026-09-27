import { useTranslation } from 'react-i18next';

import type { BudgetRequest, BudgetSubView } from '../types/budgeting.types';
import { Chip } from '@/shared/ui/chip/Chip';
import { TabbedTable, type TableColumn } from '@/shared/table';

type TableTab = Readonly<{ count: number; id: string; label: string }>;

const toneByRequestStatus: Record<
  BudgetRequest['tone'],
  'bad' | 'ok' | 'warn'
> = {
  bad: 'bad',
  ok: 'ok',
  warn: 'warn',
};

function useTabs(
  subView: Exclude<BudgetSubView, 'balanceReport'>,
): readonly TableTab[] {
  const { t } = useTranslation('budgeting');
  const tabs: Record<
    Exclude<BudgetSubView, 'balanceReport'>,
    readonly TableTab[]
  > = {
    ceoPay: [
      { count: 3, id: 'pending', label: t('tableTabs.pendingCeo') },
      { count: 19, id: 'all', label: t('tableTabs.all') },
    ],
    history: [{ count: 60, id: 'all', label: t('tableTabs.recordListing') }],
    onHold: [{ count: 3, id: 'all', label: t('tableTabs.onHold') }],
    preApproved: [{ count: 8, id: 'all', label: t('tableTabs.preApproved') }],
    rejected: [{ count: 2, id: 'all', label: t('tableTabs.rejected') }],
  };
  return tabs[subView];
}

type BudgetRequestTableProps = Readonly<{
  rows: readonly BudgetRequest[];
  subView?: Exclude<BudgetSubView, 'balanceReport'>;
  tabs?: readonly TableTab[];
}>;

export function BudgetRequestTable({ rows, subView = 'ceoPay', tabs: tabOverride }: BudgetRequestTableProps) {
  const { t } = useTranslation('budgeting');
  const tabs = useTabs(subView);
  const columns: readonly TableColumn<BudgetRequest>[] = [
    { key: 'id', label: t('columns.id') },
    { key: 'title', label: t('columns.title'), wrap: true },
    { key: 'dept', label: t('columns.department'), muted: true },
    { key: 'period', label: t('columns.period'), muted: true },
    {
      align: 'end',
      key: 'projected',
      label: t('columns.projected'),
      render: (row) => <span className="num">{row.projected}</span>,
    },
    {
      align: 'end',
      key: 'requested',
      label: t('columns.requested'),
      render: (row) => (
        <span className="num font-semibold">{row.requested}</span>
      ),
    },
    {
      key: 'status',
      label: t('columns.status'),
      render: (row) => (
        <Chip
          className="px-[9px] py-0.5 text-xs"
          tone={toneByRequestStatus[row.tone]}
        >
          {row.status}
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
      tabs={tabOverride ?? tabs}
    />
  );
}
