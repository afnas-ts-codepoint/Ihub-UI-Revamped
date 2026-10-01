import { useTranslation } from 'react-i18next';

import {
  ActionSheetForm,
  PettyCashRequestForm,
  type ReviewDecisionHandler,
} from '@/features/payment-settlement';
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/icon/Icon';
import {
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

import { useHomeQueueActions } from '../../hooks/useHomeQueueActions';
import { useHomeQueueStore } from '../../store/homeQueue.store';
import type { FormModalState } from '../../types/queue.types';
import { actionButtonClass } from '../actions/actionButtonStyles';
import { eyebrowClass, MetaCell, MetaGrid } from '../workflow-drawer/DrawerParts';

const DASH = '—';

/**
 * Inline summary card for the budget and budget-release kinds (and any other
 * kind that reaches the Form Preview, e.g. a returned stub). It has no
 * attachments, steps or history, unlike the drawer's action body.
 * @prototype ihub/index.html:L12740 `formModal` summary branch
 */
function BudgetSummary({ modal }: Readonly<{ modal: FormModalState }>) {
  const { t } = useTranslation('homeWorkflow');
  const { actOnAction } = useHomeQueueActions();
  const closeFormModal = useHomeQueueStore((state) => state.closeFormModal);
  const openSendBack = useHomeQueueStore((state) => state.openSendBack);
  const { item } = modal;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className={eyebrowClass}>{t('drawer.blocks.whyNeedsYou')}</span>
        <p className="m-0 text-md leading-[1.6] text-fg-2">{item.reason}</p>
      </div>
      <MetaGrid>
        <MetaCell
          label={t('drawer.meta.requestOwner')}
          value={item.owner || DASH}
        />
        <MetaCell label={t('drawer.meta.department')} value={item.dept || DASH} />
        <MetaCell
          label={t('drawer.meta.amount')}
          mono
          value={item.amount || DASH}
        />
        <MetaCell label={t('drawer.meta.status')} value={item.status || DASH} />
      </MetaGrid>
      {item.impact ? (
        <div className="rounded-lg border border-line bg-raised px-[15px] py-[13px] text-base-plus leading-[1.55] text-fg-2">
          {item.impact}
        </div>
      ) : null}
      <div className="mt-1 flex flex-col gap-2.5">
        <button
          className={cn(actionButtonClass('primary'), 'w-full gap-[7px]')}
          onClick={() => {
            actOnAction('approve', item);
            closeFormModal();
          }}
          type="button"
        >
          <Icon name="check" size={15} />
          {modal.verify
            ? t('formPreview.verify')
            : t('formPreview.approve')}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={cn(actionButtonClass('ghost'), 'gap-[7px]')}
            onClick={() => {
              closeFormModal();
              openSendBack(item);
            }}
            type="button"
          >
            <Icon name="refresh" size={15} />
            {t('formPreview.sendBack')}
          </button>
          <button
            className={cn(actionButtonClass('ghost'), 'gap-[7px] text-bad')}
            onClick={() => {
              actOnAction('reject', item);
              closeFormModal();
            }}
            type="button"
          >
            <Icon name="close" size={15} />
            {t('formPreview.reject')}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormPreviewBody({ modal }: Readonly<{ modal: FormModalState }>) {
  const { actOnAction, resubmit } = useHomeQueueActions();
  const closeFormModal = useHomeQueueStore((state) => state.closeFormModal);
  const { item } = modal;

  const onDecision: ReviewDecisionHandler = (type, reason) => {
    if (type === 'submit') {
      // Resubmit only clears the tracker row (the store also closes the modal).
      resubmit(item.id);
      return;
    }
    actOnAction(type, item, reason);
    closeFormModal();
  };

  // The embedded forms are blank: the prototype never prefills them from the item.
  if (item.kind === 'action-sheet') {
    return (
      <ActionSheetForm
        embedded
        onDecision={onDecision}
        resubmit={modal.creator}
        review
        verify={modal.verify}
      />
    );
  }
  if (item.kind === 'petty-cash') {
    return (
      <PettyCashRequestForm
        onDecision={onDecision}
        resubmit={modal.creator}
        review
        verify={modal.verify}
      />
    );
  }
  return <BudgetSummary modal={modal} />;
}

function FormPreviewFrame({ modal }: Readonly<{ modal: FormModalState }>) {
  const { t } = useTranslation('homeWorkflow');
  const closeFormModal = useHomeQueueStore((state) => state.closeFormModal);

  return (
    <DialogRoot
      onOpenChange={(open) => {
        if (!open) closeFormModal();
      }}
      open
    >
      <DialogContent
        aria-describedby={undefined}
        className="top-[3vh] max-h-[94vh] w-[min(1080px,calc(100%-32px))] translate-y-0 rounded-lg bg-canvas shadow-drawer"
        data-testid="form-preview-dialog"
      >
        <header className="z-[2] flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3.5">
          <div className="min-w-0">
            <span className="num text-sm font-semibold text-accent">
              {modal.item.id}
            </span>
            <DialogTitle className="m-0 truncate text-lg font-semibold">
              {modal.item.title}
            </DialogTitle>
          </div>
          {/* "Close" is hard-coded English in the prototype; kept as an identical-in-both-locales key. */}
          <DialogClose asChild>
            <button
              aria-label={t('formPreview.close')}
              className="flex h-8 w-[34px] items-center justify-center rounded-sm text-fg-2 hover:bg-raised hover:text-fg"
              type="button"
            >
              <Icon name="close" size={16} />
            </button>
          </DialogClose>
        </header>
        <div className="overflow-y-auto p-5">
          <FormPreviewBody key={modal.item.id} modal={modal} />
        </div>
      </DialogContent>
    </DialogRoot>
  );
}

/**
 * The Form Preview dialog: opened for action-sheet, petty-cash and budget
 * kinds (and a creator's returned item, in resubmit mode). Self-contained: it
 * reads `formModal` from the home queue store.
 *
 * Deviation (recorded): Escape also closes it (the prototype closes on scrim
 * and the X button only) and focus is managed by Radix.
 * @prototype ihub/index.html:L12740 `formModal` portal
 */
export function FormPreviewDialog() {
  const formModal = useHomeQueueStore((state) => state.formModal);
  return formModal ? <FormPreviewFrame modal={formModal} /> : null;
}
