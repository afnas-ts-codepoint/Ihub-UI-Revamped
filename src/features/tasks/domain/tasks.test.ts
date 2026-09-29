import { describe, expect, it } from 'vitest';

import { TASKS } from '../data/tasks.mock';
import {
  filterBoardTasks,
  filterListTasks,
  initialChecklistCount,
  progressFromChecklist,
  taskBoardColumn,
} from './tasks';
import { createEmptyRecordFilter } from '@/features/organization';

const rows = TASKS.map((task) => {
  const checklistCount = initialChecklistCount(task);
  return {
    ...task,
    checklistCount,
    progress: progressFromChecklist(checklistCount),
  };
});

describe('adopted M8.1 task behavior', () => {
  it('assigns the exact initial board placement and checklist progress', () => {
    expect(TASKS.map((task) => task.id)).toEqual([
      'T-001',
      'T-002',
      'T-003',
      'T-004',
      'T-005',
      'T-006',
      'T-007',
      'T-008',
      'T-009',
      'T-010',
    ]);
    expect(
      rows.reduce<Record<string, string[]>>((result, task) => {
        const column = taskBoardColumn(task);
        return { ...result, [column]: [...(result[column] ?? []), task.id] };
      }, {}),
    ).toEqual({
      completed: ['T-006', 'T-010'],
      critical: ['T-001', 'T-004'],
      new: ['T-002', 'T-007'],
      progress: ['T-003', 'T-005', 'T-008', 'T-009'],
    });
    expect(rows.map((task) => task.progress)).toEqual([
      33, 0, 67, 33, 67, 100, 0, 67, 67, 100,
    ]);
  });

  it('keeps the List search ID-only while Board searches ID and subject', () => {
    const filter = { ...createEmptyRecordFilter(), num: 'HVAC' };
    expect(filterListTasks(rows, filter)).toHaveLength(0);
    expect(filterBoardTasks(rows, filter).map((task) => task.id)).toEqual([
      'T-001',
    ]);
  });

  it('applies only the adopted List predicates', () => {
    expect(
      filterListTasks(rows, {
        ...createEmptyRecordFilter(),
        dept: 'Maintenance',
        priority: 'Critical',
        risk: 'Critical',
        status: 'Open',
      }).map((task) => task.id),
    ).toEqual(['T-001']);
    expect(
      filterListTasks(rows, {
        ...createEmptyRecordFilter(),
        locations: ['360 Mall'],
      }).map((task) => task.id),
    ).toEqual(['T-001']);
    expect(
      filterListTasks(rows, {
        ...createEmptyRecordFilter(),
        zones: ['MAKE zone'],
      }).map((task) => task.id),
    ).toEqual(['T-003']);
  });

  it('applies only the adopted Board predicates', () => {
    expect(
      filterBoardTasks(rows, {
        ...createEmptyRecordFilter(),
        dept: 'Operations',
        priority: 'High',
        risk: 'Medium',
        status: 'Review',
      }).map((task) => task.id),
    ).toEqual(['T-005']);
    expect(
      filterBoardTasks(rows, {
        ...createEmptyRecordFilter(),
        locations: ['Food Court'],
      }).map((task) => task.id),
    ).toEqual(['T-005']);
    expect(
      filterBoardTasks(rows, {
        ...createEmptyRecordFilter(),
        zones: ['does not exist'],
      }),
    ).toHaveLength(10);
  });

  it('leaves unsupported generic filters ineffective in both views', () => {
    const unsupported = {
      ...createEmptyRecordFilter(),
      activity: 'Retail',
      assignees: ['Unassigned'],
      cat: 'QA / Compliance Check',
      flags: ['overdue'],
      from: '2026-01-01',
      matrix: ['Finance'],
      origin: 'HR',
      sub: 'Control Room',
      to: '2026-12-31',
    };
    expect(filterListTasks(rows, unsupported)).toHaveLength(10);
    expect(filterBoardTasks(rows, unsupported)).toHaveLength(10);
  });
});
