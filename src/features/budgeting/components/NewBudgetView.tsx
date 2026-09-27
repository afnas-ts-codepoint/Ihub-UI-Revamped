import { Check, Folder, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter, useReferenceFilters } from '@/features/organization';
import { Chip } from '@/shared/ui/chip/Chip';
import { TabbedTable, type TableColumn } from '@/shared/table';

import { activityMaster } from '../data/home-budgeting.mock';
import { BudgetSectionHeading } from './BudgetSectionHeading';
import { budgetButtonStyles, smallBudgetButtonStyles } from './budgetButtonStyles';

type BudgetLine = {
  activity: string; category: string; dept: string; desc: string; location: string;
  months: string[]; prior: string; remarks: string; subActivity: string; target: string; year: string; zone: string;
};
type Attachment = { caption: string; name: string };
type ListingRow = Readonly<{ amount: string; dept: string; id: string; period: string; status: string; title: string; tone: 'bad' | 'neutral' | 'ok' | 'warn' }>;
type HistoryRow = Readonly<{ action: string; budget: string; by: string; note: string; ref: string; when: string }>;

const blankLine = (): BudgetLine => ({ activity: '', category: '', dept: '', desc: '', location: '', months: Array.from({ length: 12 }, () => ''), prior: '', remarks: '', subActivity: '', target: '', year: '', zone: '' });
const inputClass = 'w-full rounded-lg border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none focus:border-accent';
const numberOf = (value: string) => Number.parseFloat(value.replaceAll(',', '')) || 0;
const format3 = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 3, minimumFractionDigits: 3 });
const totalOf = (line: BudgetLine) => line.months.reduce((sum, value) => sum + numberOf(value), 0);
const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;

const listingRows: readonly ListingRow[] = [
  { amount: '60,000', dept: 'Marketing', id: 'BUD-2026-014', period: 'Q3 2026', status: 'Submitted', title: 'Q3 digital marketing — school holiday campaign', tone: 'warn' },
  { amount: '38,500', dept: 'Facilities', id: 'BUD-2026-013', period: 'Q3 2026', status: 'Verified', title: 'Soft play surface replacement — SAMA Mall', tone: 'neutral' },
  { amount: '24,000', dept: 'IT & Systems', id: 'BUD-2026-012', period: 'Q3 2026', status: 'Approved', title: 'Redemption counter POS upgrade', tone: 'ok' },
  { amount: '52,000', dept: 'Operations', id: 'BUD-2026-011', period: 'Q4 2026', status: 'Rejected', title: 'Additional ride operators — Al Kout', tone: 'bad' },
  { amount: '9,800', dept: 'Safety & Security', id: 'BUD-2026-010', period: 'Q3 2026', status: 'Approved', title: 'Harness inspection tooling', tone: 'ok' },
];
const releaseRows: readonly ListingRow[] = [
  { amount: '24,000', dept: 'IT & Systems', id: 'BUD-2026-012', period: 'Q3 2026', status: 'Approved', title: 'Redemption counter POS upgrade', tone: 'ok' },
  { amount: '9,800', dept: 'Safety & Security', id: 'BUD-2026-010', period: 'Q3 2026', status: 'Approved', title: 'Harness inspection tooling', tone: 'ok' },
  { amount: '17,400', dept: 'Facilities', id: 'BUD-2026-008', period: 'Q3 2026', status: 'Partially released', title: 'Party room refresh — The Avenues', tone: 'neutral' },
];
const rejectedRows: readonly ListingRow[] = [
  { amount: '52,000', dept: 'Operations', id: 'BUD-2026-011', period: 'Q4 2026', status: 'Rejected — no headcount', title: 'Additional ride operators — Al Kout', tone: 'bad' },
  { amount: '13,200', dept: 'Marketing', id: 'BUD-2026-006', period: 'Q2 2026', status: 'Rejected — defer to Q4', title: 'Signage refresh — 360 Mall', tone: 'bad' },
];
const historyRows: readonly HistoryRow[] = [
  { action: 'Submitted', budget: 'BUD-2026-014', by: 'S. Al-Qahtani', note: 'Routed to Finance · Budgets', ref: 'REC-2026518', when: '28 Jul 2026 09:14' },
  { action: 'Verified', budget: 'BUD-2026-013', by: 'Budgets', note: 'Budget line confirmed available', ref: 'REC-2026514', when: '27 Jul 2026 16:40' },
  { action: 'Approved', budget: 'BUD-2026-012', by: 'Finance Head', note: 'Released partially — KWD 12,000', ref: 'REC-2026509', when: '27 Jul 2026 11:02' },
  { action: 'Rejected', budget: 'BUD-2026-011', by: 'CEO', note: 'No approved headcount for FY', ref: 'REC-2026501', when: '26 Jul 2026 18:20' },
];

