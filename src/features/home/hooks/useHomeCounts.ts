import { useMemo } from 'react';

import { deriveHomeCounts } from '../domain/homeCounts';
import type { HomeBannerData } from '../types/home.types';

export function useHomeCounts(data: HomeBannerData) {
  return useMemo(() => deriveHomeCounts(data), [data]);
}
