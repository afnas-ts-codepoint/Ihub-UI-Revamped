import { useMemo } from 'react';

import { homeBannerData } from '../data/home.mock';
import { useHomeQueueStore } from '../store/homeQueue.store';
import type { HomeBannerData } from '../types/home.types';

/** Banner data with the live queue slices (actions, incidents, job orders) from the home store. */
export function useHomeBannerData() {
  const actions = useHomeQueueStore((state) => state.actions);
  const incidents = useHomeQueueStore((state) => state.incidents);
  const jobOrders = useHomeQueueStore((state) => state.jobOrders);
  const data: HomeBannerData = useMemo(
    () => ({ ...homeBannerData, actions, incidents, jobOrders }),
    [actions, incidents, jobOrders],
  );

  return { data, error: null, isError: false, isPending: false } as const;
}
