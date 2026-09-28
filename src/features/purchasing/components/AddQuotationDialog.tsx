import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DialogBody, DialogContent, DialogDescription, DialogRoot, DialogTitle } from '@/shared/ui/overlay/Dialog';

import type { AddQuotationSeed, QuotationSupplierDraft } from '../types/purchasing.types';
import { purchasingButtonStyles } from './purchasingButtonStyles';
import { QuotationSupplierCard } from './QuotationSupplierCard';

type AddQuotationDialogProps = Readonly<{ onClose: () => void; seed: AddQuotationSeed }>;

export const SUPPLIER_LETTERS = 'ABCDEFGH';
const addSymbol = '+';

export function createBlankQuotationSupplier(): QuotationSupplierDraft {
  return {
    amount: '', attachments: [], category: '', convertedAmount: '', convertedAmountEdited: false,
    currency: 'KWD', description: '', name: '', remarks: '',
  };
}

function Meta({ label, mono, value }: Readonly<{ label: string; mono?: boolean; value: string }>) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-2xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{label}</span>
      <span className={`text-sm-plus font-semibold text-fg ${mono ? 'num' : ''}`}>{value}</span>
    </div>
  );
}

/** @prototype index.html:L10492-L10528 `quoteModal` */
export function AddQuotationDialog({ onClose, seed }: AddQuotationDialogProps) {
  const { t } = useTranslation('purchasing');
  const [suppliers, setSuppliers] = useState<readonly QuotationSupplierDraft[]>([createBlankQuotationSupplier()]);

  const updateSupplier = (index: number, patch: Partial<QuotationSupplierDraft>) => {
    setSuppliers((current) => current.map((supplier, currentIndex) => currentIndex === index ? { ...supplier, ...patch } : supplier));
  };

  const addSupplier = () => {
    // Human ADOPT, 2026-09-28: no maximum guard. Indexing beyond H returns
    // undefined exactly as in the prototype, leaving the post-H label blank.
    setSuppliers((current) => [...current.map((supplier) => ({ ...supplier, collapsed: true })), createBlankQuotationSupplier()]);
  };

  return (
    <DialogRoot onOpenChange={(open) => { if (!open) onClose(); }} open>
      <DialogContent className="w-[min(660px,100%)] max-w-[calc(100%-48px)]" data-testid="add-quotation-dialog">
        <DialogDescription className="sr-only">{seed.pcTitle}</DialogDescription>
        <DialogBody className="gap-0">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle asChild><div className="text-lg font-semibold tracking-[-0.01em]">{t('quotations.builder.title')}</div></DialogTitle>
              <div className="mt-1 text-sm text-fg-3">{t('quotations.builder.against')} <span className="num font-semibold text-fg-2">{seed.pcRef}</span></div>
            </div>
            <button aria-label={t('quotations.builder.close')} className="p-0.5 text-fg-3" onClick={onClose} type="button"><X aria-hidden="true" size={20} /></button>
          </div>
          <div className="mb-5 rounded-xl border border-line bg-canvas p-4">
            <div className="mb-3.5 flex flex-wrap items-center gap-2">
              <span className="text-2xs font-bold tracking-[0.06em] text-fg-2 uppercase">{t('quotations.builder.requestDetails')}</span>
              <span className="rounded-full border border-line-strong bg-surface px-1.5 py-0.5 text-2xs font-semibold text-fg-3">{t('quotations.builder.readOnly')}</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
              <Meta label={t('quotations.builder.requestNumber')} mono value={seed.pcRef} />
              <Meta label={t('quotations.builder.department')} value={seed.pcDept || '—'} />
              <Meta label={t('quotations.builder.estimatedValue')} mono value={`${seed.pcValue || '—'} KWD`} />
              <Meta label={t('quotations.builder.submitted')} value={seed.pcSubmitted || '—'} />
              <Meta label={t('quotations.builder.status')} value={seed.pcStatus || '—'} />
            </div>
            <div className="mt-3.5 border-t border-line pt-3.5"><Meta label={t('quotations.builder.subject')} value={seed.pcTitle || '—'} /></div>
          </div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <span className="eyebrow">{t('quotations.builder.supplierQuotations')}</span>
            <span className="text-sm text-fg-3">{t('quotations.builder.supplierCount', { count: suppliers.length })}</span>
          </div>
          <div className="flex flex-col gap-3">
            {suppliers.map((supplier, index) => (
              <QuotationSupplierCard
                index={index}
                key={index}
                letter={SUPPLIER_LETTERS[index]}
                onRemove={suppliers.length > 1 ? () => { setSuppliers((current) => current.filter((_, currentIndex) => currentIndex !== index)); } : undefined}
                onUpdate={(patch) => { updateSupplier(index, patch); }}
                supplier={supplier}
              />
            ))}
          </div>
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-line-strong bg-raised px-3.5 py-2.5 text-sm-plus font-semibold text-accent" onClick={addSupplier} type="button">
            <span className="text-base leading-none">{addSymbol}</span> {t('quotations.builder.addSupplier')} {SUPPLIER_LETTERS[suppliers.length]}
          </button>
          <div className="mt-[22px] flex justify-end gap-2">
            <button className={purchasingButtonStyles.ghost} onClick={onClose} type="button">{t('quotations.builder.cancel')}</button>
            {/* PROTOTYPE-NOOP(D2): closes without validation or persistence. */}
            <button className={purchasingButtonStyles.primary} onClick={onClose} type="button">{t('quotations.builder.save')}</button>
          </div>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
