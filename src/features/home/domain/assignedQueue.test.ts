import { describe, expect, it } from 'vitest';

import { ACTIONS } from '../data/actions.mock';
import { JOB_ORDERS } from '../data/jobOrders.mock';
import {
  assignedCounts,
  assignedJobOrders,
  filterAssignedActions,
  filterTaskRows,
  jobOrderProgress,
  matchesQuery,
  type AssignedFilters,
} from './assignedQueue';
import { rankQueue } from './prioritization';

const ranked = rankQueue(ACTIONS);
const NONE: AssignedFilters = { priority: 'all', query: '', sub: 'all', type: 'all' };
const ids = (list: readonly { id: string }[]) => list.map((item) => item.id);

describe('assignedJobOrders', () => {
  it('lists every job order that is no longer New', () => {
    expect(ids(assignedJobOrders(JOB_ORDERS))).toEqual(['JO-7779', 'JO-7775', 'JO-7770']);
  });
});

describe('assignedCounts', () => {
  const counts = assignedCounts(ranked, JOB_ORDERS);

  it('counts the record types from the live queue and the assigned job orders', () => {
    expect(counts.type).toMatchObject({
      all: 10,
      budgets: 3,
      'pc-request': 2,
      'payment-settlement': 3,
      tasks: 1,
    });
  });

  it('sums sub-types into their type, and advance/additional never match a record', () => {
    expect(counts.sub).toEqual({
      'action-sheets': 2,
      'additional-budget': 0,
      'advance-payment': 0,
      'new-budget': 2,
      'petty-cash': 1,
      'transfer-funds': 1,
    });
  });

  it('keeps the prototype seed count for the five types without records', () => {
    expect(counts.type).toMatchObject({
      appraisal: 2,
      checklists: 4,
      'investigation-request': 1,
      observation: 3,
      'qa-submissions': 5,
    });
  });

  it('follows the queue as items leave it', () => {
    const next = assignedCounts(
      ranked.filter((action) => action.id !== 'A4'),
      JOB_ORDERS,
    );
    expect(next.type.all).toBe(9);
    expect(next.sub['petty-cash']).toBe(0);
    expect(next.type['payment-settlement']).toBe(2);
  });
});

describe('filterAssignedActions', () => {
  it('returns the whole ranked queue for All', () => {
    expect(ids(filterAssignedActions(ranked, NONE))).toEqual(ids(ranked));
  });

  it('narrows a record type with sub-types and then a sub-type', () => {
    expect(ids(filterAssignedActions(ranked, { ...NONE, type: 'payment-settlement' }))).toEqual(['A3', 'A4', 'A9']);
    expect(ids(filterAssignedActions(ranked, { ...NONE, sub: 'action-sheets', type: 'payment-settlement' }))).toEqual(['A3', 'A9']);
    expect(ids(filterAssignedActions(ranked, { ...NONE, type: 'budgets' }))).toEqual(['A1', 'A5', 'A10']);
  });

  it('lists a group type through its approval group', () => {
    expect(ids(filterAssignedActions(ranked, { ...NONE, type: 'pc-request' }))).toEqual(['A2', 'A7']);
  });

  it('opens an empty queue for the tasks type and the seed-only types', () => {
    for (const type of ['tasks', 'appraisal', 'qa-submissions', 'observation', 'checklists', 'investigation-request'] as const) {
      expect(filterAssignedActions(ranked, { ...NONE, type })).toEqual([]);
    }
  });

  it('filters by priority', () => {
    expect(ids(filterAssignedActions(ranked, { ...NONE, priority: 'critical' }))).toEqual(['A1']);
  });

  it('searches the reference code, title, owner, department and status', () => {
    expect(ids(filterAssignedActions(ranked, { ...NONE, query: 'needs sign-off' }))).toEqual(['A3', 'A9']);
    expect(ids(filterAssignedActions(ranked, { ...NONE, query: 'AS-2026' }))).toEqual(['A3', 'A9']);
    expect(ids(filterAssignedActions(ranked, { ...NONE, query: '  NEEDS SIGN-OFF  ' }))).toEqual(['A3', 'A9']);
    expect(filterAssignedActions(ranked, { ...NONE, query: 'zzzz' })).toEqual([]);
  });
});

describe('filterTaskRows', () => {
  it('lists the external assigned job orders', () => {
    expect(ids(filterTaskRows(JOB_ORDERS, NONE))).toEqual(['JO-7775']);
  });

  it('filters by priority and searches id, title, department and location', () => {
    expect(filterTaskRows(JOB_ORDERS, { ...NONE, priority: 'high' })).toEqual([]);
    expect(ids(filterTaskRows(JOB_ORDERS, { ...NONE, query: 'jo-7775' }))).toEqual(['JO-7775']);
    expect(ids(filterTaskRows(JOB_ORDERS, { ...NONE, query: 'marketing tech' }))).toEqual(['JO-7775']);
    expect(filterTaskRows(JOB_ORDERS, { ...NONE, query: 'escalator' })).toEqual([]);
  });
});

describe('matchesQuery', () => {
  it('matches everything for an empty or blank query and skips missing parts', () => {
    expect(matchesQuery('', ['a'])).toBe(true);
    expect(matchesQuery('   ', [undefined])).toBe(true);
    expect(matchesQuery('b', ['a', undefined, 'B'])).toBe(true);
    expect(matchesQuery('c', ['a', 'b'])).toBe(false);
  });
});

describe('jobOrderProgress', () => {
  it.each([
    ['Done', 100],
    ['Completed', 100],
    ['In progress', 67],
    ['Review', 67],
    ['Assigned', 33],
    ['Scheduled', 33],
    ['Accepted', 33],
    ['New', 0],
    ['', 0],
  ])('maps the status %j to %i%%', (status, percent) => {
    expect(jobOrderProgress(status)).toBe(percent);
  });
});
