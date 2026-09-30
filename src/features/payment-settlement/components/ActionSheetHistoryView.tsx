import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter } from '@/features/organization';
import { TabbedTable } from '@/shared/table';

import { actionSheetRowsF } from '../domain/actionSheetMatchRow';
import { actionSheetHistoryRows } from '../data/actionSheet.mock';
import { segmentedOptionClass } from './actionSheetButtonStyles';
import { actionSheetColumnLabels, actionSheetHistoryColumns } from './actionSheetColumns';
import { paymentSettlementPaginationLabels } from './paymentSettlementPagination';
import { PaymentSettlementSectionHeading } from './PaymentSettlementSectionHeading';

const HIST_FILTERS = ['all', 'purchase', 'service'] as const;
type HistFilter = (typeof HIST_FILTERS)[number];

/** @prototype index.html:L17239-L17255 History (`histKind` segmented filter + `asRF` RecordFilter) */
export function ActionSheetHistoryView() {
  const { t } = useTranslation('paymentSettlement');
  const [histKind, setHistKind] = useState<HistFilter>('all');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const byKind = histKind === 'all' ? actionSheetHistoryRows : actionSheetHistoryRows.filter((row) => row.kind === histKind);
  const rows = actionSheetRowsF(byKind, filter);
  const columns = actionSheetHistoryColumns(actionSheetColumnLabels(t));
  const filterLabels: Readonly<Record<HistFilter, string>> = {
    all: t('actionSheet.history.filters.all'),
    purchase: t('actionSheet.history.filters.purchase'),
    service: t('actionSheet.history.filters.service'),
  };

  return (
    <>
      <PaymentSettlementSectionHeading subtitle={t('actionSheet.history.subtitle')} title={t('actionSheet.history.title')} />
      <RecordFilter kind="sheet" onChange={setFilter} value={filter} />
      <div className="mb-3.5 inline-flex w-fit gap-0.5 rounded-lg border border-line bg-inset p-0.5">
        {HIST_FILTERS.map((id) => (
          <button className={segmentedOptionClass(histKind === id)} key={id} onClick={() => { setHistKind(id); }} type="button">
            {filterLabels[id]}
          </button>
        ))}
      </div>
      <TabbedTable
        columns={columns}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        paginationLabels={paymentSettlementPaginationLabels(t, rows.length)}
        rows={rows}
        tabs={[{ count: byKind.length, id: 'all', label: t('allTab') }]}
      />
    </>
  );
}
