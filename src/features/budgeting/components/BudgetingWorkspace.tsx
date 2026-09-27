import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BalanceReport } from './BalanceReport';
import { BudgetRequestTable } from './BudgetRequestTable';
import type {
  BudgetRequest,
  BudgetSubView,
  DepartmentBalance,
} from '../types/budgeting.types';
import {
  createEmptyRecordFilter,
  RecordFilter,
  type RecordExportDefinition,
} from '@/features/organization';
import type { BarChartDatum } from '@/shared/ui/charts/BarChart';

type BudgetingWorkspaceProps = Readonly<{
  balanceChart: readonly BarChartDatum[];
  balanceRows: readonly DepartmentBalance[];
  requestRows: readonly BudgetRequest[];
}>;

const subViews = [
  'balanceReport',
  'ceoPay',
  'preApproved',
  'onHold',
  'rejected',
  'history',
] as const satisfies readonly BudgetSubView[];

const subViewLabelKeys = {
  balanceReport: 'subViews.balanceReport',
  ceoPay: 'subViews.ceoPay',
  history: 'subViews.history',
  onHold: 'subViews.onHold',
  preApproved: 'subViews.preApproved',
  rejected: 'subViews.rejected',
} as const satisfies Record<BudgetSubView, string>;

export function BudgetingWorkspace({
  balanceChart,
  balanceRows,
  requestRows,
}: BudgetingWorkspaceProps) {
  const { t } = useTranslation('budgeting');
  const [subView, setSubView] = useState<BudgetSubView>('balanceReport');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const exportDefinition: RecordExportDefinition = {
    columns: [
      t('columns.id'),
      t('columns.title'),
      t('columns.department'),
      t('columns.period'),
      t('columns.projected'),
      t('columns.requested'),
      t('columns.status'),
    ],
    label: t('title'),
    rows: requestRows.map((row) => [
      row.id,
      row.title,
      row.dept,
      row.period,
      row.projected,
      row.requested,
      row.status,
    ]),
  };

  return (
    <>
      <div className="mb-[18px]">
        <div
          aria-label={t('subViews.ariaLabel')}
          className="inline-flex flex-wrap gap-0.5 rounded-lg bg-inset p-0.5"
          role="tablist"
        >
          {subViews.map((item) => {
            const active = subView === item;
            return (
              <button
                aria-selected={active}
                className="rounded-compact px-[13px] py-1.5 text-base font-medium whitespace-nowrap text-fg-2 data-[active=true]:bg-surface data-[active=true]:font-semibold data-[active=true]:text-accent data-[active=true]:shadow-segment"
                data-active={active}
                key={item}
                onClick={() => {
                  setSubView(item);
                }}
                role="tab"
                type="button"
              >
                {t(subViewLabelKeys[item])}
              </button>
            );
          })}
        </div>
      </div>
      {subView === 'balanceReport' ? (
        <BalanceReport chart={balanceChart} rows={balanceRows} />
      ) : (
        <>
          {/* PROTOTYPE-NOOP(D2): filters update their visible state but never filter these fixed rows. */}
          <RecordFilter
            exportDefinition={exportDefinition}
            kind="budget"
            onChange={setFilter}
            value={filter}
          />
          <BudgetRequestTable rows={requestRows} subView={subView} />
        </>
      )}
    </>
  );
}
