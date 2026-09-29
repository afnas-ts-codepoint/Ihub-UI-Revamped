import { describe, expect, it } from 'vitest';

import { workloadColor, workloadGanttFor } from './taskDashboard';

describe('M8.2 task dashboard domain', () => {
  it('uses the exact five workload thresholds', () => {
    expect([10, 20, 30, 40, 41].map(workloadColor)).toEqual([
      '#4FA87E', '#D9A441', '#E07B39', '#D9534F', '#E0538A',
    ]);
  });

  it('generates stable inline Gantt fixtures from the expanded row label', () => {
    expect(workloadGanttFor('IT')).toEqual(workloadGanttFor('IT'));
    expect(workloadGanttFor('IT')).not.toEqual(workloadGanttFor('Finance'));
    expect(workloadGanttFor('IT').length).toBeGreaterThanOrEqual(3);
    expect(workloadGanttFor('IT').length).toBeLessThanOrEqual(5);
    for (const item of workloadGanttFor('IT')) {
      expect(item.start + item.span).toBeLessThanOrEqual(7);
    }
  });
});
