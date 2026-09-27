import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useHomeBannerData } from './useHomeBannerData';

describe('useHomeBannerData', () => {
  it('exposes synchronous query-shaped prototype data', () => {
    const { result } = renderHook(() => useHomeBannerData());
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data.actions).toHaveLength(10);
    expect(result.current.data.incidents).toHaveLength(5);
    expect(result.current.data.jobOrders).toHaveLength(6);
  });
});
