import { homeBannerData } from '../data/home.mock';

export function useHomeBannerData() {
  return {
    data: homeBannerData,
    error: null,
    isError: false,
    isPending: false,
  } as const;
}
