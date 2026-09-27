import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter, type RecordExportDefinition } from '@/features/organization';
import { TabbedTable } from '@/shared/table';

import { pcRowsF } from '../domain/pcMatchRow';
import { missingDocumentRows } from '../data/purchasing.mock';
import { missingDocumentColumns } from './purchasingColumns';
import { purchasingPaginationLabels } from './purchasingPagination';
import { PurchasingSectionHeading } from './PurchasingSectionHeading';

/** @prototype index.html:L10220-L10221 `reqSub === 'missing'` */
export function MissingDocumentsView() {
  const { t } = useTranslation('purchasing');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const rows = pcRowsF(missingDocumentRows, filter);
  const exportDefinition: RecordExportDefinition = {
    columns: ['PC #', 'Request', 'Missing', 'Vendor', 'Days pending'],
    label: t('missing.title'),
    rows: rows.map((row) => [row.id, row.title, row.missing.join(', '), row.vendor, row.days]),
  };

  return (
    <>
      <PurchasingSectionHeading subtitle={t('missing.subtitle')} title={t('missing.title')} />
      <RecordFilter exportDefinition={exportDefinition} kind="request" onChange={setFilter} value={filter} />
      <TabbedTable
        columns={missingDocumentColumns}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        paginationLabels={purchasingPaginationLabels(t, rows.length)}
        rows={rows}
        tabs={[{ count: missingDocumentRows.length, id: 'all', label: 'All' }]}
      />
    </>
  );
}
