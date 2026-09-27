import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter, type RecordExportDefinition } from '@/features/organization';
import { TabbedTable } from '@/shared/table';

import { pcRowsF } from '../domain/pcMatchRow';
import { purchaseRequestRows } from '../data/purchasing.mock';
import { purchaseRequestColumns } from './purchasingColumns';
import { purchasingPaginationLabels } from './purchasingPagination';

/**
 * The fall-through `else` branch of `reqInner` — no `SectionHead`, just the
 * filter bar and a To Do / Record Listing table.
 * @prototype index.html:L10226-L10229
 */
export function TodoRequestsView() {
  const { t } = useTranslation('purchasing');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const rows = pcRowsF(purchaseRequestRows, filter);
  const exportDefinition: RecordExportDefinition = {
    columns: ['PC #', 'Request', 'Vendor', 'Department', 'Value (KWD)', 'Submitted', 'Status'],
    label: t('home.sections.todo'),
    rows: rows.map((row) => [row.id, row.title, row.vendor, row.dept, row.value, row.submitted, row.status]),
  };

  return (
    <>
      <RecordFilter exportDefinition={exportDefinition} kind="request" onChange={setFilter} value={filter} />
      <TabbedTable
        columns={purchaseRequestColumns}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        paginationLabels={purchasingPaginationLabels(t, rows.length)}
        rows={rows}
        tabs={[
          { count: 2, id: 'todo', label: 'To Do' },
          { count: 88, id: 'records', label: 'Record Listing' },
        ]}
      />
    </>
  );
}
