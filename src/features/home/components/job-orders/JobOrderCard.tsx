import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon, type IconName } from '@/shared/ui/icon/Icon';

import { jobOrderProgress } from '../../domain/assignedQueue';
import type { QueueJobOrder } from '../../types/queue.types';
import { actionButtonClass } from '../actions/actionButtonStyles';
import { SlaBadge } from '../actions/SlaBadge';
import { PRIORITY_CHIP_TONE } from '../workflow-drawer/drawerTones';

export type JobOrderCardProps = Readonly<{
  item: QueueJobOrder;
  onDismiss: (item: QueueJobOrder) => void;
  /** Card click. Without it the card opens the workflow drawer, like the Assign/Track button. */
  onOpen?: (item: QueueJobOrder) => void;
  onOpenDrawer: (item: QueueJobOrder) => void;
}>;

const CHIP_SIZE = 'gap-1.5 px-[9px] py-[3px] text-2xs font-medium';

/** @prototype index.html:L13437-L13438 `joTone` — done is ok, in progress is the brand blue, otherwise yellow. */
const progressTone = (percent: number) =>
  percent >= 100
    ? { bar: 'bg-ok', text: 'text-ok' }
    : percent >= 60
      ? { bar: 'bg-interactive', text: 'text-interactive' }
      : { bar: 'bg-brand-yellow', text: 'text-brand-yellow' };

type FieldProps = Readonly<{
  icon: IconName;
  label: string;
  tone?: 'bad';
}>;

/** @prototype index.html:L13561-L13587 `Field` */
function Field({ icon, label, tone }: FieldProps) {
  return (
    <span
      className={cn(
        'flex min-w-0 items-center gap-1.5',
        tone === 'bad' ? 'text-bad' : 'text-fg-3',
      )}
    >
      <Icon className="shrink-0" name={icon} size={13} />
      <span
        className={cn(
          'truncate',
          tone === 'bad' ? 'text-bad' : 'text-fg-2',
        )}
      >
        {label}
      </span>
    </span>
  );
}

/**
 * A job order as a task card: kind, assignment, SLA, place, progress derived
 * from the status, and Assign/Dismiss (new) or Track (assigned) actions. Shared
 * by the Assigned Tasks queue and the Home Tasks list.
 * @prototype index.html:L13429-L13560 `JobOrderCard`
 */
export function JobOrderCard({
  item,
  onDismiss,
  onOpen,
  onOpenDrawer,
}: JobOrderCardProps) {
  const { t } = useTranslation('home');
  const percent = jobOrderProgress(item.status);
  const tone = progressTone(percent);
  const internal = item.kind === 'internal';
  const urgentDue = item.due.includes('today') || item.due.includes('tomorrow');
  const open = () => {
    (onOpen ?? onOpenDrawer)(item);
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
      className="relative flex flex-col rounded-lg border border-line bg-surface transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[0_2px_10px_rgba(20,20,30,0.05)]"
      data-testid={`job-order-card-${item.id}`}
    >
      {item.isNew ? (
        <span className="absolute end-3.5 top-3.5 rounded-full bg-accent-dim px-2 py-0.5 text-2xs font-bold tracking-[0.08em] text-accent">
          {t('jobOrderCard.new')}
        </span>
      ) : null}
      <div
        className="flex cursor-pointer flex-col gap-3 p-[18px] pb-0"
        data-testid="job-order-card-body"
        onClick={open}
        onKeyDown={onBodyKeyDown}
        role="button"
        tabIndex={0}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="num text-sm font-semibold text-fg-4">{item.id}</span>
          <Chip
            className={cn(
              CHIP_SIZE,
              'border-transparent',
              internal
                ? 'bg-interactive-soft text-interactive'
                : 'bg-brand-orange/[14%] text-brand-orange',
            )}
          >
            {internal ? t('jobOrderCard.internal') : t('jobOrderCard.external')}
          </Chip>
          <Chip className={cn(CHIP_SIZE, 'gap-1')} tone="accent">
            <Icon name="users" size={11} />
            {t('jobOrderCard.assignedToYou')}
          </Chip>
          <SlaBadge subject={item} />
        </div>
        <div
          className={cn(
            'text-lg leading-[1.3] font-semibold',
            item.isNew && 'pe-10',
          )}
        >
          {item.title}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-[7px] text-sm-plus">
          <Field icon="building" label={item.location} />
          <Field icon="users" label={item.dept} />
          <Field
            icon="clock"
            label={item.due}
            tone={urgentDue ? 'bad' : undefined}
          />
          <Field icon="shield" label={item.partner} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">
              {t('jobOrderCard.progress')}
            </span>
            <span className={cn('num text-sm-plus font-semibold', tone.text)}>
              {`${String(percent)}%`}
            </span>
          </div>
          <div
            aria-label={t('jobOrderCard.progress')}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={percent}
            className="h-1.5 overflow-hidden rounded-full bg-inset"
            role="progressbar"
          >
            <div
              className={cn('h-full rounded-full', tone.bar)}
              style={{ width: `${String(percent)}%` }}
            />
          </div>
        </div>
      </div>
      <div className="mx-[18px] mt-3 mb-[18px] flex items-center gap-2 border-t border-line pt-3">
        {/* Raw English priority and status text, untranslated (as in the prototype). */}
        <Chip className={cn(CHIP_SIZE, 'border-transparent')} tone={PRIORITY_CHIP_TONE[item.priority]}>
          {item.priority}
        </Chip>
        <Chip className={CHIP_SIZE}>{item.status}</Chip>
        <div className="flex-1" />
        {item.status === 'New' ? (
          <>
            <button
              className={actionButtonClass('primary', 'sm')}
              onClick={() => {
                onOpenDrawer(item);
              }}
              type="button"
            >
              {t('jobOrderCard.assign')}
            </button>
            {/* The prototype's hard-coded English "Dismiss" tooltip, in every locale. */}
            <button
              aria-label={t('jobOrderCard.dismiss')}
              className={actionButtonClass('ghost', 'sm')}
              onClick={() => {
                onDismiss(item);
              }}
              title={t('jobOrderCard.dismiss')}
              type="button"
            >
              <Icon name="close" size={14} />
            </button>
          </>
        ) : (
          <button
            className={actionButtonClass('secondary', 'sm')}
            onClick={() => {
              onOpenDrawer(item);
            }}
            type="button"
          >
            {t('jobOrderCard.track')}
            {/* The prototype arrow points right in Arabic too. */}
            <Icon name="arrow-right" size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