export function NewBudgetView() {
  const { t } = useTranslation('budgeting');
  const { data: references } = useReferenceFilters();
  const [tab, setTab] = useState<'add' | 'history' | 'listing' | 'reject' | 'release'>('add');
  const [lines, setLines] = useState<BudgetLine[]>([blankLine()]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const setLine = (index: number, patch: Partial<BudgetLine>) => { setLines((current) => current.map((line, itemIndex) => itemIndex === index ? { ...line, ...patch } : line)); };
  const grandTotal = lines.reduce((sum, line) => sum + totalOf(line), 0);
  const grandPrior = lines.reduce((sum, line) => sum + numberOf(line.prior), 0);
  const grandVariance = grandPrior > 0 ? ((grandTotal - grandPrior) / grandPrior) * 100 : null;
  const missingCaption = attachments.some((file) => !file.caption.trim());
  const canSubmit = lines.every((line) => line.location && line.dept && line.activity && line.subActivity && line.year && totalOf(line) > 0) && !missingCaption;

  const field = (label: string, control: React.ReactNode, hint?: string) => <label className="flex min-w-0 flex-col gap-1.5"><span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{label}</span>{control}{hint ? <span className="text-xs text-fg-3">{hint}</span> : null}</label>;
  const select = (index: number, key: keyof BudgetLine, options: readonly string[], onPick?: (value: string) => void) => <select className={inputClass} onChange={(event) => { (onPick ?? ((value) => { setLine(index, { [key]: value }); }))(event.currentTarget.value); }} value={String(lines[index]?.[key] ?? '')}><option value="">{t('home.newBudget.select')}</option>{options.map((option) => <option key={option}>{option}</option>)}</select>;

  const tabs = [
    ['add', t('home.newBudget.tabs.add')], ['listing', t('home.newBudget.tabs.listing')], ['release', t('home.newBudget.tabs.release')], ['reject', t('home.newBudget.tabs.reject')], ['history', t('home.newBudget.tabs.history')],
  ] as const;

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center gap-1.5">{tabs.map(([id, label], index) => <span className="contents" key={id}>{index ? <span className="text-line-strong">{'·'}</span> : null}<button className={`px-1.5 py-1 text-base ${tab === id ? 'font-semibold text-accent underline decoration-accent underline-offset-4' : 'font-medium text-fg-3'}`} onClick={() => { setTab(id); }} type="button">{label}</button></span>)}</div>
      {tab === 'add' ? (
        <div className="flex max-w-[980px] flex-col gap-4">
          <BudgetSectionHeading subtitle={t('home.newBudget.subtitle')} title={t('home.newBudget.title')} />
          {lines.map((line, index) => {
            const activity = activityMaster.find((item) => item.name === line.activity);
            const total = totalOf(line);
            const variance = numberOf(line.prior) > 0 ? ((total - numberOf(line.prior)) / numberOf(line.prior)) * 100 : null;
            const filled = line.months.filter((value) => numberOf(value) > 0).length;
            const target = numberOf(line.target);
            const remaining = target - total;
            const progress = target > 0 ? Math.min(100, (total / target) * 100) : total > 0 ? 100 : 0;
            return <div className="flex flex-col gap-[18px] rounded-xl border border-line bg-surface p-[22px]" key={index}>
              <div className="flex flex-wrap items-center gap-2.5"><Chip tone="accent">{t('home.newBudget.line', { count: index + 1 })}</Chip>{activity ? <span className="text-sm text-fg-3">{`${activity.account} · `}<span className="num">{activity.accountNo}</span></span> : null}<span className="num ms-auto text-lg font-semibold">{`KWD ${format3(total)}`}</span>{lines.length > 1 ? <button className={smallBudgetButtonStyles.ghost} onClick={() => { setLines((current) => current.filter((_, itemIndex) => itemIndex !== index)); }} type="button">{t('home.newBudget.removeLine')}</button> : null}</div>
              <hr className="hairline" />
              <span className="eyebrow">{t('home.newBudget.classification')}</span>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                {field(t('home.newBudget.fields.location'), select(index, 'location', references.locations))}
                {field(t('home.newBudget.fields.zone'), select(index, 'zone', references.zones))}
                {field(t('home.newBudget.fields.department'), select(index, 'dept', references.departments))}
                {field(t('home.newBudget.fields.category'), select(index, 'category', ['Capex', 'Opex', 'Marketing', 'Maintenance', 'Staffing', 'Events']))}
                {field(t('home.newBudget.fields.activity'), select(index, 'activity', activityMaster.filter((item) => item.active).map((item) => item.name), (value) => { setLine(index, { activity: value, desc: '', subActivity: '' }); }))}
                {field(t('home.newBudget.fields.subActivity'), select(index, 'subActivity', activity?.subs.filter((item) => item.active).map((item) => item.name) ?? [], (value) => { setLine(index, { desc: activity?.subs.find((item) => item.name === value)?.desc ?? '', subActivity: value }); }), line.activity ? undefined : t('home.newBudget.pickActivity'))}
                {field(t('home.newBudget.fields.year'), select(index, 'year', ['2026', '2027', '2028']))}
                {field(t('home.newBudget.fields.prior'), <input className={`${inputClass} num text-end`} onChange={(event) => { setLine(index, { prior: event.currentTarget.value.replaceAll(/[^\d.]/g, '') }); }} placeholder="0.000" value={line.prior} />)}
              </div>
              <hr className="hairline" />
              <span className="eyebrow">{t('home.newBudget.account')}</span>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                {field(t('home.newBudget.fields.accountName'), <input className={`${inputClass} bg-inset text-fg-2`} placeholder={t('home.newBudget.setByActivity')} readOnly value={activity?.account ?? ''} />)}
                {field(t('home.newBudget.fields.accountNumber'), <input className={`${inputClass} num bg-inset text-fg-2`} placeholder={t('home.newBudget.setByActivity')} readOnly value={activity?.accountNo ?? ''} />)}
              </div>
              {field(t('home.newBudget.fields.description'), <textarea className={`${inputClass} resize-y`} onChange={(event) => { setLine(index, { desc: event.currentTarget.value }); }} placeholder={t('home.newBudget.descriptionPlaceholder')} rows={3} value={line.desc} />)}
              {field(t('home.newBudget.fields.remarks'), <textarea className={`${inputClass} resize-y`} onChange={(event) => { setLine(index, { remarks: event.currentTarget.value }); }} placeholder={t('home.newBudget.remarksPlaceholder')} rows={2} value={line.remarks} />)}
              <hr className="hairline" />
              <span className="eyebrow">{t('home.newBudget.monthlySplit')}</span>
              <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-canvas p-4">
                <div className="min-w-[190px]">{field(t('home.newBudget.fields.yearlyAmount'), <input className={`${inputClass} num text-end text-lg font-semibold`} onChange={(event) => { setLine(index, { target: event.currentTarget.value.replaceAll(/[^\d.]/g, '') }); }} placeholder="0.000" value={line.target} />)}</div>
                <button className={smallBudgetButtonStyles.primary} disabled={numberOf(line.target) <= 0} onClick={() => { const perMonth = numberOf(line.target) / 12; setLine(index, { months: months.map(() => perMonth.toFixed(3)) }); }} type="button">{t('home.newBudget.splitEvenly')}</button>
                <button className={`${smallBudgetButtonStyles.ghost} ms-auto`} onClick={() => { setLine(index, { months: months.map(() => '') }); }} type="button">{t('home.newBudget.clearMonths')}</button>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(132px,1fr))] gap-3">{months.map((month, monthIndex) => <span className="contents" key={month}>{field(t(`home.newBudget.months.${month}`), <input className={`${inputClass} num text-end ${numberOf(line.months[monthIndex] ?? '') > 0 ? 'border-accent' : ''}`} onChange={(event) => { const next = [...line.months]; next[monthIndex] = event.currentTarget.value.replaceAll(/[^\d.]/g, ''); setLine(index, { months: next }); }} placeholder="0.000" value={line.months[monthIndex]} />)}</span>)}</div>
              <div className="flex flex-col gap-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-raised"><div className={`h-full rounded-full transition-[width] ${target > 0 && Math.abs(remaining) > 0.0005 ? 'bg-warn' : 'bg-accent'}`} style={{ width: `${String(progress)}%` }} /></div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-fg-3"><span>{t('home.newBudget.monthsBudgeted', { count: filled })}</span>{target > 0 && Math.abs(remaining) > 0.0005 ? <span className={remaining < 0 ? 'font-semibold text-bad' : 'font-semibold text-fg-2'}>{remaining > 0 ? t('home.newBudget.unallocated', { amount: format3(remaining) }) : t('home.newBudget.overYearly', { amount: format3(Math.abs(remaining)) })}</span> : null}<span className="ms-auto">{t('home.newBudget.allocated')}</span><span className="num text-base font-semibold text-fg">{`KWD ${format3(total)}`}</span></div>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 rounded-xl border border-line bg-canvas p-4">
                <Summary label={t('home.newBudget.summary.lineTotal')} value={format3(total)} />
                <Summary label={t('home.newBudget.summary.prior')} value={numberOf(line.prior) ? format3(numberOf(line.prior)) : '—'} />
                <Summary label={t('home.newBudget.summary.variance')} tone={variance != null && variance > 0 ? 'bad' : variance != null && variance < 0 ? 'ok' : undefined} value={variance == null ? '—' : `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`} />
                <Summary label={t('home.newBudget.summary.months')} value={`${String(filled)} / 12`} />
              </div>
            </div>;
          })}
          <div className="flex flex-wrap items-center gap-3"><button className={budgetButtonStyles.secondary} onClick={() => { setLines((current) => [...current, blankLine()]); }} type="button"><Plus aria-hidden size={14} /> {t('home.newBudget.addLine')}</button>{lines.length > 1 ? <button className={budgetButtonStyles.ghost} onClick={() => { const last = lines.at(-1) ?? blankLine(); setLines((current) => [...current, { ...last, months: [...last.months] }]); }} type="button">{t('home.newBudget.duplicate')}</button> : null}<span className="ms-auto text-sm text-fg-3">{t('home.newBudget.lineCount', { count: lines.length })}</span></div>
          <div className="rounded-xl border border-line bg-surface p-[22px]"><span className="eyebrow">{t('home.newBudget.total')}</span><div className="mt-2 flex items-end gap-2"><span className="display num text-[38px] font-bold text-accent">{format3(grandTotal)}</span><span className="pb-1 text-base font-semibold text-fg-3">{'KWD'}</span><span className="ms-auto pb-1 text-sm text-fg-3">{t('home.newBudget.calculated')}</span></div><hr className="hairline my-4" /><div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4"><Summary label={t('home.newBudget.summary.total')} value={format3(grandTotal)} /><Summary label={t('home.newBudget.summary.prior')} value={grandPrior ? format3(grandPrior) : '—'} /><Summary label={t('home.newBudget.summary.variance')} tone={grandVariance != null && grandVariance > 0 ? 'bad' : grandVariance != null && grandVariance < 0 ? 'ok' : undefined} value={grandVariance == null ? '—' : `${grandVariance > 0 ? '+' : ''}${grandVariance.toFixed(1)}%`} /><Summary label={t('home.newBudget.summary.lines')} value={String(lines.length)} /></div><p className="mb-0 text-sm text-fg-3">{t(grandVariance == null ? 'home.newBudget.variancePrompt' : 'home.newBudget.varianceHelp')}</p></div>
          <div className="rounded-xl border border-line bg-surface p-[22px]"><div className="mb-3 flex flex-wrap items-center gap-2.5"><span className="eyebrow">{t('home.newBudget.attachments')}</span><span className="text-sm text-fg-3">{t('home.newBudget.attachmentsHint')}</span></div>{attachments.map((file, index) => <div className={`mb-2 flex flex-wrap items-center gap-2.5 rounded-lg border p-3 ${file.caption.trim() ? 'border-line' : 'border-bad'}`} key={`${file.name}-${String(index)}`}><Folder aria-hidden className="text-accent" size={15} /><span className="min-w-[120px] text-sm font-semibold">{file.name}</span><input className={`${inputClass} min-w-[200px] flex-1 bg-surface`} onChange={(event) => { setAttachments((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, caption: event.currentTarget.value } : item)); }} placeholder={t('home.newBudget.caption')} value={file.caption} /><button className={smallBudgetButtonStyles.ghost} onClick={() => { setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index)); }} type="button">{t('home.newBudget.remove')}</button></div>)}<label className="block cursor-pointer rounded-xl border border-dashed border-line-strong bg-raised p-[18px] text-center"><input className="hidden" multiple onChange={(event) => { const files = Array.from(event.currentTarget.files ?? []).map((file) => ({ caption: '', name: file.name })); setAttachments((current) => [...current, ...files]); event.currentTarget.value = ''; }} type="file" /><Folder aria-hidden className="mx-auto text-accent" size={20} /><div className="mt-2 text-base font-semibold">{t('home.newBudget.upload')}</div><div className="mt-1 text-sm text-fg-3">{t('home.newBudget.captionRequired')}</div></label></div>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-[18px]"><span className={message ? 'chip ok' : 'text-sm text-fg-3'}>{message || (missingCaption ? t('home.newBudget.captionWarning') : !canSubmit ? t('home.newBudget.requiredWarning') : t('home.newBudget.approvalNote'))}</span><div className="ms-auto flex gap-2"><button className={budgetButtonStyles.ghost} onClick={() => { setLines([blankLine()]); setAttachments([]); setMessage(''); }} type="button">{t('home.newBudget.clear')}</button><button className={budgetButtonStyles.secondary} onClick={() => { setMessage(t('home.newBudget.draftSaved')); window.setTimeout(() => { setMessage(''); }, 2400); }} type="button">{t('home.newBudget.saveDraft')}</button><button className={budgetButtonStyles.primary} disabled={!canSubmit} onClick={() => { setMessage(t('home.newBudget.submitted', { amount: format3(grandTotal), count: lines.length })); window.setTimeout(() => { setMessage(''); }, 3200); }} type="button"><Check aria-hidden size={14} /> {t('home.newBudget.submit')}</button></div></div>
        </div>
      ) : <NewBudgetListing filter={filter} historyRows={historyRows} rejectedRows={rejectedRows} releaseRows={releaseRows} rows={listingRows} setFilter={setFilter} tab={tab} />}
    </>
  );
}

