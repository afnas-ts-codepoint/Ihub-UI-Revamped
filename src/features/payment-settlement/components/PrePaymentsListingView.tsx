import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter } from '@/features/organization';
import { TabbedTable } from '@/shared/table';

import { actionSheetRowsF } from '../domain/actionSheetMatchRow';
import { actionSheetPrepayRows } from '../data/actionSheet.mock';
import { actionSheetColumnLabels, actionSheetPrepayColumns } from './actionSheetColumns';
import { paymentSettlementPaginationLabels } from './paymentSettlementPagination';
import { PaymentSettlementSectionHeading } from './PaymentSettlementSectionHeading';

/** @prototype index.html:L17292 `sub === 'prepay'` */
export function PrePaymentsListingView() {
  const { t } = useTranslation('paymentSettlement');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const rows = actionSheetRowsF(actionSheetPrepayRows, filter);
  const columns = actionSheetPrepayColumns(actionSheetColumnLabels(t));

  return (
    <>
      <PaymentSettlementSectionHeading subtitle={t('actionSheet.prepay.subtitle')} title={t('actionSheet.prepay.title')} />
      <RecordFilter kind="sheet" onChange={setFilter} value={filter} />
      <TabbedTable
        columns={columns}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        paginationLabels={paymentSettlementPaginationLabels(t, rows.length)}
        rows={rows}
        tabs={[{ count: actionSheetPrepayRows.length, id: 'all', label: t('allTab') }]}
      />
    </>
  );
}
