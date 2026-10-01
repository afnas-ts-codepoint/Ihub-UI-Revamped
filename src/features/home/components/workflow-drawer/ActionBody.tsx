import { useTranslation } from 'react-i18next';

import { Icon } from '@/shared/ui/icon/Icon';

import { actionButtonClass } from '../actions/actionButtonStyles';
import { useHomeQueueActions } from '../../hooks/useHomeQueueActions';
import { useHomeQueueStore } from '../../store/homeQueue.store';
import type { QueueAction } from '../../types/queue.types';
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
 * Attachment rows. The prototype rows look clickable but have no handler.
 * @prototype ihub/index.html:L13366-L13382
 */
function AttachmentList({ files }: Readonly<{ files: readonly string[] }>) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {files.map((file) => (
        <li
          className="flex items-center gap-2.5 rounded border border-line px-3 py-2.5 text-base transition-colors hover:border-line-strong hover:bg-raised"
          key={file}
        >
          <Icon className="text-fg-3" name="receipt" size={15} />
          <span className="flex-1">{file}</span>
          <Icon className="text-fg-4" name="download" size={14} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Approval workflow body and footer. Reaches only the purchase, contract,
 * overtime and leave kinds in practice (the store routes the rest to the Form
 * Preview), but renders any queue action.
 * @prototype ihub/index.html:L13087-L13497 `WorkflowDrawer` (type 'action')
 */
export function ActionBody({
  item,
  verify,
}: Readonly<{ item: QueueAction; verify: boolean }>) {
  const { t } = useTranslation('homeWorkflow');
  const { actOnAction } = useHomeQueueActions();
  const closeDrawer = useHomeQueueStore((state) => state.closeDrawer);

  return (
    <>
      <DrawerScroll>
        <DrawerBlock icon="help" label={t('drawer.blocks.whyNeedsYou')}>
          <p className="m-0 text-md leading-[1.6] text-fg-2">{item.reason}</p>
        </DrawerBlock>
        <MetaGrid>
          <MetaCell label={t('drawer.meta.requestOwner')} value={item.owner} />
          <MetaCell label={t('drawer.meta.department')} value={item.dept} />
          <MetaCell label={t('drawer.meta.amount')} mono value={item.amount} />
          <MetaCell label={t('drawer.meta.status')} value={item.status} />
        </MetaGrid>
        {item.impact ? (
          <DrawerBlock icon="dollar" label={t('drawer.blocks.impact')}>
            <div className="rounded-lg border border-line bg-raised px-[15px] py-[13px] text-base-plus leading-[1.55] text-fg-2">
              {item.impact}
            </div>
          </DrawerBlock>
        ) : null}
        <DrawerBlock icon="clock" label={t('drawer.blocks.history')}>
          <RecordHistory id={item.id} kind="request" status={item.status} />
        </DrawerBlock>
        {item.attachments.length > 0 ? (
          <DrawerBlock icon="folder" label={t('drawer.blocks.attachments')}>
            <AttachmentList files={item.attachments} />
          </DrawerBlock>
        ) : null}
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
            actOnAction('approve', item);
          }}
          type="button"
        >
          <Icon name="check" size={15} />
          {verify
            ? t('drawer.footer.verify')
            : item.recommended || t('drawer.footer.approve')}
        </button>
        <button
          className={actionButtonClass('secondary')}
          onClick={() => {
            actOnAction('reject', item);
          }}
          type="button"
        >
          {t('drawer.footer.reject')}
        </button>
        <button
          className={actionButtonClass('ghost')}
          onClick={closeDrawer}
          type="button"
        >
          {t('drawer.footer.clarify')}
        </button>
        <FooterSpacer />
        <button
          aria-label={t('drawer.footer.escalateTitle')}
          className={actionButtonClass('ghost')}
          onClick={() => {
            actOnAction('escalate', item);
          }}
          title={t('drawer.footer.escalateTitle')}
          type="button"
        >
          <Icon name="trend" size={15} />
        </button>
      </DrawerFooter>
    </>
  );
}
