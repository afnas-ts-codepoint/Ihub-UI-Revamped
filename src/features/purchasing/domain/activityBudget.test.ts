import { describe, expect, it } from 'vitest';

import {
  activityAvailable,
  activityBudget,
  activityCommitted,
  activityNames,
  subActivitiesFor,
  subActivityNames,
  subBudget,
} from './activityBudget';

describe('Purchasing activity budget helpers', () => {
  it('lists every active top-level activity name', () => {
    expect(activityNames()).toEqual([
      'Marketing & Campaigns',
      'Operations',
      'Facilities & Maintenance',
      'IT & Systems',
      'Safety & Compliance',
      'Capital & Fit-out',
      'Utilities',
    ]);
  });

  it('lists only the active sub-activities for a given activity', () => {
    expect(subActivitiesFor('Utilities')).toEqual(['Electricity & water']);
    expect(subActivitiesFor('Marketing & Campaigns')).toEqual(['Seasonal campaigns', 'Digital & social', 'School holiday programmes']);
  });

  it('returns an empty list for an unknown activity', () => {
    expect(subActivitiesFor('Not a real activity')).toEqual([]);
  });

  it('collects every unique active sub-activity name across activities', () => {
    const names = subActivityNames();
    expect(names).toContain('Seasonal campaigns');
    expect(names).not.toContain('Telecom');
  });

  it('derives activity budget, committed and available totals', () => {
    expect(activityBudget('Marketing & Campaigns')).toBe(30000);
    expect(activityCommitted('Marketing & Campaigns')).toBe(21400);
    expect(activityAvailable('Marketing & Campaigns')).toBe(8600);
  });

  it('returns zero for an unknown activity', () => {
    expect(activityBudget('Not a real activity')).toBe(0);
    expect(activityAvailable('Not a real activity')).toBe(0);
  });

  it('derives a sub-activity budget breakdown', () => {
    expect(subBudget('Marketing & Campaigns', 'Seasonal campaigns')).toEqual({ alloc: 14000, available: 2800, committed: 11200 });
  });

  it('returns a zeroed breakdown for an unknown activity or sub-activity', () => {
    expect(subBudget('Marketing & Campaigns', 'Not a real sub')).toEqual({ alloc: 0, available: 0, committed: 0 });
    expect(subBudget('Not a real activity', 'Seasonal campaigns')).toEqual({ alloc: 0, available: 0, committed: 0 });
  });
});
