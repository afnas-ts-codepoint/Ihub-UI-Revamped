import { afterEach, describe, expect, it } from 'vitest';

import { ACTIONS } from '../data/actions.mock';
import { INCIDENTS } from '../data/incidents.mock';
import { JOB_ORDERS } from '../data/jobOrders.mock';
import { opensFormPreview, useHomeQueueStore } from './homeQueue.store';

const store = () => useHomeQueueStore.getState();
const action = (id: string) => {
  const found = store().actions.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};
const incident = (id: string) => {
  const found = store().incidents.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};
const jobOrder = (id: string) => {
  const found = store().jobOrders.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};
const ids = (list: readonly { id: string }[]) => list.map((item) => item.id);

afterEach(() => {
  store().reset();
});

describe('seed and reset', () => {
  it('seeds the prototype fixtures and restores them on reset', () => {
    expect(store().actions).toHaveLength(10);
    expect(store().incidents).toHaveLength(5);
    expect(store().jobOrders).toHaveLength(6);
    store().actOnAction('reject', action('A1'));
    expect(store().actions).toHaveLength(9);
    store().reset();
    expect(store().actions).toEqual(ACTIONS);
    expect(store().incidents).toEqual(INCIDENTS);
    expect(store().jobOrders).toEqual(JOB_ORDERS);
    expect(store().rejectedFeed).toEqual([]);
  });
});

describe('terminal decisions', () => {
  it('approve removes the item, clears its selection, opens the track prompt and returns the toast', () => {
    store().toggleSelected('A2');
    store().toggleSelected('A3');
    const toast = store().actOnAction('approve', action('A2'));
    expect(toast).toEqual({ key: 'approved', values: { recommended: 'Approve PC' } });
    expect(ids(store().actions)).not.toContain('A2');
    expect(store().selected).toEqual(['A3']);
    expect(store().trackPrompt).toEqual({ id: 'A2', title: 'Purchase Approval (PC) — Cinema Projector Units ×2' });
    expect(store().rejectedFeed).toEqual([]);
  });

  it('reject removes the item, records it in the rejected feed and never prompts tracking', () => {
    const toast = store().actOnAction('reject', action('A4'));
    expect(toast).toEqual({ key: 'rejected' });
    expect(ids(store().actions)).not.toContain('A4');
    expect(store().rejectedFeed).toEqual([
      { id: 'A4', kind: 'petty-cash', owner: 'Rania Farouk', title: 'Petty Cash — Al Kout Venue Float Top-up' },
    ]);
    expect(store().trackPrompt).toBeNull();
  });

  it('rejecting the same id twice never duplicates the feed row', () => {
    const a4 = action('A4');
    store().actOnAction('reject', a4);
    store().actOnAction('reject', a4);
    expect(store().rejectedFeed).toHaveLength(1);
  });

  it('send back without a reason only opens the dialog', () => {
    const toast = store().actOnAction('sendback', action('A5'));
    expect(toast).toBeUndefined();
    expect(store().sendbackFor?.id).toBe('A5');
    expect(ids(store().actions)).toContain('A5');
  });

  it('send back with a reason removes the item, records a returned tracker row and skips the track prompt', () => {
    const toast = store().actOnAction('sendback', action('A5'), 'Missing document: scan');
    expect(toast).toEqual({ key: 'sentBackWithReason', values: { reason: 'Missing document: scan' } });
    expect(ids(store().actions)).not.toContain('A5');
    expect(store().trackedTasks).toEqual([
      { id: 'A5', kind: 'budget', reason: 'Missing document: scan', returned: true, title: 'Budget Approval — Q3 Capex, Arcade Refresh', when: 'Missing document: scan' },
    ]);
    expect(store().trackPrompt).toBeNull();
  });

  it('an empty-string reason (embedded forms) is a reason: no dialog, no suffix, "just now"', () => {
    const toast = store().actOnAction('sendback', action('A3'), '');
    expect(toast).toEqual({ key: 'sentBack' });
    expect(store().sendbackFor).toBeNull();
    expect(ids(store().actions)).not.toContain('A3');
    expect(store().trackedTasks[0]).toMatchObject({ id: 'A3', reason: '', returned: true, when: undefined });
  });

  it('closes the drawer when the acted-on item is the open one', () => {
    store().openDrawer('action', action('A2'));
    store().actOnAction('approve', action('A2'));
    expect(store().drawer).toBeNull();
    store().openDrawer('action', action('A6'));
    store().actOnAction('approve', action('A7'));
    expect(store().drawer?.item.id).toBe('A6');
  });
});

