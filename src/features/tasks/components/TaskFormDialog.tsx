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

/** `createFromIncident`: Incident Workspace "Raise a task". `homeTask`: the Home Assigned and Live Incidents task form. */
export type TaskFormDialogMode = 'createFromIncident' | 'homeTask';
export type TaskFormDialogPresentation = 'modal';

type TaskFormDialogProps = Readonly<{
  onCancel: () => void;
  prefill: TaskFormPrefill;
  presentation: TaskFormDialogPresentation;
  sourceId: string;
}> &
  (
    | Readonly<{ mode: 'createFromIncident'; onConfirm: () => void }>
    | Readonly<{ mode: 'homeTask'; title: string }>
  );

/**
 * Modal presentation of the canonical create form (M9.1 §3). The caller owns the
 * confirm effect; the embedded form fields are decorative for this flow, exactly as
 * in the prototype, where Create only converts the source record. The `homeTask`
 * mode reproduces the Home modal chrome instead: the record id and title in the
 * header and a close button, with no footer.
 * Render it only while open — it is keyed by the caller so each open starts fresh.
 */
export function TaskFormDialog(props: TaskFormDialogProps) {
  const { mode, onCancel, prefill, presentation, sourceId } = props;
  const { t } = useTranslation('taskCreate');
  const closeButton = (
    <button aria-label={t('dialog.close')} className="inline-flex size-[34px] items-center justify-center rounded-lg text-fg-2 hover:bg-inset" onClick={() => { onCancel(); }} type="button"><X aria-hidden size={16} /></button>
  );

  return (
    <DialogRoot onOpenChange={(open) => { if (!open) onCancel(); }} open>
      <DialogContent
        className="w-[min(1080px,calc(100%-32px))] bg-canvas"
        data-mode={mode}
        data-presentation={presentation}
      >
        {props.mode === 'homeTask' ? (
          <>
            <DialogHeader className="bg-surface px-5 py-3">
              <span className="num shrink-0 text-base font-semibold text-accent">{sourceId}</span>
              <DialogTitle className="min-w-0 flex-1 truncate text-md font-semibold">{props.title}</DialogTitle>
              {closeButton}
            </DialogHeader>
            <DialogBody className="gap-4 p-5">
              <CreateTaskForm initialValues={prefill} presentation="modal" />
            </DialogBody>
          </>
        ) : (
          <>
            <DialogHeader className="bg-surface px-5 py-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
                <DialogTitle className="text-md font-semibold">{t('dialog.raise')}</DialogTitle>
                <span className="text-sm text-fg-3">{t('dialog.fromIncident')}</span>
                <span className="num text-base font-semibold text-accent">{sourceId}</span>
              </div>
              {closeButton}
            </DialogHeader>
            <DialogBody className="gap-4 p-5">
              <CreateTaskForm initialValues={prefill} presentation="modal" />
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-fg-3">{t('dialog.note')}</span>
                <div className="ms-auto flex gap-2">
                  <button className="rounded-lg px-3 py-2 text-sm font-semibold text-fg-2" onClick={() => { onCancel(); }} type="button">{t('actions.cancel')}</button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink" onClick={() => { props.onConfirm(); }} type="button"><Check aria-hidden size={14} />{t('actions.create')}</button>
                </div>
              </div>
            </DialogBody>
          </>
        )}
      </DialogContent>
    </DialogRoot>
  );
}
