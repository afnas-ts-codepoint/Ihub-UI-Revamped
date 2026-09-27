import { yupResolver } from '@hookform/resolvers/yup';
import { Pencil, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { MasterRecordFields } from './MasterRecordFields';
import { EMPTY_MASTER_FORM, masterFormDraft, masterFormOutput, type MasterFormValues } from '../domain/formValues';
import { masterFormMissing } from '../domain/requiredFields';
import type { MasterDefinition, MasterRow } from '../domain/types';
import { createMasterRecordSchema } from '../schemas/masterRecord.schema';
import { FormActions } from '@/shared/form/layout/FormActions';
import { DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from '@/shared/ui/overlay/Dialog';

type CommonProps = Readonly<{
  definition: MasterDefinition;
  onClose: () => void;
  record: MasterRow;
  title: string;
}>;

function CloseIcon({ label, onClick }: Readonly<{ label: string; onClick: () => void }>) {
  return <button aria-label={label} className="ms-auto inline-flex size-7.5 items-center justify-center rounded-lg border border-line-strong text-fg-3" onClick={onClick} type="button"><X aria-hidden="true" size={14} /></button>;
}

export function MasterViewDialog({ definition, onClose, record, title, onEdit }: CommonProps & Readonly<{ onEdit: () => void }>) {
  const { t } = useTranslation('masters');
  const values = masterFormDraft(record, definition.mode);
  return <DialogRoot onOpenChange={(open) => { if (!open) onClose(); }} open>
    <DialogContent className="w-[min(100%,max(80vw,560px))] max-w-[calc(100%-48px)]" data-testid="master-view-dialog">
      <DialogHeader><DialogTitle className="text-base font-bold">{t('form.viewTitle', { title })}</DialogTitle><DialogDescription className="sr-only">{t('form.viewTitle', { title })}</DialogDescription><CloseIcon label={t('form.close')} onClick={onClose} /></DialogHeader>
      <DialogBody className="gap-4"><MasterRecordFields masterMode={definition.mode} mode="view" onChange={() => undefined} record={record} t={t} values={values} /></DialogBody>
      <DialogFooter><div className="ms-auto flex gap-2"><button className="rounded-lg px-3 py-2 text-sm font-semibold text-fg-2" onClick={onClose} type="button">{t('form.close')}</button><button className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink" onClick={onEdit} type="button"><Pencil aria-hidden="true" size={13} />{t('actions.edit')}</button></div></DialogFooter>
    </DialogContent>
  </DialogRoot>;
}

export function MasterEditDialog({ definition, onClose, onSave, record, title }: CommonProps & Readonly<{ onSave: (row: MasterRow) => void }>) {
  const { t } = useTranslation('masters');
  const schema = createMasterRecordSchema(definition.mode);
  const { control, handleSubmit, reset, setValue } = useForm<MasterFormValues>({
    defaultValues: masterFormDraft(record, definition.mode),
    resolver: yupResolver(schema),
    shouldFocusError: false,
  });
  useEffect(() => { reset(masterFormDraft(record, definition.mode)); }, [definition.mode, record, reset]);
  const values: MasterFormValues = { ...EMPTY_MASTER_FORM, ...useWatch({ control }) };
  const missing = masterFormMissing(values, definition.mode);
  const submit = handleSubmit((next) => { onSave(masterFormOutput(record, next, definition.mode)); });
  return <DialogRoot onOpenChange={(open) => { if (!open) onClose(); }} open>
    <DialogContent className="w-[min(100%,max(80vw,560px))] max-w-[calc(100%-48px)]" data-testid="master-edit-dialog">
      <DialogHeader><DialogTitle className="text-base font-bold">{t('form.editTitle', { title })}</DialogTitle><DialogDescription className="sr-only">{t('form.editTitle', { title })}</DialogDescription><CloseIcon label={t('form.close')} onClick={onClose} /></DialogHeader>
      <form noValidate onSubmit={(event) => { void submit(event); }}>
        <DialogBody className="gap-4"><MasterRecordFields masterMode={definition.mode} mode="edit" onChange={(patch) => { for (const [key, value] of Object.entries(patch)) setValue(key as keyof MasterFormValues, value as never, { shouldValidate: true }); }} record={record} t={t} values={values} /></DialogBody>
        <FormActions cancelLabel={t('form.cancel')} disabled={missing} message={missing ? t(`form.missing.${definition.mode}`) : ''} onCancel={onClose} submitLabel={t('form.saveChanges')} />
      </form>
    </DialogContent>
  </DialogRoot>;
}
