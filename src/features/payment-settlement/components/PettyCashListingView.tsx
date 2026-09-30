import type { RecordFilterKind, RecordFilterValue } from '@/features/organization';
import { RecordFilter } from '@/features/organization';
import type { TableColumn } from '@/shared/table';
import { TabbedTable } from '@/shared/table';
import { useTranslation } from 'react-i18next';

import { paymentSettlementPaginationLabels } from './paymentSettlementPagination';
import { PaymentSettlementSectionHeading } from './PaymentSettlementSectionHeading';

type PettyCashListingViewProps<Row extends object> = Readonly<{
  columns: readonly TableColumn<Row>[];
  filter: RecordFilterValue;
  filterKind: Extract<RecordFilterKind, 'history' | 'request'>;
  onFilterChange: (next: RecordFilterValue) => void;
  rows: readonly Row[];
  subtitle: string;
  tabs: readonly Readonly<{ count: number; id: string; label: string }>[];
  title: string;
}>;

/**
 * One heading + shared `RecordFilter` + `TabbedTable` block, used by every
 * Petty Cash listing sub-view. Callers decide whether `rows` is already
 * filtered (Settle deliberately is not — index.html:L9734 passes `settleRows`
 * straight through while still rendering the filter).
 * @prototype index.html:L9686-L9696, L9730-L9735
 */
export function PettyCashListingView<Row extends object>({
  columns,
  filter,
  filterKind,
  onFilterChange,
  rows,
  subtitle,
  tabs,
  title,
}: PettyCashListingViewProps<Row>) {
  const { t } = useTranslation('paymentSettlement');

  return (
    <>
      <PaymentSettlementSectionHeading subtitle={subtitle} title={title} />
      <RecordFilter kind={filterKind} onChange={onFilterChange} value={filter} />
      <TabbedTable
        columns={columns}
        emptyDescription={t('pettyCash.empty.description')}
        emptyTitle={t('pettyCash.empty.title')}
        paginationLabels={paymentSettlementPaginationLabels(t, rows.length)}
        rows={rows}
        tabs={tabs}
      />
    </>
  );
}
