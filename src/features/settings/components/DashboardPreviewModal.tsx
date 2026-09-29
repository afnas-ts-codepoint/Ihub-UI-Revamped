import { useTranslation } from 'react-i18next';

import { DashboardSchematicPreview } from './DashboardSchematicPreview';
import type { DashboardBuilderState } from '../hooks/useDashboardBuilder';
import {
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';
import { Icon } from '@/shared/ui/icon/Icon';

type DashboardPreviewModalProps = Readonly<{ builder: DashboardBuilderState }>;

/**
 * Full-size read-only preview modal (opened from the preview card's expand
 * button, or a saved-configuration library entry's Preview eye icon).
 * Touches no persisted state.
 * @prototype index.html:L7421-L7426
 */
export function DashboardPreviewModal({ builder }: DashboardPreviewModalProps) {
  const { t } = useTranslation('settings');
  const request = builder.previewRequest;

  return (
    <DialogRoot
      onOpenChange={(open) => {
        if (!open) builder.closePreview();
      }}
      open={request !== null}
    >
      {request ? (
        <DialogContent
          aria-label={t('preview.dialogLabel')}
          className="w-[min(1320px,calc(100%-48px))] max-h-[90vh]"
        >
          <div className="flex items-center gap-3 border-b border-line px-5.5 py-3.5">
            <div className="min-w-0 flex-1">
              <DialogTitle className="m-0 text-base font-semibold">
                {t('preview.modalTitlePrefix')}
                {request.title}
              </DialogTitle>
              <div className="mt-0.5 font-mono text-xs text-fg-3">
                {request.cfg.ids.length}
                {' '}
                {t('preview.widgets')}
                {' · '}
                {request.cfg.cols}
                {' '}
                {request.cfg.cols === 1 ? t('preview.column') : t('preview.columns')}
              </div>
            </div>
            <DialogClose asChild>
              <button aria-label={t('preview.close')} className="rounded-lg p-1.5 text-fg-2 hover:bg-inset" type="button">
                <Icon name="close" size={16} />
              </button>
            </DialogClose>
          </div>
          <div className="overflow-y-auto p-5.5">
            <DashboardSchematicPreview
              cfg={request.cfg}
              device="desktop"
              height="calc(90vh - 170px)"
              widgets={builder.availableWidgets}
            />
          </div>
        </DialogContent>
      ) : null}
    </DialogRoot>
  );
}
