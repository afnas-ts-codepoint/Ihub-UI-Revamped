import { Check, ChevronRight, Folder, Plus, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ACTION_SHEET_CATEGORIES,
  ACTION_SHEET_DEPARTMENTS,
  ACTION_SHEET_LOCATIONS,
  ACTION_SHEET_SUPPLIERS,
  ACTION_SHEET_YEARS,
  ACTION_SHEET_ZONES,
} from '../data/actionSheet.mock';
import { activityNames, subActivitiesFor } from '../domain/activityMaster';
import { ACTION_SHEET_CURRENCIES, actionSheetAboveBudget, actionSheetPurchaseValue, formatActionSheetKwd } from '../domain/actionSheetFinancials';
import type { ActionSheetDraft } from '../types/paymentSettlement.types';
import { paymentSettlementButtonStyles, segmentedOptionClass } from './actionSheetButtonStyles';
import { ResubmitCard, ReviewDecisionCard, type ReviewDecisionHandler } from './ReviewDecisionCards';

const blankDraft = (): ActionSheetDraft => ({
  activity: '', budgeted: 'yes', category: '', ccy: '', collapsed: false, dept: '', files: [], grn: false,
  invoice: '', key: Math.random().toString(36).slice(2), location: '', payType: 'advance', pval: '',
  remarks: '', sheetType: 'regular', subActivity: '', supplier: '', year: '', zone: '',
});

const inputClass = 'w-full rounded-lg border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none focus:border-accent';

type ActionSheetFormProps = Readonly<{
  embedded?: boolean;
  onDecision?: ReviewDecisionHandler;
  resubmit?: boolean;
  review?: boolean;
  verify?: boolean;
}>;

/**
 * Create / review form for an action sheet. Create mode is the Payment
 * Settlement "Create" sub-tab (`embedded`); `review` (+ `resubmit`, `verify`,
 * `onDecision`) is the Home approvals Form Preview, where the left column is
 * read-only until the approver presses Edit and the right column carries the
 * Decision card (or the Resubmit card for the creator of a returned item).
 * @prototype index.html:L17034-L17151 `CreateActionSheetPanel`
 */
