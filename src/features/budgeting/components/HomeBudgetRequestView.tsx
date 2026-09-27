import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter, type RecordExportDefinition } from '@/features/organization';

import { budgetRequests } from '../data/budgeting.mock';
import { BudgetRequestTable } from './BudgetRequestTable';

export function HomeBudgetRequestView() {
  const { t } = useTranslation('budgeting');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const exportDefinition: RecordExportDefinition = {
    columns: [t('columns.id'), t('columns.title'), t('columns.department'), t('columns.period'), t('columns.projected'), t('columns.requested'), t('columns.status')],
    label: t('home.title'),
    rows: budgetRequests.map((row) => [row.id, row.title, row.dept, row.period, row.projected, row.requested, row.status]),
  };

  // PROTOTYPE-NOOP(D2): both named sections fall through to the same fixed four-row table;
  // visible filter state and the table pagination never change the rows.
  return (
    <>
      <RecordFilter exportDefinition={exportDefinition} kind="budget" onChange={setFilter} value={filter} />
      <BudgetRequestTable
        rows={budgetRequests}
        tabs={[{ count: 4, id: 'pending', label: t('home.requestTabs.pending') }, { count: 28, id: 'all', label: t('tableTabs.all') }]}
      />
    </>
  );
}
