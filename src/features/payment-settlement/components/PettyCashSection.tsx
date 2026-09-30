import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter } from '@/features/organization';

import {
  PETTY_CASH_LISTING_COUNTS,
  PETTY_CASH_SETTLE_COUNTS,
  pettyCashEditRows,
  pettyCashHistoryRows,
  pettyCashListingRows,
  pettyCashSettleRows,
} from '../data/pettyCash.mock';
import { pettyCashRowsF } from '../domain/pettyCashMatchRow';
import { segmentedOptionClass } from './actionSheetButtonStyles';
import { pettyCashEditColumns, pettyCashHistoryColumns, pettyCashListingColumns, pettyCashSettleColumns } from './pettyCashColumns';
import { PettyCashListingView } from './PettyCashListingView';
import { PettyCashRequestForm } from './PettyCashRequestForm';
import { ReimbursePettyCashForm } from './ReimbursePettyCashForm';

const TABS = ['request', 'reimburse', 'settle'] as const;
const REQUEST_SUBS = ['create', 'edit', 'history'] as const;
const REIMBURSE_SUBS = ['request', 'listing', 'edit', 'history'] as const;

type Tab = (typeof TABS)[number];
type RequestSub = (typeof REQUEST_SUBS)[number];
type ReimburseSub = (typeof REIMBURSE_SUBS)[number];

type UnderlineBarProps<Id extends string> = Readonly<{
  active: Id;
  ariaLabel: string;
  items: readonly Readonly<{ id: Id; label: string }>[];
  onSelect: (id: Id) => void;
}>;

/** @prototype index.html:L9675-L9683 `pcReqSegBar` / L9703-L9711 `reimSegBar` (dot-separated underline links) */
function UnderlineBar<Id extends string>({ active, ariaLabel, items, onSelect }: UnderlineBarProps<Id>) {
  return (
    <div aria-label={ariaLabel} className="mb-4 flex flex-wrap items-center gap-1.5" role="group">
      {items.map((item, index) => (
        <span className="contents" key={item.id}>
          {index ? <span aria-hidden="true" className="text-line-strong">{'·'}</span> : null}
          <button
            aria-pressed={active === item.id}
            className={`px-1.5 py-1 text-base ${active === item.id ? 'font-semibold text-accent underline decoration-accent underline-offset-4' : 'font-medium text-fg-3'}`}
            onClick={() => { onSelect(item.id); }}
            type="button"
          >
            {item.label}
          </button>
        </span>
      ))}
    </div>
  );
}

/**
 * Embedded `PettyCashScreen` (Home → Payment Settlement → Petty Cash). The
 * three top tabs and both inner sub-tab strips are local component state
 * (the prototype's `pcTab` / `pcReqSub` / `reimSub`), not routes. One
 * `pcashFilter` is shared by every listing and persists across tab
 * switches while the screen stays mounted.
 * @prototype index.html:L9549-L9755 `PettyCashScreen`
 */