function Summary({ label, tone, value }: Readonly<{ label: string; tone?: 'bad' | 'ok'; value: string }>) { return <div className="flex min-w-0 flex-col gap-1"><span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{label}</span><span className={`num text-xl font-semibold ${tone === 'bad' ? 'text-bad' : tone === 'ok' ? 'text-ok' : ''}`}>{value}</span></div>; }

function NewBudgetListing({ filter, historyRows: history, rejectedRows: rejected, releaseRows: release, rows, setFilter, tab }: Readonly<{ filter: ReturnType<typeof createEmptyRecordFilter>; historyRows: readonly HistoryRow[]; rejectedRows: readonly ListingRow[]; releaseRows: readonly ListingRow[]; rows: readonly ListingRow[]; setFilter: React.Dispatch<React.SetStateAction<ReturnType<typeof createEmptyRecordFilter>>>; tab: 'history' | 'listing' | 'reject' | 'release' }>) {
  const { t } = useTranslation('budgeting');
  if (tab === 'history') {
    const columns: readonly TableColumn<HistoryRow>[] = [{ key: 'ref', label: t('home.newBudget.historyColumns.ref') }, { key: 'budget', label: t('columns.id') }, { key: 'action', label: t('home.newBudget.historyColumns.action') }, { key: 'by', label: t('home.newBudget.historyColumns.by'), muted: true }, { key: 'when', label: t('home.newBudget.historyColumns.date'), muted: true }, { key: 'note', label: t('home.newBudget.historyColumns.note'), muted: true, wrap: true }];
    return <ListingFrame filter={filter} onFilter={setFilter} subtitle={t('home.newBudget.listings.historySubtitle')} title={t('home.newBudget.tabs.history')}><TabbedTable columns={columns} emptyDescription={t('empty.description')} emptyTitle={t('empty.title')} paginationLabels={pagination(t, history.length)} rows={history} tabs={[{ count: history.length, id: 'all', label: t('tableTabs.recordListing') }]} /></ListingFrame>;
  }
  const selectedRows = tab === 'listing' ? rows : tab === 'release' ? release : rejected;
  const columns: readonly TableColumn<ListingRow>[] = [{ key: 'id', label: t('columns.id') }, { key: 'title', label: t('columns.title'), wrap: true }, { key: 'dept', label: t('columns.department'), muted: true }, { key: 'period', label: t('columns.period'), muted: true }, { align: 'end', key: 'amount', label: t('home.newBudget.amount') }, { key: 'status', label: t('columns.status'), render: (row) => <Chip tone={row.tone}>{row.status}</Chip> }];
  const title = t(tab === 'listing' ? 'home.newBudget.tabs.listing' : tab === 'release' ? 'home.newBudget.tabs.release' : 'home.newBudget.tabs.reject');
  return <ListingFrame filter={filter} onFilter={setFilter} subtitle={t(`home.newBudget.listings.${tab}Subtitle`)} title={title}><TabbedTable columns={columns} emptyDescription={t('empty.description')} emptyTitle={t('empty.title')} paginationLabels={pagination(t, selectedRows.length)} rows={selectedRows} tabs={[{ count: selectedRows.length, id: 'all', label: tab === 'reject' ? t('tableTabs.rejected') : tab === 'release' ? t('home.newBudget.awaitingRelease') : t('tableTabs.all') }]} /></ListingFrame>;
}

function ListingFrame({ children, filter, onFilter, subtitle, title }: React.PropsWithChildren<Readonly<{ filter: ReturnType<typeof createEmptyRecordFilter>; onFilter: React.Dispatch<React.SetStateAction<ReturnType<typeof createEmptyRecordFilter>>>; subtitle: string; title: string }>>) { return <><BudgetSectionHeading subtitle={subtitle} title={title} /><RecordFilter kind="budget" onChange={onFilter} value={filter} />{children}</>; }
const pagination = (t: ReturnType<typeof useTranslation<'budgeting'>>['t'], count: number) => ({ next: t('pagination.next'), page: t('pagination.page'), previous: t('pagination.previous'), summary: t('pagination.summary', { shown: count, total: count }) });
