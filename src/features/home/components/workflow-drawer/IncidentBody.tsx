import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/icon/Icon';

import { actionButtonClass } from '../actions/actionButtonStyles';
import { useHomeQueueActions } from '../../hooks/useHomeQueueActions';
import { useHomeQueueStore } from '../../store/homeQueue.store';
import type { QueueIncident } from '../../types/queue.types';
import { FeedTimeline } from '../incidents/FeedTimeline';
import { SEVERITY_TONE, SLA_TEXT_TONE } from './drawerTones';
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
          <FeedTimeline feed={item.feed} />
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
