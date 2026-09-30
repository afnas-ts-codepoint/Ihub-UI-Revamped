import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter } from '@/features/organization';
import { TabbedTable } from '@/shared/table';

import { actionSheetRowsF } from '../domain/actionSheetMatchRow';
import { actionSheetEditRows } from '../data/actionSheet.mock';
import { actionSheetColumnLabels, actionSheetEditColumns } from './actionSheetColumns';
import { paymentSettlementPaginationLabels } from './paymentSettlementPagination';
import { PaymentSettlementSectionHeading } from './PaymentSettlementSectionHeading';

/**
 * @prototype index.html:L17290 `sub === 'edit'`; L17187 `onClick:()=>setSub('create')`
 * — the row action switches to the Create tab without loading the row into
 * a draft (no prefill exists in the prototype either).
 */
export function EditActionSheetView({ onEditRow }: Readonly<{ onEditRow: () => void }>) {
  const { t } = useTranslation('paymentSettlement');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const rows = actionSheetRowsF(actionSheetEditRows, filter);
  const columns = actionSheetEditColumns(actionSheetColumnLabels(t), t('actionSheet.edit.action'), onEditRow);

  return (
    <>
      <PaymentSettlementSectionHeading subtitle={t('actionSheet.edit.subtitle')} title={t('actionSheet.edit.title')} />
      <RecordFilter kind="sheet" onChange={setFilter} value={filter} />
      <TabbedTable
        columns={columns}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        paginationLabels={paymentSettlementPaginationLabels(t, rows.length)}
        rows={rows}
        tabs={[{ count: actionSheetEditRows.length, id: 'all', label: t('allTab') }]}
      />
    </>
  );
}
