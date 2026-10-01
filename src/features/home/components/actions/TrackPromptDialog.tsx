import { useTranslation } from 'react-i18next';

import { Icon } from '@/shared/ui/icon/Icon';
import {
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

import { useHomeQueueActions } from '../../hooks/useHomeQueueActions';
import { useHomeQueueStore } from '../../store/homeQueue.store';
import { actionButtonClass } from './actionButtonStyles';

/**
 * Self-contained "Decision recorded" prompt driven by `trackPrompt` in the
 * queue store (set only by a single approve). Scrim/Escape = "Not now".
 * @prototype ihub/index.html:L12740 `trackPrompt` portal
 */
export function TrackPromptDialog() {
  const { t } = useTranslation('home');
  const { trackItem } = useHomeQueueActions();
  const trackPrompt = useHomeQueueStore((state) => state.trackPrompt);
  const dismissTrackPrompt = useHomeQueueStore(
    (state) => state.dismissTrackPrompt,
  );

  return (
    <DialogRoot
      onOpenChange={(open) => {
        if (!open) dismissTrackPrompt();
      }}
      open={trackPrompt !== null}
    >
      {trackPrompt ? (
        <DialogContent className="w-[min(420px,calc(100%-32px))] rounded-lg p-6">
          <div className="mb-3.5 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--ok)_14%,transparent)] text-ok">
              <Icon name="check" size={20} />
            </span>
            <div className="min-w-0">
              <DialogTitle className="m-0 text-lg-plus font-semibold">
                {t('trackPrompt.title')}
              </DialogTitle>
              <div className="num text-sm-plus font-semibold text-fg-3">
                {trackPrompt.id}
              </div>
            </div>
          </div>
          <DialogDescription className="mb-5 text-md leading-[1.55] text-fg-2">
            {t('trackPrompt.body')}
          </DialogDescription>
          <div className="flex justify-end gap-2.5">
            <button
              className={actionButtonClass('ghost')}
              onClick={dismissTrackPrompt}
              type="button"
            >
              {t('trackPrompt.notNow')}
            </button>
            <button
              className={actionButtonClass('primary')}
              onClick={trackItem}
              type="button"
            >
              <Icon name="trend" size={15} />
              {t('trackPrompt.track')}
            </button>
          </div>
        </DialogContent>
      ) : null}
    </DialogRoot>
  );
}