describe('pin and escalate', () => {
  it('pin toggles the flag without a toast', () => {
    expect(store().actOnAction('pin', action('A8'))).toBeUndefined();
    expect(action('A8').pinned).toBe(true);
    store().actOnAction('pin', action('A8'));
    expect(action('A8').pinned).toBe(false);
  });

  it('escalate forces critical/today, keeps the due text, and toasts the short title', () => {
    const toast = store().actOnAction('escalate', action('A5'));
    expect(toast).toEqual({ key: 'escalatedAction', values: { name: 'Budget Approval' } });
    expect(action('A5')).toMatchObject({ due: 'Due in 3 days', dueState: 'today', priority: 'critical' });
  });

  it('escalating does not close the drawer and the drawer keeps its stale snapshot', () => {
    store().openDrawer('action', action('A2'));
    store().actOnAction('escalate', action('A7'));
    store().actOnAction('escalate', action('A2'));
    expect(store().drawer?.item).toMatchObject({ id: 'A2', priority: 'high' });
    expect(action('A2').priority).toBe('critical');
  });
});

describe('kind routing', () => {
  it.each([
    ['A1', true],
    ['A2', false],
    ['A3', true],
    ['A4', true],
    ['A5', true],
    ['A6', false],
    ['A7', false],
    ['A8', false],
    ['A9', true],
    ['A10', true],
  ] as const)('%s opens the form preview: %s', (id, preview) => {
    expect(opensFormPreview(action(id))).toBe(preview);
    store().openDrawer('action', action(id));
    if (preview) {
      expect(store().formModal?.item.id).toBe(id);
      expect(store().drawer).toBeNull();
    } else {
      expect(store().drawer).toMatchObject({ type: 'action', verify: false });
      expect(store().formModal).toBeNull();
    }
  });

  it('carries verify at open time and routes incident / job-order items to the drawer', () => {
    store().openDrawer('action', action('A3'), true);
    expect(store().formModal).toMatchObject({ creator: false, verify: true });
    store().closeFormModal();
    store().openDrawer('incident', incident('INC-2041'));
    expect(store().drawer).toMatchObject({ type: 'incident' });
    store().openDrawer('jo', jobOrder('JO-7782'));
    expect(store().drawer).toMatchObject({ type: 'jo' });
    store().closeDrawer();
    expect(store().drawer).toBeNull();
  });

  it('openFormModal supports resubmit (creator) mode', () => {
    store().openFormModal(action('A3'), { creator: true });
    expect(store().formModal).toMatchObject({ creator: true, verify: false });
  });
});

describe('batch decisions', () => {
  it('approve removes the selection without a track prompt and toasts the full count', () => {
    store().selectAll(['A1', 'A2', 'A3']);
    const toast = store().batch('approve');
    expect(toast).toEqual({ key: 'batchApproved', values: { n: 3 } });
    expect(ids(store().actions)).toEqual(['A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10']);
    expect(store().selected).toEqual([]);
    expect(store().trackPrompt).toBeNull();
    expect(store().rejectedFeed).toEqual([]);
  });

  it('reject records every picked item in the rejected feed', () => {
    store().selectAll(['A8', 'A6']);
    const toast = store().batch('reject');
    expect(toast).toEqual({ key: 'batchRejected', values: { n: 2 } });
    expect(ids(store().rejectedFeed)).toEqual(['A6', 'A8']);
    expect(ids(store().actions)).toHaveLength(8);
  });

  it('acts on ids that are selected even when a filter would hide them', () => {
    store().toggleSelected('A1');
    store().toggleSelected('A4');
    expect(store().batch('approve').values).toEqual({ n: 2 });
    expect(ids(store().actions)).not.toContain('A1');
  });

  it('toggleSelected adds and removes ids and selectAll replaces the selection', () => {
    store().toggleSelected('A1');
    store().toggleSelected('A2');
    store().toggleSelected('A1');
    expect(store().selected).toEqual(['A2']);
    store().selectAll(['A5']);
    expect(store().selected).toEqual(['A5']);
  });
});

