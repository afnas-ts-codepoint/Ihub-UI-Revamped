import { describe, expect, it } from 'vitest';

import {
  dashboardConfigFilename,
  exportDashboardConfig,
  importDashboardConfig,
} from './dashboardConfigFile';
import type { DashboardConfig } from '../types/dashboardConfig.types';

const availableIds = ['metrics', 'slaPerf', 'compliance', 'source', 'dependency'];

const validConfig: DashboardConfig = {
  cols: 2,
  dnd: true,
  hide: true,
  ids: ['metrics', 'slaPerf'],
  lock: false,
};

describe('exportDashboardConfig / dashboardConfigFilename', () => {
  it('produces { scope, config } JSON', () => {
    const json = exportDashboardConfig('default', validConfig);
    expect(JSON.parse(json)).toEqual({ config: validConfig, scope: 'default' });
  });

  it('builds a sensible filename', () => {
    expect(dashboardConfigFilename('tasks', 'dept:Finance|Operations')).toBe(
      'tasks-dashboard-dept-finance-operations.json',
    );
  });
});

describe('importDashboardConfig — golden cases', () => {
  it('golden: a valid { config } wrapper imports correctly', () => {
    const raw = JSON.stringify({ config: validConfig, scope: 'default' });
    const result = importDashboardConfig(raw, availableIds);
    expect(result).toEqual({
      ok: true,
      patch: { cols: 2, dnd: true, hide: true, ids: ['metrics', 'slaPerf'], lock: false },
    });
  });

  it('golden: a bare config object (no { config } wrapper) also imports', () => {
    const raw = JSON.stringify(validConfig);
    const result = importDashboardConfig(raw, availableIds);
    expect(result.ok).toBe(true);
  });

  it('golden: invalid JSON is rejected and changes nothing', () => {
    expect(importDashboardConfig('not json at all', availableIds)).toEqual({
      ok: false,
    });
  });

  it('golden: valid JSON missing an `ids` array is rejected', () => {
    expect(
      importDashboardConfig(JSON.stringify({ config: { cols: 2 } }), availableIds),
    ).toEqual({ ok: false });
    expect(
      importDashboardConfig(JSON.stringify({ ids: 'not-an-array' }), availableIds),
    ).toEqual({ ok: false });
  });

  it('golden: a config with more than max ids is silently truncated, not rejected', () => {
    const twentyIds = Array.from({ length: 20 }, (_, index) => `metrics${String(index)}`);
    // Make the first 15 resolvable against `availableIds` by reusing real ids
    // for the first few and keeping the rest as distinct unknown ids so we
    // can also prove truncation happens on the *matched* set.
    const raw = JSON.stringify({ ids: availableIds.concat(twentyIds) });
    const result = importDashboardConfig(raw, availableIds, 3);
    expect(result).toEqual({ ok: true, patch: { ids: availableIds.slice(0, 3) } });
  });

  it('golden: unknown widget ids are silently dropped, not flagged as an error', () => {
    const raw = JSON.stringify({ ids: ['metrics', 'totallyUnknownWidget', 'source'] });
    const result = importDashboardConfig(raw, availableIds);
    expect(result).toEqual({ ok: true, patch: { ids: ['metrics', 'source'] } });
  });

  it('does not validate cols/dnd/hide/lock at all — absurd values pass through as-is', () => {
    const raw = JSON.stringify({
      cols: 999,
      dnd: 'yes',
      hide: null,
      ids: ['metrics'],
      lock: 42,
    });
    const result = importDashboardConfig(raw, availableIds);
    expect(result).toEqual({
      ok: true,
      patch: { cols: 999, dnd: 'yes', hide: null, ids: ['metrics'], lock: 42 },
    });
  });

  it('ignores non-string entries inside ids', () => {
    const raw = JSON.stringify({ ids: ['metrics', 42, null, 'source'] });
    const result = importDashboardConfig(raw, availableIds);
    expect(result).toEqual({ ok: true, patch: { ids: ['metrics', 'source'] } });
  });
});
