import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/shared/ui/chip/Chip';
import { Icon, type IconName } from '@/shared/ui/icon/Icon';

import { referenceCode } from '../../domain/referenceCode';
import type { HomeDueState, HomePriority } from '../../types/home.types';
import type { QueueAction, QueueActionVerb } from '../../types/queue.types';
import { actionButtonClass } from './actionButtonStyles';
import { SlaBadge } from './SlaBadge';

/** The verbs the card rail emits (there is no escalate button on the card). */
export type ActionCardVerb = Exclude<QueueActionVerb, 'escalate'>;

export type ActionCardProps = Readonly<{
  item: QueueAction;
  onAct: (verb: ActionCardVerb, item: QueueAction) => void;
  onOpen: (item: QueueAction) => void;
  onToggle: () => void;
  selectable?: boolean;
  selected: boolean;
  verify?: boolean;
}>;

/** @prototype ihub/index.html:L10355-L10358 `SEV_COLOR` (high is brand orange, not a status token). */
const STRIPE_CLASS: Readonly<Record<HomePriority, string>> = {
  critical: 'bg-bad',
  high: 'bg-brand-orange',
  low: 'bg-info',
  medium: 'bg-warn',
};

/** @prototype ihub/index.html:L10355 `PRIO_CHIP` */
const PRIORITY_TONE = {
  critical: 'bad',
  high: 'bad',
  low: 'info',
  medium: 'warn',
} as const satisfies Record<HomePriority, 'bad' | 'info' | 'warn'>;

/** @prototype ihub/index.html:L10356 `DUE_CHIP` (later has no tone) */
const DUE_TONE = {
  later: 'neutral',
  overdue: 'bad',
  soon: 'info',
  today: 'warn',
} as const satisfies Record<HomeDueState, 'bad' | 'info' | 'neutral' | 'warn'>;

const CHIP_SIZE = 'gap-1.5 px-[9px] py-[3px] text-2xs font-semibold';

type RailButtonProps = Readonly<{
  active?: boolean;
  icon: IconName;
  label: string;
  onClick: () => void;
  pressed?: boolean;
  tone?: 'bad';
}>;

/**
 * Icon-only rail button. The prototype sets only `title`; the matching
 * `aria-label` is an accessibility addition.
 * @prototype ihub/index.html:L10374-L10393 `IconBtn`
 */
function RailButton({
  active = false,
  icon,
  label,
  onClick,
  pressed,
  tone,
}: RailButtonProps) {
  const color = active
    ? 'bg-accent-dim text-accent'
    : tone === 'bad'
      ? 'text-bad'
      : 'text-fg-3';
  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className={`${actionButtonClass('ghost', 'sm')} px-[7px] ${color}`}
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon name={icon} size={15} />
    </button>
  );
}

/** @prototype ihub/index.html:L10394-L10400 `MetaDot` */
function MetaDot() {
  return (
    <span aria-hidden="true" className="text-line-strong">
      {'·'}
    </span>
  );
}

/**
 * One approvals-queue row. Prop driven so it can be reused with no-op
 * handlers (the Dashboard layout designer). "Edit" is identical to a body
 * click in the prototype: both open the item (drawer or form preview).
 * At phone width (≤760px) the body takes the full row, the amount drops under
 * the content and the action rail moves to a bottom row (prototype `.ac-card`
 * rules in the `ihub-mobile-overview` stylesheet).
 * @prototype ihub/index.html:L10867-L11067 `ActionCard`
 */
