import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  DEFAULT_TASK_DASHBOARD_CONFIG,
  effectiveTaskDashboardConfig,
  taskDashboardConfigStorageKey,
  useTaskDashboardConfigStore,
} from './taskDashboardConfig.store';

beforeEach(() => {
  localStorage.clear();
  useTaskDashboardConfigStore.getState().reset();
});

afterEach(() => {
  localStorage.clear();
  useTaskDashboardConfigStore.getState().reset();
});

describe('M8.2 task dashboard config store', () => {
  it('starts with all eleven widgets in prototype order and two columns', () => {
    expect(useTaskDashboardConfigStore.getState().organizationConfig).toEqual(DEFAULT_TASK_DASHBOARD_CONFIG);
    expect(DEFAULT_TASK_DASHBOARD_CONFIG.ids).toHaveLength(11);
  });

  it('persists organization and personal configs under the v2 taskdash key', () => {
    useTaskDashboardConfigStore.getState().setOrganizationConfig({
      ...DEFAULT_TASK_DASHBOARD_CONFIG,
      cols: 4,
      ids: ['metrics', 'slaPerf', 'workload'],
    });
    useTaskDashboardConfigStore.getState().setPersonalConfig({
      ...DEFAULT_TASK_DASHBOARD_CONFIG,
      cols: 1,
      ids: ['workload'],
    });
    expect(localStorage.getItem(taskDashboardConfigStorageKey)).toContain('workload');
    expect(localStorage.getItem(taskDashboardConfigStorageKey)).toContain('organizationConfig');
  });

  it('reapplies admin visibility, ordering, and mandatory-widget rules', () => {
    const organization = {
      ...DEFAULT_TASK_DASHBOARD_CONFIG,
      dnd: false,
      hide: false,
      ids: ['metrics', 'slaPerf', 'source', 'workload'],
      lock: true,
    } as const;
    const personal = {
      ...DEFAULT_TASK_DASHBOARD_CONFIG,
      cols: 3,
      ids: ['workload', 'unknown', 'source'],
    } as never;
    expect(effectiveTaskDashboardConfig(organization, personal)).toEqual({
      ...organization,
      cols: 3,
      ids: ['metrics', 'slaPerf', 'source', 'workload'],
    });
  });

  it('supports an intentionally empty dashboard when hiding is allowed', () => {
    expect(effectiveTaskDashboardConfig(DEFAULT_TASK_DASHBOARD_CONFIG, {
      ...DEFAULT_TASK_DASHBOARD_CONFIG,
      ids: [],
    }).ids).toEqual([]);
  });
});
