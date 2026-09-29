import { describe, expect, it } from 'vitest';

import { sanitizeUserConfig } from './sanitizeUserConfig';
import type { DashboardConfig } from '../types/dashboardConfig.types';

const org: DashboardConfig = {
  cols: 2,
  dnd: true,
  hide: true,
  ids: ['metrics', 'slaPerf', 'compliance', 'source'],
  lock: false,
};

describe('sanitizeUserConfig', () => {
  it('returns null when there is nothing to sanitize', () => {
    expect(sanitizeUserConfig(null, org, [])).toBeNull();
    expect(sanitizeUserConfig({ ids: 'not-an-array' } as never, org, [])).toBeNull();
  });

  it('filters ids down to the admin default ids — a removed widget is never selectable', () => {
    const result = sanitizeUserConfig(
      { ids: ['metrics', 'unknownWidget', 'source'] },
      org,
      [],
    );
    expect(result?.ids).toEqual(['metrics', 'source']);
  });

  it('force-appends missing admin ids when hiding is disallowed', () => {
    const noHide = { ...org, hide: false };
    const result = sanitizeUserConfig({ ids: ['metrics'] }, noHide, []);
    expect(result?.ids).toEqual(['metrics', 'slaPerf', 'compliance', 'source']);
  });

  it('forces the admin order back when reordering is disallowed', () => {
    const noDnd = { ...org, dnd: false };
    const result = sanitizeUserConfig(
      { ids: ['source', 'metrics'] },
      noDnd,
      [],
    );
    expect(result?.ids).toEqual(['metrics', 'source']);
  });

  it('ensures mandatory ids are present when locking is on', () => {
    const locked = { ...org, lock: true };
    const result = sanitizeUserConfig({ ids: ['source'] }, locked, [
      'metrics',
      'slaPerf',
    ]);
    expect(result?.ids).toEqual(['metrics', 'slaPerf', 'source']);
  });

  it('keeps the imported column count, falling back to the admin default when unset', () => {
    expect(sanitizeUserConfig({ cols: 3, ids: ['metrics'] }, org, [])?.cols).toBe(3);
    expect(sanitizeUserConfig({ ids: ['metrics'] }, org, [])?.cols).toBe(2);
  });

  it('applies hide, dnd and lock rules together in the documented order', () => {
    const strict = { ...org, dnd: false, hide: false, lock: true };
    const result = sanitizeUserConfig({ ids: ['source'] }, strict, ['metrics']);
    // locked ids are unshifted after the hide/dnd passes, ahead of the kept id.
    expect(result?.ids).toEqual(['metrics', 'slaPerf', 'compliance', 'source']);
  });
});
