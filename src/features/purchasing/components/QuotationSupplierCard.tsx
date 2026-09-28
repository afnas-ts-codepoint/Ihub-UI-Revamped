import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/shared/ui/chip/Chip';
import { CollapsibleCard } from '@/shared/ui/card/CollapsibleCard';

import { automaticQuotationKwd, CBK_RATES_KWD, QUOTATION_CURRENCIES } from '../domain/currencyConversion';
import type { PoAttachmentFile, QuotationSupplierDraft } from '../types/purchasing.types';
import { AttachmentList } from './AttachmentList';

type QuotationSupplierCardProps = Readonly<{
  index: number;
  letter: string | undefined;
  onRemove?: () => void;
  onUpdate: (patch: Partial<QuotationSupplierDraft>) => void;
  supplier: QuotationSupplierDraft;
}>;

const inputClass = 'w-full rounded-lg border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none focus:border-accent';
const kwdCode = 'KWD';

function Field({ children, label }: Readonly<{ children: ReactNode; label: string }>) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{label}</span>
      {children}
    </label>
  );
}

/** @prototype index.html:L10462-L10491 `qSupCard` */
export function QuotationSupplierCard({ index, letter, onRemove, onUpdate, supplier }: QuotationSupplierCardProps) {
  const { t } = useTranslation('purchasing');
  const automaticValue = automaticQuotationKwd(supplier.amount, supplier.currency);
  const displayedConvertedAmount = supplier.convertedAmountEdited ? supplier.convertedAmount : automaticValue;
  const updateAttachments = (files: readonly PoAttachmentFile[]) => { onUpdate({ attachments: files }); };

  return (
    <CollapsibleCard
      actions={onRemove ? (
        <button aria-label={t('quotations.builder.removeSupplier', { number: index + 1 })} className="shrink-0 p-0.5 text-fg-4" onClick={onRemove} type="button">
          <X aria-hidden="true" size={15} />
        </button>
      ) : undefined}
      badges={(
        <>
          {supplier.name ? <Chip>{supplier.name}</Chip> : null}
          {displayedConvertedAmount ? <Chip tone="accent"><span className="num">{displayedConvertedAmount} {kwdCode}</span></Chip> : null}
        </>
      )}
      onOpenChange={(open) => { onUpdate({ collapsed: !open }); }}
      open={!supplier.collapsed}
      title={<>{t('quotations.builder.supplier')} {letter}</>}
    >
      <div className="flex flex-col gap-3.5 p-4">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
          <Field label={t('quotations.builder.fields.name')}>
            <input className={inputClass} onChange={(event) => { onUpdate({ name: event.currentTarget.value }); }} placeholder={t('quotations.builder.placeholders.name')} value={supplier.name} />
          </Field>
          <Field label={t('quotations.builder.fields.category')}>
            <select className={`${inputClass} cursor-pointer`} onChange={(event) => { onUpdate({ category: event.currentTarget.value }); }} value={supplier.category}>
              <option value="">{t('quotations.builder.placeholders.category')}</option>
              {(['facilities', 'it', 'maintenance', 'printing', 'security', 'other'] as const).map((category) => (
                <option key={category} value={t(`quotations.builder.categories.${category}`)}>{t(`quotations.builder.categories.${category}`)}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label={t('quotations.builder.fields.description')}>
          <textarea className={`${inputClass} resize-y leading-relaxed`} onChange={(event) => { onUpdate({ description: event.currentTarget.value }); }} placeholder={t('quotations.builder.placeholders.description')} rows={2} value={supplier.description} />
        </Field>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
          <Field label={t('quotations.builder.fields.currency')}>
            <select className={`${inputClass} cursor-pointer`} onChange={(event) => { onUpdate({ currency: event.currentTarget.value as QuotationSupplierDraft['currency'] }); }} value={supplier.currency}>
              {QUOTATION_CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
            </select>
          </Field>
          <Field label={t('quotations.builder.fields.amount')}>
            <input className={inputClass} inputMode="decimal" onChange={(event) => { onUpdate({ amount: event.currentTarget.value }); }} placeholder="0.000" value={supplier.amount} />
          </Field>
          <Field label={t('quotations.builder.fields.converted')}>
            <input className={`${inputClass} num font-semibold`} inputMode="decimal" onChange={(event) => { onUpdate({ convertedAmount: event.currentTarget.value, convertedAmountEdited: true }); }} placeholder="0.000" value={displayedConvertedAmount} />
          </Field>
        </div>
        <div className="-mt-1.5 text-xs text-fg-3">
          {t('quotations.builder.conversionHint')}
          {supplier.currency === 'KWD' ? '' : ` — 1 ${supplier.currency} = ${String(CBK_RATES_KWD[supplier.currency])} KWD`}
          {t('quotations.builder.overrideHint')}
        </div>
        <Field label={t('quotations.builder.fields.remarks')}>
          <textarea className={`${inputClass} resize-y leading-relaxed`} onChange={(event) => { onUpdate({ remarks: event.currentTarget.value }); }} placeholder={t('quotations.builder.placeholders.remarks')} rows={2} value={supplier.remarks} />
        </Field>
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{t('quotations.builder.fields.attachments')}</span>
          <AttachmentList
            files={supplier.attachments}
            onAdd={(files) => { updateAttachments([...supplier.attachments, ...files]); }}
            onCaptionChange={(fileIndex, caption) => { updateAttachments(supplier.attachments.map((file, currentIndex) => currentIndex === fileIndex ? { ...file, caption } : file)); }}
            onRemove={(fileIndex) => { updateAttachments(supplier.attachments.filter((_, currentIndex) => currentIndex !== fileIndex)); }}
          />
        </div>
      </div>
    </CollapsibleCard>
  );
}
