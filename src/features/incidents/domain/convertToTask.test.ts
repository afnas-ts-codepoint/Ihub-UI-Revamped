import { describe, expect, it } from 'vitest';

import { convertToTask, FIRST_TASK_SEQUENCE, incidentTaskPrefill } from './convertToTask';
import { INCIDENT_ROWS } from '../data/incidents.mock';
import type { IncidentHistoryEntry, IncidentRuntimeRow } from '../types/incidents.types';

const base = (index: number): IncidentRuntimeRow => ({ ...(INCIDENT_ROWS[index] as IncidentRuntimeRow), history: [], tracked: false });
const entry = (ref: string): IncidentHistoryEntry => ({ by: 'M. Faris', text: `raised ${ref}`, tone: 'update', when: 'just now' });
const labels = { actionTaken: 'Action already taken', followUp: 'Follow-up' };

describe('convertToTask', () => {
  it('starts the reference sequence at 318 with the TSK-2026 format', () => {
    expect(FIRST_TASK_SEQUENCE).toBe(318);
    expect(convertToTask(base(0), FIRST_TASK_SEQUENCE, entry).ref).toBe('TSK-2026-318');
    expect(convertToTask(base(0), 319, entry).ref).toBe('TSK-2026-319');
  });

  it('marks the row Converted to task with the info tone and links the reference', () => {
    const { created, row } = convertToTask(base(0), 318, entry);
    expect(created).toBe(true);
    expect(row).toMatchObject({ id: 'INC-2041', status: 'Converted to task', statusTone: 'info', taskRef: 'TSK-2026-318' });
  });

  it('appends one history entry after the existing ones and leaves other fields untouched', () => {
    const source: IncidentRuntimeRow = { ...base(0), history: [entry('earlier')], tracked: true };
    const { row } = convertToTask(source, 318, entry);
    expect(row.history).toEqual([entry('earlier'), entry('TSK-2026-318')]);
    expect(row.tracked).toBe(true);
    expect(row.title).toBe(source.title);
    expect(row.priority).toBe(source.priority);
    expect(source.history).toHaveLength(1);
  });

  it('is idempotent: an already converted incident returns its existing reference unchanged', () => {
    const converted = convertToTask(base(0), 318, entry).row;
    const again = convertToTask(converted, 319, entry);
    expect(again).toEqual({ created: false, ref: 'TSK-2026-318', row: converted });
    expect(again.row.history).toHaveLength(1);
  });
});

describe('incidentTaskPrefill', () => {
  it('maps INC-2041 to the follow-up subject, description with house action, and carried documents', () => {
    const row = base(0);
    const prefill = incidentTaskPrefill(row, labels);
    expect(prefill.subject).toBe('Follow-up: POS network outage — 360 Mall');
    expect(prefill.details).toBe(`${row.detail.description}\n\nAction already taken: ${row.detail.houseAction}`);
    expect(prefill).toMatchObject({
      area: 'Front of house',
      location: '360 Mall',
      priority: 'critical',
      scope: 'internal',
      severity: 'critical',
      subArea: row.detail.specificArea,
      zone: 'Zone B',
    });
    expect(prefill.carriedAttachments).toEqual(row.detail.documents);
  });

  it.each([
    ['Critical', 'critical'],
    ['High', 'high'],
    ['Med', 'medium'],
    ['Low', 'low'],
  ])('maps incident priority %s to %s', (priority, expected) => {
    expect(incidentTaskPrefill({ ...base(0), priority }, labels).priority).toBe(expected);
  });

  it('lowercases the incident risk into severity and falls back to medium when unrecognised', () => {
    expect(incidentTaskPrefill(base(3), labels).severity).toBe('medium');
    expect(incidentTaskPrefill(base(4), labels).severity).toBe('low');
    const odd = { ...base(0), detail: { ...base(0).detail, risk: '' } };
    expect(incidentTaskPrefill(odd, labels).severity).toBe('medium');
  });

  it('omits the action-taken block when the incident has no house action', () => {
    const row = base(0);
    const bare = { ...row, detail: { ...row.detail, houseAction: '' } };
    expect(incidentTaskPrefill(bare, labels).details).toBe(row.detail.description);
  });
});
