import { Download, Eye, Folder, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CollapsiblePanel } from './CollapsiblePanel';
import { PanelIntro } from './FieldGrid';
import { TASK_VIEW_ATTACHMENTS, type AttachmentFixture } from '../../data/taskView.mock';
import { toast } from '@/shared/ui/feedback/Toaster';
import { DialogBody, DialogContent, DialogHeader, DialogRoot, DialogTitle } from '@/shared/ui/overlay/Dialog';

/**
 * Attachments — read-only: view opens a metadata-only preview (the fixture
 * carries no real `File`, matching the prototype's placeholder branch of
 * `openAttachPreview`), download shows a toast (no real download — the
 * prototype's `downloadReal` falls back to a "Downloading…" toast when there
 * is no `.file`). No upload dropzone and no remove control in read-only mode.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18260-L18298 (`openAttachPreview`,
 * `downloadReal`, `previewModal`), L18266-L18281 (`attachmentsPanel`).
 */
export function AttachmentsPanel() {
  const { t } = useTranslation('taskView');
  const [preview, setPreview] = useState<AttachmentFixture | null>(null);

  // Matches the prototype's literal "Downloading…" toast (no filename), since
  // this fixture carries no real File to trigger an actual download.
  const download = () => {
    toast(t('attachments.downloading'));
  };

  return (
    <CollapsiblePanel icon={Folder} title={t('attachments.title')}>
      <PanelIntro>{t('attachments.intro')}</PanelIntro>
      <div className="flex flex-col gap-2.5">
        {TASK_VIEW_ATTACHMENTS.map((attachment) => (
          <div
            className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5"
            key={attachment.name}
          >
            <span className="flex size-8.5 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-accent">
              <Folder aria-hidden size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-sm-plus font-semibold">{attachment.name}</p>
              <p className="m-0 text-xs-plus text-fg-3">
                {`${attachment.size} · ${attachment.by} · ${attachment.when}`}
              </p>
            </div>
            <button
              aria-label={`${t('attachments.view')} ${attachment.name}`}
              className="flex size-7.5 items-center justify-center rounded-lg text-fg-3 hover:bg-inset"
              onClick={() => {
                setPreview(attachment);
              }}
              type="button"
            >
              <Eye aria-hidden size={14} />
            </button>
            <button
              aria-label={`${t('attachments.download')} ${attachment.name}`}
              className="flex size-7.5 items-center justify-center rounded-lg text-fg-3 hover:bg-inset"
              onClick={() => {
                download();
              }}
              type="button"
            >
              <Download aria-hidden size={14} />
            </button>
          </div>
        ))}
        {TASK_VIEW_ATTACHMENTS.length === 0 ? (
          <p className="m-0 rounded-lg border border-dashed border-line-strong py-4.5 text-center text-xs-plus text-fg-4">
            {t('attachments.empty')}
          </p>
        ) : null}
      </div>

      <DialogRoot
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        open={preview !== null}
      >
        <DialogContent className="w-[min(480px,calc(100%-32px))]">
          {preview ? (
            <>
              <DialogHeader>
                <DialogTitle className="truncate text-sm-plus font-semibold">{preview.name}</DialogTitle>
                <button
                  aria-label={t('attachments.close')}
                  className="ms-auto flex size-8 items-center justify-center rounded-lg text-fg-3 hover:bg-inset"
                  onClick={() => {
                    setPreview(null);
                  }}
                  type="button"
                >
                  <X aria-hidden size={16} />
                </button>
              </DialogHeader>
              <DialogBody className="items-center gap-3.5 bg-raised text-center">
                <span className="flex size-18 items-center justify-center rounded-2xl bg-accent-dim text-accent">
                  <Folder aria-hidden size={32} />
                </span>
                <p className="m-0 text-xs-plus text-fg-3">
                  {[preview.size, preview.by, preview.when].filter(Boolean).join(' · ')}
                </p>
              </DialogBody>
              <div className="flex justify-end gap-2 border-t border-line bg-inset px-5.5 py-3.5">
                <button
                  className="rounded-lg px-3.5 py-2 text-sm font-semibold text-fg-2 hover:bg-surface"
                  onClick={() => {
                    setPreview(null);
                  }}
                  type="button"
                >
                  {t('attachments.close')}
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink"
                  onClick={() => {
                    download();
                  }}
                  type="button"
                >
                  <Download aria-hidden size={13} />
                  {t('attachments.download')}
                </button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </DialogRoot>
    </CollapsiblePanel>
  );
}
