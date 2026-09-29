import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EditorField, inputClass } from './TaskEditPanels';
import { toast } from '@/shared/ui/feedback/Toaster';
import { DateField } from '@/shared/form/controls/DateField';
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

/** @prototype ihub/ORIGINAL_SOURCE.html:L18647 `DEP_CATEGORIES`. */
const DEP_CATEGORIES = ['Spare Parts', 'Approval', 'Vendor', 'Technical', 'Other'] as const;
/** @prototype ihub/ORIGINAL_SOURCE.html:L18648 `DEP_TYPES_BY_CAT`. */
const DEP_TYPES_BY_CATEGORY: Readonly<Record<(typeof DEP_CATEGORIES)[number], readonly string[]>> = {
  Approval: ['Technical', 'Financial'],
  Other: ['General'],
  'Spare Parts': ['Procurement', 'Delivery'],
  Technical: ['Inspection', 'Testing'],
  Vendor: ['Contract', 'Certification'],
};

export type NewDependencyInput = Readonly<{
  blocking: boolean;
  category: string;
  impactDate: string;
  leadTime: string;
  remarks: string;
  type: string;
}>;

/**
 * Add New Dependency — Category and Lead Time are required (Type depends on
 * Category). "Mark as Showstopper" reveals an Impacted Date field, but that
 * field is never actually required by validation — a genuine prototype
 * quirk (`PROTOTYPE-NOOP(D2)`), preserved rather than "fixed": checking
 * Showstopper and leaving Impacted Date empty still successfully adds the
 * dependency. On Add, the new row is appended to the Dependencies panel and
 * that panel auto-expands.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18647-L18705.
 */
export function AddDependencyDialog({
  onAdd,
  onOpenChange,
  open,
}: Readonly<{ onAdd: (input: NewDependencyInput) => void; onOpenChange: (open: boolean) => void; open: boolean }>) {
  const { t } = useTranslation('taskView');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showstopper, setShowstopper] = useState(false);
  const [impactDate, setImpactDate] = useState('');

  const typeOptions = category ? DEP_TYPES_BY_CATEGORY[category as (typeof DEP_CATEGORIES)[number]] : [];

  const reset = () => {
    setCategory(''); setType(''); setLeadTime(''); setRemarks(''); setShowstopper(false); setImpactDate('');
  };

  const add = () => {
    if (!category || !leadTime.trim()) {
      toast(t('dependencyDialog.requiredFields'), 'bad');
      return;
    }
    onAdd({ blocking: showstopper, category, impactDate, leadTime, remarks, type });
    reset();
    onOpenChange(false);
    toast(t('dependencyDialog.added'));
  };

  return (
    <DialogRoot
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent aria-label={t('dependencyDialog.title')} className="w-[min(480px,calc(100%-32px))]">
        <DialogHeader>
          <DialogTitle className="text-md font-semibold">{t('dependencyDialog.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <EditorField label={t('dependencyDialog.category')} required>
            <select
              className={inputClass}
              onChange={(event) => { setCategory(event.target.value); setType(''); }}
              value={category}
            >
              <option value="">{t('dependencyDialog.categoryPlaceholder')}</option>
              {DEP_CATEGORIES.map((option) => <option key={option}>{option}</option>)}
            </select>
          </EditorField>
          <EditorField label={t('dependencyDialog.type')}>
            <select className={inputClass} onChange={(event) => { setType(event.target.value); }} value={type}>
              <option value="">{category ? t('dependencyDialog.typePlaceholder') : t('dependencyDialog.typePlaceholderNoCategory')}</option>
              {typeOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </EditorField>
          <EditorField label={t('dependencyDialog.leadTime')} required>
            <input
              className={inputClass}
              onChange={(event) => { setLeadTime(event.target.value); }}
              placeholder={t('dependencyDialog.leadTimePlaceholder')}
              value={leadTime}
            />
          </EditorField>
          <EditorField label={t('dependencyDialog.remarks')}>
            <textarea
              className={`${inputClass} resize-y`}
              onChange={(event) => { setRemarks(event.target.value); }}
              placeholder={t('dependencyDialog.remarksPlaceholder')}
              rows={2}
              value={remarks}
            />
          </EditorField>
          <label className="flex items-center gap-2 text-sm-plus">
            <input checked={showstopper} onChange={(event) => { setShowstopper(event.target.checked); }} type="checkbox" />
            {t('dependencyDialog.showstopper')}
          </label>
          {showstopper ? (
            <EditorField label={t('dependencyDialog.impactedDate')}>
              <DateField onChange={setImpactDate} value={impactDate} />
            </EditorField>
          ) : null}
        </DialogBody>
        <DialogFooter className="justify-end">
          <button className="rounded-lg px-3.5 py-2 text-sm font-semibold text-fg-2" onClick={() => { onOpenChange(false); }} type="button">
            {t('dependencyDialog.cancel')}
          </button>
          <button className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink" onClick={add} type="button">
            {t('dependencyDialog.add')}
          </button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
