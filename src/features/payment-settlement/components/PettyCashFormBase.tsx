import { Check, ChevronRight, Folder, Plus, X, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ACTION_SHEET_DEPARTMENTS, ACTION_SHEET_LOCATIONS, ACTION_SHEET_SUPPLIERS, ACTION_SHEET_YEARS, ACTION_SHEET_ZONES } from '../data/actionSheet.mock';
import { activityNames, subActivitiesOrAll } from '../domain/activityMaster';
import { formatPettyCashKwd, pettyCashAmount, pettyCashTotal } from '../domain/pettyCashFinancials';
import type { PettyCashDraft } from '../types/paymentSettlement.types';
import { paymentSettlementButtonStyles, segmentedOptionClass } from './actionSheetButtonStyles';
import { ResubmitCard, ReviewDecisionCard, type ReviewDecisionHandler } from './ReviewDecisionCards';

export type PettyCashFormVariant = 'reimburse' | 'request';

const blankDraft = (): PettyCashDraft => ({
  activity: '', amount: '', budgeted: 'yes', collapsed: false, dept: '', files: [], invoice: '',
  key: Math.random().toString(36).slice(2), location: '', remarks: '', subActivity: '', supplier: '', year: '', zone: '',
});

const inputBase = 'w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:border-accent';
const inputClass = `${inputBase} border-line-strong bg-canvas text-fg`;
/** @prototype index.html:L7766 `sel` — an empty select renders in `--text-3`. */
const selectClass = (value: string) => `${inputBase} border-line-strong bg-canvas ${value ? 'text-fg' : 'text-fg-3'}`;
const kickerClass = 'text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase';

type StringDraftKey = 'dept' | 'location' | 'supplier' | 'year' | 'zone';

type PettyCashFormBaseProps = Readonly<{
  onDecision?: ReviewDecisionHandler;
  resubmit?: boolean;
  review?: boolean;
  variant: PettyCashFormVariant;
  verify?: boolean;
}>;

/**
 * Shared body of the two prototype multi-request forms. `request` mirrors
 * `PettyCashRequestCreate`, including its `review` / `resubmit` / `verify` /
 * `onDecision` branches used by the Home Form Preview (the left column turns
 * read-only until Edit, "Add another request" is hidden and the Decision or
 * Resubmit card replaces the Actions card); `reimburse` mirrors
 * `ReimbursePettyCashCreate`, which has no review mode and adds Activity,
 * Sub Activity, Budgeted and Invoice # fields.
 * @prototype index.html:L7663-L7741 `ReimbursePettyCashCreate`; L7744-L7828 `PettyCashRequestCreate`
 */
