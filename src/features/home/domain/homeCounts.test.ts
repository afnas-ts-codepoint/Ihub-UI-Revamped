import { describe, expect, it } from 'vitest';

import { homeBannerData } from '../data/home.mock';
import { deriveHomeCounts } from './homeCounts';

describe('deriveHomeCounts', () => {
  it('matches the prototype banner, pulse, and tab counts', () => {
    expect(deriveHomeCounts(homeBannerData)).toEqual({
      actions: 10,
      assigned: 16,
      breaches: 1,
      criticalIncidents: 1,
      incidents: 5,
      later: 1,
      newTasks: 3,
      onTrackPercent: 90,
      overdue: 1,
      soon: 5,
      today: 3,
      totalTasks: 6,
      urgent: 1,
    });
  });

  it('uses the prototype empty-queue on-track fallback', () => {
    expect(
      deriveHomeCounts({
        actions: [],
        assignedSheets: [],
        incidents: [],
        jobOrders: [],
        profile: homeBannerData.profile,
      }).onTrackPercent,
    ).toBe(100);
  });
});
