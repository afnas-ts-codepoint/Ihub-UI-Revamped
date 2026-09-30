import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter } from '@/features/organization';
import { TabbedTable } from '@/shared/table';

import { actionSheetRowsF } from '../domain/actionSheetMatchRow';
import { actionSheetMissingRows } from '../data/actionSheet.mock';
import { actionSheetColumnLabels, actionSheetMissingColumns } from './actionSheetColumns';
import { paymentSettlementPaginationLabels } from './paymentSettlementPagination';
import { PaymentSettlementSectionHeading } from './PaymentSettlementSectionHeading';

/** @prototype index.html:L17291 `sub === 'missing'` */
export function ActionSheetMissingDocumentsView() {
  const { t } = useTranslation('paymentSettlement');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const rows = actionSheetRowsF(actionSheetMissingRows, filter);
  const columns = actionSheetMissingColumns(actionSheetColumnLabels(t));

  return (
    <>
      <PaymentSettlementSectionHeading subtitle={t('actionSheet.missing.subtitle')} title={t('actionSheet.missing.title')} />
      <RecordFilter kind="sheet" onChange={setFilter} value={filter} />
      <TabbedTable
        columns={columns}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        paginationLabels={paymentSettlementPaginationLabels(t, rows.length)}
        rows={rows}
        tabs={[{ count: actionSheetMissingRows.length, id: 'all', label: t('allTab') }]}
      />
    </>
  );
}