export function ActionCard({
  item,
  onAct,
  onOpen,
  onToggle,
  selectable = true,
  selected,
  verify = false,
}: ActionCardProps) {
  const { t } = useTranslation('home');
  const approveLabel = verify
    ? t('actionCard.verify')
    : t('actionCard.approve');
  const overdue = item.dueState === 'overdue';
  const open = () => {
    onOpen(item);
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
      className={`flex items-stretch overflow-hidden rounded-lg border bg-surface max-tablet:relative max-tablet:flex-wrap transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[0_2px_10px_rgba(20,20,30,0.05)] ${
        overdue
          ? 'border-[color-mix(in_srgb,var(--bad)_32%,var(--line))]'
          : 'border-line'
      }`}
      data-testid={`action-card-${item.id}`}
    >
      <span
        aria-hidden="true"
        className={`w-1 shrink-0 max-tablet:absolute max-tablet:inset-y-0 max-tablet:start-0 ${STRIPE_CLASS[item.priority]}`}
      />
      {selectable ? (
        // The prototype's label stops click propagation, but the checkbox is a
        // sibling of the clickable body (not inside it), so it is a no-op here.
        <label className="flex cursor-pointer items-center ps-3.5 pe-1">
          <input
            aria-label={item.title}
            checked={selected}
            className="size-[17px] cursor-pointer accent-accent"
            onChange={onToggle}
            type="checkbox"
          />
        </label>
      ) : null}
      <div
        className="min-w-0 flex-1 cursor-pointer px-[18px] py-4 max-tablet:basis-full max-tablet:pt-3.5 max-tablet:pb-3 max-tablet:pe-3.5 max-tablet:ps-[18px]"
        data-testid="action-card-body"
        onClick={open}
        onKeyDown={onBodyKeyDown}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-start gap-[13px] max-tablet:flex-wrap max-tablet:gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-menu bg-accent-dim text-accent">
            <Icon name={item.icon} size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="num basis-full text-xs-plus font-semibold text-accent">
                {referenceCode(item)}
              </span>
              <span className="text-lg font-semibold">{item.title}</span>
              {/* Raw English data, untranslated (the prototype has no priority label map). */}
              <Chip className={CHIP_SIZE} tone={PRIORITY_TONE[item.priority]}>
                {item.priority}
              </Chip>
              <Chip className={CHIP_SIZE} tone={DUE_TONE[item.dueState]}>
                {overdue ? <Icon name="clock" size={11} /> : null}
                {item.due}
              </Chip>
              <SlaBadge subject={item} />
            </div>
            <div className="mt-[5px] flex flex-wrap items-center gap-2 text-base text-fg-3">
              <span className="text-fg-2">{item.owner}</span>
              <MetaDot />
              <span>{item.dept}</span>
              <MetaDot />
              <span>{item.status}</span>
            </div>
            <div className="mt-[11px] flex items-center gap-[7px] text-sm-plus text-fg-3">
              <Icon className="text-accent" name="sparkle" size={13} />
              <span>
                {`${t('actionCard.recommended')}: `}
                <span className="font-semibold text-fg-2">
                  {item.recommended}
                </span>
              </span>
            </div>
          </div>
          <div className="shrink-0 text-end max-tablet:grow max-tablet:basis-full max-tablet:ps-[46px] max-tablet:text-start">
            <div className="num display text-2xl-plus font-medium tracking-[-0.02em]">
              {item.amount}
            </div>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-col justify-center gap-[7px] border-s border-line bg-raised px-4 py-3.5 max-tablet:grow max-tablet:basis-full max-tablet:flex-row max-tablet:justify-end max-tablet:border-s-0 max-tablet:border-t max-tablet:px-3.5 max-tablet:py-2">
        <div className="flex items-center gap-1">
          <button
            aria-label={approveLabel}
            className={`${actionButtonClass('primary', 'sm')} px-2`}
            onClick={() => {
              onAct('approve', item);
            }}
            title={approveLabel}
            type="button"
          >
            <Icon name="check" size={15} />
          </button>
          <RailButton icon="edit" label={t('actionCard.edit')} onClick={open} />
          <RailButton
            icon="refresh"
            label={t('actionCard.sendBack')}
            onClick={() => {
              onAct('sendback', item);
            }}
          />
          <RailButton
            icon="close"
            label={t('actionCard.reject')}
            onClick={() => {
              onAct('reject', item);
            }}
            tone="bad"
          />
          {/* Prototype quirk: the Pin tooltip is the hard-coded English "Pin to top" in every locale. */}
          <RailButton
            active={item.pinned === true}
            icon="pin"
            label={t('actionCard.pinToTop')}
            onClick={() => {
              onAct('pin', item);
            }}
            pressed={item.pinned === true}
          />
        </div>
      </div>
    </div>
  );
}
