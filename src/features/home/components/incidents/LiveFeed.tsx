import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

import type { QueueIncident, RejectedEntry } from '../../types/queue.types';
import { HomeSectionHead } from '../sections/HomeSectionHead';
import { SEVERITY_TONE, capitalise } from '../workflow-drawer/drawerTones';
import { FeedTimeline } from './FeedTimeline';

export type LiveFeedProps = Readonly<{
  onDismissRejected?: (id: string) => void;
  onOpen: (incident: QueueIncident) => void;
  onUnpin: (incident: QueueIncident) => void;
  pinned: readonly QueueIncident[];
  rejected?: readonly RejectedEntry[];
}>;

const BAD_BORDER = 'border-[color-mix(in_srgb,var(--bad)_28%,var(--line))]';

type IconButtonProps = Readonly<{
  icon: 'close';
  label: string;
  onClick: () => void;
}>;

/** @prototype index.html:L10374-L10393 `IconBtn` */
function IconButton({ icon, label, onClick }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-8 shrink-0 items-center justify-center rounded-sm px-[7px] text-fg-3 transition-colors hover:bg-raised hover:text-fg"
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon name={icon} size={15} />
    </button>
  );
}

/**
 * Pinned/tracked incidents with their live-update timelines, and the rejected
 * approvals. Both render when present; with nothing pinned the feed shows its
 * empty hint.
 * @prototype index.html:L13868-L13918 `LiveFeed`
 */
export function LiveFeed({
  onDismissRejected,
  onOpen,
  onUnpin,
  pinned,
  rejected = [],
}: LiveFeedProps) {
  const { t } = useTranslation('home');

  const rejectedBlock = rejected.length ? (
    <div
      className={cn('rounded-lg border bg-surface p-5', BAD_BORDER)}
      data-testid="rejected-feed"
    >
      <HomeSectionHead
        right={<Chip className="px-[9px] py-[3px] text-xs font-medium">{rejected.length}</Chip>}
        title={
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-bad" />
            {t('liveFeed.rejected')}
          </span>
        }
      />
      <div className="flex flex-col gap-2.5">
        {rejected.map((entry) => (
          <div
            className="flex items-center gap-2.5 rounded-lg bg-[color-mix(in_srgb,var(--bad)_7%,var(--bg-2))] px-3 py-2.5"
            key={`rejected-${entry.id}`}
          >
            <span className="flex text-bad">
              <Icon name="close" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base-plus font-semibold">{entry.title}</div>
              <div className="num text-xs text-fg-3">
                {`${entry.id}${entry.owner ? ` · ${entry.owner}` : ''} · ${t('liveFeed.rejectedLower')} ${t('liveFeed.justNow')}`}
              </div>
            </div>
            {onDismissRejected ? (
              <IconButton
                icon="close"
                label={t('liveFeed.dismiss')}
                onClick={() => {
                  onDismissRejected(entry.id);
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  ) : null;

  if (pinned.length === 0) {
    return (
      <>
        {rejectedBlock}
        <div className="rounded-lg border border-line bg-surface p-5" data-testid="live-feed">
          <HomeSectionHead title={t('liveFeed.titleEmpty')} />
          <div className="flex flex-col items-center gap-2 py-6 text-center text-base text-fg-3">
            <Icon className="text-fg-4" name="pin" size={20} />
            {t('liveFeed.empty')}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {rejectedBlock}
      <div
        className={cn('rounded-lg border bg-surface p-5', BAD_BORDER)}
        data-testid="live-feed"
      >
        <HomeSectionHead
          right={
            <Chip className="px-[9px] py-[3px] text-xs font-medium">
              {`${String(pinned.length)} ${t('liveFeed.tracked')}`}
            </Chip>
          }
          title={
            <span className="inline-flex items-center gap-2">
              <span className="pulse-soft size-2 rounded-full bg-bad" />
              {t('liveFeed.title')}
            </span>
          }
        />
        <div className="flex flex-col gap-4">
          {pinned.map((incident, index) => (
            <div
              className={index ? 'border-t border-line pt-4' : undefined}
              key={incident.id}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <button
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lg bg-raised px-3 py-2.5 text-start"
                  onClick={() => {
                    onOpen(incident);
                  }}
                  type="button"
                >
                  <span className={cn('flex', SEVERITY_TONE[incident.severity].text)}>
                    <Icon name={incident.icon} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base-plus font-semibold">
                      {incident.title}
                    </span>
                    <span className="num block text-xs text-fg-3">
                      {`${incident.id} · ${incident.owner}`}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      SEVERITY_TONE[incident.severity].text,
                    )}
                  >
                    {capitalise(incident.severity)}
                  </span>
                </button>
                <IconButton
                  icon="close"
                  label={t('liveFeed.unpin')}
                  onClick={() => {
                    onUnpin(incident);
                  }}
                />
              </div>
              <FeedTimeline feed={incident.feed} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
