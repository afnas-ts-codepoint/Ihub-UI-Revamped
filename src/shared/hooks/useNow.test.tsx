import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useNow } from './useNow';

afterEach(() => {
  vi.useRealTimers();
});

describe('useNow', () => {
  it('publishes the current instant at the requested interval', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-25T05:00:00.000Z'));
    const { result } = renderHook(() => useNow(1_000));

    expect(result.current.toISOString()).toBe('2026-09-25T05:00:00.000Z');
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(result.current.toISOString()).toBe('2026-09-25T05:00:01.000Z');
  });
});
