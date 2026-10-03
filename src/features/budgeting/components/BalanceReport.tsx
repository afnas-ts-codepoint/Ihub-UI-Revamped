import { useTranslation } from 'react-i18next';

import { BudgetSectionHeading } from './BudgetSectionHeading';
import { BudgetStatRow } from './BudgetStatRow';
import type { DepartmentBalance } from '../types/budgeting.types';
import { Chip } from '@/shared/ui/chip/Chip';
import type { BarChartDatum } from '@/shared/ui/charts/BarChart';
import { LazyBarChart } from '@/shared/ui/charts/LazyBarChart';
import { TabbedTable, type TableColumn } from '@/shared/table';

const toneByBalanceStatus: Record<
  DepartmentBalance['tone'],
  'bad' | 'ok' | 'warn'
> = {
  bad: 'bad',
  ok: 'ok',
  warn: 'warn',
};

type BalanceReportProps = Readonly<{
  chart: readonly BarChartDatum[];
  rows: readonly DepartmentBalance[];
}>;

export function BalanceReport({ chart, rows }: BalanceReportProps) {
  const { t } = useTranslation('budgeting');
  const columns: readonly TableColumn<DepartmentBalance>[] = [
    { key: 'dept', label: t('columns.department'), muted: true },
    {
      align: 'end',
      key: 'budget',
      label: t('columns.budget'),
      render: (row) => <span className="num font-semibold">{row.budget}</span>,
    },
    {
      align: 'end',
      key: 'committed',
      label: t('columns.committed'),
      render: (row) => <span className="num">{row.committed}</span>,
    },
    {
      align: 'end',
      key: 'balance',
      label: t('columns.balance'),
      render: (row) => (
        <span
          className={`num font-semibold ${row.tone === 'bad' ? 'text-bad' : 'text-ok'}`}
        >
          {row.balance}
        </span>
      ),
    },
    {
      align: 'end',
      key: 'utilised',
      label: t('columns.utilised'),
      render: (row) => <span className="num">{row.utilised}</span>,
    },
    {
      key: 'status',
      label: t('columns.status'),
      render: (row) => (
        <Chip
          className="px-[9px] py-0.5 text-xs"
          tone={toneByBalanceStatus[row.tone]}
        >
          {row.status}
        </Chip>
      ),
    },
  ];

  return (
    <>
      <BudgetStatRow
        stats={[
          { label: t('balance.stats.total'), value: 'KWD 8.4M' },
          { label: t('balance.stats.committed'), value: 'KWD 6.5M' },
          {
            label: t('balance.stats.available'),
            tone: 'ok',
            value: 'KWD 1.9M',
          },
          {
            label: t('balance.stats.overspent'),
            tone: 'bad',
            value: '1',
          },
        ]}
      />
      <div className="mt-4 rounded-xl border border-line bg-surface p-[26px]">
        <BudgetSectionHeading
          subtitle={t('balance.chart.subtitle')}
          title={t('balance.chart.title')}
        />
        <LazyBarChart ariaLabel={t('balance.chart.ariaLabel')} data={chart} />
      </div>
      <div className="mt-4">
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
          tabs={[
            {
              count: 7,
              id: 'all',
              label: t('balance.byDepartment'),
            },
          ]}
        />
      </div>
    </>
  );
}
