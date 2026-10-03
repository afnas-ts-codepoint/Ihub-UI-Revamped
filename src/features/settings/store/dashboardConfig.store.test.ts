import { beforeEach, describe, expect, it } from 'vitest';

import {
  dashboardConfigStorageKey,
  useDashboardConfigStore,
} from './dashboardConfig.store';

beforeEach(() => {
  localStorage.clear();
  useDashboardConfigStore.setState({
    adminConfigsByDashboard: {},
    adminLibraryByDashboard: {},
    lastSelectedAdminDashboard: 'tasks',
    lastSelectedUserDashboard: 'tasks',
    personalConfigByDashboard: {},
    personalLibraryByDashboard: {},
  });
});

describe('dashboard configuration persistence', () => {
  it('keeps safe defaults when persisted JSON is malformed', async () => {
    localStorage.setItem(dashboardConfigStorageKey, '{not-json');

    await expect(
      useDashboardConfigStore.persist.rehydrate(),
    ).resolves.toBeUndefined();
    expect(useDashboardConfigStore.getState()).toMatchObject({
      adminConfigsByDashboard: {},
      adminLibraryByDashboard: {},
      lastSelectedAdminDashboard: 'tasks',
      lastSelectedUserDashboard: 'tasks',
      personalConfigByDashboard: {},
      personalLibraryByDashboard: {},
    });
  });
});
