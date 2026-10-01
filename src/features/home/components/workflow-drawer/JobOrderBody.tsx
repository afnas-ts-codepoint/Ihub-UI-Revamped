import { useTranslation } from 'react-i18next';

import { Icon } from '@/shared/ui/icon/Icon';

import { actionButtonClass } from '../actions/actionButtonStyles';
import { useHomeQueueActions } from '../../hooks/useHomeQueueActions';
import { useHomeQueueStore } from '../../store/homeQueue.store';
import type { QueueJobOrder } from '../../types/queue.types';
import {
  DrawerBlock,
  DrawerFooter,
  DrawerScroll,
  DrawerSteps,
  FooterSpacer,
  MetaCell,
  MetaGrid,
  NoteBox,
} from './DrawerParts';
import { RecordHistory } from './RecordHistory';

/**
 * Task workflow body and footer for a job order.
 * @prototype ihub/index.html:L13087-L13614 `WorkflowDrawer` (type 'jo')
 */
export function JobOrderBody({ item }: Readonly<{ item: QueueJobOrder }>) {
  const { t } = useTranslation('homeWorkflow');
  const { actOnJobOrder } = useHomeQueueActions();
  const closeDrawer = useHomeQueueStore((state) => state.closeDrawer);

  return (
    <>
      <DrawerScroll>
        <DrawerBlock icon="help" label={t('drawer.blocks.whyNeedsYou')}>
          <p className="m-0 text-md leading-[1.6] text-fg-2">{item.detail}</p>
        </DrawerBlock>
        <MetaGrid>
          <MetaCell label={t('drawer.meta.location')} value={item.location} />
          <MetaCell label={t('drawer.meta.requestorDept')} value={item.dept} />
          <MetaCell label={t('drawer.meta.partner')} value={item.partner} />
          <MetaCell
            label={t('drawer.meta.type')}
            value={
              item.kind === 'internal'
                ? t('drawer.meta.internal')
                : t('drawer.meta.external')
            }
          />
        </MetaGrid>
        <DrawerBlock icon="clock" label={t('drawer.blocks.history')}>
          <RecordHistory id={item.id} kind="task" status={item.status} />
        </DrawerBlock>
        <DrawerBlock accent icon="sparkle" label={t('drawer.blocks.nextSteps')}>
          <DrawerSteps steps={item.steps} />
        </DrawerBlock>
        <DrawerBlock icon="mail" label={t('drawer.blocks.note')}>
          <NoteBox />
        </DrawerBlock>
      </DrawerScroll>
      <DrawerFooter>
        <button
          className={`${actionButtonClass('primary')} gap-2.5`}
          onClick={() => {
            actOnJobOrder('assign', item);
          }}
          type="button"
        >
          <Icon name="check" size={15} />
          {t('drawer.footer.assignApprove')}
        </button>
        <button
          className={actionButtonClass('secondary')}
          onClick={closeDrawer}
          type="button"
        >
          {t('drawer.footer.addComment')}
        </button>
        <FooterSpacer />
        <button
          className={`${actionButtonClass('ghost')} text-bad`}
          onClick={() => {
            actOnJobOrder('dismiss', item);
          }}
          type="button"
        >
          {t('drawer.footer.dismiss')}
        </button>
      </DrawerFooter>
    </>
  );
}
