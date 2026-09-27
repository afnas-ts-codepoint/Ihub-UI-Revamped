import { Download, Folder, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/shared/ui/chip/Chip';
import { DialogBody, DialogContent, DialogDescription, DialogRoot, DialogTitle } from '@/shared/ui/overlay/Dialog';

import type { PurchaseRequestRow, ReviewExtra } from '../types/purchasing.types';

type ReviewDialogProps = Readonly<{
  extra: ReviewExtra;
  onClose: () => void;
  row: PurchaseRequestRow;
}>;

function Meta({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-2xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{label}</span>
      <span className="num text-sm-plus font-semibold text-fg">{value}</span>
    </div>
  );
}

/**
 * The functional supplier-lock review dialog. Because this component only
 * exists in the tree while `revOpen` is true (the parent conditionally
 * mounts it), every open — including re-opening the same row — starts from a
 * fresh `useState('')`, which is behaviorally equivalent to the prototype's
 * `useEffect(() => { setRevSupplier(''); setRevMsg(''); }, [revSel, revOpen])`
 * reset.
 * @prototype index.html:L10254-L10317 `revModal`
 */
export function ReviewDialog({ extra, onClose, row }: ReviewDialogProps) {
  const { t } = useTranslation('purchasing');
  const [supplier, setSupplier] = useState('');
  const [message, setMessage] = useState('');
  const locked = message !== '';
  const suppliers = extra.suppliers.length ? extra.suppliers : [row.vendor];

  const submit = () => {
    if (!supplier || locked) return;
    setMessage(t('review.dialog.submittedMessage', { supplier }));
  };

  return (
    <DialogRoot onOpenChange={(open) => { if (!open) onClose(); }} open>
      <DialogContent className="w-[min(680px,100%)] max-w-[calc(100%-48px)]" data-testid="review-dialog">
        <DialogDescription className="sr-only">{row.title}</DialogDescription>
        <DialogBody className="gap-0">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <Chip tone={row.tone === 'ok' ? 'ok' : 'warn'}>{row.status}</Chip>
              <DialogTitle asChild>
                <h2 className="display m-0 mt-2.5 mb-1.5 text-xl leading-tight tracking-[-0.01em]">{row.title}</h2>
              </DialogTitle>
              <div className="text-sm text-fg-3">
                <span className="num font-semibold text-fg-2">{row.id}</span>{' · '}{row.vendor}{' · '}{row.dept}{' · '}{t('review.dialog.submittedOn')}{' '}{row.submitted}
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="display num text-2xl tracking-[-0.02em] whitespace-nowrap">
                {row.value}
                <span className="text-sm-plus font-medium text-fg-3">{' KWD'}</span>
              </div>
              <button aria-label={t('review.dialog.dismiss')} className="p-0.5 text-xl leading-none text-fg-3" onClick={onClose} type="button">
                <X aria-hidden="true" size={18} />
              </button>
            </div>
          </div>
          <hr className="hairline my-5" />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
            <Meta label={t('review.dialog.quotationsReceived')} value={String(extra.quotes)} />
            <Meta label={t('review.dialog.lowestQuote')} value={`${extra.low} KWD`} />
            <Meta label={t('review.dialog.highestQuote')} value={`${extra.high} KWD`} />
            <Meta label={t('review.dialog.committeeStatus')} value={row.status} />
          </div>
          <div className="mt-5 rounded-xl border border-line bg-canvas p-4">
            <div className="mb-3.5 flex flex-wrap items-center gap-2">
              <span className="eyebrow">{t('review.dialog.submittedRequest')}</span>
              <span className="rounded-full border border-line-strong bg-surface px-1.5 py-0.5 text-2xs font-semibold text-fg-3">{t('review.dialog.asFiled')}</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
              <Meta label={t('review.dialog.location')} value={extra.location || '—'} />
              <Meta label={t('review.dialog.zone')} value={extra.zone || '—'} />
              <Meta label={t('review.dialog.department')} value={row.dept || '—'} />
              <Meta label={t('review.dialog.year')} value={extra.year || '—'} />
              <Meta label={t('review.dialog.activity')} value={extra.activity || '—'} />
              <Meta label={t('review.dialog.subActivity')} value={extra.subActivity || '—'} />
              <Meta label={t('review.dialog.budgeted')} value={extra.budgeted || '—'} />
              <Meta label={t('review.dialog.budgetedValue')} value={`${extra.budgetValue || '—'} KWD`} />
              <Meta label={t('review.dialog.locationType')} value={extra.locType || '—'} />
              <Meta label={t('review.dialog.requestedValue')} value={`${row.value} KWD`} />
            </div>
          </div>
          <div className="mt-5">
            <span className="eyebrow">{t('review.dialog.justification')}</span>
            <p className="m-0 mt-2 text-sm-plus leading-[1.65] text-fg-2">{extra.just}</p>
          </div>
          <div className="mt-5">
            <span className="eyebrow">{t('review.dialog.attachments')}</span>
            <div className="mt-2.5 flex flex-col gap-2">
              {extra.docs.map((doc) => (
                <div className="flex items-center gap-2.5 rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm-plus" key={doc}>
                  <Folder aria-hidden="true" className="text-accent" size={15} />
                  <span className="flex-1 font-semibold">{doc}</span>
                  <Download aria-hidden="true" className="text-fg-4" size={15} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <span className="eyebrow">{t('review.dialog.committeeRemarks')}</span>
            <p className="m-0 mt-2 text-sm-plus leading-[1.65] text-fg-2">{extra.remarks || t('review.dialog.noRemarks')}</p>
          </div>
          <div className="mt-5 rounded-xl border border-accent bg-canvas p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="eyebrow">{t('review.dialog.selectSupplier')}</span>
              <span className="text-xs text-fg-3">{t('review.dialog.editableHint')}</span>
            </div>
            <div className="flex flex-wrap items-end gap-2.5">
              <label className="flex min-w-60 flex-1 flex-col gap-1.5">
                <span className="text-xs font-semibold text-fg-3 uppercase">{t('review.dialog.awardedSupplier')}</span>
                <select
                  className="w-full rounded-lg border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={locked}
                  onChange={(event) => { setSupplier(event.currentTarget.value); setMessage(''); }}
                  value={supplier}
                >
                  <option value="">{t('review.dialog.selectSupplierPlaceholder')}</option>
                  {suppliers.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <button
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-interactive px-3 py-2.5 text-sm font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!supplier || locked}
                onClick={submit}
                type="button"
              >
                {t('review.dialog.submitToCommittee')}
              </button>
            </div>
            {locked ? (
              <div className="mt-3.5 flex flex-col gap-2">
                <div><Chip tone="ok">{message}</Chip></div>
                <div className="text-xs text-fg-3">{t('review.dialog.submittedStatus')}</div>
              </div>
            ) : null}
          </div>
          <hr className="hairline mt-5 mb-4" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-fg-3">{locked ? t('review.dialog.submittedNote') : t('review.dialog.beforeSubmitNote')}</span>
            <button className="ms-auto rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-semibold text-fg" onClick={onClose} type="button">
              {t('review.dialog.close')}
            </button>
          </div>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
