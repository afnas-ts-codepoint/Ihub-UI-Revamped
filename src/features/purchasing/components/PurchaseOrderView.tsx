import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter, type RecordExportDefinition } from '@/features/organization';
import { TabbedTable } from '@/shared/table';

import { pcRowsF } from '../domain/pcMatchRow';
import { purchaseOrderHistoryRows, purchaseOrderRows, purchaseRequestRows } from '../data/purchasing.mock';
import type { PoAttachSeed, PurchaseOrderRow } from '../types/purchasing.types';
import { PoAttachDialog } from './PoAttachDialog';
import { purchaseOrderColumns, purchaseOrderHistoryColumns } from './purchasingColumns';
import { segmentedOptionClass } from './purchasingButtonStyles';
import { purchasingPaginationLabels } from './purchasingPagination';
import { PurchasingSectionHeading } from './PurchasingSectionHeading';

type PoSegment = 'history' | 'report' | 'todo';

const segmentIds: readonly PoSegment[] = ['todo', 'history', 'report'];
const segmentLabelKeys = {
  history: 'po.segments.history',
  report: 'po.segments.report',
  todo: 'po.segments.todo',
} as const satisfies Record<PoSegment, string>;

/**
 * `poSub` (index.html:L10109) is local component state in the prototype, not
 * a routed value — its 3-way `poSegBar` switch (L10342-L10350) is reproduced
 * here as an in-page segmented control (mirroring the outer Purchasing nav's
 * own pill styling via `segmentedOptionClass`) rather than as new deep-linked
 * routes, since the prototype never makes `poSub` addressable by URL either.
 * @prototype index.html:L10337-L10401 `poSubDef`/`poSegBar`/`poInner`/`poBody`
 */
export function PurchaseOrderView() {
  const { t } = useTranslation('purchasing');
  const [segment, setSegment] = useState<PoSegment>('todo');
  const [todoFilter, setTodoFilter] = useState(createEmptyRecordFilter);
  const [reportFilter, setReportFilter] = useState(createEmptyRecordFilter);
  const [attachSeed, setAttachSeed] = useState<PoAttachSeed | null>(null);

  const todoRows = pcRowsF(purchaseOrderRows, todoFilter);

  const openAttach = (row: PurchaseOrderRow) => {
    const request = purchaseRequestRows.find((item) => item.id === row.ref);
    setAttachSeed({
      pcDept: request?.dept ?? '',
      pcRef: row.ref,
      pcStatus: request?.status ?? '',
      pcTitle: request?.title ?? '',
      pcValue: request?.value ?? '',
      po: row.id,
      supplier: row.supplier,
    });
  };

  const columns = purchaseOrderColumns(t('po.attach.title'), openAttach);

  const todoExportDefinition: RecordExportDefinition = {
    columns: ['PO #', 'Supplier', 'PC Ref', 'Value (KWD)', 'Issued', 'Status'],
    label: t('home.sections.po'),
    rows: todoRows.map((row) => [row.id, row.supplier, row.ref, row.value, row.issued, row.status]),
  };

  return (
    <>
      <div className="mb-4 flex">
        <div className="inline-flex flex-wrap gap-0.5 rounded-[10px] border border-line bg-raised p-0.5">
          {segmentIds.map((id) => (
            <button
              className={segmentedOptionClass(segment === id)}
              key={id}
              onClick={() => { setSegment(id); }}
              type="button"
            >
              {t(segmentLabelKeys[id])}
            </button>
          ))}
        </div>
      </div>
      {segment === 'history' ? (
        <>
          <PurchasingSectionHeading subtitle={t('po.history.subtitle')} title={t('po.history.title')} />
          {/* No RecordFilter here — the prototype's `poInner` history branch renders none, unlike request history. */}
          <TabbedTable
            columns={purchaseOrderHistoryColumns}
            emptyDescription={t('empty.description')}
            emptyTitle={t('empty.title')}
            paginationLabels={purchasingPaginationLabels(t, purchaseOrderHistoryRows.length)}
            rows={purchaseOrderHistoryRows}
            tabs={[{ count: purchaseOrderHistoryRows.length, id: 'all', label: 'All' }]}
          />
        </>
      ) : segment === 'report' ? (
        <>
          <PurchasingSectionHeading subtitle={t('po.report.subtitle')} title={t('po.report.title')} />
          <RecordFilter kind="request" noExport onChange={setReportFilter} value={reportFilter} />
          {/* Permanent inert placeholder — never renders a real report, matching reqReportBody's precedent. */}
          <div className="rounded-xl border border-dashed border-line-strong bg-canvas p-[60px] text-center text-sm text-fg-3">
            {t('report.placeholder')}
          </div>
        </>
      ) : (
        <>
          <RecordFilter exportDefinition={todoExportDefinition} kind="request" onChange={setTodoFilter} value={todoFilter} />
          <TabbedTable
            columns={columns}
            emptyDescription={t('empty.description')}
            emptyTitle={t('empty.title')}
            paginationLabels={purchasingPaginationLabels(t, todoRows.length)}
            rows={todoRows}
            tabs={[{ count: 3, id: 'open', label: 'Open' }, { count: 142, id: 'all', label: 'All' }]}
          />
        </>
      )}
      {attachSeed ? <PoAttachDialog key={`${attachSeed.po}-${attachSeed.pcRef}`} onClose={() => { setAttachSeed(null); }} seed={attachSeed} /> : null}
    </>
  );
}
