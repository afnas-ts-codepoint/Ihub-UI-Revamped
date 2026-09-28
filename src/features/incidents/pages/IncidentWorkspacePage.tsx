import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CompensationDialog, FeedbackDialog, IncidentDetailDialog, type IncidentAction, RaiseTaskPendingDialog } from '../components/IncidentDialogs';
import { IncidentListing } from '../components/IncidentListing';
import { IncidentReportForm } from '../components/IncidentReportForm';
import { INCIDENT_ROWS } from '../data/incidents.mock';
import type { IncidentHistoryEntry, IncidentRuntimeRow } from '../types/incidents.types';

type WorkspaceTab = 'list' | 'report';

export function IncidentWorkspacePage() {
  const { t } = useTranslation('incidents');
  const [tab, setTab] = useState<WorkspaceTab>('report');
  const [rows, setRows] = useState<readonly IncidentRuntimeRow[]>(() => INCIDENT_ROWS.map((row) => ({ ...row, history: [], tracked: false })));
  const [detail, setDetail] = useState<IncidentRuntimeRow | null>(null);
  const [compensation, setCompensation] = useState<IncidentRuntimeRow | null>(null);
  const [feedback, setFeedback] = useState<IncidentRuntimeRow | null>(null);
  const [taskPending, setTaskPending] = useState<IncidentRuntimeRow | null>(null);
  const [flash, setFlash] = useState('');

  const currentRow = (row: IncidentRuntimeRow) => rows.find((candidate) => candidate.id === row.id) ?? row;
  const appendHistory = (row: IncidentRuntimeRow, entry: IncidentHistoryEntry) => {
    setRows((current) => current.map((candidate) => candidate.id === row.id ? { ...candidate, history: [...candidate.history, entry] } : candidate));
  };
  const show = (message: string) => { setFlash(message); };
  const act = (action: IncidentAction, source: IncidentRuntimeRow) => {
    const row = currentRow(source);
    if (action === 'track') {
      setRows((current) => current.map((candidate) => candidate.id === row.id ? { ...candidate, tracked: true, history: candidate.tracked ? candidate.history : [...candidate.history, { by: 'M. Faris', text: t('history.tracked'), tone: 'update', when: t('history.justNow') }] } : candidate));
      show(t('messages.tracked', { id: row.id }));
      setDetail((open) => open?.id === row.id ? { ...row, tracked: true, history: row.tracked ? row.history : [...row.history, { by: 'M. Faris', text: t('history.tracked'), tone: 'update', when: t('history.justNow') }] } : open);
      return;
    }
    if (action === 'compensate') { setCompensation(row); return; }
    if (action === 'feedback') { setFeedback(row); return; }
    if (action === 'task') { setTaskPending(row); return; }
    // PROTOTYPE-NOOP(D2): these actions only show transient local feedback.
    show(t(`messages.${action}`, { id: row.id }));
    setDetail(null);
  };
  const saveHistory = (row: IncidentRuntimeRow, text: string, message: string) => {
    appendHistory(row, { by: 'M. Faris', text, tone: 'update', when: t('history.justNow') });
    show(message);
    setDetail((open) => open?.id === row.id ? { ...open, history: [...open.history, { by: 'M. Faris', text, tone: 'update', when: t('history.justNow') }] } : open);
  };

  return (
    <section>
      <div className="mb-[18px] flex"><div className="inline-flex flex-wrap gap-0.5 rounded-[10px] border border-line bg-raised p-0.5">{(['report', 'list'] as const).map((item) => <button aria-current={tab === item ? 'page' : undefined} className={`rounded-md px-3 py-1.5 text-sm whitespace-nowrap ${tab === item ? 'bg-surface font-semibold text-accent shadow-sm' : 'font-medium text-fg-2'}`} key={item} onClick={() => { setTab(item); }} type="button">{t(`tabs.${item}`)}</button>)}</div></div>
      {tab === 'report' ? <IncidentReportForm /> : <IncidentListing flash={flash} onAction={act} onOpen={(row) => { setDetail(currentRow(row)); }} rows={rows} />}
      <IncidentDetailDialog onAction={act} onOpenChange={(open) => { if (!open) setDetail(null); }} row={detail} />
      <CompensationDialog onCancel={() => { setCompensation(null); }} onSave={(summary) => { if (!compensation) return; saveHistory(compensation, t('history.compensation', { summary }), t('messages.compensation', { id: compensation.id })); setCompensation(null); }} row={compensation} />
      <FeedbackDialog onCancel={() => { setFeedback(null); }} onSave={(value) => { if (!feedback) return; saveHistory(feedback, t('history.feedback', { value }), t('messages.feedback', { id: feedback.id })); setFeedback(null); }} row={feedback} />
      <RaiseTaskPendingDialog onCancel={() => { setTaskPending(null); }} row={taskPending} />
    </section>
  );
}
