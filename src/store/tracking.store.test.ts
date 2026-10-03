import { afterEach, describe, expect, it } from 'vitest';

import { useTrackingStore } from './tracking.store';

afterEach(() => {
  useTrackingStore.getState().reset();
});

describe('tracking store', () => {
  it('queues requests in order and hands them over once', () => {
    const { drain, track } = useTrackingStore.getState();
    track({ id: 'INC-1', title: 'First' });
    track({ id: 'INC-2', title: 'Second', severity: 'high' });

    expect(useTrackingStore.getState().pending.map((record) => record.id)).toEqual(['INC-1', 'INC-2']);
    expect(drain().map((record) => record.id)).toEqual(['INC-1', 'INC-2']);
    expect(useTrackingStore.getState().pending).toEqual([]);
    expect(drain()).toEqual([]);
  });

  it('reset discards requests nobody took', () => {
    useTrackingStore.getState().track({ id: 'INC-1', title: 'First' });
    useTrackingStore.getState().reset();
    expect(useTrackingStore.getState().pending).toEqual([]);
  });
});
