import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/icon/Icon';

import type { QueueIncident } from '../../types/queue.types';
import { FEED_TONE } from '../workflow-drawer/drawerTones';

/**
 * Incident live-updates timeline (drawer and Live feed). The connector line uses logical offsets so it stays
 * on the correct side in RTL (the prototype's `left: 12` is physical).
 * @prototype ihub/index.html:L13403-L13476 timeline; index.html:L13791-L13867 `FeedTimeline`
 */
export function FeedTimeline({ feed }: Readonly<{ feed: QueueIncident['feed'] }>) {
  return (
    <ol className="relative m-0 list-none p-0 ps-1">
      {feed.map((entry, index) => {
        const tone = FEED_TONE[entry.type];
        const last = index === feed.length - 1;
        return (
          <li
            className={cn('relative flex gap-3', !last && 'pb-3.5')}
            key={`${entry.t}-${entry.who}-${entry.text}`}
          >
            {last ? null : (
              <span
                aria-hidden="true"
                className="absolute start-3 top-[26px] bottom-0 w-px bg-line"
              />
            )}
            <span
              className={cn(
                'z-[1] flex size-[25px] shrink-0 items-center justify-center rounded-full border-[1.5px] bg-surface',
                tone.border,
                tone.text,
              )}
            >
              <Icon name={tone.icon} size={13} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <span className={cn('text-sm-plus font-semibold', tone.text)}>
                  {entry.who}
                </span>
                <span className="num text-xs text-fg-4">{entry.t}</span>
              </div>
              <div className="mt-0.5 text-base leading-[1.45] text-fg-2">
                {entry.text}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
