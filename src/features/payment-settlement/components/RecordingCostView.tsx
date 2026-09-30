import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter } from '@/features/organization';
import { TabbedTable } from '@/shared/table';

import { actionSheetRowsF } from '../domain/actionSheetMatchRow';
import { actionSheetCostRows } from '../data/actionSheet.mock';
import { actionSheetColumnLabels, actionSheetCostColumns } from './actionSheetColumns';
import { paymentSettlementPaginationLabels } from './paymentSettlementPagination';
import { PaymentSettlementSectionHeading } from './PaymentSettlementSectionHeading';

/** @prototype index.html:L17293 `sub === 'cost'` */
export function RecordingCostView() {
  const { t } = useTranslation('paymentSettlement');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const rows = actionSheetRowsF(actionSheetCostRows, filter);
  const columns = actionSheetCostColumns(actionSheetColumnLabels(t));

  return (
    <>
      <PaymentSettlementSectionHeading subtitle={t('actionSheet.cost.subtitle')} title={t('actionSheet.cost.title')} />
      <RecordFilter kind="sheet" onChange={setFilter} value={filter} />
      <TabbedTable
        columns={columns}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        paginationLabels={paymentSettlementPaginationLabels(t, rows.length)}
        rows={rows}
        tabs={[{ count: actionSheetCostRows.length, id: 'all', label: t('allTab') }]}
      />
    </>
  );
}