describe('track prompt', () => {
  it('Track adds one tracker row (deduplicated) and clears the prompt', () => {
    store().actOnAction('approve', action('A2'));
    expect(store().trackItem()).toEqual({ key: 'trackAdded', values: { id: 'A2' } });
    expect(store().trackedTasks).toEqual([{ id: 'A2', title: 'Purchase Approval (PC) — Cinema Projector Units ×2' }]);
    expect(store().trackPrompt).toBeNull();
    expect(store().trackItem()).toBeUndefined();
  });

  it('Not now clears the prompt without tracking', () => {
    store().actOnAction('approve', action('A6'));
    store().dismissTrackPrompt();
    expect(store().trackPrompt).toBeNull();
    expect(store().trackedTasks).toEqual([]);
  });
});

describe('incident verbs (drawer)', () => {
  it('pin pins, marks read and starts tracking; the toast fires only when pinning', () => {
    expect(store().actOnIncident('pin', incident('INC-2039'))).toEqual({ key: 'pinnedTracking', values: { id: 'INC-2039' } });
    expect(incident('INC-2039')).toMatchObject({ pinned: true, read: true });
    expect(store().trackedTasks).toEqual([{ id: 'INC-2039', title: 'HVAC failure — SAMA Cinema' }]);
    expect(store().actOnIncident('pin', incident('INC-2039'))).toBeUndefined();
    expect(incident('INC-2039').pinned).toBe(false);
  });

  it('pin computes willPin from the stale snapshot: a second pin from the same drawer snapshot re-tracks yet unpins', () => {
    const snapshot = incident('INC-2039');
    store().actOnIncident('pin', snapshot);
    expect(incident('INC-2039').pinned).toBe(true);
    const toast = store().actOnIncident('pin', snapshot);
    expect(toast).toEqual({ key: 'pinnedTracking', values: { id: 'INC-2039' } });
    expect(incident('INC-2039').pinned).toBe(false);
    expect(store().trackedTasks).toHaveLength(1);
  });

  it('escalate walks the severity ladder and caps at critical without touching sla', () => {
    store().actOnIncident('escalate', incident('INC-2030'));
    expect(incident('INC-2030').severity).toBe('medium');
    store().actOnIncident('escalate', incident('INC-2030'));
    store().actOnIncident('escalate', incident('INC-2030'));
    store().actOnIncident('escalate', incident('INC-2030'));
    expect(incident('INC-2030')).toMatchObject({ severity: 'critical', sla: 'ok' });
  });

  it('dismiss removes the incident and closes its drawer', () => {
    store().openDrawer('incident', incident('INC-2034'));
    expect(store().actOnIncident('dismiss', incident('INC-2034'))).toEqual({ key: 'dismissedIncident', values: { id: 'INC-2034' } });
    expect(ids(store().incidents)).not.toContain('INC-2034');
    expect(store().drawer).toBeNull();
  });
});

describe('job-order verbs (drawer)', () => {
  it('assign flips isNew/status (even from Review) and closes the drawer', () => {
    store().openDrawer('jo', jobOrder('JO-7770'));
    expect(store().actOnJobOrder('assign', jobOrder('JO-7770'))).toEqual({ key: 'jobOrderAssigned', values: { id: 'JO-7770' } });
    expect(jobOrder('JO-7770')).toMatchObject({ isNew: false, status: 'Assigned' });
    expect(store().drawer).toBeNull();
  });

  it('dismiss removes the job order but leaves the drawer open', () => {
    store().openDrawer('jo', jobOrder('JO-7781'));
    expect(store().actOnJobOrder('dismiss', jobOrder('JO-7781'))).toEqual({ key: 'dismissedJobOrder', values: { id: 'JO-7781' } });
    expect(ids(store().jobOrders)).not.toContain('JO-7781');
    expect(store().drawer?.item.id).toBe('JO-7781');
  });
});

describe('resubmit', () => {
  it('only clears the tracker row and closes the modal: the item is not re-queued', () => {
    store().actOnAction('sendback', action('A3'), '');
    store().openFormModal(action('A9'), { creator: true });
    const toast = store().resubmit('A3');
    expect(toast).toEqual({ key: 'resubmitted' });
    expect(store().trackedTasks).toEqual([]);
    expect(store().formModal).toBeNull();
    expect(ids(store().actions)).not.toContain('A3');
  });
});
