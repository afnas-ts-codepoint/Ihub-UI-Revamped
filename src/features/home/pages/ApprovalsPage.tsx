import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { actionButtonClass } from '../components/actions/actionButtonStyles';
import { ActionList } from '../components/actions/ActionList';
import { FilterChips } from '../components/actions/FilterChips';
import {
  APPROVAL_GROUP_IDS,
  type ApprovalFilterId,
} from '../constants/approvalGroups';
import { rankQueue } from '../domain/prioritization';
import { useHomeQueueActions } from '../hooks/useHomeQueueActions';
import { useHomeQueueStore } from '../store/homeQueue.store';

const FILTER_LABEL_KEY = {
  'action-sheet': 'approvals.filters.actionSheet',
  all: 'approvals.filters.all',
  'new-budget': 'approvals.filters.newBudget',
  'purchase-committee': 'approvals.filters.purchaseCommittee',
  'transfer-funds': 'approvals.filters.transferFunds',
} as const satisfies Record<ApprovalFilterId, string>;

/**
 * `/home/approvals` — the ranked approvals queue with group chips, select-all
 * and batch decisions. The send-back, track-prompt, drawer and form-preview
 * dialogs are mounted once by `HomeLayout`.
 * @prototype ihub/index.html:L12526-L12548 `view === 'approvals'`
 */
export function ApprovalsPage() {
  const { t } = useTranslation('home');
  const actions = useHomeQueueStore((state) => state.actions);
  const selected = useHomeQueueStore((state) => state.selected);
  const toggleSelected = useHomeQueueStore((state) => state.toggleSelected);
  const selectAll = useHomeQueueStore((state) => state.selectAll);
  const openDrawer = useHomeQueueStore((state) => state.openDrawer);
  const { actOnAction, batch } = useHomeQueueActions();
  const [filter, setFilter] = useState<ApprovalFilterId>('all');

  const ranked = useMemo(() => rankQueue(actions), [actions]);
  const items = useMemo(
    () =>
      filter === 'all'
        ? ranked
        : ranked.filter((action) => action.group === filter),
    [filter, ranked],
  );
  // Counts come from the live queue and ignore the selected chip; the
  // "other" group has no chip, so the chips do not sum to "All".
  const options = APPROVAL_GROUP_IDS.map((id) => ({
    count:
      id === 'all'
        ? actions.length
        : actions.filter((action) => action.group === id).length,
    id,
    label: t(FILTER_LABEL_KEY[id]),
  }));

  return (
    <section>
      <div className="mb-3.5 flex items-end justify-between gap-3 max-tablet:flex-wrap max-tablet:items-start">
        <div className="min-w-0 max-tablet:flex-[1_1_220px]">
          <h2 className="m-0 text-lg font-semibold tracking-[-0.01em]">
            {t('approvals.title')}
          </h2>
          <p className="mt-0.5 mb-0 text-base text-fg-3">
            {t('approvals.subtitle')}
          </p>
        </div>
        {/* Keyed on the whole selection, so a selection hidden by the filter still reads "Clear". */}
        <button
          className={actionButtonClass('ghost', 'sm')}
          onClick={() => {
            selectAll(selected.length ? [] : items.map((item) => item.id));
          }}
          type="button"
        >
          {selected.length
            ? t('approvals.clearSelection')
            : t('approvals.selectAll')}
        </button>
      </div>
      <FilterChips onChange={setFilter} options={options} value={filter} />
      <ActionList
        items={items}
        onAct={(verb, item) => {
          // "Send back" passes no reason: the store then opens the send-back dialog.
          actOnAction(verb, item);
        }}
        onBatch={batch}
        onOpen={(item) => {
          openDrawer('action', item);
        }}
        onToggle={toggleSelected}
        selectedIds={selected}
      />
    </section>
  );
}