export function PettyCashSection() {
  const { t } = useTranslation('paymentSettlement');
  const [tab, setTab] = useState<Tab>('request');
  const [requestSub, setRequestSub] = useState<RequestSub>('create');
  const [reimburseSub, setReimburseSub] = useState<ReimburseSub>('request');
  const [filter, setFilter] = useState(createEmptyRecordFilter);

  const editTabs = [{ count: pettyCashEditRows.length, id: 'open', label: t('pettyCash.tableTabs.editable') }];
  const historyTabs = [{ count: pettyCashHistoryRows.length, id: 'all', label: t('allTab') }];

  const requestBody = (() => {
    if (requestSub === 'edit') {
      return (
        <PettyCashListingView
          columns={pettyCashEditColumns(t)}
          filter={filter}
          filterKind="request"
          onFilterChange={setFilter}
          rows={pettyCashRowsF(pettyCashEditRows, filter)}
          subtitle={t('pettyCash.request.edit.subtitle')}
          tabs={editTabs}
          title={t('pettyCash.request.edit.title')}
        />
      );
    }
    if (requestSub === 'history') {
      return (
        <PettyCashListingView
          columns={pettyCashHistoryColumns(t)}
          filter={filter}
          filterKind="history"
          onFilterChange={setFilter}
          rows={pettyCashRowsF(pettyCashHistoryRows, filter)}
          subtitle={t('pettyCash.request.history.subtitle')}
          tabs={historyTabs}
          title={t('pettyCash.history.title')}
        />
      );
    }
    return <PettyCashRequestForm />;
  })();

  const reimburseBody = (() => {
    if (reimburseSub === 'listing') {
      return (
        <PettyCashListingView
          columns={pettyCashListingColumns(t, () => { setReimburseSub('request'); })}
          filter={filter}
          filterKind="request"
          onFilterChange={setFilter}
          rows={pettyCashRowsF(pettyCashListingRows, filter)}
          subtitle={t('pettyCash.reimburse.listing.subtitle')}
          tabs={[
            { count: PETTY_CASH_LISTING_COUNTS.pending, id: 'pending', label: t('pettyCash.tableTabs.pending') },
            { count: PETTY_CASH_LISTING_COUNTS.all, id: 'all', label: t('allTab') },
          ]}
          title={t('pettyCash.reimburse.listing.title')}
        />
      );
    }
    if (reimburseSub === 'edit') {
      return (
        <PettyCashListingView
          columns={pettyCashEditColumns(t)}
          filter={filter}
          filterKind="request"
          onFilterChange={setFilter}
          rows={pettyCashRowsF(pettyCashEditRows, filter)}
          subtitle={t('pettyCash.reimburse.edit.subtitle')}
          tabs={editTabs}
          title={t('pettyCash.reimburse.edit.title')}
        />
      );
    }
    if (reimburseSub === 'history') {
      return (
        <PettyCashListingView
          columns={pettyCashHistoryColumns(t)}
          filter={filter}
          filterKind="history"
          onFilterChange={setFilter}
          rows={pettyCashRowsF(pettyCashHistoryRows, filter)}
          subtitle={t('pettyCash.reimburse.history.subtitle')}
          tabs={historyTabs}
          title={t('pettyCash.history.title')}
        />
      );
    }
    return <ReimbursePettyCashForm />;
  })();

  /** The Settle table renders every row regardless of the shared filter (index.html:L9734). */
  const settleBody = (
    <PettyCashListingView
      columns={pettyCashSettleColumns(t)}
      filter={filter}
      filterKind="request"
      onFilterChange={setFilter}
      rows={pettyCashSettleRows}
      subtitle={t('pettyCash.settle.subtitle')}
      tabs={[
        { count: PETTY_CASH_SETTLE_COUNTS.open, id: 'open', label: t('pettyCash.tableTabs.toSettle') },
        { count: PETTY_CASH_SETTLE_COUNTS.all, id: 'all', label: t('allTab') },
      ]}
      title={t('pettyCash.settle.title')}
    />
  );

  return (
    <div className="flex flex-col" style={{ paddingBottom: 40 }}>
      <div className="mb-4 inline-flex w-fit flex-wrap gap-0.5 rounded-lg border border-line bg-inset p-0.5">
        {TABS.map((id) => (
          <button aria-pressed={tab === id} className={segmentedOptionClass(tab === id)} key={id} onClick={() => { setTab(id); }} type="button">
            {t(`pettyCash.tabs.${id}`)}
          </button>
        ))}
      </div>
      {tab === 'request' ? (
        <>
          <UnderlineBar
            active={requestSub}
            ariaLabel={t('pettyCash.request.ariaLabel')}
            items={REQUEST_SUBS.map((id) => ({ id, label: t(`pettyCash.request.subs.${id}`) }))}
            onSelect={setRequestSub}
          />
          {requestBody}
        </>
      ) : null}
      {tab === 'reimburse' ? (
        <>
          <UnderlineBar
            active={reimburseSub}
            ariaLabel={t('pettyCash.reimburse.ariaLabel')}
            items={REIMBURSE_SUBS.map((id) => ({ id, label: t(`pettyCash.reimburse.subs.${id}`) }))}
            onSelect={setReimburseSub}
          />
          {reimburseBody}
        </>
      ) : null}
      {tab === 'settle' ? settleBody : null}
    </div>
  );
}
