import { describe, expect, it } from 'vitest';

import {
  DEFAULT_REPORT_LIBRARY_GROUP,
  DEFAULT_REPORT_LIBRARY_REPORT,
  REPORT_LIBRARY_CATALOGUE,
  reportsForLibraryGroup,
} from './reports-library';
import { REPORT_LIBRARY_GROUPS } from '../types/reports-library.types';

const expected = [
  ['attendance-summary', 'Attendance Summary', 'HR'],
  ['attendance-detail', 'Attendance Detailed', 'HR'],
  ['leave-balance', 'Leave Balance', 'HR'],
  ['overtime-summary', 'Overtime Summary', 'Workforce'],
  ['overtime-detail', 'Overtime Detailed', 'Workforce'],
  ['appraisal-summary', 'Appraisal Summary', 'Performance'],
  ['budget-vs-actual', 'Budget vs Actual', 'Finance'],
  ['budget-utilisation', 'Budget Utilisation', 'Finance'],
  ['revenue-projection', 'Revenue Projection', 'Finance'],
  ['pc-pending', 'Purchasing Pending', 'Finance'],
  ['petty-cash', 'Petty Cash Movement', 'Finance'],
  ['job-orders', 'Tasks', 'Operations'],
  ['violations', 'Violations Register', 'Operations'],
  ['incidents', 'Incident Log', 'Operations'],
  ['checklists', 'Checklist Compliance', 'Quality'],
  ['enquiries', 'Enquiries Register', 'Operations'],
  ['observations', 'Observations Register', 'Operations'],
  ['audit-trail', 'Audit Trail', 'System'],
] as const;

describe('Reports Library catalogue', () => {
  it('preserves the approved standalone 18-report catalogue exactly', () => {
    expect(REPORT_LIBRARY_CATALOGUE).toHaveLength(18);
    expect(
      REPORT_LIBRARY_CATALOGUE.map(({ id, label, group }) => [
        id,
        label,
        group,
      ]),
    ).toEqual(expected);
  });

  it('preserves group order, membership, and per-group report order', () => {
    expect(REPORT_LIBRARY_GROUPS).toEqual([
      'HR',
      'Workforce',
      'Performance',
      'Finance',
      'Operations',
      'Quality',
      'System',
    ]);
    expect(
      REPORT_LIBRARY_GROUPS.map((group) =>
        reportsForLibraryGroup(group).map((report) => report.id),
      ),
    ).toEqual([
      ['attendance-summary', 'attendance-detail', 'leave-balance'],
      ['overtime-summary', 'overtime-detail'],
      ['appraisal-summary'],
      [
        'budget-vs-actual',
        'budget-utilisation',
        'revenue-projection',
        'pc-pending',
        'petty-cash',
      ],
      ['job-orders', 'violations', 'incidents', 'enquiries', 'observations'],
      ['checklists'],
      ['audit-trail'],
    ]);
  });

  it('defaults to HR and Attendance Summary with no synthetic All group', () => {
    expect(DEFAULT_REPORT_LIBRARY_GROUP).toBe('HR');
    expect(DEFAULT_REPORT_LIBRARY_REPORT.id).toBe('attendance-summary');
    expect(REPORT_LIBRARY_GROUPS).not.toContain('All');
  });
});
