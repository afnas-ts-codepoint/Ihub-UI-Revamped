import { ArrowRight, Check, ChevronRight, Pencil, Plus, Tag, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EditorField, inputClass, labelClass } from './TaskEditPanels';
import { SUBTASK_PROGRESS_ROWS, TASK_VIEW_TEAM, type SubtaskStatus } from '../../data/taskView.mock';
import { useTasks } from '../../store/tasks.store';
import { toast } from '@/shared/ui/feedback/Toaster';
import { Chip } from '@/shared/ui/chip/Chip';
import { ConfirmDialog } from '@/shared/ui/overlay/ConfirmDialog';
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

const STATUS_TONE: Readonly<Record<SubtaskStatus, 'accent' | 'info' | 'warn'>> = {
  done: 'info',
  pending: 'warn',
  progress: 'accent',
};

/** @prototype ihub/ORIGINAL_SOURCE.html:L19215 `WEIGHT_OPTS`. */
const WEIGHT_OPTIONS = ['5', '10', '15', '20', '25', '30', '40', '50'] as const;
const STATUS_KEYS: readonly SubtaskStatus[] = ['pending', 'progress', 'done'];

type ResTaskRow = Readonly<{
  assignee: string;
  cat: string;
  dept: string;
  due: string;
  id: string;
  pct: number;
  slaOk: boolean;
  status: SubtaskStatus;
  sub: string;
  title: string;
}>;

function seedRows(): ResTaskRow[] {
  return SUBTASK_PROGRESS_ROWS.map((row, index) => ({
    assignee: row.assignee,
    cat: row.category,
    dept: row.department,
    due: row.due,
    id: `RES-${String(index + 1)}`,
    pct: row.percent,
    slaOk: row.slaOk,
    status: row.status,
    sub: row.subDepartment,
    title: row.title,
  }));
}

type DraftForm = Readonly<{
  assignee: string;
  dueDate: string;
  name: string;
  projectCategory: string;
  relatedProject: string;
  remark: string;
  status: SubtaskStatus;
  weight: string;
}>;

const EMPTY_DRAFT: DraftForm = {
  assignee: '', dueDate: '', name: '', projectCategory: '', relatedProject: '', remark: '', status: 'pending', weight: WEIGHT_OPTIONS[0],
};

/**
 * Update Sub Tasks ("Resolution Tasks" in the prototype's own modal
 * heading — a genuine naming mismatch vs. the trigger button/tooltip text
 * "Update Sub Tasks", preserved as-is). Opened from both the header's
 * standalone toolbar button and any Sub Tasks Progress row click in edit
 * mode (`openStCard`) — always the same, unfiltered dialog regardless of
 * which row was clicked. Seeded once from the same 7-row `EDIT_SUBTASKS`
 * fixture the summary panel displays, but keeps its own independent local
 * copy — edits here do not write back to the summary panel's fixed rows.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L19180-L19479.
 */
