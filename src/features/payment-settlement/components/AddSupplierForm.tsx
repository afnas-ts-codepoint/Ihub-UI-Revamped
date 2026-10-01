import { Check, Folder, X, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DateField } from '@/shared/form/controls/DateField';

import type { ActionSheetAttachment } from '../types/paymentSettlement.types';
import { paymentSettlementButtonStyles } from './actionSheetButtonStyles';

const inputClass = 'w-full rounded-lg border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none focus:border-accent';
const kickerClass = 'text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase';
const cardClass = 'flex flex-col gap-4 rounded-xl border border-line bg-surface p-[22px]';
const gridClass = 'grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-x-5 gap-y-4';

function Card({ children, title }: Readonly<{ children: ReactNode; title: string }>) {
  return (
    <div className={cardClass}>
      <h3 className="m-0 text-sm-plus font-semibold tracking-[-0.01em]">{title}</h3>
      {children}
    </div>
  );
}

function Field({ children, label }: Readonly<{ children: ReactNode; label: string }>) {
  return (
    <label className="flex min-w-0 flex-col gap-[7px]">
      <span className={kickerClass}>{label}</span>
      {children}
    </label>
  );
}

/** A labelled `DateField`; a `<label>` would re-trigger the popover button, so the label is a plain caption + aria-label. */
function DateRow({ label, onChange, value }: Readonly<{ label: string; onChange: (value: string) => void; value: string }>) {
  return (
    <div className="flex min-w-0 flex-col gap-[7px]">
      <span className={kickerClass}>{label}</span>
      <DateField ariaLabel={label} onChange={onChange} value={value} />
    </div>
  );
}

/**
 * Embedded Add a Supplier form. The prototype's text/date inputs are
 * uncontrolled and are never validated, read, persisted or reset: only the
 * attachment captions gate "Add supplier", and a completely empty form adds a
 * supplier successfully. The unused `TERMS`/`seg` helpers declared inside
 * `AddSupplierPanel` are dead source and are not ported.
 * @prototype index.html:L16975-L17032 `AddSupplierPanel` (single render site L12724, `embedded: true`)
 */
