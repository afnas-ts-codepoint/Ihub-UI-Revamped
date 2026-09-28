import { describe, expect, it } from 'vitest';

import { INCIDENT_ROWS } from '../data/incidents.mock';
import { filterIncidents, incidentHistorySeed } from './incidentFilter';
import { createEmptyRecordFilter } from '@/features/organization';

const rows = INCIDENT_ROWS.map((row) => ({ ...row, history: [], tracked: false }));

describe('incident domain', () => {
  it('preserves the five literal fixtures and deterministic history', () => {
    expect(rows.map((row) => row.id)).toEqual(['INC-2041', 'INC-2039', 'INC-2036', 'INC-2031', 'INC-2028']);
    expect(incidentHistorySeed('INC-2041')).toHaveLength(4);
    expect(incidentHistorySeed('INC-2041')).toEqual(incidentHistorySeed('INC-2041'));
  });

  it.each([
    ['number', { num: '2039' }, ['INC-2039']],
    ['subject', { num: 'chiller' }, ['INC-2031']],
    ['location', { locations: ['Al Kout'] }, ['INC-2036']],
    ['zone', { zones: ['Zone B'] }, ['INC-2041', 'INC-2031']],
    ['department', { dept: 'Facilities' }, ['INC-2036', 'INC-2031']],
    ['category', { cat: 'Security' }, ['INC-2028']],
    ['subcategory', { sub: 'Mechanical failure' }, ['INC-2036', 'INC-2031']],
    ['risk', { risk: 'Critical' }, ['INC-2041']],
    ['status', { status: 'Closed' }, ['INC-2028']],
  ])('filters by %s', (_name, patch, expected) => {
    expect(filterIncidents(rows, { ...createEmptyRecordFilter(), ...patch }).map((row) => row.id)).toEqual(expected);
  });

  it('ignores generic incident-filter fields without prototype predicates', () => {
    const filter = { ...createEmptyRecordFilter(), activity: 'Jump', assignees: ['M. Faris'], flags: ['overdue'], origin: 'Operations', priority: 'High' };
    expect(filterIncidents(rows, filter)).toHaveLength(5);
  });
});
