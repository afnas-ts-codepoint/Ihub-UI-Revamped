import { afterEach, describe, expect, it } from 'vitest';

import { useHomeQueueStore } from './homeQueue.store';

const store = () => useHomeQueueStore.getState();
const incident = (id: string) => {
  const found = store().incidents.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};
const action = (id: string) => {
  const found = store().actions.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};
const jobOrder = (id: string) => {
  const found = store().jobOrders.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};
const ids = (list: readonly { id: string }[]) => list.map((item) => item.id);

const labels = {
  feed: 'Added to tracking from the incident listing.',
  justNow: 'just now',
  slaLabel: 'Within SLA',
  status: 'Tracking',
};

afterEach(() => {
  store().reset();
});

describe('incident menu verbs (M10.3)', () => {
  it('read marks the incident read without a toast', () => {
    expect(incident('INC-2039').read).toBeUndefined();
    expect(store().actOnIncident('read', incident('INC-2039'))).toBeUndefined();
    expect(incident('INC-2039').read).toBe(true);
  });

  it('track lists the incident once, marks it read and toasts "added to live feed"', () => {
    const toast = store().actOnIncident('track', incident('INC-2039'));
    expect(toast).toEqual({ key: 'trackAdded', values: { id: 'INC-2039' } });
    store().actOnIncident('track', incident('INC-2039'));
    expect(ids(store().trackedTasks)).toEqual(['INC-2039']);
    expect(incident('INC-2039').read).toBe(true);
    expect(incident('INC-2039').pinned).toBe(false);
  });

  it('close removes the incident, closes its drawer and toasts "case closed"', () => {
    store().openDrawer('incident', incident('INC-2034'));
    const toast = store().actOnIncident('close', incident('INC-2034'));
    expect(toast).toEqual({ key: 'caseClosed', values: { id: 'INC-2034' } });
    expect(ids(store().incidents)).not.toContain('INC-2034');
    expect(store().drawer).toBeNull();
  });

  it('dismiss keeps its own toast', () => {
    expect(store().actOnIncident('dismiss', incident('INC-2034'))).toEqual({
      key: 'dismissedIncident',
      values: { id: 'INC-2034' },
    });
  });

  it('task opens the thin internal draft and marks the incident read', () => {
    const toast = store().actOnIncident('task', incident('INC-2041'));
    expect(toast).toEqual({ key: 'taskDrafted', values: { id: 'INC-2041' } });
    expect(store().taskOpen).toEqual({
      dept: 'Yazan Malik (IT)',
      id: 'INC-2041',
      kind: 'internal',
      priority: 'high',
      title: 'POS network outage — 360 Mall',
    });
    expect(incident('INC-2041').read).toBe(true);
  });

  it.each([
    ['INC-2041', 'critical', 'high'],
    ['INC-2039', 'high', 'high'],
    ['INC-2034', 'medium', 'medium'],
    ['INC-2030', 'low', 'medium'],
  ] as const)('task maps the %s severity %s to the %s priority', (id, _severity, priority) => {
    store().actOnIncident('task', incident(id));
    expect(store().taskOpen?.priority).toBe(priority);
  });

  it.each([
    ['compensate', 'compensationLogged'],
    ['investigate', 'investigationRequested'],
    ['feedback', 'feedbackSaved'],
    ['callback', 'callbackRequested'],
  ] as const)('%s only notes the request, marks the incident read and toasts', (verb, key) => {
    expect(store().actOnIncident(verb, incident('INC-2039'))).toEqual({
      key,
      values: { id: 'INC-2039' },
    });
    expect(incident('INC-2039').read).toBe(true);
    expect(store().incidents).toHaveLength(5);
    expect(store().taskOpen).toBeNull();
  });
});

describe('job-order approve (assigned task rows)', () => {
  it('assigns like Assign but also opens the track prompt', () => {
    const toast = store().actOnJobOrder('approve', jobOrder('JO-7775'));
    expect(toast).toEqual({ key: 'jobOrderAssigned', values: { id: 'JO-7775' } });
    expect(jobOrder('JO-7775')).toMatchObject({ isNew: false, status: 'Assigned' });
    expect(store().trackPrompt).toEqual({ id: 'JO-7775', title: 'Install digital signage — main concourse' });
  });

  it('assign (the drawer) does not open the track prompt', () => {
    store().actOnJobOrder('assign', jobOrder('JO-7782'));
    expect(store().trackPrompt).toBeNull();
  });
});

describe('home task form state', () => {
  it('openTask and closeTask hold the draft', () => {
    store().openTask({ id: 'JO-7779', kind: 'internal', priority: 'high', title: 'Repair escalator B2' });
    expect(store().taskOpen?.id).toBe('JO-7779');
    store().closeTask();
    expect(store().taskOpen).toBeNull();
  });

  it('reset discards an open draft', () => {
    store().openTask({ id: 'JO-7779', kind: 'internal', priority: 'high', title: 'x' });
    store().reset();
    expect(store().taskOpen).toBeNull();
  });
});

describe('rejected feed', () => {
  it('dismissRejected removes only that entry', () => {
    store().actOnAction('reject', action('A1'));
    store().actOnAction('reject', action('A2'));
    expect(ids(store().rejectedFeed)).toEqual(['A2', 'A1']);
    store().dismissRejected('A2');
    expect(ids(store().rejectedFeed)).toEqual(['A1']);
  });
});

describe('trackRecord (the __ihubTrack hand-off)', () => {
  it('opens a pinned, read "Tracking" incident and lists the record for an unknown id', () => {
    store().trackRecord({ id: 'INC-9001', title: 'Water leak — Lobby' }, labels);
    const created = store().incidents[0];
    expect(created).toMatchObject({
      detail: 'Water leak — Lobby',
      id: 'INC-9001',
      location: '—',
      owner: 'M. Faris',
      pinned: true,
      progress: 0.1,
      read: true,
      severity: 'medium',
      sla: 'ok',
      slaLabel: 'Within SLA',
      status: 'Tracking',
      title: 'Water leak — Lobby',
    });
    expect(created?.feed).toEqual([
      { t: 'just now', text: labels.feed, type: 'status', who: 'M. Faris' },
    ]);
    expect(store().incidents).toHaveLength(6);
    expect(ids(store().trackedTasks)).toEqual(['INC-9001']);
  });

  it('uses the details the record carries', () => {
    store().trackRecord(
      { by: 'A. Rahman', detail: 'Pipe burst', id: 'INC-9002', location: 'Level 2', severity: 'high', title: 'Pipe' },
      labels,
    );
    expect(store().incidents[0]).toMatchObject({
      detail: 'Pipe burst',
      location: 'Level 2',
      owner: 'A. Rahman',
      severity: 'high',
    });
  });

  it('pins and reads an incident that already exists without adding a second one', () => {
    store().trackRecord({ id: 'INC-2039', title: 'Escalator outage' }, labels);
    expect(store().incidents).toHaveLength(5);
    expect(incident('INC-2039')).toMatchObject({ pinned: true, read: true });
    expect(ids(store().trackedTasks)).toEqual(['INC-2039']);
  });

  it('does not list the same record twice', () => {
    store().trackRecord({ id: 'INC-9003', title: 'Again' }, labels);
    store().trackRecord({ id: 'INC-9003', title: 'Again' }, labels);
    expect(ids(store().trackedTasks)).toEqual(['INC-9003']);
    expect(store().incidents.filter((candidate) => candidate.id === 'INC-9003')).toHaveLength(1);
  });
});
