import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DialogBody, DialogContent, DialogDescription, DialogRoot, DialogTitle } from '@/shared/ui/overlay/Dialog';

import type { PoAttachSeed, PoAttachmentFile } from '../types/purchasing.types';
import { AttachmentList } from './AttachmentList';
import { purchasingButtonStyles } from './purchasingButtonStyles';

type PoAttachDialogProps = Readonly<{
  onClose: () => void;
  seed: PoAttachSeed;
}>;

const fieldInputClass =
  'w-full rounded-lg border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none focus:border-accent';

function Meta({ label, mono, value }: Readonly<{ label: string; mono?: boolean; value: string }>) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-2xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{label}</span>
      <span className={`text-sm-plus font-semibold text-fg ${mono ? 'num' : ''}`}>{value}</span>
    </div>
  );
}

/**
 * `PoNo`/`actual`/`remarks`/`files` are local state, mounted only while
 * `seed` is non-null (see `PurchaseOrderView`); every row-action click
 * builds a brand-new `seed`, so re-opening — even the same row — remounts
 * this component and starts every field blank, matching the prototype's
 * mechanism exactly (a fresh `setPoAttach({...})` object per open) without
 * a `useEffect`-based reset.
 *
 * **Cancel and "Attach purchase order" are intentionally identical**: both
 * just close with zero validation. Missing captions, a blank PO number, and
 * a blank actual value never block either button — this is the prototype's
 * literal behavior (both call the same `setPoAttach(null)`), not an
 * oversight, and must not gain gating here.
 * @prototype index.html:L10360-L10400 `poAttachModal`
 */
export function PoAttachDialog({ onClose, seed }: PoAttachDialogProps) {
  const { t } = useTranslation('purchasing');
  const [poNo, setPoNo] = useState('');
  const [actual, setActual] = useState('');
  const [remarks, setRemarks] = useState('');
  const [files, setFiles] = useState<readonly PoAttachmentFile[]>([]);

  return (
    <DialogRoot onOpenChange={(open) => { if (!open) onClose(); }} open>
      <DialogContent className="w-[min(620px,100%)] max-w-[calc(100%-48px)]" data-testid="po-attach-dialog">
        <DialogDescription className="sr-only">{seed.pcTitle}</DialogDescription>
        <DialogBody className="gap-0">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle asChild>
                <div className="text-lg font-semibold tracking-[-0.01em]">{t('po.attach.title')}</div>
              </DialogTitle>
              <div className="mt-1 text-sm text-fg-3">
                {t('po.attach.against')} <span className="num font-semibold text-fg-2">{seed.pcRef}</span>
              </div>
            </div>
            <button className="p-0.5 text-xl leading-none text-fg-3" onClick={onClose} type="button">
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <div className="mb-5 rounded-xl border border-line bg-canvas p-4">
            <div className="mb-3.5 flex flex-wrap items-center gap-2">
              <span className="text-2xs font-bold tracking-[0.06em] text-fg-2 uppercase">{t('po.attach.requestDetails')}</span>
              <span className="rounded-full border border-line-strong bg-surface px-1.5 py-0.5 text-2xs font-semibold text-fg-3">
                {t('po.attach.readOnly')}
              </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
              <Meta label={t('po.attach.requestNumber')} mono value={seed.pcRef} />
              <Meta label={t('po.attach.supplier')} value={seed.supplier || '—'} />
              <Meta label={t('po.attach.department')} value={seed.pcDept || '—'} />
              <Meta label={t('po.attach.approvedValue')} mono value={`${seed.pcValue || '—'} KWD`} />
              <Meta label={t('po.attach.committeeStatus')} value={seed.pcStatus || '—'} />
            </div>
            <div className="mt-3.5 border-t border-line pt-3.5">
              <Meta label={t('po.attach.subject')} value={seed.pcTitle || '—'} />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{t('po.attach.title')}</span>
            <AttachmentList
              files={files}
              onAdd={(added) => { setFiles((current) => [...current, ...added]); }}
              onCaptionChange={(index, caption) => {
                setFiles((current) => current.map((file, itemIndex) => (itemIndex === index ? { ...file, caption } : file)));
              }}
              onRemove={(index) => { setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index)); }}
            />
          </div>
          <div className="mt-3.5 grid grid-cols-1 gap-3.5 tablet:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{t('po.attach.poNumber')}</span>
              <input
                className={fieldInputClass}
                onChange={(event) => { setPoNo(event.currentTarget.value); }}
                placeholder="PO-2025-000"
                value={poNo}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{t('po.attach.actualValue')}</span>
              <input
                className={`${fieldInputClass} num`}
                inputMode="decimal"
                onChange={(event) => { setActual(event.currentTarget.value); }}
                placeholder="0.000"
                value={actual}
              />
            </label>
          </div>
          <label className="mt-3.5 flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{t('po.attach.remarks')}</span>
            <textarea
              className={`${fieldInputClass} resize-y`}
              onChange={(event) => { setRemarks(event.currentTarget.value); }}
              placeholder={t('po.attach.remarksPlaceholder')}
              rows={3}
              value={remarks}
            />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button className={purchasingButtonStyles.secondary} onClick={onClose} type="button">
              {t('po.attach.cancel')}
            </button>
            <button className={purchasingButtonStyles.primary} onClick={onClose} type="button">
              {t('po.attach.submit')}
            </button>
          </div>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
