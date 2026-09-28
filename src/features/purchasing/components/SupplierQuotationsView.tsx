import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter, type RecordExportDefinition } from '@/features/organization';
import { TabbedTable } from '@/shared/table';

import { supplierQuotationHistoryRows, supplierQuotationRows, purchaseRequestRows } from '../data/purchasing.mock';
import { pcRowsF } from '../domain/pcMatchRow';
import type { AddQuotationSeed, SupplierQuotationRow } from '../types/purchasing.types';
import { AddQuotationDialog } from './AddQuotationDialog';
import { segmentedOptionClass } from './purchasingButtonStyles';
import { purchasingPaginationLabels } from './purchasingPagination';
import { PurchasingSectionHeading } from './PurchasingSectionHeading';
import { supplierQuotationColumns, supplierQuotationHistoryColumns } from './purchasingColumns';

type QuotationSegment = 'history' | 'report' | 'todo';
const segmentIds: readonly QuotationSegment[] = ['todo', 'history', 'report'];

/** @prototype index.html:L10403-L10528 quotation branches and builder. */
export function SupplierQuotationsView() {
  const { t } = useTranslation('purchasing');
  const [segment, setSegment] = useState<QuotationSegment>('todo');
  const [todoFilter, setTodoFilter] = useState(createEmptyRecordFilter);
  const [reportFilter, setReportFilter] = useState(createEmptyRecordFilter);
  const [dialogSeed, setDialogSeed] = useState<AddQuotationSeed | null>(null);

  const todoRows = pcRowsF(supplierQuotationRows, todoFilter);
  const openBuilder = (row: SupplierQuotationRow) => {
    const request = purchaseRequestRows.find((item) => item.id === row.pcRef);
    setDialogSeed({
      pcDept: request?.dept ?? '', pcRef: row.pcRef, pcStatus: request?.status ?? '',
      pcSubmitted: request?.submitted ?? '', pcTitle: request?.title ?? '', pcValue: request?.value ?? '',
    });
  };
  const columns = supplierQuotationColumns({
    action: t('quotations.action'), id: t('quotations.columns.id'), items: t('quotations.columns.items'),
    pcRef: t('quotations.columns.pcRef'), status: t('quotations.columns.status'), supplier: t('quotations.columns.supplier'),
    valid: t('quotations.columns.valid'), value: t('quotations.columns.value'),
  }, openBuilder);
  const exportDefinition: RecordExportDefinition = {
    columns: ['Quotation #', 'Supplier', 'PC Ref', 'Items', 'Value (KWD)', 'Valid until', 'Status'],
    label: t('home.sections.quotations'),
    rows: todoRows.map((row) => [row.id, row.supplier, row.pcRef, row.items, row.value, row.valid, row.status]),
  };

  return (
    <>
      <div className="mb-4 flex">
        <div className="inline-flex flex-wrap gap-0.5 rounded-[10px] border border-line bg-raised p-0.5">
          {segmentIds.map((id) => (
            <button className={segmentedOptionClass(segment === id)} key={id} onClick={() => { setSegment(id); }} type="button">
              {t(`quotations.segments.${id}`)}
            </button>
          ))}
        </div>
      </div>
      {segment === 'history' ? (
        <>
          <PurchasingSectionHeading subtitle={t('quotations.history.subtitle')} title={t('quotations.history.title')} />
          <TabbedTable
            columns={supplierQuotationHistoryColumns}
            emptyDescription={t('empty.description')}
            emptyTitle={t('empty.title')}
            paginationLabels={purchasingPaginationLabels(t, supplierQuotationHistoryRows.length)}
            rows={supplierQuotationHistoryRows}
            tabs={[{ count: supplierQuotationHistoryRows.length, id: 'all', label: t('quotations.tabs.all') }]}
          />
        </>
      ) : segment === 'report' ? (
        <>
          <PurchasingSectionHeading subtitle={t('quotations.report.subtitle')} title={t('quotations.report.title')} />
          <RecordFilter kind="request" noExport onChange={setReportFilter} value={reportFilter} />
          <div className="rounded-xl border border-dashed border-line-strong bg-canvas p-[60px] text-center text-sm text-fg-3">{t('report.placeholder')}</div>
        </>
      ) : (
        <>
          <RecordFilter exportDefinition={exportDefinition} kind="request" onChange={setTodoFilter} value={todoFilter} />
          <TabbedTable
            columns={columns}
            emptyDescription={t('empty.description')}
            emptyTitle={t('empty.title')}
            paginationLabels={purchasingPaginationLabels(t, todoRows.length)}
            rows={todoRows}
            tabs={[{ count: 4, id: 'open', label: t('quotations.tabs.open') }, { count: supplierQuotationRows.length, id: 'all', label: t('quotations.tabs.allQuotations') }]}
          />
        </>
      )}
      {dialogSeed ? <AddQuotationDialog key={dialogSeed.pcRef} onClose={() => { setDialogSeed(null); }} seed={dialogSeed} /> : null}
    </>
  );
}
