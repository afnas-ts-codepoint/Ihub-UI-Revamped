import { describe, expect, it } from 'vitest';

import { AUTO_ROUTING_CATEGORIES, WORKFLOW_DEPARTMENTS, WORKFLOW_TAB_IDS } from './workflows.mock';

describe('prototype workflow fixtures', () => {
  it('preserves the four tabs and department data shape', () => {
    expect(WORKFLOW_TAB_IDS).toEqual(['rules', 'flow', 'auto', 'sla']);
    expect(WORKFLOW_DEPARTMENTS.map((department) => department.id)).toEqual([
      'tx', 'ops', 'comm', 'fin', 'hr', 'qa',
    ]);
    expect(WORKFLOW_DEPARTMENTS.map((department) => department.rules.length)).toEqual([6, 4, 3, 3, 3, 2]);
    expect(WORKFLOW_DEPARTMENTS.map((department) => department.tasks.length)).toEqual([3, 2, 2, 2, 1, 1]);
  });

  it('preserves representative exact rows and all seven auto-routing categories', () => {
    expect(WORKFLOW_DEPARTMENTS[0]?.rules[0]).toEqual({
      type: 'Guest Complaint',
      label: 'Safety',
      condition: 'Any venue',
      route: 'Operations · Facilities',
      sla: '15m / 1h',
      active: true,
    });
    expect(WORKFLOW_DEPARTMENTS[0]?.rules.at(-1)?.active).toBe(false);
    expect(AUTO_ROUTING_CATEGORIES.map((category) => category.name.en)).toEqual([
      'Guest Complaint',
      'Guest Compliment',
      'Experience Feedback',
      'Event Request',
      'VIP Request',
      'Accessibility',
      'Lost & Found',
    ]);
  });
});
