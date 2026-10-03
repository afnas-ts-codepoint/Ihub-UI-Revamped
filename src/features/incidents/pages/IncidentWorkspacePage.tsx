import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CompensationDialog, FeedbackDialog, IncidentDetailDialog, type IncidentAction } from '../components/IncidentDialogs';
import { IncidentListing } from '../components/IncidentListing';
import { IncidentReportForm } from '../components/IncidentReportForm';
import { INCIDENT_ROWS } from '../data/incidents.mock';
import { convertToTask, FIRST_TASK_SEQUENCE, incidentTaskPrefill } from '../domain/convertToTask';
import type { IncidentHistoryEntry, IncidentRuntimeRow } from '../types/incidents.types';
import { TaskFormDialog } from '@/features/tasks';
import { useTrackingStore } from '@/store/tracking.store';

type WorkspaceTab = 'list' | 'report';

export function IncidentWorkspacePage() {
  const { t } = useTranslation('incidents');
  const [tab, setTab] = useState<WorkspaceTab>('report');
  const [rows, setRows] = useState<readonly IncidentRuntimeRow[]>(() => INCIDENT_ROWS.map((row) => ({ ...row, history: [], tracked: false })));
  const [detail, setDetail] = useState<IncidentRuntimeRow | null>(null);
  const [compensation, setCompensation] = useState<IncidentRuntimeRow | null>(null);
  const [feedback, setFeedback] = useState<IncidentRuntimeRow | null>(null);
  const [taskDraft, setTaskDraft] = useState<IncidentRuntimeRow | null>(null);
  const [taskSequence, setTaskSequence] = useState(FIRST_TASK_SEQUENCE);
  const [flash, setFlash] = useState('');

  const currentRow = (row: IncidentRuntimeRow) => rows.find((candidate) => candidate.id === row.id) ?? row;
  const appendHistory = (row: IncidentRuntimeRow, entry: IncidentHistoryEntry) => {
    setRows((current) => current.map((candidate) => candidate.id === row.id ? { ...candidate, history: [...candidate.history, entry] } : candidate));
  };
  const show = (message: string) => { setFlash(message); };
  const act = (action: IncidentAction, source: IncidentRuntimeRow) => {
    const row = currentRow(source);
    if (action === 'track') {
      useTrackingStore.getState().track({ id: row.id, title: row.title });
      setRows((current) => current.map((candidate) => candidate.id === row.id ? { ...candidate, tracked: true, history: candidate.tracked ? candidate.history : [...candidate.history, { by: 'M. Faris', text: t('history.tracked'), tone: 'update', when: t('history.justNow') }] } : candidate));
      show(t('messages.tracked', { id: row.id }));
      setDetail((open) => open?.id === row.id ? { ...row, tracked: true, history: row.tracked ? row.history : [...row.history, { by: 'M. Faris', text: t('history.tracked'), tone: 'update', when: t('history.justNow') }] } : open);
      return;
    }
    if (action === 'compensate') { setCompensation(row); return; }
    if (action === 'feedback') { setFeedback(row); return; }
    if (action === 'task') { setTaskDraft(row); return; }
    // PROTOTYPE-NOOP(D2): these actions only show transient local feedback.
    show(t(`messages.${action}`, { id: row.id }));
    setDetail(null);
  };
  const saveHistory = (row: IncidentRuntimeRow, text: string, message: string) => {
    appendHistory(row, { by: 'M. Faris', text, tone: 'update', when: t('history.justNow') });
    show(message);
    setDetail((open) => open?.id === row.id ? { ...open, history: [...open.history, { by: 'M. Faris', text, tone: 'update', when: t('history.justNow') }] } : open);
  };

  const confirmTask = () => {
    if (!taskDraft) return;
    const { created, ref, row: converted } = convertToTask(currentRow(taskDraft), taskSequence, (taskRef) => ({ by: 'M. Faris', text: t('history.raisedAsTask', { ref: taskRef }), tone: 'update', when: t('history.justNow') }));
    if (created) {
      setTaskSequence((sequence) => sequence + 1);
      setRows((current) => current.map((candidate) => candidate.id === converted.id ? converted : candidate));
      // The open detail dialog keeps its snapshot status, as the prototype's `incOpen` does; only history and the task reference are live.
      setDetail((open) => open?.id === converted.id ? { ...open, history: converted.history, taskRef: converted.taskRef } : open);
    }
    setTaskDraft(null);
    show(t('messages.raisedAsTask', { id: taskDraft.id, ref }));
  };

  return (
    <section>
      <div className="mb-[18px] flex"><div className="inline-flex flex-wrap gap-0.5 rounded-[10px] border border-line bg-raised p-0.5">{(['report', 'list'] as const).map((item) => <button aria-current={tab === item ? 'page' : undefined} className={`rounded-md px-3 py-1.5 text-sm whitespace-nowrap ${tab === item ? 'bg-surface font-semibold text-accent shadow-sm' : 'font-medium text-fg-2'}`} key={item} onClick={() => { setTab(item); }} type="button">{t(`tabs.${item}`)}</button>)}</div></div>
      {tab === 'report' ? <IncidentReportForm /> : <IncidentListing flash={flash} onAction={act} onOpen={(row) => { setDetail(currentRow(row)); }} rows={rows} />}
      <IncidentDetailDialog onAction={act} onOpenChange={(open) => { if (!open) setDetail(null); }} row={detail} />
      <CompensationDialog onCancel={() => { setCompensation(null); }} onSave={(summary) => { if (!compensation) return; saveHistory(compensation, t('history.compensation', { summary }), t('messages.compensation', { id: compensation.id })); setCompensation(null); }} row={compensation} />
      <FeedbackDialog onCancel={() => { setFeedback(null); }} onSave={(value) => { if (!feedback) return; saveHistory(feedback, t('history.feedback', { value }), t('messages.feedback', { id: feedback.id })); setFeedback(null); }} row={feedback} />
      {taskDraft ? <TaskFormDialog key={taskDraft.id} mode="createFromIncident" onCancel={() => { setTaskDraft(null); }} onConfirm={confirmTask} prefill={incidentTaskPrefill(taskDraft, { actionTaken: t('task.actionTaken'), followUp: t('task.followUp') })} presentation="modal" sourceId={taskDraft.id} /> : null}
    </section>
  );
}
