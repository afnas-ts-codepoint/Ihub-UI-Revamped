import { appraisals } from '../data/appraisals.mock';

export function useAppraisals() {
  return { data: appraisals } as const;
}
