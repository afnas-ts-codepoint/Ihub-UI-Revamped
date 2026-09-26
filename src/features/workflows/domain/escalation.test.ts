import { describe, expect, it } from 'vitest';

import { escalationTarget } from './escalation';

describe('prototype workflow escalation rule', () => {
  it('progresses a normal step to the next step owner', () => {
    expect(escalationTarget(0, 5)).toEqual({
      kind: 'next-owner',
      stepNumber: 2,
    });
    expect(escalationTarget(3, 5)).toEqual({
      kind: 'next-owner',
      stepNumber: 5,
    });
  });

  it('uses Department Head for the final reachable step', () => {
    expect(escalationTarget(4, 5)).toEqual({ kind: 'department-head' });
    expect(escalationTarget(0, 1)).toEqual({ kind: 'department-head' });
  });
});
