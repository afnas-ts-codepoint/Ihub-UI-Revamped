import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/icon/Icon';

import { actionButtonClass } from '../actions/actionButtonStyles';
import { useHomeQueueActions } from '../../hooks/useHomeQueueActions';
import { useHomeQueueStore } from '../../store/homeQueue.store';
import type { QueueIncident } from '../../types/queue.types';
import { FEED_TONE, SEVERITY_TONE, SLA_TEXT_TONE } from './drawerTones';
import {
  DrawerBlock,
  DrawerFooter,
  DrawerScroll,
  FooterSpacer,
  MetaCell,
  MetaGrid,
  NoteBox,
} from './DrawerParts';
import { RecordHistory } from './RecordHistory';

/**
 * Live-updates timeline. The connector line uses logical offsets so it stays
 * on the correct side in RTL (the prototype's `left: 12` is physical).
 * @prototype ihub/index.html:L13403-L13476 timeline
 */
function LiveUpdates({ feed }: Readonly<{ feed: QueueIncident['feed'] }>) {
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

/**
 * Incident workflow body and footer.
 * @prototype ihub/index.html:L13087-L13614 `WorkflowDrawer` (type 'incident')
 */
export function IncidentBody({ item }: Readonly<{ item: QueueIncident }>) {
  const { t } = useTranslation('homeWorkflow');
  const { actOnIncident } = useHomeQueueActions();
  const closeDrawer = useHomeQueueStore((state) => state.closeDrawer);
  const percent = Math.round(item.progress * 100);

  return (
    <>
      <DrawerScroll>
        <DrawerBlock icon="help" label={t('drawer.blocks.whatHappened')}>
          <p className="m-0 text-md leading-[1.6] text-fg-2">{item.detail}</p>
        </DrawerBlock>
        <MetaGrid>
          <MetaCell label={t('drawer.meta.owner')} value={item.owner} />
          <MetaCell label={t('drawer.meta.location')} value={item.location} />
          <MetaCell label={t('drawer.meta.opened')} value={item.opened} />
          <MetaCell
            label={t('drawer.meta.sla')}
            toneClass={SLA_TEXT_TONE[item.sla]}
            value={item.slaLabel}
          />
        </MetaGrid>
        <DrawerBlock icon="trend" label={t('drawer.blocks.progress')}>
          <div
            aria-label={t('drawer.blocks.progress')}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={percent}
            className="h-2 overflow-hidden rounded-full bg-inset"
            role="progressbar"
          >
            <div
              className={cn(
                'h-full rounded-full',
                SEVERITY_TONE[item.severity].bar,
              )}
              style={{ width: `${String(percent)}%` }}
            />
          </div>
          <div className="num mt-1.5 text-sm text-fg-3">
            {t('drawer.progressCaption', {
              pct: percent,
              when: item.lastUpdate,
            })}
          </div>
        </DrawerBlock>
        <DrawerBlock icon="clock" label={t('drawer.blocks.history')}>
          <RecordHistory id={item.id} kind="incident" status={item.status} />
        </DrawerBlock>
        <DrawerBlock icon="activity" label={t('drawer.blocks.liveUpdates')}>
          <LiveUpdates feed={item.feed} />
        </DrawerBlock>
        <DrawerBlock icon="mail" label={t('drawer.blocks.note')}>
          <NoteBox />
        </DrawerBlock>
      </DrawerScroll>
      <DrawerFooter>
        <button
          className={`${actionButtonClass('primary')} gap-2.5`}
          onClick={() => {
            actOnIncident('pin', item);
          }}
          type="button"
        >
          <Icon name="pin" size={15} />
          {item.pinned ? t('drawer.footer.unpin') : t('drawer.footer.pin')}
        </button>
        <button
          className={`${actionButtonClass('secondary')} gap-2.5`}
          onClick={() => {
            actOnIncident('escalate', item);
          }}
          type="button"
        >
          <Icon name="trend" size={14} />
          {t('drawer.footer.escalate')}
        </button>
        <button
          className={actionButtonClass('ghost')}
          onClick={closeDrawer}
          type="button"
        >
          {t('drawer.footer.assign')}
        </button>
        <FooterSpacer />
        <button
          className={`${actionButtonClass('ghost')} text-bad`}
          onClick={() => {
            actOnIncident('dismiss', item);
          }}
          type="button"
        >
          {t('drawer.footer.resolve')}
        </button>
      </DrawerFooter>
    </>
  );
}
