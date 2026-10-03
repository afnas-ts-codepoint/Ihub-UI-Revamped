import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

import type { TrackedTask } from '../../types/queue.types';
import { actionButtonClass } from '../actions/actionButtonStyles';
import { HomeSectionHead } from '../sections/HomeSectionHead';

export type TrackerCardProps = Readonly<{
  onOpen: (task: TrackedTask) => void;
  onUntrack: (id: string) => void;
  tasks: readonly TrackedTask[];
}>;

/**
 * The records the user follows: approved items, pinned or tracked incidents,
 * assigned job orders and items sent back. Each row opens its incident or
 * task; the X stops tracking it. Renders nothing while the list is empty.
 * @prototype index.html:L14630 Tracker card
 */
export function TrackerCard({ onOpen, onUntrack, tasks }: TrackerCardProps) {
  const { t } = useTranslation('home');
  if (tasks.length === 0) return null;

  return (
    <div
      className="rounded-lg border border-line bg-surface p-5"
      data-testid="tracker"
    >
      <HomeSectionHead
        title={
          <span className="inline-flex items-center gap-2">
            <span className="pulse-soft size-2 rounded-full bg-accent" />
            {t('overview.tracker.title')}
          </span>
        }
      />
      <div className="mt-1 flex flex-col gap-2">
        {tasks.map((task) => (
          <div
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-[11px] transition-colors hover:border-line-strong',
              task.returned
                ? 'border-[color-mix(in_srgb,var(--bad)_35%,var(--line))] bg-[color-mix(in_srgb,var(--bad)_6%,transparent)]'
                : 'border-line',
            )}
            data-testid={`tracker-row-${task.id}`}
            key={task.id}
            onClick={() => {
              onOpen(task);
            }}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpen(task);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full',
                task.returned
                  ? 'bg-[color-mix(in_srgb,var(--bad)_15%,transparent)] text-bad'
                  : 'bg-accent-dim text-accent',
              )}
            >
              <Icon name={task.returned ? 'refresh' : 'trend'} size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base-plus leading-[1.35] font-semibold">
                {task.title}
              </div>
              {task.returned ? (
                <Chip className="mt-1 gap-1 border-transparent bg-[color-mix(in_srgb,var(--bad)_12%,transparent)] text-2xs text-bad">
                  <Icon name="refresh" size={10} />
                  {t('overview.needs.returned')}
                </Chip>
              ) : task.assigned ? (
                <Chip className="mt-1 gap-1 text-2xs" tone="accent">
                  <Icon name="users" size={10} />
                  {t('overview.tracker.assignedToYou')}
                </Chip>
              ) : null}
              <div className="flex items-center gap-1.5 text-sm text-fg-3">
                <span className="num">{task.id}</span>
                <span aria-hidden="true" className="text-line-strong">
                  {'·'}
                </span>
                <span className="capitalize">
                  {task.assigned
                    ? t('overview.tracker.assigned')
                    : (task.when ?? t('overview.tracker.justNow'))}
                </span>
              </div>
            </div>
            <button
              aria-label={t('overview.tracker.untrack')}
              className={cn(actionButtonClass('ghost', 'sm'), 'w-[30px] shrink-0 px-0')}
              onClick={(event) => {
                event.stopPropagation();
                onUntrack(task.id);
              }}
              type="button"
            >
              <Icon name="close" size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
