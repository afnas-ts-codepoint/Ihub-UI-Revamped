import { Check, Folder, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RecordHud } from './RecordHud';
import type { IncidentRuntimeRow } from '../types/incidents.types';
import { Select } from '@/shared/form/controls/Select';
import { TextArea } from '@/shared/form/controls/TextArea';
import { TextInput } from '@/shared/form/controls/TextInput';
import { Field } from '@/shared/form/field/Field';
import { Chip } from '@/shared/ui/chip/Chip';
import { DialogBody, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from '@/shared/ui/overlay/Dialog';

export type IncidentAction = 'callback' | 'close' | 'compensate' | 'feedback' | 'investigate' | 'task' | 'track';

const actionOptions = ['Refund', 'Free play credit', 'Complimentary visit', 'Voucher', 'Replacement item', 'Goodwill gesture', 'Other'].map((value) => ({ label: value, value }));
const button = 'rounded-lg px-3 py-2 text-sm font-semibold';

function DetailBlock({ items, title }: Readonly<{ items: readonly (readonly [string, string])[]; title: string }>) {
  return <section className="mt-[18px]"><span className="eyebrow">{title}</span><div className="mt-2.5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">{items.map(([label, value]) => <div key={label}><div className="text-2xs-plus font-semibold tracking-wider text-fg-3 uppercase">{label}</div><strong className="mt-0.5 block text-sm-plus">{value || '—'}</strong></div>)}</div></section>;
}

export function IncidentDetailDialog({ onAction, onOpenChange, row }: Readonly<{ onAction: (action: IncidentAction, row: IncidentRuntimeRow) => void; onOpenChange: (open: boolean) => void; row: IncidentRuntimeRow | null }>) {
  const { t } = useTranslation('incidents');
  if (!row) return null;
  const detail = row.detail;
  return <DialogRoot onOpenChange={onOpenChange} open><DialogContent className="w-[min(700px,calc(100%-48px))]">
    <DialogHeader className="items-start"><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Chip tone={row.statusTone}>{row.status}</Chip><Chip tone={row.priorityTone}>{row.priority}</Chip><Chip>{t('detail.readOnly')}</Chip></div><DialogTitle className="display mt-2.5 text-xl font-medium">{row.title}</DialogTitle><div className="mt-1 text-sm text-fg-3"><span className="num font-semibold text-fg-2">{row.id}</span>{` · ${row.raisedBy} · ${detail.date} ${detail.time}`}</div></div><button aria-label={t('actions.closeDialog')} onClick={() => { onOpenChange(false); }} type="button"><X aria-hidden size={18} /></button></DialogHeader>
    <DialogBody className="gap-0">
      <DetailBlock items={[[t('fields.location'), detail.location], [t('fields.zone'), detail.zone], [t('fields.department'), detail.department], [t('fields.area'), detail.area], [t('fields.specificArea'), detail.specificArea]]} title={t('detail.where')} />
      <DetailBlock items={[[t('fields.mainCategory'), detail.mainCategory], [t('fields.subCategory'), detail.subCategory], [t('fields.scenario'), detail.scenario], [t('fields.riskType'), detail.risk], [t('fields.impactType'), detail.impact]]} title={t('detail.classification')} />
      <DetailBlock items={[[t('fields.date'), detail.date], [t('fields.time'), detail.time], [t('fields.injuries'), detail.injuries], [t('fields.facility'), detail.facility]]} title={t('detail.whenImpact')} />
      <DetailBlock items={[[t('fields.employees'), detail.employees], [t('fields.employeePosition'), detail.employeePosition], [t('fields.witnessEmail'), detail.witnessEmail], [t('fields.guestName'), detail.guest], [t('fields.guestContact'), detail.guestContact], [t('fields.guestEmail'), detail.guestEmail]]} title={t('detail.people')} />
      {[[t('fields.description'), detail.description], [t('fields.guestAction'), detail.guestAction], [t('fields.houseAction'), detail.houseAction], [t('fields.notes'), detail.notes]].map(([label, value]) => <section className="mt-[18px]" key={label}><span className="eyebrow">{label}</span><p className="mt-2 text-base leading-relaxed text-fg-2">{value}</p></section>)}
      <section className="mt-[18px]"><span className="eyebrow">{t('attachments.title')}</span><div className="mt-2.5 flex flex-col gap-2">{detail.documents.map((document) => <div className="flex items-center gap-2.5 rounded-lg border border-line bg-raised px-3 py-2.5" key={document}><Folder aria-hidden className="text-accent" size={15} /><strong className="flex-1 text-sm-plus">{document}</strong><span className="text-sm font-semibold text-accent">{t('actions.view')}</span></div>)}</div></section>
      <div className="mt-[18px]"><RecordHud entries={row.history} id={row.id} status={row.status} statusTone={row.statusTone} /></div>
    </DialogBody>
    <DialogFooter>{(['track', 'compensate', 'task', 'investigate', 'feedback', 'callback', 'close'] as const).map((action) => <button className={`${button} ${action === 'close' ? 'bg-accent text-accent-ink' : 'border border-line-strong bg-surface'} disabled:opacity-50`} disabled={action === 'task' && Boolean(row.taskRef)} key={action} onClick={() => { onAction(action, row); }} type="button">{t(`actions.${action}`)}</button>)}<button className={`${button} ms-auto text-fg-2`} onClick={() => { onOpenChange(false); }} type="button">{t('actions.closeDialog')}</button></DialogFooter>
  </DialogContent></DialogRoot>;
}

export function CompensationDialog({ onCancel, onSave, row }: Readonly<{ onCancel: () => void; onSave: (summary: string) => void; row: IncidentRuntimeRow | null }>) {
  const { t } = useTranslation('incidents');
  const [type, setType] = useState(''); const [value, setValue] = useState(''); const [recipient, setRecipient] = useState(row?.detail.guest === '—' ? '' : (row?.detail.guest ?? '')); const [reference, setReference] = useState(''); const [notes, setNotes] = useState('');
  if (!row) return null;
  const valid = Boolean(type && notes.trim());
  return <DialogRoot onOpenChange={(open) => { if (!open) onCancel(); }} open><DialogContent className="w-[min(560px,calc(100%-48px))]"><DialogHeader><div className="flex-1"><DialogTitle className="text-lg font-semibold">{t('compensation.title')}</DialogTitle><div className="mt-1 text-sm text-fg-3">{`${row.id} · ${row.title}`}</div></div></DialogHeader><DialogBody><div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5"><Field label={t('compensation.type')}><Select ariaLabel={t('compensation.type')} onChange={setType} options={actionOptions} value={type} /></Field><Field label={t('compensation.value')}><TextInput inputMode="decimal" onChange={(event) => { setValue(event.currentTarget.value); }} placeholder="0.000" value={value} /></Field><Field label={t('compensation.recipient')}><TextInput onChange={(event) => { setRecipient(event.currentTarget.value); }} value={recipient} /></Field><Field label={t('compensation.reference')}><TextInput onChange={(event) => { setReference(event.currentTarget.value); }} placeholder="RCP-00921" value={reference} /></Field></div><Field label={t('compensation.details')}><TextArea aria-label={t('compensation.details')} onChange={(event) => { setNotes(event.currentTarget.value); }} rows={5} value={notes} /></Field></DialogBody><DialogFooter><span className="text-sm text-fg-3">{t('compensation.note')}</span><div className="ms-auto flex gap-2"><button className={`${button} text-fg-2`} onClick={onCancel} type="button">{t('actions.cancel')}</button><button className={`${button} inline-flex items-center gap-1.5 bg-accent text-accent-ink disabled:opacity-50`} disabled={!valid} onClick={() => { onSave([type, value ? `${value} KWD` : '', recipient, reference].filter(Boolean).join(' · ') + ` — ${notes.trim()}`); }} type="button"><Check aria-hidden size={14} />{t('compensation.record')}</button></div></DialogFooter></DialogContent></DialogRoot>;
}

export function FeedbackDialog({ onCancel, onSave, row }: Readonly<{ onCancel: () => void; onSave: (feedback: string) => void; row: IncidentRuntimeRow | null }>) {
  const { t } = useTranslation('incidents'); const [feedback, setFeedback] = useState(''); if (!row) return null;
  return <DialogRoot onOpenChange={(open) => { if (!open) onCancel(); }} open><DialogContent className="w-[min(520px,calc(100%-48px))]"><DialogHeader><div><DialogTitle className="text-lg font-semibold">{t('feedback.title')}</DialogTitle><div className="mt-1 text-sm text-fg-3">{`${row.id} · ${row.title}`}</div></div></DialogHeader><DialogBody><Field label={t('feedback.field')}><TextArea aria-label={t('feedback.field')} onChange={(event) => { setFeedback(event.currentTarget.value); }} rows={6} value={feedback} /></Field></DialogBody><DialogFooter><span className="text-sm text-fg-3">{t('feedback.note')}</span><div className="ms-auto flex gap-2"><button className={`${button} text-fg-2`} onClick={onCancel} type="button">{t('actions.cancel')}</button><button className={`${button} bg-accent text-accent-ink disabled:opacity-50`} disabled={!feedback.trim()} onClick={() => { onSave(feedback.trim()); }} type="button">{t('feedback.save')}</button></div></DialogFooter></DialogContent></DialogRoot>;
}