export function UpdateSubTasksDialog({
  onOpenChange,
  open,
  taskDepartment,
}: Readonly<{ onOpenChange: (open: boolean) => void; open: boolean; taskDepartment: string }>) {
  const { t } = useTranslation('taskView');
  const tasks = useTasks();
  const [resTasks, setResTasks] = useState<readonly ResTaskRow[]>(seedRows);
  const [viewBy, setViewBy] = useState<'Assignee' | 'Dept'>('Dept');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [weightErr, setWeightErr] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftForm>(EMPTY_DRAFT);
  const [remarkErr, setRemarkErr] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copyMoveMode, setCopyMoveMode] = useState<'copy' | 'move' | null>(null);
  const [ctmQuery, setCtmQuery] = useState('');

  const totalWeight = resTasks.reduce((total, row) => total + row.pct, 0);
  const completedCount = resTasks.filter((row) => row.status === 'done').length;

  const groups = viewBy === 'Assignee'
    ? [...new Set(resTasks.map((row) => row.assignee))].map((name) => ({
        key: name, label: name, rows: resTasks.filter((row) => row.assignee === name),
      }))
    : [{ key: 'dept', label: taskDepartment, rows: resTasks }];

  const toggleSelectAll = () => {
    setSelected((current) => (current.length === resTasks.length ? [] : resTasks.map((row) => row.id)));
  };
  const toggleSelectOne = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  };
  const markSelectedStatus = (status: SubtaskStatus) => {
    setResTasks((current) => current.map((row) => (selected.includes(row.id) ? { ...row, status } : row)));
  };
  const deleteSelected = () => {
    setResTasks((current) => current.filter((row) => !selected.includes(row.id)));
    setSelected([]);
  };

  const openAddForm = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setRemarkErr(false);
    setShowAddForm(true);
  };
  const openEditForm = (row: ResTaskRow) => {
    setEditingId(row.id);
    setDraft({
      assignee: row.assignee, dueDate: '', name: row.title, projectCategory: row.cat,
      relatedProject: row.cat, remark: '', status: row.status, weight: String(row.pct),
    });
    setRemarkErr(false);
    setShowAddForm(true);
  };
  const closeForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setRemarkErr(false);
  };
  const submitForm = () => {
    if (!draft.name.trim()) {
      toast(t('addSubtaskForm.taskNameRequired'), 'bad');
      return;
    }
    if (!draft.remark.trim()) {
      setRemarkErr(true);
      toast(t('addSubtaskForm.remarkRequired'), 'bad');
      return;
    }
    const pct = Number(draft.weight) || 0;
    if (editingId) {
      setResTasks((current) => current.map((row) => (row.id === editingId
        ? {
            ...row, assignee: draft.assignee, cat: draft.projectCategory || draft.relatedProject,
            due: draft.dueDate || row.due, pct, status: draft.status, title: draft.name,
          }
        : row)));
    } else {
      setResTasks((current) => [
        ...current,
        {
          assignee: draft.assignee, cat: draft.projectCategory || draft.relatedProject, dept: taskDepartment,
          due: draft.dueDate, id: `RES-NEW-${String(Date.now())}`, pct, slaOk: true,
          status: draft.status, sub: '', title: draft.name,
        },
      ]);
    }
    closeForm();
  };

  const removeRow = (id: string) => {
    setResTasks((current) => current.filter((row) => row.id !== id));
  };

  const save = () => {
    if (totalWeight > 100) {
      setWeightErr(true);
      toast(t('subtasksDialog.weightExceeds', { total: totalWeight }), 'bad');
      return;
    }
    setWeightErr(false);
    onOpenChange(false);
    toast(t('subtasksDialog.updated'));
  };
  const saveDraft = () => {
    onOpenChange(false);
    toast(t('subtasksDialog.savedAsDraft'));
  };

  const otherTasks = tasks.filter((task) =>
    `${task.id} ${task.subject}`.toLowerCase().includes(ctmQuery.toLowerCase()));
  const selectCopyMoveTarget = (targetSubject: string) => {
    toast(t(copyMoveMode === 'move' ? 'copyMoveDialog.movedTo' : 'copyMoveDialog.copiedTo', { task: targetSubject }));
    setCopyMoveMode(null);
    setCtmQuery('');
  };

  const deletingRow = resTasks.find((row) => row.id === confirmDeleteId);

  return (
    <DialogRoot onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[92vh] w-[min(880px,calc(100%-32px))]">
        <DialogHeader>
          <DialogTitle className="text-md font-semibold">{t('subtasksDialog.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm-plus text-fg-2">
              {t('subtasksDialog.tasksCompletedSummary', { completed: completedCount, total: resTasks.length })}
              {'  ·  '}
              {t('subtasksDialog.totalFixed')}
            </span>
            <div className="flex items-center gap-2">
              <span className={labelClass}>{t('subtasksDialog.viewByLabel')}</span>
              <div className="inline-flex gap-0.5 rounded-lg border border-line bg-inset p-0.5">
                {(['Dept', 'Assignee'] as const).map((option) => (
                  <button
                    aria-pressed={viewBy === option}
                    className="rounded-md px-2.5 py-1.5 text-xs-plus font-medium text-fg-2 aria-pressed:bg-surface aria-pressed:font-semibold aria-pressed:text-accent"
                    key={option}
                    onClick={() => { setViewBy(option); }}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
            <label className="flex items-center gap-2 text-sm-plus font-semibold">
              <input
                checked={resTasks.length > 0 && selected.length === resTasks.length}
                onChange={toggleSelectAll}
                type="checkbox"
              />
              {selected.length === resTasks.length && resTasks.length > 0 ? t('subtasksDialog.deselectAll') : t('subtasksDialog.selectAll')}
            </label>
            {selected.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs-plus font-semibold" onClick={() => { markSelectedStatus('done'); }} type="button">
                  <Check aria-hidden size={13} />
                  {t('subtasksDialog.markCompleted')}
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs-plus font-semibold" onClick={() => { markSelectedStatus('progress'); }} type="button">
                  <Zap aria-hidden size={13} />
                  {t('subtasksDialog.markInProgress')}
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-bad px-2.5 py-1.5 text-xs-plus font-semibold text-white" onClick={deleteSelected} type="button">
                  <Trash2 aria-hidden size={13} />
                  {t('subtasksDialog.deleteSelected')}
                </button>
              </div>
            ) : null}
            <div className="ms-auto flex gap-2">
              <button className="rounded-lg border border-line-strong px-2.5 py-1.5 text-xs-plus font-semibold" onClick={() => { setCopyMoveMode('move'); }} type="button">
                {t('subtasksDialog.move')}
              </button>
              <button className="rounded-lg border border-line-strong px-2.5 py-1.5 text-xs-plus font-semibold" onClick={() => { setCopyMoveMode('copy'); }} type="button">
                {t('subtasksDialog.copy')}
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs-plus font-semibold text-accent-ink" onClick={openAddForm} type="button">
                <Plus aria-hidden size={13} />
                {t('subtasksDialog.addSubtask')}
              </button>
            </div>
          </div>

          {groups.map((group) => (
            <div className="overflow-hidden rounded-lg border border-line" key={group.key}>
              <div className="flex items-center justify-between gap-2 border-b border-line bg-accent-dim px-3.5 py-2.5 text-sm-plus font-semibold">
                <span>{group.label}</span>
                <span className="num text-xs-plus">{t('subtasksDialog.totalFixed')}</span>
              </div>
              {group.rows.map((row) => (
                <div className="flex flex-col gap-1.5 border-t border-line p-3.5 first:border-t-0" key={row.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex min-w-0 flex-1 items-center gap-2">
                      <input checked={selected.includes(row.id)} onChange={() => { toggleSelectOne(row.id); }} type="checkbox" />
                      <span className="truncate text-sm-plus font-semibold">{row.title}</span>
                    </label>
                    <span className="num rounded-md bg-accent-dim px-2 py-0.5 text-xs-plus font-semibold text-accent">{`${String(row.pct)}%`}</span>
                    <button aria-label={t('subtasksDialog.editIcon')} className="p-1.5 text-fg-3" onClick={() => { openEditForm(row); }} type="button"><Pencil aria-hidden size={13} /></button>
                    <button aria-label={t('subtasksDialog.deleteIcon')} className="p-1.5 text-bad" onClick={() => { setConfirmDeleteId(row.id); }} type="button"><Trash2 aria-hidden size={13} /></button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs-plus">
                    <span className="inline-flex items-center gap-1 font-semibold text-accent uppercase"><Tag aria-hidden size={11} />{row.cat}</span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-line bg-raised px-2 py-0.5 text-fg-2">
                      {row.dept}<ChevronRight aria-hidden className="text-fg-4" size={11} /><span className="font-medium text-accent">{row.sub}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs-plus text-fg-3">{t('subtasks.due')}{': '}{row.due}</span>
                    <span className="flex items-center gap-1.5">
                      <Chip tone={STATUS_TONE[row.status]}>{t(`subtasks.status.${row.status}`)}</Chip>
                      <Chip tone={row.slaOk ? 'ok' : 'warn'}>{row.slaOk ? t('subtasks.withinSla') : t('subtasks.atRisk')}</Chip>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {showAddForm ? (
            <div className="flex flex-col gap-3.5 rounded-xl border border-line bg-raised p-4.5" data-testid="add-subtask-form">
              <p className="m-0 text-sm-plus font-bold">{editingId ? t('addSubtaskForm.editTitle') : t('addSubtaskForm.addTitle')}</p>
              <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
                <EditorField label={t('addSubtaskForm.taskName')}>
                  <input className={inputClass} onChange={(event) => { setDraft((current) => ({ ...current, name: event.target.value })); }} placeholder={t('addSubtaskForm.taskNamePlaceholder')} value={draft.name} />
                </EditorField>
                <EditorField label={t('addSubtaskForm.weight')}>
                  <select className={inputClass} onChange={(event) => { setDraft((current) => ({ ...current, weight: event.target.value })); }} value={draft.weight}>
                    {WEIGHT_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </EditorField>
                <EditorField label={t('addSubtaskForm.assignee')}>
                  <select className={inputClass} onChange={(event) => { setDraft((current) => ({ ...current, assignee: event.target.value })); }} value={draft.assignee}>
                    <option value="">{t('edit.chooseAssignee')}</option>
                    {TASK_VIEW_TEAM.map((name) => <option key={name}>{name}</option>)}
                  </select>
                </EditorField>
                <EditorField label={t('addSubtaskForm.status')}>
                  <select className={inputClass} onChange={(event) => { setDraft((current) => ({ ...current, status: event.target.value as SubtaskStatus })); }} value={draft.status}>
                    {STATUS_KEYS.map((key) => <option key={key} value={key}>{t(`subtasks.status.${key}`)}</option>)}
                  </select>
                </EditorField>
              </div>
              <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
                <EditorField label={t('addSubtaskForm.relatedProject')}>
                  <select className={inputClass} onChange={(event) => { setDraft((current) => ({ ...current, relatedProject: event.target.value })); }} value={draft.relatedProject}>
                    <option value="" />
                    {[...new Set(resTasks.map((row) => row.cat))].map((category) => <option key={category}>{category}</option>)}
                  </select>
                </EditorField>
                <EditorField label={t('addSubtaskForm.projectCategory')}>
                  <input className={inputClass} onChange={(event) => { setDraft((current) => ({ ...current, projectCategory: event.target.value })); }} placeholder={t('addSubtaskForm.projectCategoryPlaceholder')} value={draft.projectCategory} />
                </EditorField>
                <EditorField label={t('addSubtaskForm.dueDate')}>
                  <input className={inputClass} onChange={(event) => { setDraft((current) => ({ ...current, dueDate: event.target.value })); }} type="date" value={draft.dueDate} />
                </EditorField>
              </div>
              <EditorField label={t('addSubtaskForm.remark')} required>
                <textarea
                  className={`${inputClass} resize-y ${remarkErr && !draft.remark.trim() ? 'border-bad' : ''}`}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, remark: event.target.value }));
                    if (event.target.value.trim()) setRemarkErr(false);
                  }}
                  placeholder={t('addSubtaskForm.remarkPlaceholder')}
                  rows={3}
                  value={draft.remark}
                />
                {remarkErr && !draft.remark.trim() ? <span className="text-xs-plus text-bad">{t('addSubtaskForm.remarkRequired')}</span> : null}
              </EditorField>
              <div className="flex justify-end gap-2">
                <button className="rounded-lg px-3.5 py-2 text-sm font-semibold text-fg-2" onClick={closeForm} type="button">{t('addSubtaskForm.cancel')}</button>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink" onClick={submitForm} type="button">
                  <Check aria-hidden size={14} />
                  {editingId ? t('addSubtaskForm.saveChanges') : t('addSubtaskForm.addTask')}
                </button>
              </div>
            </div>
          ) : null}
        </DialogBody>
        <DialogFooter className="flex-wrap items-center justify-end gap-3">
          {weightErr && totalWeight > 100 ? (
            <div className="w-full rounded-lg bg-bad/15 px-3.5 py-2 text-sm-plus font-semibold text-bad" role="alert">
              {t('subtasksDialog.weightExceeds', { total: totalWeight })}
            </div>
          ) : null}
          <button className="rounded-lg px-3.5 py-2 text-sm font-semibold text-fg-2" onClick={() => { onOpenChange(false); }} type="button">
            {t('subtasksDialog.cancel')}
          </button>
          <button className="rounded-lg border border-line-strong px-3.5 py-2 text-sm font-semibold text-fg-2" onClick={saveDraft} type="button">
            {t('subtasksDialog.saveAsDraft')}
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink" onClick={save} type="button">
            <Check aria-hidden size={14} />
            {t('subtasksDialog.saveAndUpdate')}
          </button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        cancelLabel={t('deleteSubtaskDialog.cancel')}
        closeLabel={t('common.close')}
        confirmLabel={t('deleteSubtaskDialog.confirm')}
        description={t('deleteSubtaskDialog.body', { title: deletingRow?.title ?? '' })}
        onConfirm={() => {
          if (confirmDeleteId) removeRow(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onOpenChange={(next) => { if (!next) setConfirmDeleteId(null); }}
        open={confirmDeleteId !== null}
        title={t('deleteSubtaskDialog.title')}
      />

      <DialogRoot onOpenChange={(next) => { if (!next) { setCopyMoveMode(null); setCtmQuery(''); } }} open={copyMoveMode !== null}>
        <DialogContent className="w-[min(480px,calc(100%-32px))]">
          <DialogHeader>
            <DialogTitle className="text-md font-semibold">{copyMoveMode === 'move' ? t('copyMoveDialog.titleMove') : t('copyMoveDialog.titleCopy')}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="m-0 text-sm-plus text-fg-2">{copyMoveMode === 'move' ? t('copyMoveDialog.bodyMove') : t('copyMoveDialog.bodyCopy')}</p>
            <input
              aria-label={t('copyMoveDialog.searchPlaceholder')}
              className={inputClass}
              onChange={(event) => { setCtmQuery(event.target.value); }}
              placeholder={t('copyMoveDialog.searchPlaceholder')}
              value={ctmQuery}
            />
            <div className="flex max-h-70 flex-col gap-2 overflow-y-auto">
              {otherTasks.map((candidate) => (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2" key={candidate.id}>
                  <div className="min-w-0"><p className="m-0 truncate text-sm-plus font-semibold">{candidate.subject}</p><p className="num m-0 text-xs-plus text-fg-3">{candidate.id}</p></div>
                  <button aria-label={t('copyMoveDialog.select')} className="p-1.5 text-accent" onClick={() => { selectCopyMoveTarget(candidate.subject); }} type="button">
                    <ArrowRight aria-hidden size={14} />
                  </button>
                </div>
              ))}
            </div>
          </DialogBody>
          <DialogFooter className="justify-end">
            <button className="rounded-lg px-3.5 py-2 text-sm font-semibold text-fg-2" onClick={() => { setCopyMoveMode(null); setCtmQuery(''); }} type="button">
              {t('copyMoveDialog.cancel')}
            </button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </DialogRoot>
  );
}
