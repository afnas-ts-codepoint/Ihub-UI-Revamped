import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter } from '@/features/organization';
import { Chip } from '@/shared/ui/chip/Chip';
import { DialogBody, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from '@/shared/ui/overlay/Dialog';

import { activityMaster } from '../data/home-budgeting.mock';
import type { BudgetActivity } from '../types/budgeting.types';
import { BudgetSectionHeading } from './BudgetSectionHeading';
import { BudgetStatRow } from './BudgetStatRow';
import { budgetButtonStyles, smallBudgetButtonStyles } from './budgetButtonStyles';

type DraftSub = { alloc: string; desc: string; name: string };
type ActivityDraft = { account: string; accountNo: string; budget: string; desc: string; name: string; owner: string; subs: DraftSub[]; type: 'Capex' | 'Opex'; year: string };
const blankSub = (): DraftSub => ({ alloc: '', desc: '', name: '' });
const blankActivity = (): ActivityDraft => ({ account: '', accountNo: '', budget: '', desc: '', name: '', owner: 'Operations', subs: [blankSub()], type: 'Opex', year: '2026' });
const inputClass = 'w-full rounded-lg border border-line-strong bg-raised px-3 py-2.5 text-base text-fg outline-none focus:border-accent';
const departments = ['Operations', 'Total Experience (TX)', 'Facilities', 'Marketing', 'Finance', 'HR', 'IT', 'Development', 'Procurement', 'QA & Compliance'] as const;
const kwd = (value: number) => value.toLocaleString('en-US');

export function ActivityMasterView() {
  const { t } = useTranslation('budgeting');
  const [activities, setActivities] = useState<BudgetActivity[]>(() => activityMaster.map((activity) => ({ ...activity, subs: activity.subs.map((sub) => ({ ...sub })) })));
  const [tab, setTab] = useState<'listing' | 'new'>('new');
  const [drafts, setDrafts] = useState<ActivityDraft[]>([blankActivity()]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const [modal, setModal] = useState<{ code: string; mode: 'edit' | 'view' } | null>(null);
  const filtered = useMemo(() => activities.filter((activity) => {
    if (query && !`${activity.name} ${activity.code}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())) return false;
    if (filter.num && !`${activity.name} ${activity.code} ${activity.account}`.toLocaleLowerCase().includes(filter.num.trim().toLocaleLowerCase())) return false;
    if (filter.dept && activity.owner !== filter.dept) return false;
    if (filter.activity && activity.name !== filter.activity) return false;
    return true;
  }), [activities, filter, query]);
  const selected = modal ? activities.find((activity) => activity.code === modal.code) : undefined;
  const totals = activities.reduce((summary, activity) => ({ budget: summary.budget + activity.budget, committed: summary.committed + activity.committed, subs: summary.subs + activity.subs.length }), { budget: 0, committed: 0, subs: 0 });

  const setDraft = (index: number, patch: Partial<ActivityDraft>) => { setDrafts((current) => current.map((draft, itemIndex) => itemIndex === index ? { ...draft, ...patch } : draft)); };
  const setDraftSub = (index: number, subIndex: number, patch: Partial<DraftSub>) => { setDrafts((current) => current.map((draft, itemIndex) => itemIndex === index ? { ...draft, subs: draft.subs.map((sub, currentSubIndex) => currentSubIndex === subIndex ? { ...sub, ...patch } : sub) } : draft)); };
  const assigned = (draft: ActivityDraft) => draft.subs.reduce((sum, sub) => sum + (Number.parseFloat(sub.alloc) || 0), 0);
  const totalForDraft = (draft: ActivityDraft) => Math.max(Number.parseFloat(draft.budget) || 0, assigned(draft));
  const validDrafts = drafts.filter((draft) => draft.name.trim());
  const grandAllocation = drafts.reduce((sum, draft) => sum + totalForDraft(draft), 0);
  const grandAssigned = drafts.reduce((sum, draft) => sum + assigned(draft), 0);
  const grandSubs = drafts.reduce((sum, draft) => sum + draft.subs.length, 0);
  const createActivities = () => {
    if (!validDrafts.length) return;
    setActivities((current) => {
      const next = [...current];
      validDrafts.forEach((draft) => {
        const code = `ACT-${String(next.length + 1).padStart(2, '0')}`;
        next.push({
          account: draft.account.trim(), accountNo: draft.accountNo.trim(), active: true,
          budget: totalForDraft(draft), code, committed: 0, desc: draft.desc.trim(), name: draft.name.trim(), nameAr: '', owner: draft.owner, type: draft.type, year: draft.year,
          subs: draft.subs.filter((sub) => sub.name.trim()).map((sub, index) => ({ active: true, alloc: Number.parseFloat(sub.alloc) || 0, code: `${code.slice(-2)}-${String(index + 1).padStart(2, '0')}`, committed: 0, desc: sub.desc.trim(), name: sub.name.trim(), nameAr: '' })),
        });
      });
      return next;
    });
    setDrafts([blankActivity()]);
    setTab('listing');
  };

  return (
    <>
      <BudgetStatRow stats={[
        { label: t('home.activities.stats.allocated'), sub: t('home.activities.stats.activityDelta', { count: activities.length }), value: `KWD ${kwd(totals.budget)}` },
        { label: t('home.activities.stats.committed'), value: `KWD ${kwd(totals.committed)}` },
        { label: t('home.activities.stats.available'), tone: 'ok', value: `KWD ${kwd(totals.budget - totals.committed)}` },
        { label: t('home.activities.stats.subActivities'), sub: t('home.activities.stats.inactiveDelta', { count: activities.filter((activity) => !activity.active).length + activities.reduce((sum, activity) => sum + activity.subs.filter((sub) => !sub.active).length, 0) }), value: String(totals.subs) },
      ]} />
      <div className="my-[18px] flex gap-1 overflow-x-auto border-b border-line">
        <Tab active={tab === 'new'} label={t('home.activities.tabs.new')} onClick={() => { setTab('new'); }} />
        <Tab active={tab === 'listing'} count={activities.length} label={t('home.activities.tabs.listing')} onClick={() => { setTab('listing'); }} />
      </div>
      {tab === 'new' ? (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,300px)] items-start gap-4 max-desktop:grid-cols-1">
          <div className="flex flex-col gap-4">
            <BudgetSectionHeading subtitle={t('home.activities.new.subtitle')} title={t('home.activities.new.title')} />
            {drafts.map((draft, index) => <ActivityDraftCard draft={draft} index={index} key={index} onPatch={(patch) => { setDraft(index, patch); }} onPatchSub={(subIndex, patch) => { setDraftSub(index, subIndex, patch); }} onRemove={() => { setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index)); }} onRemoveSub={(subIndex) => { setDraft(index, { subs: draft.subs.filter((_, itemIndex) => itemIndex !== subIndex) }); }} onAddSub={() => { setDraft(index, { subs: [...draft.subs, blankSub()] }); }} />)}
            <div className="flex flex-wrap items-center gap-3"><button className={budgetButtonStyles.secondary} onClick={() => { setDrafts((current) => [...current, blankActivity()]); }} type="button">{`+ ${t('home.activities.new.addAnother')}`}</button>{drafts.length > 1 ? <button className={budgetButtonStyles.ghost} onClick={() => { const last = drafts.at(-1) ?? blankActivity(); setDrafts((current) => [...current, { ...last, subs: last.subs.map((sub) => ({ ...sub })) }]); }} type="button">{t('home.activities.new.duplicate')}</button> : null}<span className="ms-auto text-sm text-fg-3">{t('home.activities.new.requestCount', { count: drafts.length })}</span></div>
          </div>
          <div className="flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-[22px]">
            <h3 className="m-0 text-lg font-semibold">{t('home.activities.new.summary')}</h3>
            <Money label={t('home.activities.new.totalAllocation')} value={grandAllocation} />
            <Money label={t('home.activities.new.assigned')} value={grandAssigned} />
            <Money label={t('home.activities.new.unassigned')} tone={grandAllocation - grandAssigned < 0 ? 'bad' : 'ok'} value={grandAllocation - grandAssigned} />
            <div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-interactive" style={{ width: `${String(Math.min(100, grandAllocation ? (grandAssigned / grandAllocation) * 100 : 0))}%` }} /></div>
            <div className="flex justify-between text-base text-fg-3"><span>{t('home.activities.new.activityCount')}</span><span className="num">{validDrafts.length}</span></div>
            <div className="flex justify-between text-base text-fg-3"><span>{t('home.activities.new.subCount')}</span><span className="num">{grandSubs}</span></div>
            <hr className="hairline" />
            <div className="flex flex-wrap gap-2"><button className={budgetButtonStyles.primary} onClick={createActivities} type="button">{t('home.activities.new.create', { count: validDrafts.length > 1 ? validDrafts.length : '' })}</button><button className={budgetButtonStyles.ghost} onClick={() => { setDrafts([blankActivity()]); setTab('listing'); }} type="button">{t('home.activities.new.cancel')}</button></div>
            <p className="m-0 text-sm leading-relaxed text-fg-3">{validDrafts.length ? t('home.activities.new.saveHint') : t('home.activities.new.nameHint')}</p>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-3.5 max-w-[760px] text-base text-fg-3">{t('home.activities.listing.intro')}</p>
          <div className="mb-3 flex flex-wrap items-center gap-2.5"><input className={`${inputClass} max-w-[300px]`} onChange={(event) => { setQuery(event.currentTarget.value); }} placeholder={t('home.activities.listing.search')} value={query} /><span className="text-sm text-fg-3">{t('home.activities.listing.resultCount', { count: filtered.length, total: activities.length })}</span><button className={`${budgetButtonStyles.secondary} ms-auto`} onClick={() => { setTab('new'); }} type="button">{`+ ${t('home.activities.listing.new')}`}</button></div>
          <RecordFilter kind="budget" onChange={setFilter} value={filter} />
          <ActivityListing activities={filtered} onOpen={(code, mode) => { setModal({ code, mode }); }} />
        </>
      )}
      <ActivityDialog activity={selected} mode={modal?.mode ?? 'view'} onChange={(next) => { setActivities((current) => current.map((activity) => activity.code === next.code ? next : activity)); }} onMode={(mode) => { setModal((current) => current ? { ...current, mode } : null); }} onOpenChange={(open) => { if (!open) setModal(null); }} open={modal != null} />
    </>
  );
}

function Tab({ active, count, label, onClick }: Readonly<{ active: boolean; count?: number; label: string; onClick: () => void }>) { return <button className={`-mb-px flex items-center gap-2 border-b-2 px-3.5 py-3 text-lg whitespace-nowrap ${active ? 'border-accent font-semibold text-fg' : 'border-transparent font-medium text-fg-3'}`} onClick={onClick} type="button">{label}{count == null ? null : <span className="num text-sm text-fg-3">{count}</span>}</button>; }
function Money({ label, tone, value }: Readonly<{ label: string; tone?: 'bad' | 'ok'; value: number }>) { return <div><div className="text-xs font-semibold tracking-[0.08em] text-fg-3 uppercase">{label}</div><div className={`num mt-1 text-xl font-semibold ${tone === 'bad' ? 'text-bad' : tone === 'ok' ? 'text-ok' : ''}`}>{`KWD ${kwd(value)}`}</div></div>; }

function ActivityDraftCard({ draft, index, onAddSub, onPatch, onPatchSub, onRemove, onRemoveSub }: Readonly<{ draft: ActivityDraft; index: number; onAddSub: () => void; onPatch: (patch: Partial<ActivityDraft>) => void; onPatchSub: (index: number, patch: Partial<DraftSub>) => void; onRemove: () => void; onRemoveSub: (index: number) => void }>) {
  const { t } = useTranslation('budgeting');
  const field = (label: string, control: React.ReactNode) => <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{label}</span>{control}</label>;
  return <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-[26px]">
    <div className="flex flex-wrap items-center gap-2.5"><Chip tone="accent">{t('home.activities.new.activity', { count: index + 1 })}</Chip><span className="num ms-auto text-lg font-semibold">{`KWD ${kwd(Math.max(Number.parseFloat(draft.budget) || 0, draft.subs.reduce((sum, sub) => sum + (Number.parseFloat(sub.alloc) || 0), 0)))}`}</span>{index ? <button className={smallBudgetButtonStyles.ghost} onClick={onRemove} type="button">{t('home.activities.new.removeActivity')}</button> : null}</div>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">{field(t('home.activities.fields.name'), <input className={inputClass} onChange={(event) => { onPatch({ name: event.currentTarget.value }); }} placeholder="e.g. Training & Development" value={draft.name} />)}{field(t('home.activities.fields.accountName'), <input className={inputClass} onChange={(event) => { onPatch({ account: event.currentTarget.value }); }} placeholder="e.g. Staff training" value={draft.account} />)}{field(t('home.activities.fields.accountNumber'), <input className={inputClass} onChange={(event) => { onPatch({ accountNo: event.currentTarget.value }); }} placeholder="5600-6003" value={draft.accountNo} />)}</div>
    {field(t('home.activities.fields.description'), <textarea className={`${inputClass} resize-y`} onChange={(event) => { onPatch({ desc: event.currentTarget.value }); }} rows={2} value={draft.desc} />)}
    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">{field(t('home.activities.fields.type'), <select className={inputClass} onChange={(event) => { onPatch({ type: event.currentTarget.value as 'Capex' | 'Opex' }); }} value={draft.type}>{(['Opex', 'Capex'] as const).map((type) => <option key={type}>{type}</option>)}</select>)}{field(t('home.activities.fields.owner'), <select className={inputClass} onChange={(event) => { onPatch({ owner: event.currentTarget.value }); }} value={draft.owner}>{departments.map((department) => <option key={department}>{department}</option>)}</select>)}{field(t('home.activities.fields.year'), <select className={inputClass} onChange={(event) => { onPatch({ year: event.currentTarget.value }); }} value={draft.year}>{['2025', '2026', '2027', '2028'].map((year) => <option key={year}>{year}</option>)}</select>)}{field(t('home.activities.fields.allocation'), <input className={inputClass} min="0" onChange={(event) => { onPatch({ budget: event.currentTarget.value }); }} type="number" value={draft.budget} />)}</div>
    <hr className="hairline" /><span className="eyebrow">{t('home.activities.fields.subActivities')}</span>
    {draft.subs.map((sub, subIndex) => <div className="flex flex-col gap-3 rounded-xl border border-line bg-canvas p-4" key={subIndex}><div className="flex items-center gap-2"><Chip>{t('home.activities.new.subActivity', { count: subIndex + 1 })}</Chip>{draft.subs.length > 1 ? <button className={`${smallBudgetButtonStyles.ghost} ms-auto`} onClick={() => { onRemoveSub(subIndex); }} type="button">{t('home.activities.new.remove')}</button> : null}</div><div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">{field(t('home.activities.fields.subActivity'), <input className={inputClass} onChange={(event) => { onPatchSub(subIndex, { name: event.currentTarget.value }); }} value={sub.name} />)}{field(t('home.activities.fields.description'), <input className={inputClass} onChange={(event) => { onPatchSub(subIndex, { desc: event.currentTarget.value }); }} value={sub.desc} />)}{field(t('home.activities.fields.allocation'), <input className={inputClass} min="0" onChange={(event) => { onPatchSub(subIndex, { alloc: event.currentTarget.value }); }} type="number" value={sub.alloc} />)}</div></div>)}
    <div className="flex flex-wrap items-center gap-3"><button className={budgetButtonStyles.secondary} onClick={onAddSub} type="button">{`+ ${t('home.activities.new.addSub')}`}</button><span className={`ms-auto text-sm ${draft.budget && assignedDraft(draft) > Number.parseFloat(draft.budget) ? 'text-bad' : 'text-fg-3'}`}>{`${t('home.activities.new.assignedShort')} KWD ${kwd(assignedDraft(draft))}${draft.budget ? ` / ${kwd(Number.parseFloat(draft.budget) || 0)}` : ''}`}</span></div>
  </div>;
}

const assignedDraft = (draft: ActivityDraft) => draft.subs.reduce((sum, sub) => sum + (Number.parseFloat(sub.alloc) || 0), 0);

function ActivityListing({ activities, onOpen }: Readonly<{ activities: readonly BudgetActivity[]; onOpen: (code: string, mode: 'edit' | 'view') => void }>) {
  const { t } = useTranslation('budgeting');
  const headers = [
    ['name', 'home.activities.columns.name'], ['description', 'home.activities.columns.description'],
    ['subActivity', 'home.activities.columns.subActivity'], ['accountName', 'home.activities.columns.accountName'],
    ['accountNumber', 'home.activities.columns.accountNumber'], ['status', 'home.activities.columns.status'],
  ] as const;
  return <div className="overflow-hidden rounded-xl border border-line bg-surface"><div className="overflow-x-auto"><table className="w-full border-collapse text-base"><thead><tr className="bg-canvas">{headers.map(([key, labelKey]) => <th className="border-b border-line px-4 py-3 text-start text-xs font-semibold tracking-[0.06em] whitespace-nowrap text-fg-3 uppercase" key={key}>{t(labelKey)}</th>)}<th className="border-b border-line px-4 py-3" /></tr></thead><tbody>{activities.length ? activities.map((activity) => <tr className="border-b border-line" key={activity.code}><td className="px-4 py-3"><strong>{activity.name}</strong><span className="num mt-1 block text-xs text-fg-3">{`${activity.code} · ${activity.type} · KWD ${kwd(activity.budget)}`}</span></td><td className="max-w-[320px] px-4 py-3 text-sm leading-normal whitespace-normal text-fg-3">{activity.desc || activity.subs.slice(0, 2).map((sub) => sub.name).join(', ') || '—'}</td><td className="px-4 py-3"><button className="font-medium text-interactive" onClick={() => { onOpen(activity.code, 'view'); }} type="button">{`${String(activity.subs.length)} ${t('home.activities.listing.subActivities')}`}</button></td><td className="px-4 py-3 text-fg-2">{activity.account || '—'}</td><td className="num px-4 py-3 text-fg-2">{activity.accountNo || '—'}</td><td className="px-4 py-3"><Chip tone={activity.active ? 'ok' : 'bad'}>{t(activity.active ? 'home.activities.activated' : 'home.activities.deactivated')}</Chip></td><td className="px-4 py-3"><div className="flex justify-end gap-1.5"><button className={smallBudgetButtonStyles.ghost} onClick={() => { onOpen(activity.code, 'view'); }} type="button">{t('home.activities.view')}</button><button className={smallBudgetButtonStyles.secondary} onClick={() => { onOpen(activity.code, 'edit'); }} type="button">{t('home.activities.edit')}</button></div></td></tr>) : <tr><td className="p-[22px] text-center text-fg-3" colSpan={7}>{t('home.activities.listing.empty')}</td></tr>}</tbody></table></div><div className="border-t border-line px-4 py-3 text-sm text-fg-3">{t('home.activities.listing.showing', { count: activities.length })}</div></div>;
}

function ActivityDialog({ activity, mode, onChange, onMode, onOpenChange, open }: Readonly<{ activity?: BudgetActivity; mode: 'edit' | 'view'; onChange: (activity: BudgetActivity) => void; onMode: (mode: 'edit' | 'view') => void; onOpenChange: (open: boolean) => void; open: boolean }>) {
  const { t } = useTranslation('budgeting');
  if (!activity) return null;
  return <DialogRoot onOpenChange={onOpenChange} open={open}><DialogContent className="w-[min(1040px,calc(100%-48px))]"><DialogHeader><div className="min-w-0 flex-1"><div className="num text-xs tracking-[0.08em] text-fg-3">{activity.code}</div><DialogTitle className="mt-1 text-xl font-semibold">{activity.name}</DialogTitle><div className="mt-1 text-sm text-fg-3">{`${activity.type} · ${activity.owner} · ${activity.account} ${activity.accountNo}`}</div></div><Chip tone={activity.active ? 'ok' : 'bad'}>{t(activity.active ? 'home.activities.activated' : 'home.activities.deactivated')}</Chip><button className={smallBudgetButtonStyles.secondary} onClick={() => { onMode(mode === 'view' ? 'edit' : 'view'); }} type="button">{t(mode === 'view' ? 'home.activities.edit' : 'home.activities.view')}</button></DialogHeader><DialogBody>{mode === 'view' ? <ActivityReadOnly activity={activity} /> : <ActivityEdit activity={activity} onChange={onChange} />}</DialogBody><DialogFooter className="justify-end"><button className={budgetButtonStyles.ghost} onClick={() => { onOpenChange(false); }} type="button">{t('home.activities.close')}</button></DialogFooter></DialogContent></DialogRoot>;
}
function ActivityReadOnly({ activity }: Readonly<{ activity: BudgetActivity }>) { const { t } = useTranslation('budgeting'); return <><div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 rounded-xl border border-line bg-canvas p-[18px]"><Money label={t('home.activities.stats.allocated')} value={activity.budget} /><Money label={t('home.activities.stats.committed')} value={activity.committed} /><Money label={t('home.activities.stats.available')} value={activity.budget - activity.committed} /></div><div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4"><Read label={t('home.activities.fields.name')} value={activity.name} /><Read label={t('home.activities.fields.type')} value={activity.type} /><Read label={t('home.activities.fields.owner')} value={activity.owner} /><Read label={t('home.activities.fields.accountName')} value={activity.account} /><Read label={t('home.activities.fields.accountNumber')} value={activity.accountNo} /></div><Read label={t('home.activities.fields.description')} value={activity.desc || '—'} /><h3 className="m-0 text-lg font-semibold">{`${t('home.activities.fields.subActivities')} · ${String(activity.subs.length)}`}</h3>{activity.subs.map((sub) => <div className="grid grid-cols-[1fr_2fr_auto] gap-3 rounded-lg border border-line p-3 text-sm" key={sub.code}><strong>{`${sub.name} `}<span className="num font-normal text-fg-3">{sub.code}</span></strong><span className="text-fg-3">{sub.desc}</span><span className="num">{`KWD ${kwd(sub.alloc)}`}</span></div>)}</>; }
function Read({ label, value }: Readonly<{ label: string; value: string }>) { return <div><div className="text-xs font-semibold tracking-[0.08em] text-fg-3 uppercase">{label}</div><div className="mt-1 text-base">{value}</div></div>; }
function ActivityEdit({ activity, onChange }: Readonly<{ activity: BudgetActivity; onChange: (activity: BudgetActivity) => void }>) { const { t } = useTranslation('budgeting'); return <><div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5"><label>{t('home.activities.fields.name')}<input className={`${inputClass} mt-1.5`} onChange={(event) => { onChange({ ...activity, name: event.currentTarget.value }); }} value={activity.name} /></label><label>{t('home.activities.fields.owner')}<select className={`${inputClass} mt-1.5`} onChange={(event) => { onChange({ ...activity, owner: event.currentTarget.value }); }} value={activity.owner}>{departments.map((department) => <option key={department}>{department}</option>)}</select></label><label>{t('home.activities.fields.allocation')}<input className={`${inputClass} mt-1.5`} min="0" onChange={(event) => { onChange({ ...activity, budget: Number.parseFloat(event.currentTarget.value) || 0 }); }} type="number" value={activity.budget} /></label></div><label>{t('home.activities.fields.description')}<textarea className={`${inputClass} mt-1.5`} onChange={(event) => { onChange({ ...activity, desc: event.currentTarget.value }); }} rows={3} value={activity.desc} /></label><button className={`${budgetButtonStyles.ghost} self-start`} onClick={() => { onChange({ ...activity, active: !activity.active }); }} type="button">{t(activity.active ? 'home.activities.deactivate' : 'home.activities.activate')}</button></>; }
