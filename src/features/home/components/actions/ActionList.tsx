import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { Icon } from '@/shared/ui/icon/Icon';

import type { QueueAction } from '../../types/queue.types';
import { actionButtonClass } from './actionButtonStyles';
import { ActionCard, type ActionCardVerb } from './ActionCard';

export type ActionListProps = Readonly<{
  items: readonly QueueAction[];
  onAct: (verb: ActionCardVerb, item: QueueAction) => void;
  onBatch: (type: 'approve' | 'reject') => void;
  onOpen: (item: QueueAction) => void;
  onToggle: (id: string) => void;
  selectedIds: readonly string[];
  showBatch?: boolean;
  verify?: boolean;
}>;

/**
 * The approvals list with its batch-decision bar. The bar counts only the
 * selected items that are visible, but `onBatch` acts on the whole selection
 * (including items hidden by a filter) — prototype behaviour.
 * @prototype ihub/index.html:L11231-L11304 `ActionList`
 */
export function ActionList({
  items,
  onAct,
  onBatch,
  onOpen,
  onToggle,
  selectedIds,
  showBatch = true,
  verify = false,
}: ActionListProps) {
  const { t } = useTranslation('home');
  const selectedInView = items.filter((item) =>
    selectedIds.includes(item.id),
  ).length;
  const approveLabel = verify
    ? t('actionList.verify')
    : t('actionList.approve');

  return (
    <>
      {showBatch && selectedInView > 0 ? (
        <div
          className="mb-3.5 flex items-center gap-3 rounded-lg border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-accent-dim px-4 py-3"
          data-testid="batch-bar"
        >
          <span className="text-md font-semibold text-accent">
            {`${String(selectedInView)} ${t('actionList.selected')}`}
          </span>
          <span className="text-base text-fg-3">
            {t('actionList.batchDecision')}
          </span>
          <div className="flex-1" />
          <button
            className={actionButtonClass('primary', 'sm')}
            onClick={() => {
              onBatch('approve');
            }}
            type="button"
          >
            <Icon name="check" size={14} />
            {`${approveLabel} ${String(selectedInView)}`}
          </button>
          <button
            className={actionButtonClass('secondary', 'sm')}
            onClick={() => {
              onBatch('reject');
            }}
            type="button"
          >
            {t('actionList.rejectAll')}
          </button>
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <ActionCard
            item={item}
            key={item.id}
            onAct={onAct}
            onOpen={onOpen}
            onToggle={() => {
              onToggle(item.id);
            }}
            selectable={showBatch}
            selected={selectedIds.includes(item.id)}
            verify={verify}
          />
        ))}
        {items.length === 0 ? (
          <div className="rounded-lg border border-line bg-surface">
            <EmptyState
              description={t('actionList.emptyDescription')}
              title={t('actionList.emptyTitle')}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