export function ActionSheetForm({ embedded, onDecision, resubmit, review, verify }: ActionSheetFormProps) {
  const { t } = useTranslation('paymentSettlement');
  const [sheets, setSheets] = useState<ActionSheetDraft[]>([blankDraft()]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editable, setEditable] = useState(false);

  const totalPurchase = sheets.reduce((sum, draft) => sum + actionSheetPurchaseValue(draft), 0);
  const aboveBudget = sheets.reduce((sum, draft) => sum + actionSheetAboveBudget(draft), 0);

  const patch = (index: number, next: Partial<ActionSheetDraft>) => {
    setSheets((current) => current.map((draft, itemIndex) => (itemIndex === index ? { ...draft, ...next } : draft)));
  };

  const field = (label: string, control: ReactNode) => (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{label}</span>
      {control}
    </label>
  );

  type StringDraftKey = 'category' | 'ccy' | 'dept' | 'location' | 'supplier' | 'year' | 'zone';

  const select = (
    index: number,
    key: StringDraftKey,
    options: readonly string[],
    placeholder: string,
  ) => (
    <select className={inputClass} onChange={(event) => { patch(index, { [key]: event.currentTarget.value }); }} value={sheets[index]?.[key] ?? ''}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );

  const segmented = <Value extends string>(options: readonly { id: Value; label: string }[], value: Value, onChange: (next: Value) => void) => (
    <div className="inline-flex w-fit gap-0.5 rounded-lg border border-line bg-inset p-0.5">
      {options.map((option) => (
        <button className={segmentedOptionClass(value === option.id)} key={option.id} onClick={() => { onChange(option.id); }} type="button">
          {option.label}
        </button>
      ))}
    </div>
  );

  const submit = () => {
    const missingCaption = sheets.some((draft) => draft.files.some((file) => !file.caption.trim()));
    if (missingCaption) {
      setError(t('actionSheet.create.captionError'));
      window.setTimeout(() => { setError(''); }, 3000);
      return;
    }
    setError('');
    setMessage(sheets.length > 1 ? t('actionSheet.create.submittedCombined') : t('actionSheet.create.submittedSingle'));
    window.setTimeout(() => { setMessage(''); }, 2800);
  };

  const disabled = review && !editable && !resubmit;

  return (
    <div className="flex flex-col gap-3.5 pb-10">
      {embedded ? null : <h1 className="display m-0 text-[34px] leading-[1.1] font-medium tracking-[-0.025em]">{t('actionSheet.create.title')}</h1>}
      <div className="grid grid-cols-1 items-start gap-4 tablet:grid-cols-[1.7fr_1fr]">
        <div className={`flex min-w-0 flex-col gap-3 ${disabled ? 'pointer-events-none opacity-[0.92]' : ''}`}>
          {sheets.map((draft, index) => {
            const purchaseValue = actionSheetPurchaseValue(draft);
            return (
              <div className="overflow-hidden rounded-xl border border-line bg-surface" key={draft.key}>
                <div className="flex w-full items-center justify-between gap-3 px-5 py-4">
                  <button
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-start"
                    onClick={() => { patch(index, { collapsed: !draft.collapsed }); }}
                    type="button"
                  >
                    <ChevronRight aria-hidden="true" className={`shrink-0 text-fg-4 transition-transform ${draft.collapsed ? '' : 'rotate-90'}`} size={16} />
                    <span className="m-0 text-sm-plus font-semibold tracking-[-0.01em] whitespace-nowrap">{t('actionSheet.create.sheet')} {index + 1}</span>
                    {draft.supplier ? <span className="rounded-full border border-line-strong bg-inset px-2 py-0.5 text-xs font-semibold text-fg-2">{draft.supplier}</span> : null}
                    {purchaseValue ? <span className="num rounded-full border border-accent/30 bg-accent-dim px-2 py-0.5 text-xs font-semibold text-accent">{formatActionSheetKwd(purchaseValue)}</span> : null}
                  </button>
                  {sheets.length > 1 ? (
                    <button
                      className="inline-flex shrink-0 p-0.5 text-fg-4"
                      onClick={() => { setSheets((current) => current.filter((_, itemIndex) => itemIndex !== index)); }}
                      type="button"
                    >
                      <X aria-hidden="true" size={16} />
                    </button>
                  ) : null}
                </div>
                {draft.collapsed ? null : (
                  <div className="flex flex-col gap-4 px-5 pb-5">
                    <h3 className="m-0 text-sm font-semibold text-fg-2">{t('actionSheet.create.allocation')}</h3>
                    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
                      {field(t('actionSheet.create.fields.location'), select(index, 'location', ACTION_SHEET_LOCATIONS, t('actionSheet.create.select.location')))}
                      {field(t('actionSheet.create.fields.zone'), select(index, 'zone', ACTION_SHEET_ZONES, t('actionSheet.create.select.zone')))}
                      {field(t('actionSheet.create.fields.department'), select(index, 'dept', ACTION_SHEET_DEPARTMENTS, t('actionSheet.create.select.department')))}
                      {field(t('actionSheet.create.fields.year'), select(index, 'year', ACTION_SHEET_YEARS, t('actionSheet.create.select.year')))}
                      {field(t('actionSheet.create.fields.activity'), (
                        <select className={inputClass} onChange={(event) => { patch(index, { activity: event.currentTarget.value, subActivity: '' }); }} value={draft.activity}>
                          <option value="">{t('actionSheet.create.select.activity')}</option>
                          {activityNames().map((name) => <option key={name}>{name}</option>)}
                        </select>
                      ))}
                      {field(t('actionSheet.create.fields.subActivity'), (
                        <select className={inputClass} onChange={(event) => { patch(index, { subActivity: event.currentTarget.value }); }} value={draft.subActivity}>
                          <option value="">{t('actionSheet.create.select.subActivity')}</option>
                          {subActivitiesFor(draft.activity).map((name) => <option key={name}>{name}</option>)}
                        </select>
                      ))}
                    </div>
                    <hr className="hairline" />
                    <h3 className="m-0 text-sm font-semibold text-fg-2">{t('actionSheet.create.financials')}</h3>
                    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
                      {field(t('actionSheet.create.fields.budgeted'), segmented([{ id: 'yes' as const, label: t('actionSheet.create.budgeted.yes') }, { id: 'no' as const, label: t('actionSheet.create.budgeted.no') }], draft.budgeted, (next) => { patch(index, { budgeted: next }); }))}
                      {field(t('actionSheet.create.fields.category'), select(index, 'category', ACTION_SHEET_CATEGORIES, t('actionSheet.create.select.category')))}
                      {field(t('actionSheet.create.fields.purchaseValue'), <input className={inputClass} min="0" onChange={(event) => { patch(index, { pval: event.currentTarget.value }); }} placeholder="0.000" type="number" value={draft.pval} />)}
                      {field(t('actionSheet.create.fields.currency'), select(index, 'ccy', ACTION_SHEET_CURRENCIES, t('actionSheet.create.select.currency')))}
                      {field(t('actionSheet.create.fields.invoice'), <input className={inputClass} onChange={(event) => { patch(index, { invoice: event.currentTarget.value }); }} placeholder={t('actionSheet.create.invoicePlaceholder')} value={draft.invoice} />)}
                      {field(t('actionSheet.create.fields.supplier'), select(index, 'supplier', ACTION_SHEET_SUPPLIERS, t('actionSheet.create.select.supplier')))}
                      {field(t('actionSheet.create.fields.paymentType'), segmented([{ id: 'advance' as const, label: t('actionSheet.create.paymentType.advance') }, { id: 'final' as const, label: t('actionSheet.create.paymentType.final') }], draft.payType, (next) => { patch(index, { payType: next }); }))}
                    </div>
                    <hr className="hairline" />
                    <h3 className="m-0 text-sm font-semibold text-fg-2">{t('actionSheet.create.options')}</h3>
                    <div className="grid grid-cols-1 items-start gap-4 tablet:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
                      {field(t('actionSheet.create.fields.sheetType'), segmented([{ id: 'regular' as const, label: t('actionSheet.create.sheetType.regular') }, { id: 'scheduled' as const, label: t('actionSheet.create.sheetType.scheduled') }], draft.sheetType, (next) => { patch(index, { sheetType: next }); }))}
                      {field(t('actionSheet.create.fields.grn'), (
                        <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-lg border border-line-strong bg-canvas px-3 py-2.5">
                          <input checked={draft.grn} className="size-4 cursor-pointer accent-accent" onChange={(event) => { patch(index, { grn: event.currentTarget.checked }); }} type="checkbox" />
                          <span className="text-sm-plus font-semibold text-fg">{t('actionSheet.create.grnReceived')}</span>
                        </label>
                      ))}
                    </div>
                    {field(t('actionSheet.create.fields.remarks'), <textarea className={`${inputClass} resize-y`} onChange={(event) => { patch(index, { remarks: event.currentTarget.value }); }} placeholder={t('actionSheet.create.remarksPlaceholder')} rows={3} value={draft.remarks} />)}
                    <hr className="hairline" />
                    <div className="flex flex-col gap-2.5">
                      <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{t('actionSheet.create.attachment')}</span>
                      {draft.files.map((file, fileIndex) => (
                        <div className={`flex flex-wrap items-center gap-2.5 rounded-lg border p-3 ${file.caption.trim() ? 'border-line' : 'border-bad'}`} key={`${file.name}-${String(fileIndex)}`}>
                          <Folder aria-hidden="true" className="text-accent" size={16} />
                          <span className="min-w-[120px] flex-1 truncate text-sm-plus font-semibold">{file.name || t('actionSheet.create.untitledFile')}</span>
                          <input
                            className={`${inputClass} min-w-[180px] flex-[1_1_180px] bg-surface`}
                            onChange={(event) => { patch(index, { files: draft.files.map((item, itemIndex) => (itemIndex === fileIndex ? { ...item, caption: event.currentTarget.value } : item)) }); }}
                            placeholder={t('actionSheet.create.captionPlaceholder')}
                            value={file.caption}
                          />
                          <button className="p-0.5 text-fg-4" onClick={() => { patch(index, { files: draft.files.filter((_, itemIndex) => itemIndex !== fileIndex) }); }} type="button">
                            <X aria-hidden="true" size={15} />
                          </button>
                        </div>
                      ))}
                      <label className="block cursor-pointer rounded-xl border border-dashed border-line-strong bg-raised p-[18px] text-center">
                        <input
                          className="hidden"
                          multiple
                          onChange={(event) => {
                            const files = Array.from(event.currentTarget.files ?? []).map((file) => ({ caption: '', name: file.name }));
                            patch(index, { files: [...draft.files, ...files] });
                            event.currentTarget.value = '';
                          }}
                          type="file"
                        />
                        <Folder aria-hidden="true" className="mx-auto text-accent" size={20} />
                        <div className="mt-2 text-sm-plus font-semibold">{t('actionSheet.create.uploadHint')}</div>
                        <div className="mt-1 text-xs text-fg-3">{t('actionSheet.create.captionHint')}</div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {review ? null : (
            <button className={paymentSettlementButtonStyles.secondary} onClick={() => { setSheets((current) => [...current, blankDraft()]); }} type="button">
              <Plus aria-hidden="true" size={15} />
              {t('actionSheet.create.combine')}
            </button>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-4 tablet:sticky tablet:top-[120px]">
          <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-[22px]">
            <h3 className="m-0 text-sm-plus font-semibold tracking-[-0.01em]">{t('actionSheet.create.summary')}</h3>
            <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{t('actionSheet.create.sheetCount', { count: sheets.length })}</span>
            <div className="flex flex-col gap-1 rounded-xl border border-line-strong bg-canvas p-3.5">
              <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{t('actionSheet.create.totalPurchaseValue')}</span>
              <span className="num text-xl font-semibold tracking-[-0.02em]">{formatActionSheetKwd(totalPurchase)}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-line-strong bg-canvas p-3.5">
              <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{t('actionSheet.create.totalAboveBudget')}</span>
              <span className={`num text-xl font-semibold tracking-[-0.02em] ${aboveBudget > 0 ? 'text-bad' : ''}`}>{formatActionSheetKwd(aboveBudget)}</span>
            </div>
          </div>
          {review ? (
            resubmit ? (
              <ResubmitCard labelScope="actionSheet" onDecision={onDecision} />
            ) : (
              <ReviewDecisionCard
                editable={editable}
                labelScope="actionSheet"
                onDecision={onDecision}
                onToggleEditable={() => { setEditable((value) => !value); }}
                verify={verify}
              />
            )
          ) : (
            <div className="flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-[22px]">
              <h3 className="m-0 text-sm-plus font-semibold tracking-[-0.01em]">{t('actionSheet.create.actions')}</h3>
              <button className={`${paymentSettlementButtonStyles.primary} w-full`} onClick={submit} type="button">
                <Check aria-hidden="true" size={15} />
                {t('actionSheet.create.submit', { count: sheets.length })}
              </button>
              {error ? <div className="rounded-lg bg-bad/10 px-3 py-2.5 text-sm-plus font-semibold text-bad">{error}</div> : null}
              {message ? <div className="rounded-lg bg-ok/10 px-3 py-2.5 text-sm-plus font-semibold text-ok">{message}</div> : null}
              {/* PROTOTYPE-NOOP(D2): "Save as draft" has no onClick handler at all (index.html:L17130). */}
              <button className={`${paymentSettlementButtonStyles.secondary} w-full`} type="button">
                <Folder aria-hidden="true" size={16} />
                {t('actionSheet.create.saveDraft')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
