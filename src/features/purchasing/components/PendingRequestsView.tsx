import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter, type RecordExportDefinition } from '@/features/organization';
import { TabbedTable } from '@/shared/table';

import { pcRowsF } from '../domain/pcMatchRow';
import { purchaseRequestRows } from '../data/purchasing.mock';
import { purchaseRequestColumns } from './purchasingColumns';
import { purchasingPaginationLabels } from './purchasingPagination';
import { PurchasingSectionHeading } from './PurchasingSectionHeading';

/** @prototype index.html:L10214-L10215 `reqSub === 'pending'` */
export function PendingRequestsView() {
  const { t } = useTranslation('purchasing');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const rows = pcRowsF(purchaseRequestRows, filter);
  const exportDefinition: RecordExportDefinition = {
    columns: ['PC #', 'Request', 'Vendor', 'Department', 'Value (KWD)', 'Submitted', 'Status'],
    label: t('pending.title'),
    rows: rows.map((row) => [row.id, row.title, row.vendor, row.dept, row.value, row.submitted, row.status]),
  };

  return (
    <>
      <PurchasingSectionHeading subtitle={t('pending.subtitle')} title={t('pending.title')} />
      <RecordFilter exportDefinition={exportDefinition} kind="request" onChange={setFilter} value={filter} />
      <TabbedTable
        columns={purchaseRequestColumns}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        paginationLabels={purchasingPaginationLabels(t, rows.length)}
        rows={rows}
        tabs={[
          { count: purchaseRequestRows.length, id: 'pending', label: 'Pending' },
          { count: 42, id: 'all', label: 'All' },
        ]}
      />
    </>
  );
}
