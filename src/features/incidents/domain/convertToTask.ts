import type { IncidentHistoryEntry, IncidentRuntimeRow } from '../types/incidents.types';
import type { TaskFormPrefill } from '@/features/tasks';

/** @prototype ihub/index.html `taskSeq` initial value and `'TSK-2026-' + taskSeq` reference format. */
export const FIRST_TASK_SEQUENCE = 318;
export const CONVERTED_STATUS = 'Converted to task';

export type TaskConversion = Readonly<{
  /** False when the incident was already converted and the existing reference is returned. */
  created: boolean;
  ref: string;
  row: IncidentRuntimeRow;
}>;

/**
 * @prototype ihub/index.html `convertToTask` (L6596-6603). Marks the source incident row
 * and appends a history entry; it never reads the task form and never touches the task store.
 */
export function convertToTask(
  row: IncidentRuntimeRow,
  sequence: number,
  historyEntry: (ref: string) => IncidentHistoryEntry,
): TaskConversion {
  if (row.taskRef) return { created: false, ref: row.taskRef, row };
  const ref = `TSK-2026-${String(sequence)}`;
  return {
    created: true,
    ref,
    row: {
      ...row,
      history: [...row.history, historyEntry(ref)],
      status: CONVERTED_STATUS,
      statusTone: 'info',
      taskRef: ref,
    },
  };
}

type Priority = NonNullable<TaskFormPrefill['priority']>;

const PRIORITY_BY_INCIDENT: Readonly<Record<string, Priority>> = { Critical: 'critical', High: 'high', Med: 'medium' };
const SEVERITIES: readonly Priority[] = ['critical', 'high', 'low', 'medium'];

/** @prototype ihub/index.html `openTaskDraft` (L6706-6722), limited to the fields the canonical form can show. */
export function incidentTaskPrefill(
  row: IncidentRuntimeRow,
  labels: Readonly<{ actionTaken: string; followUp: string }>,
): TaskFormPrefill {
  const { detail } = row;
  const risk = detail.risk.toLowerCase();
  return {
    area: detail.area,
    carriedAttachments: detail.documents,
    details: detail.description + (detail.houseAction ? `\n\n${labels.actionTaken}: ${detail.houseAction}` : ''),
    location: detail.location || row.site,
    priority: PRIORITY_BY_INCIDENT[row.priority] ?? 'low',
    scope: 'internal',
    severity: SEVERITIES.find((value) => value === risk) ?? 'medium',
    subArea: detail.specificArea,
    subject: `${labels.followUp}: ${row.title}`,
    zone: detail.zone,
  };
}
