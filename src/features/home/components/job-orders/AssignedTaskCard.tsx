import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

import type { QueueJobOrder } from '../../types/queue.types';
import { actionButtonClass } from '../actions/actionButtonStyles';
import { PRIORITY_CHIP_TONE, capitalise } from '../workflow-drawer/drawerTones';

export type AssignedTaskCardProps = Readonly<{
  item: QueueJobOrder;
  onApprove: (item: QueueJobOrder) => void;
  onEdit: (item: QueueJobOrder) => void;
  onSendBack: (item: QueueJobOrder) => void;
  verify: boolean;
}>;

function MetaDot() {
  return (
    <span aria-hidden="true" className="text-line-strong">
      {'·'}
    </span>
  );
}

/**
 * An external assigned task listed under the Approvals/Verify "Tasks" record
 * type: approve (or verify), edit, send back. A body click and Edit both open
 * the Home task form.
 * @prototype index.html:L14730-L14740 task row card
 */
export function AssignedTaskCard({
  item,
  onApprove,
  onEdit,
  onSendBack,
  verify,
}: AssignedTaskCardProps) {
  const { t } = useTranslation('home');
  const open = () => {
    onEdit(item);
  };
  const onBodyKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  };

  return (
    <div
      className="flex flex-col rounded-lg border border-line bg-surface transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[0_2px_10px_rgba(20,20,30,0.05)]"
      data-testid={`assigned-task-${item.id}`}
    >
      <div
        className="flex cursor-pointer flex-col gap-3 p-4 pb-0"
        data-testid="assigned-task-body"
        onClick={open}
        onKeyDown={onBodyKeyDown}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <div className="num text-xs-plus font-semibold text-accent">
              {item.id}
            </div>
            <div className="mt-[3px] text-md leading-[1.35] font-semibold">
              {item.title}
            </div>
          </div>
          <Chip
            className="shrink-0 border-transparent px-[9px] py-[3px] text-xs font-medium"
            tone={PRIORITY_CHIP_TONE[item.priority]}
          >
            {capitalise(item.priority)}
          </Chip>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-fg-3">
          <span>{item.dept}</span>
          <MetaDot />
          <span>{item.location}</span>
          <MetaDot />
          <span className="num">{item.due}</span>
        </div>
      </div>
      <div className="mx-4 mt-3 mb-4 flex flex-wrap gap-2 border-t border-line pt-3">
        <button
          className={actionButtonClass('primary', 'sm')}
          onClick={() => {
            onApprove(item);
          }}
          type="button"
        >
          <Icon name="check" size={14} />
          {verify ? t('assigned.taskRow.verify') : t('assigned.taskRow.approve')}
        </button>
        <button
          className={actionButtonClass('secondary', 'sm')}
          onClick={open}
          type="button"
        >
          <Icon name="edit" size={14} />
          {t('assigned.taskRow.edit')}
        </button>
        <button
          className={actionButtonClass('ghost', 'sm')}
          onClick={() => {
            onSendBack(item);
          }}
          type="button"
        >
          <Icon name="refresh" size={14} />
          {t('assigned.taskRow.sendBack')}
        </button>
      </div>
    </div>
  );
}
