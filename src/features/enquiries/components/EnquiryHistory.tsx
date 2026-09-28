import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ENQUIRY_HISTORY_ROWS } from '../data/enquiries.mock';
import type { EnquiryHistoryRow } from '../types/enquiries.types';
import { createEmptyRecordFilter, RecordFilter } from '@/features/organization';
import { TabbedTable, type TableColumn } from '@/shared/table/TabbedTable';
import { Chip } from '@/shared/ui/chip/Chip';

const columns = [
  { key: 'id', label: 'Ref #' },
  { key: 'title', label: 'Subject', wrap: true },
  { key: 'raised', label: 'Raised by', muted: true },
  { key: 'site', label: 'Site', muted: true },
  { key: 'date', label: 'Date', muted: true },
  {
    key: 'priority',
    label: 'Priority',
    render: (row: EnquiryHistoryRow) => (
      <Chip tone={row.priorityTone}>{row.priority}</Chip>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (row: EnquiryHistoryRow) => (
      <Chip tone={row.statusTone}>{row.status}</Chip>
    ),
  },
] as const satisfies readonly TableColumn<EnquiryHistoryRow>[];

/** @prototype ihub/index.html:L7466-L7485 Enquiry History fallback branch. */
export function EnquiryHistory() {
  const { t } = useTranslation('enquiries');
  const [filter, setFilter] = useState(createEmptyRecordFilter);

  return (
    <div className="flex flex-col gap-5" data-testid="enquiry-history">
      {/* PROTOTYPE-NOOP(D2): visible filter state does not narrow the fixed rows. */}
      <RecordFilter kind="enquiry" onChange={setFilter} value={filter} />
      {/* PROTOTYPE-NOOP(D2): literal tabs and pagination never alter the four rows. */}
      <TabbedTable
        columns={columns}
        emptyDescription={t('history.emptyDescription')}
        emptyTitle={t('history.emptyTitle')}
        paginationLabels={{
          next: t('history.pagination.next'),
          page: t('history.pagination.page'),
          previous: t('history.pagination.previous'),
          summary: t('history.pagination.summary'),
        }}
        rows={ENQUIRY_HISTORY_ROWS}
        tabs={[
          { count: 12, id: 'open', label: 'Open' },
          { count: 47, id: 'closed', label: 'Closed' },
        ]}
      />
    </div>
  );
}
