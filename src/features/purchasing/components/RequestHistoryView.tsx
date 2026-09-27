import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter, type RecordExportDefinition } from '@/features/organization';
import { TabbedTable } from '@/shared/table';

import { pcRowsF } from '../domain/pcMatchRow';
import { purchaseHistoryRows } from '../data/purchasing.mock';
import { purchaseHistoryColumns } from './purchasingColumns';
import { purchasingPaginationLabels } from './purchasingPagination';
import { PurchasingSectionHeading } from './PurchasingSectionHeading';

/** @prototype index.html:L10222-L10223 `reqSub === 'history'` */
export function RequestHistoryView() {
  const { t } = useTranslation('purchasing');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const rows = pcRowsF(purchaseHistoryRows, filter);
  const exportDefinition: RecordExportDefinition = {
    columns: ['Date', 'PC #', 'Action', 'By', 'Note'],
    label: t('history.title'),
    rows: rows.map((row) => [row.date, row.id, row.action, row.by, row.note]),
  };

  return (
    <>
      <PurchasingSectionHeading subtitle={t('history.subtitle')} title={t('history.title')} />
      <RecordFilter exportDefinition={exportDefinition} kind="history" onChange={setFilter} value={filter} />
      <TabbedTable
        columns={purchaseHistoryColumns}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        paginationLabels={purchasingPaginationLabels(t, rows.length)}
        rows={rows}
        tabs={[{ count: purchaseHistoryRows.length, id: 'all', label: 'All' }]}
      />
    </>
  );
}
