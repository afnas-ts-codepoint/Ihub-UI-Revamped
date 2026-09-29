import { describe, expect, it } from 'vitest';

import { computeScopeKey, isScopeTargetMissing, scopeTargetList } from './scopeKey';
import type { ScopeTargetState } from '../types/dashboardConfig.types';

const target: ScopeTargetState = {
  dept: [],
  role: 'Duty Manager',
  user: [],
};

describe('computeScopeKey', () => {
  it('resolves personal mode to "me" regardless of scope', () => {
    expect(computeScopeKey('user', 'default', target)).toBe('me');
    expect(computeScopeKey('user', 'role', target)).toBe('me');
  });

  it('resolves the default scope to the fixed key', () => {
    expect(computeScopeKey('admin', 'default', target)).toBe('default');
  });

  it('resolves the role scope by the selected role', () => {
    expect(computeScopeKey('admin', 'role', target)).toBe('role:Duty Manager');
  });

  it('sorts multi-select targets so pick order does not change the key', () => {
    const deptTargetA = { ...target, dept: ['Finance', 'Operations'] };
    const deptTargetB = { ...target, dept: ['Operations', 'Finance'] };
    expect(computeScopeKey('admin', 'dept', deptTargetA)).toBe(
      computeScopeKey('admin', 'dept', deptTargetB),
    );
    expect(computeScopeKey('admin', 'dept', deptTargetA)).toBe(
      'dept:Finance|Operations',
    );
  });
});

describe('isScopeTargetMissing', () => {
  it('is never missing for the default scope', () => {
    expect(isScopeTargetMissing('default', { ...target, dept: [] })).toBe(false);
  });

  it('is never missing for the role scope (always a selection)', () => {
    expect(isScopeTargetMissing('role', target)).toBe(false);
  });

  it('blocks department/user scopes with nothing selected', () => {
    expect(isScopeTargetMissing('dept', { ...target, dept: [] })).toBe(true);
    expect(isScopeTargetMissing('user', { ...target, user: [] })).toBe(true);
  });

  it('is not missing once at least one target is selected', () => {
    expect(isScopeTargetMissing('dept', { ...target, dept: ['Finance'] })).toBe(
      false,
    );
  });
});

describe('scopeTargetList', () => {
  it('wraps the single-select role into a list', () => {
    expect(scopeTargetList('role', target)).toEqual(['Duty Manager']);
  });

  it('returns an empty list for the default scope', () => {
    expect(scopeTargetList('default', target)).toEqual([]);
  });
});
