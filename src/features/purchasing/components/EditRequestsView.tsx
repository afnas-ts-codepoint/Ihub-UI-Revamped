import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter, type RecordExportDefinition } from '@/features/organization';
import { TabbedTable } from '@/shared/table';

import { pcRowsF } from '../domain/pcMatchRow';
import { purchaseRequestRows } from '../data/purchasing.mock';
import { editRequestColumns } from './purchasingColumns';
import { purchasingPaginationLabels } from './purchasingPagination';
import { PurchasingSectionHeading } from './PurchasingSectionHeading';

/**
 * `PROTOTYPE-NOOP(D2)`: the row Edit action has no prototype handler
 * (`index.html` L10150-L10152, L10153, L10216-L10217) — there is no edit
 * dialog anywhere in `PurchasingScreen`. Rendered as a visible, inert control.
 * @prototype index.html:L10216-L10217 `reqSub === 'edit'`
 */
export function EditRequestsView() {
  const { t } = useTranslation('purchasing');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const rows = pcRowsF(purchaseRequestRows, filter);
  const exportDefinition: RecordExportDefinition = {
    columns: ['PC #', 'Request', 'Vendor', 'Department', 'Value (KWD)', 'Submitted', 'Status'],
    label: t('edit.title'),
    rows: rows.map((row) => [row.id, row.title, row.vendor, row.dept, row.value, row.submitted, row.status]),
  };

  return (
    <>
      <PurchasingSectionHeading subtitle={t('edit.subtitle')} title={t('edit.title')} />
      <RecordFilter exportDefinition={exportDefinition} kind="request" onChange={setFilter} value={filter} />
      <TabbedTable
        columns={editRequestColumns(t('edit.action'))}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        paginationLabels={purchasingPaginationLabels(t, rows.length)}
        rows={rows}
        tabs={[{ count: purchaseRequestRows.length, id: 'open', label: 'Editable' }]}
      />
    </>
  );
}