export function AddSupplierForm() {
  const { t } = useTranslation('paymentSettlement');
  const [files, setFiles] = useState<ActionSheetAttachment[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  /** The prototype's `type="date"` inputs render as its branded calendar field (index.html:L1408) and are never read. */
  const [taxFrom, setTaxFrom] = useState('');
  const [taxTo, setTaxTo] = useState('');

  /** @prototype index.html:L17020 — flash timers are intentionally not cancelled. */
  const submit = () => {
    if (files.some((file) => !file.caption.trim())) {
      setError(t('addSupplier.actions.captionError'));
      window.setTimeout(() => { setError(''); }, 3000);
      return;
    }
    setError('');
    setMessage(t('addSupplier.actions.added'));
    window.setTimeout(() => { setMessage(''); }, 2600);
  };

  return (
    <div className="grid grid-cols-1 items-start gap-4 pb-10 tablet:grid-cols-[1.7fr_1fr]">
      <div className="flex min-w-0 flex-col gap-3">
        <Card title={t('addSupplier.details.title')}>
          <div className={gridClass}>
            <Field label={t('addSupplier.details.name')}><input className={inputClass} placeholder={t('addSupplier.details.namePlaceholder')} /></Field>
            <Field label={t('addSupplier.details.company')}><input className={inputClass} placeholder={t('addSupplier.details.companyPlaceholder')} /></Field>
            <Field label={t('addSupplier.details.tel')}><input className={inputClass} placeholder="+965 …" /></Field>
            <Field label={t('addSupplier.details.mobile')}><input className={inputClass} placeholder="+965 …" /></Field>
            <Field label={t('addSupplier.details.email')}><input className={inputClass} placeholder="name@company.com" type="email" /></Field>
            <DateRow label={t('addSupplier.details.taxFrom')} onChange={setTaxFrom} value={taxFrom} />
            <DateRow label={t('addSupplier.details.taxTo')} onChange={setTaxTo} value={taxTo} />
          </div>
          <Field label={t('addSupplier.details.address')}>
            <textarea className={`${inputClass} min-h-[70px] resize-y leading-[1.55]`} placeholder={t('addSupplier.details.addressPlaceholder')} />
          </Field>
        </Card>
        <Card title={t('addSupplier.banking.title')}>
          <div className={gridClass}>
            <Field label={t('addSupplier.banking.bankName')}><input className={inputClass} placeholder={t('addSupplier.banking.bankNamePlaceholder')} /></Field>
            <Field label={t('addSupplier.banking.branch')}><input className={inputClass} placeholder={t('addSupplier.banking.branchPlaceholder')} /></Field>
            <Field label={t('addSupplier.banking.accountNumber')}><input className={inputClass} placeholder="—" /></Field>
            <Field label={t('addSupplier.banking.iban')}><input className={inputClass} placeholder="KW…" /></Field>
          </div>
        </Card>
        <Card title={t('addSupplier.attachments.title')}>
          {files.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {files.map((file, index) => (
                <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-line bg-canvas px-3 py-2.5" key={`${file.name}-${String(index)}`}>
                  <Folder aria-hidden="true" className="shrink-0 text-accent" size={16} />
                  <span className="min-w-[120px] flex-[1_1_120px] truncate text-sm-plus font-semibold">{file.name || t('addSupplier.attachments.untitledFile')}</span>
                  <input
                    aria-label={t('addSupplier.attachments.captionPlaceholder')}
                    className={`${inputClass} min-w-[180px] flex-[1_1_180px] !w-auto bg-surface !text-sm ${file.caption.trim() ? '' : '!border-bad'}`}
                    onChange={(event) => { setFiles(files.map((item, itemIndex) => (itemIndex === index ? { ...item, caption: event.currentTarget.value } : item))); }}
                    placeholder={t('addSupplier.attachments.captionPlaceholder')}
                    value={file.caption}
                  />
                  <button aria-label={t('addSupplier.attachments.removeAttachment')} className="flex shrink-0 p-0.5 text-fg-4" onClick={() => { setFiles(files.filter((_, itemIndex) => itemIndex !== index)); }} type="button">
                    <X aria-hidden="true" size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {/* The "drag and drop" copy is dead in the prototype too: no onDrop/onDragOver, click-only picker. */}
          <label className="block cursor-pointer rounded-xl border border-dashed border-line-strong bg-raised px-4 py-[22px] text-center">
            <input
              className="hidden"
              multiple
              onChange={(event) => {
                const picked = Array.from(event.currentTarget.files ?? []).map((file) => ({ caption: '', name: file.name }));
                setFiles([...files, ...picked]);
                event.currentTarget.value = '';
              }}
              type="file"
            />
            <Folder aria-hidden="true" className="mx-auto text-accent" size={22} />
            <div className="mt-[9px] text-sm-plus font-semibold">{t('addSupplier.attachments.uploadHint')}</div>
            <div className="mt-[3px] text-xs text-fg-3">{t('addSupplier.attachments.fileHint')}</div>
          </label>
        </Card>
      </div>
      <div className="flex min-w-0 flex-col gap-4 tablet:sticky tablet:top-6">
        <div className={cardClass}>
          <h3 className="m-0 text-sm-plus font-semibold tracking-[-0.01em]">{t('addSupplier.actions.title')}</h3>
          <button className={`${paymentSettlementButtonStyles.primary} w-full`} onClick={submit} type="button">
            <Check aria-hidden="true" size={15} />
            {t('addSupplier.actions.submit')}
          </button>
          {error ? (
            <div className="flex items-center gap-2 rounded-lg bg-bad/10 px-3 py-2.5 text-sm-plus font-semibold text-bad" role="alert">
              <Zap aria-hidden="true" size={15} />
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="flex items-center gap-2 rounded-lg bg-ok/10 px-3 py-2.5 text-sm-plus font-semibold text-ok" role="status">
              <Check aria-hidden="true" size={15} />
              {message}
            </div>
          ) : null}
          {/* PROTOTYPE-NOOP(D2): "Save as draft" has no onClick handler at all (index.html:L17023). */}
          <button className={`${paymentSettlementButtonStyles.secondary} w-full`} type="button">
            <Folder aria-hidden="true" size={16} />
            {t('addSupplier.actions.saveDraft')}
          </button>
        </div>
      </div>
    </div>
  );
}
