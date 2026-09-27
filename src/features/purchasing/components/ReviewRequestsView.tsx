import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter, type RecordExportDefinition } from '@/features/organization';
import { TabbedTable, type TableColumn } from '@/shared/table';
import { Chip } from '@/shared/ui/chip/Chip';

import { pcRowsF } from '../domain/pcMatchRow';
import { purchaseRequestRows, reviewExtraById } from '../data/purchasing.mock';
import type { PurchaseRequestRow } from '../types/purchasing.types';
import { rowActionButtonClass } from './purchasingButtonStyles';
import { purchasingPaginationLabels } from './purchasingPagination';
import { PurchasingSectionHeading } from './PurchasingSectionHeading';
import { ReviewDialog } from './ReviewDialog';

/**
 * Human-decided reconciliation (2026-09-27, `DECISIONS.md`): the plan's single
 * `review` segment is implemented using the prototype's second, functional
 * `reviewBody`/`revModal` (index.html:L10318-L10323, L10254-L10317), not the
 * inert `reqSubDef` "review" pill body (L10218-L10219, `reviewCols`). The
 * segment pill keeps the literal `Review PC Request` label; this view's own
 * `SectionHead` title/sub are the separate, also-literal `reviewBody` strings.
 * @prototype index.html:L10318-L10323 `reviewBody`
 */
export function ReviewRequestsView() {
  const { t } = useTranslation('purchasing');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rows = pcRowsF(purchaseRequestRows, filter);
  const pendingCount = purchaseRequestRows.filter((row) => row.tone === 'warn').length;

  const columns: readonly TableColumn<PurchaseRequestRow>[] = [
    { key: 'id', label: t('review.columns.id'), render: (row) => <span className="num font-semibold">{row.id}</span> },
    { key: 'title', label: t('review.columns.title'), wrap: true },
    { key: 'dept', label: t('review.columns.department'), muted: true },
    { key: 'vendor', label: t('review.columns.vendor'), muted: true },
    {
      align: 'end', key: 'quotes', label: t('review.columns.quotes'), muted: true,
      render: (row) => <span className="num">{reviewExtraById[row.id]?.quotes ?? 0}</span>,
    },
    {
      align: 'end', key: 'value', label: t('review.columns.value'),
      render: (row) => <span className="num font-semibold">{row.value}</span>,
    },
    { key: 'submitted', label: t('review.columns.submitted'), muted: true },
    { key: 'status', label: t('review.columns.status'), render: (row) => <Chip tone={row.tone}>{row.status}</Chip> },
    {
      align: 'end', key: 'act', label: '',
      render: (row) => (
        <button className={rowActionButtonClass} onClick={() => { setSelectedId(row.id); }} type="button">
          <Search aria-hidden="true" size={13} />
          {t('review.action')}
        </button>
      ),
    },
  ];

  const exportDefinition: RecordExportDefinition = {
    columns: ['PC #', 'Request', 'Department', 'Vendor', 'Quotes', 'Value (KWD)', 'Submitted', 'Status'],
    label: t('review.title'),
    rows: rows.map((row) => [row.id, row.title, row.dept, row.vendor, String(reviewExtraById[row.id]?.quotes ?? 0), row.value, row.submitted, row.status]),
  };

  const selectedRow = purchaseRequestRows.find((row) => row.id === selectedId) ?? null;
  const selectedExtra = selectedRow ? (reviewExtraById[selectedRow.id] ?? { activity: '', budgetValue: '', budgeted: '', docs: [], high: '—', just: '—', locType: '', location: '', low: '—', quotes: 0, remarks: '', subActivity: '', suppliers: [], year: '', zone: '' }) : null;

  return (
    <>
      <PurchasingSectionHeading subtitle={t('review.subtitle')} title={t('review.title')} />
      <RecordFilter exportDefinition={exportDefinition} kind="request" onChange={setFilter} value={filter} />
      <TabbedTable
        columns={columns}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        paginationLabels={purchasingPaginationLabels(t, rows.length)}
        rows={rows}
        tabs={[
          { count: pendingCount, id: 'pending', label: t('review.tabs.pending') },
          { count: purchaseRequestRows.length, id: 'all', label: t('review.tabs.all') },
        ]}
      />
      {selectedRow && selectedExtra ? (
        <ReviewDialog extra={selectedExtra} onClose={() => { setSelectedId(null); }} row={selectedRow} />
      ) : null}
    </>
  );
}
