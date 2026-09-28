import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { WORK_CENTRE_FALLBACK_ROWS } from '../data/work-centre.mock';
import type { WorkCentreRow } from '../types/work-centre.types';
import {
  createEmptyRecordFilter,
  RecordFilter,
  type RecordFilterKind,
} from '@/features/organization';
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
    render: (row: WorkCentreRow) => <Chip tone={row.priorityTone}>{row.priority}</Chip>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (row: WorkCentreRow) => <Chip tone={row.statusTone}>{row.status}</Chip>,
  },
] as const satisfies readonly TableColumn<WorkCentreRow>[];

/** @prototype ihub/index.html:L7466-L7485 fallback branch. */
export function WorkCentreFallback({ kind = 'enquiry' }: Readonly<{ kind?: RecordFilterKind }>) {
  const { t } = useTranslation('workCentre');
  const [filter, setFilter] = useState(createEmptyRecordFilter);

  return (
    <div className="flex flex-col gap-5" data-testid="work-centre-fallback">
      {/* PROTOTYPE-NOOP(D2): filter state is visible but never narrows the fixed rows. */}
      <RecordFilter kind={kind} onChange={setFilter} value={filter} />
      {/* PROTOTYPE-NOOP(D2): tabs and pagination change styling only; rows stay fixed. */}
      <TabbedTable
        columns={columns}
        emptyDescription={t('fallback.emptyDescription')}
        emptyTitle={t('fallback.emptyTitle')}
        paginationLabels={{
          next: t('fallback.pagination.next'),
          page: t('fallback.pagination.page'),
          previous: t('fallback.pagination.previous'),
          summary: t('fallback.pagination.summary'),
        }}
        rows={WORK_CENTRE_FALLBACK_ROWS}
        tabs={[
          { count: 12, id: 'open', label: 'Open' },
          { count: 47, id: 'closed', label: 'Closed' },
        ]}
      />
    </div>
  );
}
