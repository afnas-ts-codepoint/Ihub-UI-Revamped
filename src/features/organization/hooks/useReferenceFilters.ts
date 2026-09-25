import { REFERENCE_FILTERS } from '../data/reference-filters.mock';

export function useReferenceFilters() {
  return {
    data: REFERENCE_FILTERS,
    error: null,
    isError: false,
    isPending: false,
  } as const;
}
