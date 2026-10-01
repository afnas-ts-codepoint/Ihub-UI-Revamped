import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/shared/ui/icon/Icon';
import {
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

import { SEND_BACK_OTHER, SEND_BACK_REASONS } from '../../constants/sendBackReasons';
import { useHomeQueueActions } from '../../hooks/useHomeQueueActions';
import { useHomeQueueStore } from '../../store/homeQueue.store';
import type { QueueAction } from '../../types/queue.types';
import { actionButtonClass } from './actionButtonStyles';

function SendBackForm({ item }: Readonly<{ item: QueueAction }>) {
  const { t } = useTranslation('home');
  const { actOnAction } = useHomeQueueActions();
  const closeSendBack = useHomeQueueStore((state) => state.closeSendBack);
  // Local state lives with the form, so it resets whenever the dialog closes.
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const blocked = category === SEND_BACK_OTHER && !reason.trim();

  const submit = () => {
    if (blocked) return;
    // The category is stored as its English label in every locale (prototype).
    const stored = [category, reason].filter(Boolean).join(': ');
    actOnAction('sendback', item, stored || t('sendBack.noReason'));
    closeSendBack();
  };

  return (
    <DialogContent className="w-[min(440px,calc(100%-32px))] gap-3.5 rounded-lg p-[22px]">
      <div className="flex items-center gap-2.5">
        <span className="flex size-[34px] shrink-0 items-center justify-center rounded-menu bg-accent-dim text-accent">
          <Icon name="refresh" size={17} />
        </span>
        <div className="min-w-0">
          <DialogTitle className="m-0 text-xl font-semibold">
            {t('sendBack.title')}
          </DialogTitle>
          <DialogDescription className="truncate text-sm-plus text-fg-3">
            {item.title}
          </DialogDescription>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-fg-2">
          {t('sendBack.reason')}
        </span>
        <div className="flex flex-wrap gap-[7px]">
          {SEND_BACK_REASONS.map((entry) => {
            const on = category === entry.label;
            return (
              <button
                aria-pressed={on}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm-plus font-medium ${
                  on
                    ? 'chip-tone-accent'
                    : 'border-line bg-surface text-fg-2'
                }`}
                key={entry.key}
                onClick={() => {
                  setCategory(on ? '' : entry.label);
                }}
                type="button"
              >
                {t(`sendBack.reasons.${entry.key}`)}
              </button>
            );
          })}
        </div>
      </div>
      <textarea
        aria-label={t('sendBack.reason')}
        className="min-h-[70px] w-full resize-y rounded border border-line-strong bg-raised px-[11px] py-[9px] text-base text-fg outline-none placeholder:text-fg-4 focus:border-accent"
        onChange={(event) => {
          setReason(event.currentTarget.value);
        }}
        placeholder={t('sendBack.placeholder')}
        value={reason}
      />
      <div className="flex gap-2.5">
        <button
          className={`${actionButtonClass('primary')} flex-1 gap-[7px]`}
          disabled={blocked}
          onClick={submit}
          type="button"
        >
          <Icon name="refresh" size={15} />
          {t('sendBack.submit')}
        </button>
        <button
          className={actionButtonClass('ghost')}
          onClick={closeSendBack}
          type="button"
        >
          {t('sendBack.cancel')}
        </button>
      </div>
    </DialogContent>
  );
}

/**
 * Self-contained send-back dialog driven by `sendbackFor` in the queue store.
 * Escape closes it like Cancel — a recorded deviation: the prototype only
 * closed on a scrim click.
 * @prototype ihub/index.html:L12740 `sendbackFor` portal
 */
export function SendBackDialog() {
  const sendbackFor = useHomeQueueStore((state) => state.sendbackFor);
  const closeSendBack = useHomeQueueStore((state) => state.closeSendBack);

  return (
    <DialogRoot
      onOpenChange={(open) => {
        if (!open) closeSendBack();
      }}
      open={sendbackFor !== null}
    >
      {sendbackFor ? (
        <SendBackForm item={sendbackFor} key={sendbackFor.id} />
      ) : null}
    </DialogRoot>
  );
}
