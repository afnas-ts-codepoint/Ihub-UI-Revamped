import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  Clock,
  Download,
  Eye,
  Folder,
  MapPin,
  MessageSquare,
  Pencil,
  User,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { CollapsiblePanel } from '../task-view/CollapsiblePanel';
import { FieldGrid, FieldItem, PanelIntro } from '../task-view/FieldGrid';
import {
  TASK_VIEW_ATTACHMENTS,
  TASK_VIEW_SLA_HISTORY,
  TASK_VIEW_SLA_TARGET,
  TASK_VIEW_TEAM,
  type AttachmentFixture,
  type SlaHistoryEntry,
} from '../../data/taskView.mock';
import type { TaskViewModel } from '../../types/task.types';
import { toast } from '@/shared/ui/feedback/Toaster';
import { Chip } from '@/shared/ui/chip/Chip';
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

export const inputClass =
  'w-full rounded-lg border border-line-strong bg-canvas px-3 py-2 text-sm-plus text-fg outline-none';
export const labelClass = 'text-xs font-semibold tracking-wider text-fg-3 uppercase';

export function EditorField({
  children,
  label,
  required = false,
}: Readonly<{ children: ReactNode; label: string; required?: boolean }>) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className={labelClass}>
        {label}
        {required ? <span className="ms-1 text-bad">{'*'}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function TaskEditDetailsPanel({
  project,
  task,
}: Readonly<{ project: readonly [string, string]; task: TaskViewModel }>) {
  const { t } = useTranslation('taskView');
  const [details, setDetails] = useState(t('details.descriptionValue', { department: task.department }));
  return (
    <CollapsiblePanel icon={Pencil} title={t('details.title')}>
      <PanelIntro>{t('details.intro')}</PanelIntro>
      <FieldGrid>
        <FieldItem label={t('details.subject')} value={task.subject} />
        <FieldItem label={t('details.projectName')} value={project[0]} />
        <FieldItem label={t('details.projectCategory')} value={project[1]} />
      </FieldGrid>
      <EditorField label={t('details.description')}>
        <textarea
          className={`${inputClass} resize-y`}
          onChange={(event) => {
            setDetails(event.target.value);
          }}
          placeholder={t('edit.describeTask')}
          rows={3}
          value={details}
        />
      </EditorField>
    </CollapsiblePanel>
  );
}

const ASSET_CATEGORIES = [
  'Rides & Attractions',
  'Facility Assets',
  'Electrical Systems',
  'HVAC Systems',
  'IT Equipment',
] as const;

export function TaskEditLocationPanel({
  assetCategory,
  assetCode,
  task,
}: Readonly<{ assetCategory: string; assetCode: string; task: TaskViewModel }>) {
  const { t } = useTranslation('taskView');
  const [assetName, setAssetName] = useState(task.zone);
  return (
    <CollapsiblePanel icon={MapPin} title={t('location.title')}>
      <PanelIntro>{t('location.intro')}</PanelIntro>
      <FieldGrid>
        <FieldItem label={t('location.location')} value={task.location} />
        <FieldItem label={t('location.zone')} value={task.zone} />
        <FieldItem label={t('location.area')} value={t('location.areaValue')} />
        <FieldItem label={t('location.subArea')} value={t('location.subAreaValue')} />
        <FieldItem label={t('location.priority')} value={task.severity} />
        <FieldItem label={t('location.severity')} value={task.severity} />
        <FieldItem label={t('location.touchpoint')} value="" />
        <FieldItem label={t('location.guestKpi')} value={t('location.guestKpiValue')} />
        <EditorField label={t('location.assetCategory')}>
          {/* Prototype quirk: this select renders as editable but its onChange is a no-op. */}
          <select className={inputClass} onChange={() => undefined} value={assetCategory}>
            {ASSET_CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </EditorField>
        <EditorField label={t('location.assetName')}>
          <input
            className={inputClass}
            onChange={(event) => {
              setAssetName(event.target.value);
            }}
            placeholder={t('edit.assetNamePlaceholder')}
            value={assetName}
          />
        </EditorField>
        <EditorField label={t('location.assetCode')}>
          <input className={`${inputClass} num text-fg-3`} readOnly value={assetCode} />
        </EditorField>
      </FieldGrid>
    </CollapsiblePanel>
  );
}

export const DEFAULT_PROCESS_OWNER = 'Maintenance Department';
export const DEFAULT_MATRIX_PARTNERS = ['IT Department', 'Safety Department'] as const;

/**
 * Controlled by `TaskEditPage` (rather than owning its own local state) so
 * the Redirect dialog (M8.6) can overwrite process owner / matrix partner /
 * assignee, matching the prototype's single-component `setProcessOwner`/
 * `setMatrixPartners`/`setAssignee` state that both this card and Redirect
 * share.
 */
export function TaskEditAssignmentPanel({
  assignee,
  matrixPartners,
  onAssigneeChange,
  processOwner,
}: Readonly<{
  assignee: string;
  matrixPartners: readonly string[];
  onAssigneeChange: (value: string) => void;
  processOwner: string;
}>) {
  const { t } = useTranslation('taskView');
  return (
    <CollapsiblePanel defaultOpen icon={UserRound} title={t('assignment.title')}>
      <PanelIntro>{t('assignment.intro')}</PanelIntro>
      <div className="flex flex-col gap-2">
        <span className={labelClass}>{t('assignment.processOwner')}</span>
        <div className="flex flex-wrap gap-1.5"><Chip tone="accent">{processOwner}</Chip></div>
      </div>
      <div className="flex flex-col gap-2">
        <span className={labelClass}>{t('assignment.matrixPartner')}</span>
        <div className="flex flex-wrap gap-1.5">
          {matrixPartners.map((partner) => <Chip key={partner} tone="accent">{partner}</Chip>)}
        </div>
      </div>
      <EditorField label={t('assignment.assignee')}>
        <div className="relative flex items-center gap-3 rounded-lg border border-line-strong bg-surface px-3.5 py-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-inset text-fg-3">
            <User aria-hidden size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className={`m-0 truncate text-sm-plus font-semibold ${assignee ? 'text-fg' : 'text-fg-3'}`}>
              {assignee || t('edit.chooseAssignee')}
            </p>
            <p className="m-0 text-xs-plus text-fg-3">{t('assignment.assignee')}</p>
          </div>
          <select
            aria-label={t('assignment.assignee')}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(event) => {
              onAssigneeChange(event.target.value);
            }}
            value={assignee}
          >
            <option value="">{t('edit.chooseAssignee')}</option>
            {TASK_VIEW_TEAM.map((name) => <option key={name}>{name}</option>)}
          </select>
        </div>
      </EditorField>
    </CollapsiblePanel>
  );
}

type EditAttachment = AttachmentFixture & Readonly<{ file?: File }>;

function AttachmentPreview({
  attachment,
  onClose,
  onDownload,
}: Readonly<{ attachment: EditAttachment | null; onClose: () => void; onDownload: (item: EditAttachment) => void }>) {
  const { t } = useTranslation('taskView');
  const url = useMemo(
    () => attachment?.file ? URL.createObjectURL(attachment.file) : null,
    [attachment],
  );
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return (
    <DialogRoot onOpenChange={(open) => { if (!open) onClose(); }} open={attachment !== null}>
      <DialogContent className="w-[min(480px,calc(100%-32px))]">
        {attachment ? (
          <>
            <DialogHeader>
              <DialogTitle className="truncate text-sm-plus font-semibold">{attachment.name}</DialogTitle>
              <button aria-label={t('attachments.close')} className="ms-auto p-1 text-fg-3" onClick={onClose} type="button"><X aria-hidden size={16} /></button>
            </DialogHeader>
            <DialogBody className="items-center bg-raised text-center">
              {url && attachment.file?.type.startsWith('image/') ? (
                <img alt={attachment.name} className="max-h-[55vh] max-w-full rounded-lg" src={url} />
              ) : (
                <span className="flex size-18 items-center justify-center rounded-2xl bg-accent-dim text-accent"><Folder aria-hidden size={32} /></span>
              )}
              <p className="m-0 text-xs-plus text-fg-3">{[attachment.size, attachment.by, attachment.when].filter(Boolean).join(' · ')}</p>
            </DialogBody>
            <DialogFooter className="justify-end">
              <button className="rounded-lg px-3.5 py-2 text-sm font-semibold text-fg-2" onClick={onClose} type="button">{t('attachments.close')}</button>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink" onClick={() => { onDownload(attachment); }} type="button"><Download aria-hidden size={13} />{t('attachments.download')}</button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </DialogRoot>
  );
}

function downloadAttachment(item: EditAttachment, downloadingMessage: string) {
  if (!item.file) {
    toast(downloadingMessage);
    return;
  }
  const url = URL.createObjectURL(item.file);
  const link = document.createElement('a');
  link.href = url;
  link.download = item.name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => { URL.revokeObjectURL(url); }, 4000);
}

export function TaskEditAttachmentsPanel({ startDate }: Readonly<{ startDate: string }>) {
  const { t } = useTranslation('taskView');
  const [attachments, setAttachments] = useState<readonly EditAttachment[]>(TASK_VIEW_ATTACHMENTS);
  const [preview, setPreview] = useState<EditAttachment | null>(null);
  const addPlaceholder = () => {
    const number = attachments.length + 1;
    setAttachments((current) => [
      ...current,
      {
        by: t('edit.currentUser'),
        name: `Attachment (${String(number)}).png`,
        size: `${String(200 + number * 37)} KB`,
        when: `${startDate}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      },
    ]);
    toast(t('edit.fileAttached'));
  };

  return (
    <CollapsiblePanel icon={Folder} title={t('attachments.title')}>
      <PanelIntro>{t('attachments.intro')}</PanelIntro>
      <button className="rounded-xl border border-dashed border-line-strong bg-raised px-3.5 py-5.5 text-center" onClick={addPlaceholder} type="button">
        <Folder aria-hidden className="mx-auto mb-2 text-fg-4" size={22} />
        <span className="block text-sm-plus font-semibold text-fg-2">{t('edit.uploadPrompt')}</span>
        <span className="mt-1 block text-xs text-fg-4">{t('edit.uploadNote')}</span>
      </button>
      <div className="flex flex-col gap-2.5">
        {attachments.map((attachment, index) => (
          <div className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5" key={`${attachment.name}-${String(index)}`}>
            <span className="flex size-8.5 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-accent"><Folder aria-hidden size={15} /></span>
            <div className="min-w-0 flex-1"><p className="m-0 truncate text-sm-plus font-semibold">{attachment.name}</p><p className="m-0 text-xs-plus text-fg-3">{`${attachment.size} · ${attachment.by} · ${attachment.when}`}</p></div>
            <button aria-label={`${t('attachments.view')} ${attachment.name}`} className="p-2 text-fg-3" onClick={() => { setPreview(attachment); }} type="button"><Eye aria-hidden size={14} /></button>
            <button aria-label={`${t('attachments.download')} ${attachment.name}`} className="p-2 text-fg-3" onClick={() => { downloadAttachment(attachment, t('attachments.downloading')); }} type="button"><Download aria-hidden size={14} /></button>
            <button aria-label={`${t('edit.remove')} ${attachment.name}`} className="p-2 text-bad" onClick={() => { setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index)); }} type="button"><X aria-hidden size={14} /></button>
          </div>
        ))}
      </div>
      <AttachmentPreview attachment={preview} onClose={() => { setPreview(null); }} onDownload={(item) => { downloadAttachment(item, t('attachments.downloading')); }} />
    </CollapsiblePanel>
  );
}

function pad2(value: number) { return String(value).padStart(2, '0'); }
function formatSlaDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const hour = date.getHours() % 12 || 12;
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}/${String(date.getFullYear())}, ${pad2(hour)}:${pad2(date.getMinutes())} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
}
function slaStamp(date: Date) {
  const hour = date.getHours() % 12 || 12;
  return `${String(date.getFullYear())}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(hour)}:${pad2(date.getMinutes())} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
}

export function TaskEditSlaPanel() {
  const { t } = useTranslation('taskView');
  const [target, setTarget] = useState(TASK_VIEW_SLA_TARGET);
  const [history, setHistory] = useState<readonly SlaHistoryEntry[]>(TASK_VIEW_SLA_HISTORY);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [reason, setReason] = useState('');
  const breached = new Date(target) < new Date();
  const canSave = Boolean(draft && draft !== target && reason.trim());
  const save = () => {
    if (!canSave) return;
    setHistory((current) => [
      { from: target, reason: reason.trim(), to: draft, when: slaStamp(new Date()), who: t('edit.currentUser') },
      ...current,
    ]);
    setTarget(draft);
    setEditing(false);
    setReason('');
    toast(t('edit.targetUpdated'));
  };

  return (
    <CollapsiblePanel icon={Clock} title={t('sla.title')}>
      <PanelIntro>{t('sla.intro')}</PanelIntro>
      <div className={`flex items-center gap-3 rounded-lg border p-3.5 ${breached ? 'border-bad/30 bg-bad/10' : 'border-ok/30 bg-ok/10'}`}>
        <span className={`flex size-8.5 shrink-0 items-center justify-center rounded-full ${breached ? 'bg-bad/20 text-bad' : 'bg-ok/20 text-ok'}`}>{breached ? <Zap aria-hidden size={16} /> : <Check aria-hidden size={16} />}</span>
        <div className="min-w-0 flex-1"><p className={`m-0 text-sm-plus font-bold ${breached ? 'text-bad' : 'text-ok'}`}>{breached ? t('sla.breachedTitle') : t('sla.onTrackTitle')}</p><p className="m-0 text-xs-plus text-fg-2">{breached ? t('sla.breachedSub') : t('sla.onTrackSub')}</p></div>
        <Chip tone={breached ? 'bad' : 'ok'}>{breached ? t('sla.breached') : t('sla.onTrack')}</Chip>
      </div>
      <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5"><span className="flex size-7.5 items-center justify-center rounded-lg border border-line-strong text-accent"><Calendar aria-hidden size={15} /></span><div><span className={labelClass}>{t('sla.targetCompletion')}</span><div className={`num text-sm-plus font-bold ${breached ? 'text-bad' : 'text-ok'}`}>{formatSlaDate(target)}</div></div></div>
          {!editing ? <button aria-label={t('edit.editTarget')} className="p-2 text-fg-3" onClick={() => { setDraft(target); setReason(''); setEditing(true); }} title={t('edit.editTarget')} type="button"><Pencil aria-hidden size={14} /></button> : null}
        </div>
        {editing ? (
          <div className="grid grid-cols-1 gap-3 border-t border-line pt-3 tablet:grid-cols-2">
            <EditorField label={t('edit.newTarget')}><input className={inputClass} onChange={(event) => { setDraft(event.target.value); }} type="datetime-local" value={draft} /></EditorField>
            <div className="tablet:col-span-2"><EditorField label={t('edit.justification')} required><textarea className={`${inputClass} resize-y`} onChange={(event) => { setReason(event.target.value); }} placeholder={t('edit.justificationPlaceholder')} rows={3} value={reason} /></EditorField></div>
            <div className="flex justify-end gap-2 tablet:col-span-2"><button className="rounded-lg border border-line-strong px-3.5 py-2 text-sm font-semibold" onClick={() => { setEditing(false); setDraft(''); setReason(''); }} type="button">{t('edit.cancel')}</button><button className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink disabled:opacity-40" disabled={!canSave} onClick={save} type="button">{t('edit.save')}</button></div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2"><span className={`flex items-center gap-2 ${labelClass}`}><Clock aria-hidden size={14} />{t('sla.changeHistory')}</span><Chip>{t('sla.changeCount', { count: history.length })}</Chip></div>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {history.map((entry, index) => (
            <li className="flex gap-3" key={`${entry.when}-${String(index)}`}><span className={`mt-1 size-2.5 shrink-0 rounded-full ${index === 0 ? 'bg-accent' : 'bg-line-strong'}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-sm-plus font-semibold">{entry.who}</span><span className="num text-xs-plus text-fg-4">{entry.when}</span></div><div className="mt-1 inline-flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-inset px-2.5 py-1 text-xs-plus"><span className="num text-fg-4 line-through">{formatSlaDate(entry.from)}</span><ArrowRight aria-hidden size={13} className="text-fg-3" /><span className="num font-bold text-bad">{formatSlaDate(entry.to)}</span></div><p className="m-0 mt-1 text-xs-plus text-fg-3 italic">{entry.reason}</p></div></li>
          ))}
        </ul>
      </div>
    </CollapsiblePanel>
  );
}

type CommentRow = Readonly<{ activity: string; expense: string }>;
type CommentAttachment = EditAttachment & Readonly<{ id: number }>;

function fileSize(size: number) {
  if (size < 1024) return `${String(size)} B`;
  if (size < 1_048_576) return `${String(Math.round(size / 1024))} KB`;
  return `${(size / 1_048_576).toFixed(1)} MB`;
}

export function AddCommentPanel({ department, startDate }: Readonly<{ department: string; startDate: string }>) {
  const { t } = useTranslation('taskView');
  const [selectedDepartment, setSelectedDepartment] = useState(department);
  const [partnerStatus, setPartnerStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [expected, setExpected] = useState('');
  const [rows, setRows] = useState<readonly CommentRow[]>([{ activity: '', expense: '0.00' }]);
  const [attachments, setAttachments] = useState<readonly CommentAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<CommentAttachment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | readonly File[]) => {
    const next = Array.from(files).map((file, index) => ({
      by: t('edit.currentUser'), file, id: Date.now() + index, name: file.name,
      size: fileSize(file.size), when: startDate,
    }));
    if (!next.length) return;
    setAttachments((current) => [...current, ...next]);
    toast(t('edit.fileAttached'));
  };
  const post = () => {
    if (!remarks.trim()) {
      toast(t('edit.commentNeedsRemark'), 'bad');
      return;
    }
    toast(t('edit.commentPosted'));
    setRemarks(''); setPartnerStatus(''); setExpected('');
    setRows([{ activity: '', expense: '0.00' }]); setAttachments([]);
  };

  return (
    <CollapsiblePanel defaultOpen icon={MessageSquare} title={t('edit.commentTitle')}>
      <PanelIntro>{t('edit.commentIntro')}</PanelIntro>
      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
        <EditorField label={t('edit.department')}><select className={inputClass} onChange={(event) => { setSelectedDepartment(event.target.value); }} value={selectedDepartment}>{[department, 'Operations', 'Maintenance', 'Logistics'].map((value, index) => <option key={`${value}-${String(index)}`}>{value}</option>)}</select></EditorField>
        <EditorField label={t('edit.partnerStatus')}><select className={inputClass} onChange={(event) => { setPartnerStatus(event.target.value); }} value={partnerStatus}><option value="">{t('edit.selectStatus')}</option>{['In Progress', 'Completed'].map((value) => <option key={value}>{value}</option>)}</select></EditorField>
      </div>
      <EditorField label={t('edit.partnerRemarks')}><textarea className={`${inputClass} resize-y`} onChange={(event) => { setRemarks(event.target.value); }} placeholder={t('edit.addNotes')} rows={3} value={remarks} /></EditorField>
      <EditorField label={t('edit.expectedBy')}><input className={inputClass} onChange={(event) => { setExpected(event.target.value); }} type="date" value={expected} /></EditorField>
      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2" key={index}>
            <EditorField label={t('edit.activity')}><select className={inputClass} onChange={(event) => { setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, activity: event.target.value } : item)); }} value={row.activity}><option value="">{t('edit.selectActivity')}</option>{['Comment Added', 'Status Updated', 'Site Visit', 'Parts Ordered'].map((value) => <option key={value}>{value}</option>)}</select></EditorField>
            <EditorField label={t('edit.expense')}><div className="flex items-center gap-2"><div className="relative flex-1"><span className="absolute top-1/2 start-3 -translate-y-1/2 text-xs-plus font-semibold text-fg-3">{'KWD'}</span><input className={`${inputClass} ps-12`} onChange={(event) => { setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, expense: event.target.value } : item)); }} value={row.expense} /></div><button aria-label={t('edit.remove')} className="p-2 text-bad" onClick={() => { setRows((current) => current.filter((_, itemIndex) => itemIndex !== index)); }} type="button"><X aria-hidden size={14} /></button></div></EditorField>
          </div>
        ))}
        <button className="inline-flex self-end items-center gap-1 text-sm-plus font-semibold text-accent" onClick={() => { setRows((current) => [...current, { activity: '', expense: '0.00' }]); }} type="button">{t('edit.addMore')}</button>
      </div>
      <button
        className={`rounded-xl border border-dashed px-3.5 py-4.5 text-center ${dragOver ? 'border-accent bg-accent-dim' : 'border-line-strong bg-raised'}`}
        onClick={() => { inputRef.current?.click(); }}
        onDragLeave={() => { setDragOver(false); }}
        onDragOver={(event: DragEvent<HTMLButtonElement>) => { event.preventDefault(); setDragOver(true); }}
        onDrop={(event: DragEvent<HTMLButtonElement>) => { event.preventDefault(); setDragOver(false); addFiles(event.dataTransfer.files); }}
        type="button"
      >
        <input ref={inputRef} accept=".jpg,.jpeg,.png,.pdf" className="hidden" multiple onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ''; }} type="file" />
        <Folder aria-hidden className="mx-auto mb-1.5 text-fg-4" size={20} /><span className="block text-sm-plus font-semibold text-fg-2">{t('edit.uploadPrompt')}</span><span className="mt-1 block text-xs text-fg-4">{t('edit.uploadNote')}</span>
      </button>
      {attachments.length ? <div className="flex max-h-45 flex-col gap-2 overflow-y-auto">{attachments.map((attachment) => <div className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2" key={attachment.id}><Folder aria-hidden className="shrink-0 text-accent" size={14} /><div className="min-w-0 flex-1"><p className="m-0 truncate text-sm-plus font-semibold">{attachment.name}</p><p className="m-0 text-xs text-fg-3">{attachment.size}</p></div><button aria-label={`${t('attachments.view')} ${attachment.name}`} className="p-1.5" onClick={() => { setPreview(attachment); }} type="button"><Eye aria-hidden size={13} /></button><button aria-label={`${t('attachments.download')} ${attachment.name}`} className="p-1.5" onClick={() => { downloadAttachment(attachment, t('attachments.downloading')); }} type="button"><Download aria-hidden size={13} /></button><button aria-label={`${t('edit.remove')} ${attachment.name}`} className="p-1.5 text-bad" onClick={() => { setAttachments((current) => current.filter((item) => item.id !== attachment.id)); }} type="button"><X aria-hidden size={13} /></button></div>)}</div> : null}
      <button className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink" onClick={post} type="button"><ArrowUpRight aria-hidden size={14} />{t('edit.postComment')}</button>
      <AttachmentPreview attachment={preview} onClose={() => { setPreview(null); }} onDownload={(item) => { downloadAttachment(item, t('attachments.downloading')); }} />
    </CollapsiblePanel>
  );
}
