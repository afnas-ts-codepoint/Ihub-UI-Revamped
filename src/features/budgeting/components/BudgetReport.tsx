import { useTranslation } from 'react-i18next';

import { projectedRevenueChart, projectedRevenueRows } from '../data/home-budgeting.mock';
import { BarChart } from '@/shared/ui/charts/BarChart';
import { Chip } from '@/shared/ui/chip/Chip';
import { TabbedTable, type TableColumn } from '@/shared/table';

import { BudgetSectionHeading } from './BudgetSectionHeading';
import { BudgetStatRow } from './BudgetStatRow';

type RevenueRow = (typeof projectedRevenueRows)[number];

export function BudgetReport() {
  const { t } = useTranslation('budgeting');
  const columns: readonly TableColumn<RevenueRow>[] = [
    { key: 'dept', label: t('columns.department'), muted: true },
    { align: 'end', key: 'projected', label: t('home.report.columns.projected') },
    { align: 'end', key: 'actual', label: t('home.report.columns.actual') },
    {
      align: 'end', key: 'variance', label: t('home.report.columns.variance'),
      render: (row) => <span className="num font-semibold text-ok">{row.variance}</span>,
    },
    { align: 'end', key: 'attainment', label: t('home.report.columns.attainment') },
    {
      key: 'status', label: t('columns.status'),
      render: (row) => <Chip tone={row.tone === 'warn' ? 'warn' : 'ok'}>{row.status}</Chip>,
    },
  ];

  return (
    <>
      <div className="mb-[18px] flex gap-1 overflow-x-auto border-b border-line">
        <button className="-mb-px border-b-2 border-accent px-3.5 py-3 text-base font-semibold whitespace-nowrap text-fg" type="button">
          {t('home.report.projectingRevenue')}
        </button>
      </div>
      <BudgetStatRow stats={[
        { label: t('home.report.stats.projected'), sub: '+8.4%', value: 'KWD 11.2M' },
        { label: t('home.report.stats.actual'), sub: '65%', value: 'KWD 7.3M' },
        { label: t('home.report.stats.remaining'), tone: 'ok', value: 'KWD 3.9M' },
        { label: t('home.report.stats.variance'), tone: 'ok', value: '+2.1%' },
      ]} />
      <div className="mb-4 rounded-xl border border-line bg-surface p-[26px]">
        <BudgetSectionHeading subtitle={t('home.report.chart.subtitle')} title={t('home.report.chart.title')} />
        <BarChart ariaLabel={t('home.report.chart.ariaLabel')} data={projectedRevenueChart} height={140} />
      </div>
      <TabbedTable
        columns={columns}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        paginationLabels={{ next: t('pagination.next'), page: t('pagination.page'), previous: t('pagination.previous'), summary: t('pagination.summary', { shown: 7, total: 7 }) }}
        rows={projectedRevenueRows}
        tabs={[{ count: 7, id: 'all', label: t('balance.byDepartment') }]}
      />
    </>
  );
}
