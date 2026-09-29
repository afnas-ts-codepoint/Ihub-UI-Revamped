import { Folder, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EditorField, inputClass, labelClass } from './TaskEditPanels';
import { toast } from '@/shared/ui/feedback/Toaster';
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

/**
 * Approve Task — a plain confirm dialog. Its body copy is a genuine
 * prototype copy/paste artifact (a generic "follow this item" message, not
 * approval-specific text) and is preserved verbatim rather than rewritten.
 * Confirming only closes the dialog and shows a toast; no task state is
 * mutated, matching the prototype's `confirmApprove`.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18861-L18877.
 */
export function ApproveTaskDialog({
  onOpenChange,
  open,
}: Readonly<{ onOpenChange: (open: boolean) => void; open: boolean }>) {
  const { t } = useTranslation('taskView');
  return (
    <DialogRoot onOpenChange={onOpenChange} open={open}>
      <DialogContent className="w-[min(420px,calc(100%-32px))]">
        <DialogHeader>
          <DialogTitle className="text-md font-semibold">{t('approveDialog.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="m-0 text-sm-plus text-fg-2">{t('approveDialog.body')}</p>
        </DialogBody>
        <DialogFooter className="justify-end">
          <button className="rounded-lg px-3.5 py-2 text-sm font-semibold text-fg-2" onClick={() => { onOpenChange(false); }} type="button">
            {t('approveDialog.cancel')}
          </button>
          <button
            className="rounded-lg bg-ok px-3.5 py-2 text-sm font-semibold text-white"
            onClick={() => {
              onOpenChange(false);
              toast(t('approveDialog.approved'));
            }}
            type="button"
          >
            {t('approveDialog.confirm')}
          </button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

type RemarksDialogProps = Readonly<{
  confirmLabel: string;
  confirmToneClassName: string;
  onConfirm: (remarks: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  placeholder: string;
  remarksLabel: string;
  requiredNote: string;
  title: string;
}>;

const REMARKS_MAX = 500;

/** Shared 500-char-capped remarks textarea + live counter, used identically by Reject and Close Task. */
function RemarksDialog({
  confirmLabel,
  confirmToneClassName,
  onConfirm,
  onOpenChange,
  open,
  placeholder,
  remarksLabel,
  requiredNote,
  title,
}: RemarksDialogProps) {
  const { t } = useTranslation('taskView');
  const [remarks, setRemarks] = useState('');
  const trimmed = remarks.trim();
  return (
    <DialogRoot
      onOpenChange={(next) => {
        if (!next) setRemarks('');
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent className="w-[min(480px,calc(100%-32px))]">
        <DialogHeader>
          <DialogTitle className="text-md font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <EditorField label={remarksLabel}>
            <textarea
              className={`${inputClass} resize-y`}
              onChange={(event) => { setRemarks(event.target.value.slice(0, REMARKS_MAX)); }}
              placeholder={placeholder}
              rows={4}
              value={remarks}
            />
          </EditorField>
          <p className="num m-0 text-xs text-fg-4">{`${String(remarks.length)}/${String(REMARKS_MAX)} ${t('rejectDialog.characters')}`}</p>
        </DialogBody>
        <DialogFooter className="flex-wrap items-center justify-between gap-3">
          <span className="text-xs-plus text-fg-3">{requiredNote}</span>
          <div className="flex gap-2">
            <button className="rounded-lg px-3.5 py-2 text-sm font-semibold text-fg-2" onClick={() => { onOpenChange(false); }} type="button">
              {t('rejectDialog.cancel')}
            </button>
            <button
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold disabled:opacity-50 ${confirmToneClassName}`}
              disabled={!trimmed}
              onClick={() => { onConfirm(trimmed); }}
              type="button"
            >
              {confirmLabel}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

/**
 * Reject Job Order — heading says "Job Order" (not "Task"), a genuine
 * prototype terminology inconsistency vs. the trigger button labeled
 * "Reject", preserved verbatim. Remarks are capped at 500 characters and
 * required (guard + disabled Confirm button); confirming only toasts and
 * clears the draft — no task stage/status is changed.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18880-L18903.
 */
export function RejectTaskDialog({
  onOpenChange,
  open,
}: Readonly<{ onOpenChange: (open: boolean) => void; open: boolean }>) {
  const { t } = useTranslation('taskView');
  return (
    <RemarksDialog
      confirmLabel={t('rejectDialog.confirm')}
      confirmToneClassName="bg-bad text-white"
      onConfirm={() => {
        onOpenChange(false);
        toast(t('rejectDialog.rejected'));
      }}
      onOpenChange={onOpenChange}
      open={open}
      placeholder={t('rejectDialog.remarksPlaceholder')}
      remarksLabel={t('rejectDialog.remarksLabel')}
      requiredNote={t('rejectDialog.remarksRequired')}
      title={t('rejectDialog.title')}
    />
  );
}

/**
 * Close Task — same 500-char-counter/required pattern as Reject. Confirming
 * only toasts and clears the draft — no task stage/status is changed.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18906-L18929.
 */
export function CloseTaskDialog({
  onOpenChange,
  open,
}: Readonly<{ onOpenChange: (open: boolean) => void; open: boolean }>) {
  const { t } = useTranslation('taskView');
  return (
    <RemarksDialog
      confirmLabel={t('closeDialog.confirm')}
      confirmToneClassName="bg-accent text-accent-ink"
      onConfirm={() => {
        onOpenChange(false);
        toast(t('closeDialog.closed'));
      }}
      onOpenChange={onOpenChange}
      open={open}
      placeholder={t('closeDialog.remarksPlaceholder')}
      remarksLabel={t('closeDialog.remarksLabel')}
      requiredNote={t('closeDialog.remarksRequired')}
      title={t('closeDialog.title')}
    />
  );
}

/** @prototype ihub/ORIGINAL_SOURCE.html:L18801 `ceoNotifyDepts`. */
const CEO_NOTIFY_DEPARTMENTS = [
  'Operations', 'Total Experience (TX)', 'Guest Services', 'Facilities', 'Maintenance',
  'Marketing', 'Procurement', 'Finance', 'HR', 'IT', 'QA & Compliance',
  'Franchise Operations', 'Development',
] as const;
/** @prototype ihub/ORIGINAL_SOURCE.html:L18823-L18825 `PRIO_OPTS`. */
const CEO_PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'] as const;
/** @prototype ihub/ORIGINAL_SOURCE.html:L18801 `ceoStatusOptions`. */
const CEO_STATUS_OPTIONS = ['In Progress', 'Completed', 'Closed'] as const;
/** Hardcoded, never derived from real task data — matches the prototype's own fixed `ceoCurrentStatus`. */
const CEO_CURRENT_STATUS = 'In Progress';

type CeoAttachment = Readonly<{ id: number; name: string; size: string }>;

function fileSizeLabel(size: number) {
  if (size < 1024) return `${String(size)} B`;
  if (size < 1_048_576) return `${String(Math.round(size / 1024))} KB`;
  return `${(size / 1_048_576).toFixed(1)} MB`;
}

/**
 * CEO Comments — Top Management Comments, Notify Department, Priority, a
 * User Status block (hardcoded "In Progress" current status + a status
 * select), and a file dropzone. The footer's "Process owner and assignee are
 * required" note is a leftover from the Redirect dialog's copy — this dialog
 * has no such fields, and Save performs zero validation of any kind
 * (`PROTOTYPE-NOOP(D2)`, already called out by the M8.6 task card).
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18801-L18858.
 */
export function CeoCommentsDialog({
  onOpenChange,
  open,
}: Readonly<{ onOpenChange: (open: boolean) => void; open: boolean }>) {
  const { t } = useTranslation('taskView');
  const [comment, setComment] = useState('');
  const [notify, setNotify] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [attachments, setAttachments] = useState<readonly CeoAttachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setComment(''); setNotify(''); setPriority(''); setStatus(''); setAttachments([]);
  };
  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setAttachments((current) => [
      ...current,
      ...Array.from(files).map((file, index) => ({ id: Date.now() + index, name: file.name, size: fileSizeLabel(file.size) })),
    ]);
  };

  return (
    <DialogRoot
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent className="w-[min(560px,calc(100%-32px))]">
        <DialogHeader>
          <DialogTitle className="text-md font-semibold">{t('ceoComments.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <EditorField label={t('ceoComments.commentsLabel')}>
            <textarea
              className={`${inputClass} resize-y`}
              onChange={(event) => { setComment(event.target.value); }}
              placeholder={t('ceoComments.commentsPlaceholder')}
              rows={4}
              value={comment}
            />
          </EditorField>
          <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
            <EditorField label={t('ceoComments.notifyDepartment')}>
              <select className={inputClass} onChange={(event) => { setNotify(event.target.value); }} value={notify}>
                <option value="">{t('ceoComments.notifyPlaceholder')}</option>
                {CEO_NOTIFY_DEPARTMENTS.map((department) => <option key={department}>{department}</option>)}
              </select>
            </EditorField>
            <EditorField label={t('ceoComments.priority')}>
              <select className={inputClass} onChange={(event) => { setPriority(event.target.value); }} value={priority}>
                <option value="">{t('ceoComments.priorityPlaceholder')}</option>
                {CEO_PRIORITY_OPTIONS.map((option) => <option key={option}>{option}</option>)}
              </select>
            </EditorField>
          </div>
          <div className="flex flex-col gap-2.5 rounded-lg border border-line bg-raised p-3.5">
            <span className={labelClass}>{t('ceoComments.userStatus')}</span>
            <p className="m-0 text-sm-plus">
              {t('ceoComments.currentStatus')}
              {' : '}
              <span className="font-semibold">{CEO_CURRENT_STATUS}</span>
            </p>
            <p className="m-0 text-xs-plus text-fg-3">{t('ceoComments.statusHint')}</p>
            <select className={inputClass} onChange={(event) => { setStatus(event.target.value); }} value={status}>
              <option value="">{t('ceoComments.statusPlaceholder')}</option>
              {CEO_STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <button
            className="rounded-xl border border-dashed border-line-strong bg-raised px-3.5 py-5.5 text-center"
            onClick={() => { inputRef.current?.click(); }}
            type="button"
          >
            <input
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              multiple
              onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }}
              ref={inputRef}
              type="file"
            />
            <Folder aria-hidden className="mx-auto mb-2 text-fg-4" size={22} />
            <span className="block text-sm-plus font-semibold text-fg-2">{t('ceoComments.addFile')}</span>
            <span className="mt-1 block text-xs text-fg-4">{t('edit.uploadNote')}</span>
          </button>
          {attachments.length ? (
            <div className="flex flex-col gap-2">
              {attachments.map((attachment) => (
                <div className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2" key={attachment.id}>
                  <Folder aria-hidden className="shrink-0 text-accent" size={14} />
                  <div className="min-w-0 flex-1"><p className="m-0 truncate text-sm-plus font-semibold">{attachment.name}</p><p className="m-0 text-xs text-fg-3">{attachment.size}</p></div>
                  <button aria-label={`${t('edit.remove')} ${attachment.name}`} className="p-1.5 text-bad" onClick={() => { setAttachments((current) => current.filter((item) => item.id !== attachment.id)); }} type="button"><X aria-hidden size={13} /></button>
                </div>
              ))}
            </div>
          ) : null}
        </DialogBody>
        <DialogFooter className="flex-wrap items-center justify-between gap-3">
          <span className="text-xs-plus text-fg-3">{t('ceoComments.requiredNote')}</span>
          <div className="flex gap-2">
            <button className="rounded-lg px-3.5 py-2 text-sm font-semibold text-fg-2" onClick={() => { onOpenChange(false); }} type="button">
              {t('ceoComments.cancel')}
            </button>
            <button
              className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink"
              onClick={() => {
                onOpenChange(false);
                toast(t('ceoComments.saved'));
              }}
              type="button"
            >
              {t('ceoComments.save')}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
