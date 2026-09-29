import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EditorField, inputClass, labelClass } from './TaskEditPanels';
import { TASK_VIEW_TEAM } from '../../data/taskView.mock';
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
 * Shared with the Assignment Info card's Process Owner default/options list
 * (`processOwner`/`matrixPartners` seed from this same array).
 * @prototype ihub/ORIGINAL_SOURCE.html:L18047 `TEP_ASSIGN_DEPTS`.
 */
export const TEP_ASSIGN_DEPARTMENTS = [
  'Maintenance Department', 'IT Department', 'Safety Department', 'Operations Department',
  'Facilities Department', 'HR Department', 'Finance Department', 'Procurement Department',
] as const;

/** Redirect-specific — a distinct list from `TEP_ASSIGN_DEPTS`, not reused. */
const REDIRECT_PARTNERS = [
  'IT Department', 'HR Department', 'Finance Department',
  'Operations Team', 'Maintenance Team', 'Procurement Team',
] as const;

type RedirectSelection = Readonly<{ assignee: string; matrixPartners: readonly string[]; processOwner: string }>;

/**
 * Redirect Task — seeded from the current Assignment Info values each time
 * it opens. Process Owner and Assignee are required (validated on confirm,
 * with a toast; unlike Reject/Close the Confirm button is never disabled).
 * Matrix Partner is optional. On confirm this is the one M8.6 dialog that
 * mutates real, visible page state — it overwrites the Assignment Info
 * card's process owner / matrix partners / assignee.
 *
 * The caller remounts this component (varying `key` on `open`) each time
 * the dialog opens, so the draft state below re-seeds from the latest
 * committed values without a state-in-effect synchronization.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18932-L18972.
 */
export function RedirectDialog({
  assignee,
  matrixPartners,
  onOpenChange,
  onRedirect,
  open,
  processOwner,
}: Readonly<{
  assignee: string;
  matrixPartners: readonly string[];
  onOpenChange: (open: boolean) => void;
  onRedirect: (selection: RedirectSelection) => void;
  open: boolean;
  processOwner: string;
}>) {
  const { t } = useTranslation('taskView');
  const [draftOwner, setDraftOwner] = useState(processOwner);
  const [draftPartners, setDraftPartners] = useState<readonly string[]>(matrixPartners);
  const [draftAssignee, setDraftAssignee] = useState(assignee);

  const togglePartner = (name: string) => {
    setDraftPartners((list) => (list.includes(name) ? list.filter((entry) => entry !== name) : [...list, name]));
  };

  const confirm = () => {
    if (!draftOwner || !draftAssignee.trim()) {
      toast(t('redirectDialog.requiredFields'), 'bad');
      return;
    }
    onRedirect({
      assignee: draftAssignee,
      matrixPartners: draftPartners.filter((name) => name !== draftOwner),
      processOwner: draftOwner,
    });
    toast(t('redirectDialog.redirected'));
    onOpenChange(false);
  };

  return (
    <DialogRoot onOpenChange={onOpenChange} open={open}>
      <DialogContent className="w-[min(480px,calc(100%-32px))]">
        <DialogHeader>
          <DialogTitle className="flex-1 text-md font-semibold">{t('redirectDialog.title')}</DialogTitle>
          <button aria-label={t('common.close')} className="p-1 text-fg-3" onClick={() => { onOpenChange(false); }} type="button">
            <X aria-hidden size={16} />
          </button>
        </DialogHeader>
        <DialogBody>
          <EditorField label={t('assignment.processOwner')} required>
            <select className={inputClass} onChange={(event) => { setDraftOwner(event.target.value); }} value={draftOwner}>
              <option value="">{t('redirectDialog.processOwnerPlaceholder')}</option>
              {TEP_ASSIGN_DEPARTMENTS.map((department) => <option key={department}>{department}</option>)}
            </select>
          </EditorField>
          <div className="flex flex-col gap-2">
            <span className={labelClass}>{t('assignment.matrixPartner')}</span>
            <div className="flex flex-col gap-1.5">
              {REDIRECT_PARTNERS.map((partner) => (
                <label className="flex items-center gap-2 text-sm-plus" key={partner}>
                  <input
                    checked={draftPartners.includes(partner)}
                    onChange={() => { togglePartner(partner); }}
                    type="checkbox"
                  />
                  {partner}
                </label>
              ))}
            </div>
          </div>
          <EditorField label={t('assignment.assignee')} required>
            <select className={inputClass} onChange={(event) => { setDraftAssignee(event.target.value); }} value={draftAssignee}>
              <option value="">{t('redirectDialog.assigneePlaceholder')}</option>
              {TASK_VIEW_TEAM.map((name) => <option key={name}>{name}</option>)}
            </select>
          </EditorField>
          <p className="m-0 text-xs-plus text-fg-3">
            <strong>{t('redirectDialog.noteLabel')}</strong>
            {' '}
            {t('redirectDialog.note')}
          </p>
        </DialogBody>
        <DialogFooter className="justify-end">
          <button className="rounded-lg px-3.5 py-2 text-sm font-semibold text-fg-2" onClick={() => { onOpenChange(false); }} type="button">
            {t('redirectDialog.cancel')}
          </button>
          <button className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink" onClick={confirm} type="button">
            {t('redirectDialog.confirm')}
          </button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
