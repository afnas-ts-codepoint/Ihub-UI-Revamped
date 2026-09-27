import { ChevronRight, Check, Folder, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { activityAvailable, activityNames, subActivitiesFor, subBudget } from '../domain/activityBudget';
import { PC_REQUEST_DEPARTMENTS, PC_REQUEST_LOCATIONS, PC_REQUEST_YEARS, PC_REQUEST_ZONES } from '../data/purchasing.mock';
import { purchasingButtonStyles } from './purchasingButtonStyles';
import { PurchasingSectionHeading } from './PurchasingSectionHeading';

type Attachment = Readonly<{ caption: string; name: string }>;

type RequestDraft = {
  activity: string;
  budgeted: 'no' | 'yes';
  collapsed: boolean;
  dept: string;
  files: Attachment[];
  key: string;
  location: string;
  locType: 'international' | 'local';
  logNote: string;
  remarks: string;
  subActivity: string;
  year: string;
  zone: string;
};

const blankDraft = (): RequestDraft => ({
  activity: '', budgeted: 'yes', collapsed: false, dept: '', files: [], key: Math.random().toString(36).slice(2),
  location: '', locType: 'local', logNote: '', remarks: '', subActivity: '', year: '', zone: '',
});

const inputClass = 'w-full rounded-lg border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none focus:border-accent';
const fmtKwd = (value: number) => `KWD ${value.toLocaleString('en-US', { maximumFractionDigits: 3, minimumFractionDigits: 3 })}`;

const budgetOf = (draft: RequestDraft): number => {
  if (draft.budgeted !== 'yes' || !draft.activity) return 0;
  if (draft.subActivity) return subBudget(draft.activity, draft.subActivity).available;
  return activityAvailable(draft.activity);
};

/** @prototype index.html:L9949-L10031 `PCRequestCreate` */
export function PCRequestCreate() {
  const { t } = useTranslation('purchasing');
  const [requests, setRequests] = useState<RequestDraft[]>([blankDraft()]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const total = requests.reduce((sum, draft) => sum + budgetOf(draft), 0);

  const patch = (index: number, next: Partial<RequestDraft>) => {
    setRequests((current) => current.map((draft, itemIndex) => (itemIndex === index ? { ...draft, ...next } : draft)));
  };

  const field = (label: string, control: React.ReactNode) => (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{label}</span>
      {control}
    </label>
  );

  const select = (index: number, key: 'dept' | 'location' | 'year' | 'zone', options: readonly string[], placeholder: string) => (
    <select className={inputClass} onChange={(event) => { patch(index, { [key]: event.currentTarget.value }); }} value={requests[index]?.[key] ?? ''}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );

  const segmented = <Value extends string>(options: readonly { id: Value; label: string }[], value: Value, onChange: (next: Value) => void) => (
    <div className="inline-flex w-fit gap-0.5 rounded-lg border border-line bg-inset p-0.5">
      {options.map((option) => (
        <button
          className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap ${value === option.id ? 'bg-surface font-semibold text-accent shadow-sm' : 'bg-transparent text-fg-2'}`}
          key={option.id}
          onClick={() => { onChange(option.id); }}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  const submit = () => {
    const missingCaption = requests.some((draft) => draft.files.some((file) => !file.caption.trim()));
    if (missingCaption) {
      setError(t('create.captionError'));
      window.setTimeout(() => { setError(''); }, 3000);
      return;
    }
    setError('');
    setMessage(requests.length > 1 ? t('create.submittedCombined') : t('create.submittedSingle'));
    window.setTimeout(() => { setMessage(''); }, 2800);
  };

  return (
    <>
      <PurchasingSectionHeading subtitle={t('create.subtitle')} title={t('create.title')} />
      <div className="grid grid-cols-1 items-start gap-4 tablet:grid-cols-[1.7fr_1fr]">
        <div className="flex min-w-0 flex-col gap-3">
          {requests.map((draft, index) => {
            const subActivityOptions = subActivitiesFor(draft.activity);
            const available = budgetOf(draft);
            return (
              <div className="overflow-hidden rounded-xl border border-line bg-surface" key={draft.key}>
                <div className="flex w-full items-center justify-between gap-3 px-5 py-4">
                  <button
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-start"
                    onClick={() => { patch(index, { collapsed: !draft.collapsed }); }}
                    type="button"
                  >
                    <ChevronRight aria-hidden="true" className={`shrink-0 text-fg-4 transition-transform ${draft.collapsed ? '' : 'rotate-90'}`} size={16} />
                    <span className="m-0 text-sm-plus font-semibold tracking-[-0.01em] whitespace-nowrap">{t('create.request')} {index + 1}</span>
                    {draft.dept ? <span className="rounded-full border border-line-strong bg-inset px-2 py-0.5 text-xs font-semibold text-fg-2">{draft.dept}</span> : null}
                    {draft.budgeted === 'yes' && available ? <span className="num rounded-full border border-accent/30 bg-accent-dim px-2 py-0.5 text-xs font-semibold text-accent">{fmtKwd(available)}</span> : null}
                  </button>
                  {requests.length > 1 ? (
                    <button
                      className="inline-flex shrink-0 p-0.5 text-fg-4"
                      onClick={() => { setRequests((current) => current.filter((_, itemIndex) => itemIndex !== index)); }}
                      type="button"
                    >
                      <X aria-hidden="true" size={16} />
                    </button>
                  ) : null}
                </div>
                {draft.collapsed ? null : (
                  <div className="flex flex-col gap-4 px-5 pb-5">
                    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
                      {field(t('create.fields.location'), select(index, 'location', PC_REQUEST_LOCATIONS, t('create.select.location')))}
                      {field(t('create.fields.zone'), select(index, 'zone', PC_REQUEST_ZONES, t('create.select.zone')))}
                      {field(t('create.fields.department'), select(index, 'dept', PC_REQUEST_DEPARTMENTS, t('create.select.department')))}
                      {field(t('create.fields.year'), select(index, 'year', PC_REQUEST_YEARS, t('create.select.year')))}
                      {field(t('create.fields.activity'), (
                        <select className={inputClass} onChange={(event) => { patch(index, { activity: event.currentTarget.value, subActivity: '' }); }} value={draft.activity}>
                          <option value="">{t('create.select.activity')}</option>
                          {activityNames().map((name) => <option key={name}>{name}</option>)}
                        </select>
                      ))}
                      {field(t('create.fields.subActivity'), (
                        <select className={inputClass} onChange={(event) => { patch(index, { subActivity: event.currentTarget.value }); }} value={draft.subActivity}>
                          <option value="">{t('create.select.subActivity')}</option>
                          {subActivityOptions.map((name) => <option key={name}>{name}</option>)}
                        </select>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 items-start gap-4 tablet:grid-cols-3">
                      {field(t('create.fields.budgeted'), segmented([{ id: 'yes' as const, label: t('create.budgeted.yes') }, { id: 'no' as const, label: t('create.budgeted.no') }], draft.budgeted, (next) => { patch(index, { budgeted: next }); }))}
                      {field(t('create.fields.budgetedValue'), (
                        <div className="flex flex-col gap-1.5">
                          <div className={`${inputClass} flex items-center bg-inset font-semibold ${draft.budgeted === 'yes' && draft.activity ? 'text-accent' : 'text-fg-3'}`}>
                            {draft.budgeted === 'yes' ? (draft.activity ? fmtKwd(available) : t('create.selectActivityFirst')) : t('create.notBudgeted')}
                          </div>
                          <span className="text-xs text-fg-3">{t('create.budgetedForHint')}</span>
                        </div>
                      ))}
                      {field(t('create.fields.locationType'), segmented([{ id: 'local' as const, label: t('create.locationType.local') }, { id: 'international' as const, label: t('create.locationType.international') }], draft.locType, (next) => { patch(index, { locType: next }); }))}
                    </div>
                    {field(t('create.fields.remarks'), <textarea className={`${inputClass} resize-y`} onChange={(event) => { patch(index, { remarks: event.currentTarget.value }); }} placeholder={t('create.remarksPlaceholder')} rows={3} value={draft.remarks} />)}
                    <div className="flex flex-col gap-2.5">
                      <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{t('create.attachments')}</span>
                      {draft.files.map((file, fileIndex) => (
                        <div className={`flex flex-wrap items-center gap-2.5 rounded-lg border p-3 ${file.caption.trim() ? 'border-line' : 'border-bad'}`} key={`${file.name}-${String(fileIndex)}`}>
                          <Folder aria-hidden="true" className="text-accent" size={16} />
                          <span className="min-w-[120px] flex-1 truncate text-sm-plus font-semibold">{file.name || t('create.untitledFile')}</span>
                          <input
                            className={`${inputClass} min-w-[180px] flex-[1_1_180px] bg-surface`}
                            onChange={(event) => { patch(index, { files: draft.files.map((item, itemIndex) => (itemIndex === fileIndex ? { ...item, caption: event.currentTarget.value } : item)) }); }}
                            placeholder={t('create.captionPlaceholder')}
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
                        <div className="mt-2 text-sm-plus font-semibold">{t('create.uploadHint')}</div>
                        <div className="mt-1 text-xs text-fg-3">{t('create.captionHint')}</div>
                      </label>
                    </div>
                    {field(t('create.fields.logNote'), <textarea className={`${inputClass} resize-y`} onChange={(event) => { patch(index, { logNote: event.currentTarget.value }); }} placeholder={t('create.logNotePlaceholder')} rows={3} value={draft.logNote} />)}
                  </div>
                )}
              </div>
            );
          })}
          <button className={purchasingButtonStyles.secondary} onClick={() => { setRequests((current) => [...current, blankDraft()]); }} type="button">
            <Plus aria-hidden="true" size={15} />
            {t('create.combine')}
          </button>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-[22px]">
            <h3 className="m-0 text-sm-plus font-semibold tracking-[-0.01em]">{t('create.summary')}</h3>
            <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{t('create.requestCount', { count: requests.length })}</span>
            <div className="flex flex-col gap-1 rounded-xl border border-line-strong bg-canvas p-3.5">
              <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{t('create.totalBudgetedValue')}</span>
              <span className="num text-xl font-semibold tracking-[-0.02em]">{fmtKwd(total)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-[22px]">
            <h3 className="m-0 text-sm-plus font-semibold tracking-[-0.01em]">{t('create.actions')}</h3>
            <button className={`${purchasingButtonStyles.primary} w-full`} onClick={submit} type="button">
              <Check aria-hidden="true" size={15} />
              {t('create.submit')}
            </button>
            {error ? <div className="rounded-lg bg-bad/10 px-3 py-2.5 text-sm-plus font-semibold text-bad">{error}</div> : null}
            {message ? <div className="rounded-lg bg-ok/10 px-3 py-2.5 text-sm-plus font-semibold text-ok">{message}</div> : null}
            {/* PROTOTYPE-NOOP(D2): "Save as draft" has no onClick handler at all (index.html:L10025). */}
            <button className={`${purchasingButtonStyles.secondary} w-full`} type="button">
              <Folder aria-hidden="true" size={16} />
              {t('create.saveDraft')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
