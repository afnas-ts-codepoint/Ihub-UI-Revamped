import type {
  QueueAction,
  QueueIncident,
  QueueJobOrder,
  SlaState,
} from '../types/queue.types';
import {
  slaLabelOf,
  slaOf,
  slaTip,
  type SlaLabels,
} from './sla';

export type ClockQueueId = 'approvals' | 'incidents' | 'sheets' | 'tasks';

/** The queue a clock row belongs to, with the Home view its chip jumps to. */
export const CLOCK_QUEUES = [
  { id: 'approvals', labelKey: 'overview.clock.queues.approvals', view: 'approvals' },
  { id: 'sheets', labelKey: 'overview.clock.queues.sheets', view: 'approvals' },
  { id: 'tasks', labelKey: 'overview.clock.queues.tasks', view: 'assigned' },
  { id: 'incidents', labelKey: 'overview.clock.queues.incidents', view: 'incidents' },
] as const satisfies readonly Readonly<{
  id: ClockQueueId;
  labelKey: string;
  view: 'approvals' | 'assigned' | 'incidents';
}>[];

/** What opening a row does: the drawer for an action or incident, the task form for a job order. */
export type ClockSource =
  | Readonly<{ item: QueueAction; type: 'action' }>
  | Readonly<{ item: QueueIncident; type: 'incident' }>
  | Readonly<{ item: QueueJobOrder; type: 'jo' }>;

export type ClockRow = Readonly<{
  key: string;
  label: string;
  pct: number;
  queue: ClockQueueId;
  source: ClockSource;
  state: SlaState;
  tip: string;
  title: string;
  who: string;
}>;

/** Incident clock figure: the label with its "SLA" prefix and state phrase dropped. */
const incidentClockLabel = (slaLabel: string) =>
  slaLabel.replace(/^SLA\s*/i, '').replace(/^(breached|at risk)\s*·\s*/i, '');

const INCIDENT_PCT: Readonly<Record<SlaState, number>> = {
  'at-risk': 0.86,
  breached: 1.12,
  ok: 0.45,
};

/**
 * Every queue item as one row on the "On the clock" board. Actions and job
 * orders use the queue clock (`slaOf`); incidents carry their own state. This
 * is the live work-queue clock, separate from the monthly SLA compliance model
 * (D4).
 * @prototype index.html:L13242-L13244 `SLASection` rows
 */
export function buildClockRows(
  actions: readonly QueueAction[],
  jobOrders: readonly QueueJobOrder[],
  incidents: readonly QueueIncident[],
  labels: SlaLabels,
): ClockRow[] {
  const rows: ClockRow[] = [];
  for (const action of actions) {
    const sla = slaOf(action);
    rows.push({
      key: `A${action.id}`,
      label: slaLabelOf(action, labels),
      pct: sla.pct,
      queue: action.kind === 'action-sheet' ? 'sheets' : 'approvals',
      source: { item: action, type: 'action' },
      state: sla.state,
      tip: slaTip(action, labels),
      title: action.title,
      who: action.owner,
    });
  }
  for (const jobOrder of jobOrders) {
    const sla = slaOf(jobOrder);
    rows.push({
      key: `J${jobOrder.id}`,
      label: slaLabelOf(jobOrder, labels),
      pct: sla.pct,
      queue: 'tasks',
      source: { item: jobOrder, type: 'jo' },
      state: sla.state,
      tip: slaTip(jobOrder, labels),
      title: jobOrder.title,
      who: jobOrder.dept,
    });
  }
  for (const incident of incidents) {
    rows.push({
      key: `I${incident.id}`,
      label: incidentClockLabel(incident.slaLabel),
      pct: INCIDENT_PCT[incident.sla],
      queue: 'incidents',
      source: { item: incident, type: 'incident' },
      state: incident.sla,
      tip: incident.slaLabel,
      title: incident.title,
      who: incident.owner || incident.location,
    });
  }
  return rows;
}

export type ClockSummary = Readonly<{
  attention: readonly ClockRow[];
  breached: number;
  ok: number;
  onTime: readonly ClockRow[];
  risk: number;
}>;

/**
 * Counts and the two ordered lists. "Needs attention" puts breached rows
 * first, then the most elapsed; "On time" is most elapsed first.
 * @prototype index.html:L13245-L13248
 */
export function summariseClock(rows: readonly ClockRow[]): ClockSummary {
  const count = (state: SlaState) =>
    rows.filter((row) => row.state === state).length;
  const attention = rows
    .filter((row) => row.state !== 'ok')
    .sort(
      (a, b) =>
        Number(b.state === 'breached') - Number(a.state === 'breached') ||
        b.pct - a.pct,
    );
  const onTime = rows
    .filter((row) => row.state === 'ok')
    .sort((a, b) => b.pct - a.pct);
  return {
    attention,
    breached: count('breached'),
    ok: count('ok'),
    onTime,
    risk: count('at-risk'),
  };
}