export function PettyCashFormBase({ onDecision, resubmit, review, variant, verify }: PettyCashFormBaseProps) {
  const { t } = useTranslation('paymentSettlement');
  const [drafts, setDrafts] = useState<PettyCashDraft[]>([blankDraft()]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editable, setEditable] = useState(false);
  const reimburse = variant === 'reimburse';

  const total = pettyCashTotal(drafts);
  const disabled = review && !editable && !resubmit;

  const patch = (index: number, next: Partial<PettyCashDraft>) => {
    setDrafts((current) => current.map((draft, itemIndex) => (itemIndex === index ? { ...draft, ...next } : draft)));
  };

  const field = (label: string, control: ReactNode) => (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className={kickerClass}>{label}</span>
      {control}
    </label>
  );

  const select = (index: number, key: StringDraftKey, options: readonly string[], placeholder: string) => (
    <select className={selectClass(drafts[index]?.[key] ?? '')} onChange={(event) => { patch(index, { [key]: event.currentTarget.value }); }} value={drafts[index]?.[key] ?? ''}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );

  const amountField = (index: number, draft: PettyCashDraft) =>
    field(t('pettyCash.form.fields.amount'), (
      <>
        <input className={inputClass} min="0" onChange={(event) => { patch(index, { amount: event.currentTarget.value }); }} placeholder="0.000" type="number" value={draft.amount} />
        <span className="num mt-1.5 text-sm font-semibold text-accent">{formatPettyCashKwd(pettyCashAmount(draft))}</span>
      </>
    ));

  /** @prototype index.html:L7720-L7723 / L7797-L7800 `submit` — only attachment captions gate; an empty form submits. */
  const submit = () => {
    if (drafts.some((draft) => draft.files.some((file) => !file.caption.trim()))) {
      setError(t('pettyCash.form.captionError'));
      window.setTimeout(() => { setError(''); }, 3000);
      return;
    }
    setError('');
    setMessage(t(`pettyCash.form.${variant}.${drafts.length > 1 ? 'submittedMultiple' : 'submittedSingle'}`));
    window.setTimeout(() => { setMessage(''); }, 2800);
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div className="mb-3.5 min-w-0">
        <h2 className="m-0 text-lg font-semibold tracking-[-0.01em]">{t(`pettyCash.form.${variant}.title`)}</h2>
        <p className="mt-0.5 mb-0 text-base text-fg-3">{t(`pettyCash.form.${variant}.subtitle`)}</p>
      </div>
      <div className="grid grid-cols-1 items-start gap-4 tablet:grid-cols-[1.7fr_1fr]">
        <div className={`flex min-w-0 flex-col gap-3 ${disabled ? 'pointer-events-none opacity-[0.92]' : ''}`}>
          {drafts.map((draft, index) => (
            <div className="overflow-hidden rounded-xl border border-line bg-surface" key={draft.key}>
              <div className="flex w-full items-center justify-between gap-3 px-5 py-4">
                <button
                  aria-expanded={!draft.collapsed}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-start"
                  onClick={() => { patch(index, { collapsed: !draft.collapsed }); }}
                  type="button"
                >
                  <ChevronRight aria-hidden="true" className={`shrink-0 text-fg-4 transition-transform ${draft.collapsed ? 'rtl:-scale-x-100' : 'rotate-90'}`} size={16} />
                  <span className="m-0 text-sm-plus font-semibold tracking-[-0.01em] whitespace-nowrap">{t('pettyCash.form.requestLabel')} {index + 1}</span>
                  {draft.dept ? <span className="rounded-full border border-line-strong bg-inset px-2 py-0.5 text-xs font-semibold text-fg-2">{draft.dept}</span> : null}
                  {draft.amount ? <span className="num rounded-full border border-accent/30 bg-accent-dim px-2 py-0.5 text-xs font-semibold text-accent">{formatPettyCashKwd(pettyCashAmount(draft))}</span> : null}
                </button>
                {drafts.length > 1 ? (
                  <button
                    aria-label={t('pettyCash.form.removeRequest', { number: index + 1 })}
                    className="inline-flex shrink-0 p-0.5 text-fg-4"
                    onClick={() => { setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index)); }}
                    type="button"
                  >
                    <X aria-hidden="true" size={16} />
                  </button>
                ) : null}
              </div>
              {draft.collapsed ? null : (
                <div className="flex flex-col gap-4 px-5 pb-5">
                  <div className="grid grid-cols-1 items-start gap-4 tablet:grid-cols-3">
                    {field(t('pettyCash.form.fields.location'), select(index, 'location', ACTION_SHEET_LOCATIONS, t('pettyCash.form.select.location')))}
                    {field(t('pettyCash.form.fields.zone'), select(index, 'zone', ACTION_SHEET_ZONES, t('pettyCash.form.select.zone')))}
                    {field(t('pettyCash.form.fields.department'), select(index, 'dept', ACTION_SHEET_DEPARTMENTS, t('pettyCash.form.select.department')))}
                    {reimburse ? (
                      <>
                        {field(t('pettyCash.form.fields.year'), select(index, 'year', ACTION_SHEET_YEARS, t('pettyCash.form.select.year')))}
                        {/* Activity change deliberately does not reset Sub Activity (index.html:L7701). */}
                        {field(t('pettyCash.form.fields.activity'), (
                          <select className={selectClass(draft.activity)} onChange={(event) => { patch(index, { activity: event.currentTarget.value }); }} value={draft.activity}>
                            <option value="">{t('pettyCash.form.select.activity')}</option>
                            {activityNames().map((name) => <option key={name}>{name}</option>)}
                          </select>
                        ))}
                        {field(t('pettyCash.form.fields.subActivity'), (
                          <select className={selectClass(draft.subActivity)} onChange={(event) => { patch(index, { subActivity: event.currentTarget.value }); }} value={draft.subActivity}>
                            <option value="">{t('pettyCash.form.select.subActivity')}</option>
                            {subActivitiesOrAll(draft.activity).map((name) => <option key={name}>{name}</option>)}
                          </select>
                        ))}
                        {field(t('pettyCash.form.fields.budgeted'), (
                          <div className="inline-flex w-fit gap-0.5 rounded-lg border border-line bg-inset p-0.5">
                            {(['yes', 'no'] as const).map((option) => (
                              <button aria-pressed={draft.budgeted === option} className={segmentedOptionClass(draft.budgeted === option)} key={option} onClick={() => { patch(index, { budgeted: option }); }} type="button">
                                {t(`pettyCash.form.budgeted.${option}`)}
                              </button>
                            ))}
                          </div>
                        ))}
                        {amountField(index, draft)}
                        {field(t('pettyCash.form.fields.invoice'), <input className={inputClass} onChange={(event) => { patch(index, { invoice: event.currentTarget.value }); }} placeholder={t('pettyCash.form.invoicePlaceholder')} value={draft.invoice} />)}
                        {field(t('pettyCash.form.fields.supplier'), select(index, 'supplier', ACTION_SHEET_SUPPLIERS, t('pettyCash.form.select.supplier')))}
                      </>
                    ) : (
                      <>
                        {field(t('pettyCash.form.fields.supplier'), select(index, 'supplier', ACTION_SHEET_SUPPLIERS, t('pettyCash.form.select.supplier')))}
                        {field(t('pettyCash.form.fields.year'), select(index, 'year', ACTION_SHEET_YEARS, t('pettyCash.form.select.year')))}
                        {amountField(index, draft)}
                      </>
                    )}
                  </div>
                  {field(t('pettyCash.form.fields.remarks'), <textarea className={`${inputClass} resize-y`} onChange={(event) => { patch(index, { remarks: event.currentTarget.value }); }} placeholder={t('pettyCash.form.remarksPlaceholder')} rows={3} value={draft.remarks} />)}
                  <div className="flex flex-col gap-2.5">
                    <span className={kickerClass}>{t(`pettyCash.form.${variant}.attachment`)}</span>
                    {draft.files.map((file, fileIndex) => (
                      <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-line bg-canvas p-3" key={`${file.name}-${String(fileIndex)}`}>
                        <Folder aria-hidden="true" className="text-accent" size={16} />
                        <span className="min-w-[120px] flex-1 truncate text-sm-plus font-semibold">{file.name || t('pettyCash.form.untitledFile')}</span>
                        <input
                          className={`${inputBase} min-w-[180px] flex-[1_1_180px] bg-surface text-fg ${file.caption.trim() ? 'border-line-strong' : 'border-bad'}`}
                          onChange={(event) => { patch(index, { files: draft.files.map((item, itemIndex) => (itemIndex === fileIndex ? { ...item, caption: event.currentTarget.value } : item)) }); }}
                          placeholder={t('pettyCash.form.captionPlaceholder')}
                          value={file.caption}
                        />
                        <button aria-label={t('pettyCash.form.removeAttachment')} className="p-0.5 text-fg-4" onClick={() => { patch(index, { files: draft.files.filter((_, itemIndex) => itemIndex !== fileIndex) }); }} type="button">
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
                      <div className="mt-2 text-sm-plus font-semibold">{t('pettyCash.form.uploadHint')}</div>
                      <div className="mt-1 text-xs text-fg-3">{t('pettyCash.form.captionHint')}</div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
          {review ? null : (
            <button className={`${paymentSettlementButtonStyles.secondary} w-fit self-start border-dashed px-4 py-2.5 text-accent`} onClick={() => { setDrafts((current) => [...current, blankDraft()]); }} type="button">
              <Plus aria-hidden="true" size={15} />
              {t('pettyCash.form.addAnother')}
            </button>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-4 tablet:sticky tablet:top-[120px]">
          <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-[22px]">
            <h3 className="m-0 text-sm-plus font-semibold tracking-[-0.01em]">{t('pettyCash.form.summary')}</h3>
            <span className={kickerClass}>{drafts.length} {t(drafts.length === 1 ? 'pettyCash.form.requestSingular' : 'pettyCash.form.requestPlural')}</span>
            <div className="flex flex-col gap-1 rounded-xl border border-line-strong bg-canvas p-3.5">
              <span className={kickerClass}>{t(`pettyCash.form.${variant}.totalLabel`)}</span>
              <span className="num text-xl font-semibold tracking-[-0.02em]">{formatPettyCashKwd(total)}</span>
            </div>
          </div>
          {review ? (
            resubmit ? (
              <ResubmitCard labelScope="pettyCash.form" onDecision={onDecision} />
            ) : (
              <ReviewDecisionCard
                editable={editable}
                labelScope="pettyCash.form"
                onDecision={onDecision}
                onToggleEditable={() => { setEditable((value) => !value); }}
                verify={verify}
              />
            )
          ) : (
            <div className="flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-[22px]">
              <h3 className="m-0 text-sm-plus font-semibold tracking-[-0.01em]">{t('pettyCash.form.actions')}</h3>
              <button className={`${paymentSettlementButtonStyles.primary} w-full`} onClick={submit} type="button">
                <Check aria-hidden="true" size={15} />
                {t(`pettyCash.form.${variant}.submit`)}
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
              {/* PROTOTYPE-NOOP(D2): "Save as draft" has no onClick handler at all (index.html:L7735 / L7812). */}
              <button className={`${paymentSettlementButtonStyles.secondary} w-full`} type="button">
                <Folder aria-hidden="true" size={16} />
                {t('pettyCash.form.saveDraft')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
