import { useTranslation } from 'react-i18next';

import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

import type {
  QueueAction,
  TrackedTask,
} from '../../types/queue.types';
import { ActionCard, type ActionCardVerb } from '../actions/ActionCard';
import { actionButtonClass } from '../actions/actionButtonStyles';
import { HomeSectionHead } from '../sections/HomeSectionHead';

/** How many ranked approvals the section lists. */
export const NEEDS_YOU_LIMIT = 6;

export type NeedsYouNowProps = Readonly<{
  onAct: (verb: ActionCardVerb, item: QueueAction) => void;
  onOpen: (item: QueueAction) => void;
  onOpenReturned: (task: TrackedTask) => void;
  onSeeAll: () => void;
  queueSize: number;
  ranked: readonly QueueAction[];
  returned: readonly TrackedTask[];
}>;

/**
 * Items sent back to the user (red cards, first), then the top ranked
 * approvals. "See all" shows the live queue size and opens Assigned.
 * @prototype index.html:L14557-L14582 "Needs you now"
 */
export function NeedsYouNow({
  onAct,
  onOpen,
  onOpenReturned,
  onSeeAll,
  queueSize,
  ranked,
  returned,
}: NeedsYouNowProps) {
  const { t } = useTranslation('home');

  return (
    <section className="min-w-0" data-testid="needs-you-now">
      <HomeSectionHead
        right={
          <button
            className={actionButtonClass('ghost', 'sm')}
            onClick={onSeeAll}
            type="button"
          >
            {`${t('overview.needs.seeAll')} ${String(queueSize)}`}
            <Icon name="arrow-right" size={13} />
          </button>
        }
        sub={t('overview.needs.subtitle')}
        title={t('overview.needs.title')}
      />
      <div className="flex flex-col gap-3">
        {returned.map((task) => (
          <div
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-[color-mix(in_srgb,var(--bad)_35%,var(--line))] bg-[color-mix(in_srgb,var(--bad)_6%,transparent)] px-4 py-3.5 transition-[border-color,box-shadow] hover:shadow-[0_2px_10px_rgba(20,20,30,0.05)]"
            data-testid={`returned-card-${task.id}`}
            key={`ret-${task.id}`}
            onClick={() => {
              onOpenReturned(task);
            }}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpenReturned(task);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-menu bg-[color-mix(in_srgb,var(--bad)_15%,transparent)] text-bad">
              <Icon name="refresh" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold">{task.title}</span>
                <Chip
                  className="border-transparent bg-[color-mix(in_srgb,var(--bad)_12%,transparent)] text-2xs text-bad"
                >
                  {t('overview.needs.returned')}
                </Chip>
              </div>
              <div className="mt-1 text-base-plus text-fg-3">
                {task.reason
                  ? `${t('overview.needs.reason')}: ${task.reason}`
                  : t('overview.needs.sentBackToYou')}
              </div>
            </div>
            <Icon
              className="shrink-0 text-fg-4"
              name="arrow-right"
              size={16}
            />
          </div>
        ))}
        {ranked.slice(0, NEEDS_YOU_LIMIT).map((item) => (
          <ActionCard
            item={item}
            key={item.id}
            onAct={onAct}
            onOpen={onOpen}
            onToggle={() => undefined}
            selectable={false}
            selected={false}
          />
        ))}
      </div>
    </section>
  );
}
