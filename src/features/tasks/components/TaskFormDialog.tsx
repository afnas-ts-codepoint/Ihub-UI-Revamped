import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CreateTaskForm, type TaskFormPrefill } from './CreateTaskForm';
import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

export type TaskFormDialogMode = 'createFromIncident';
export type TaskFormDialogPresentation = 'modal';

type TaskFormDialogProps = Readonly<{
  mode: TaskFormDialogMode;
  onCancel: () => void;
  onConfirm: () => void;
  prefill: TaskFormPrefill;
  presentation: TaskFormDialogPresentation;
  sourceId: string;
}>;

/**
 * Modal presentation of the canonical create form (M9.1 §3). The caller owns the
 * confirm effect; the embedded form fields are decorative for this flow, exactly as
 * in the prototype, where Create only converts the source record.
 * Render it only while open — it is keyed by the caller so each open starts fresh.
 */
export function TaskFormDialog({ mode, onCancel, onConfirm, prefill, presentation, sourceId }: TaskFormDialogProps) {
  const { t } = useTranslation('taskCreate');

  return (
    <DialogRoot onOpenChange={(open) => { if (!open) onCancel(); }} open>
      <DialogContent
        className="w-[min(1080px,calc(100%-32px))] bg-canvas"
        data-mode={mode}
        data-presentation={presentation}
      >
        <DialogHeader className="bg-surface px-5 py-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
            <DialogTitle className="text-md font-semibold">{t('dialog.raise')}</DialogTitle>
            <span className="text-sm text-fg-3">{t('dialog.fromIncident')}</span>
            <span className="num text-base font-semibold text-accent">{sourceId}</span>
          </div>
          <button aria-label={t('dialog.close')} className="inline-flex size-[34px] items-center justify-center rounded-lg text-fg-2 hover:bg-inset" onClick={() => { onCancel(); }} type="button"><X aria-hidden size={16} /></button>
        </DialogHeader>
        <DialogBody className="gap-4 p-5">
          <CreateTaskForm initialValues={prefill} presentation="modal" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-fg-3">{t('dialog.note')}</span>
            <div className="ms-auto flex gap-2">
              <button className="rounded-lg px-3 py-2 text-sm font-semibold text-fg-2" onClick={() => { onCancel(); }} type="button">{t('actions.cancel')}</button>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink" onClick={() => { onConfirm(); }} type="button"><Check aria-hidden size={14} />{t('actions.create')}</button>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
