import { describe, expect, it } from 'vitest';

import {
  assetCategoryFor,
  assetCodeFor,
  daysElapsedFor,
  dependencyReminderItems,
  formatMinutes,
  headerStats,
  ownerNameFor,
  projectFor,
  scheduleDatesFor,
  slaChipTextFor,
  stageIndex,
  startedTargetTimes,
  taskViewSeed,
} from './taskView';

describe('taskViewSeed', () => {
  it('is deterministic for the same id', () => {
    expect(taskViewSeed('T-001')).toBe(taskViewSeed('T-001'));
  });

  it('differs across ids', () => {
    expect(taskViewSeed('T-001')).not.toBe(taskViewSeed('T-002'));
  });
});

describe('stageIndex', () => {
  it('maps every stage to its 0-based track position', () => {
    expect(stageIndex('Open')).toBe(4);
    expect(stageIndex('Review')).toBe(6);
    expect(stageIndex('In progress')).toBe(5);
    expect(stageIndex('Done')).toBe(7);
  });
});

describe('formatMinutes', () => {
  it('renders hours and minutes', () => {
    expect(formatMinutes(125)).toBe('2h 5m');
    expect(formatMinutes(45)).toBe('0h 45m');
  });
});

describe('headerStats', () => {
  it('derives all four figures from the same seed, resolution feeding completion', () => {
    const stats = headerStats(42);
    expect(stats.responseMinutes).toBe(20 + (42 % 90));
    expect(stats.verificationMinutes).toBe(2 + (42 % 20));
    expect(stats.resolutionMinutes).toBe(40 + (42 % 160));
    expect(stats.completionMinutes).toBe(stats.resolutionMinutes + 60 + (42 % 240));
  });
});

describe('startedTargetTimes', () => {
  it('is deterministic for a given seed', () => {
    const a = startedTargetTimes(7);
    const b = startedTargetTimes(7);
    expect(a).toEqual(b);
    expect(a.startedTime).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('daysElapsedFor / ownerNameFor / assetCodeFor', () => {
  it('bounds days elapsed to the documented 30-309 range', () => {
    expect(daysElapsedFor(0)).toBe(30);
    expect(daysElapsedFor(279)).toBe(309);
  });

  it('picks a team member deterministically by seed', () => {
    const team = ['Tom Baker', 'Sarah Johnson', 'Mike Chen'];
    expect(ownerNameFor(0, team)).toBe('Tom Baker');
    expect(ownerNameFor(1, team)).toBe('Sarah Johnson');
  });

  it('formats a 4-digit asset code', () => {
    expect(assetCodeFor(5)).toMatch(/^AST-2026-\d{4}$/);
  });
});

describe('projectFor / assetCategoryFor', () => {
  it('maps known departments and falls back for unknown ones', () => {
    expect(projectFor('Maintenance')).toEqual(['Ride Safety Upgrade', 'Safety Systems']);
    expect(projectFor('Unknown')).toEqual(['General Operations', 'Operations']);
    expect(assetCategoryFor('Safety')).toBe('Safety Equipment');
    expect(assetCategoryFor('Unknown')).toBe('Facility Assets');
  });
});

describe('scheduleDatesFor', () => {
  it('defaults to the fixed reference dates when due is unparseable', () => {
    expect(scheduleDatesFor('')).toEqual({ start: '03 Sep 2026', target: '06 Sep 2026' });
  });

  it('derives start = target - 3 days when the target falls before the reference date', () => {
    expect(scheduleDatesFor('28 Feb')).toEqual({ start: '25 Feb 2026', target: '28 Feb 2026' });
  });
});

describe('slaChipTextFor', () => {
  it('reads Met only when the stage is Done', () => {
    expect(slaChipTextFor('Done')).toBe('Met');
    expect(slaChipTextFor('Open')).toBe('On Track');
    expect(slaChipTextFor('In progress')).toBe('On Track');
  });
});

describe('dependencyReminderItems', () => {
  const today = new Date(2026, 8, 23); // Wednesday

  it('includes a dependency due within the next 5 working days (due-soon)', () => {
    const items = dependencyReminderItems(
      [
        {
          blocking: true,
          category: 'Spare Parts',
          dueDate: new Date(2026, 8, 28), // Mon, 3 working days out
          id: 'DEP-1',
          status: 'Pending',
          type: 'Procurement',
        },
      ],
      today,
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.workdaysLeft).toBe(3);
  });

  it('includes an already-overdue dependency with a negative workdaysLeft', () => {
    const items = dependencyReminderItems(
      [
        {
          blocking: false,
          category: 'Approval',
          dueDate: new Date(2026, 8, 21), // Monday, before today
          id: 'DEP-2',
          status: 'Pending',
          type: 'Financial',
        },
      ],
      today,
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.workdaysLeft).toBeLessThan(0);
  });

  it('excludes resolved dependencies and dependencies beyond the reminder window', () => {
    const items = dependencyReminderItems(
      [
        {
          blocking: false,
          category: 'Vendor',
          dueDate: new Date(2026, 8, 24),
          id: 'DEP-3',
          status: 'Resolved',
          type: 'Contract',
        },
        {
          blocking: false,
          category: 'Technical',
          dueDate: new Date(2026, 9, 15), // well over 5 working days out
          id: 'DEP-4',
          status: 'Pending',
          type: 'Inspection',
        },
      ],
      today,
    );
    expect(items).toHaveLength(0);
  });

  it('sorts multiple due items soonest-first', () => {
    const items = dependencyReminderItems(
      [
        { blocking: false, category: 'A', dueDate: new Date(2026, 8, 29), id: 'DEP-LATER', status: 'Pending', type: '' },
        { blocking: false, category: 'B', dueDate: new Date(2026, 8, 24), id: 'DEP-SOONER', status: 'Pending', type: '' },
      ],
      today,
    );
    expect(items.map((item) => item.id)).toEqual(['DEP-SOONER', 'DEP-LATER']);
  });
});
