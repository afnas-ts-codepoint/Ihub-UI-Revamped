import {
  DEPARTMENT_DETAILS,
  DEPARTMENT_ITEMS,
  DEPARTMENT_PERFORMANCE,
  SLA_LEVELS,
  SLA_PERFORMANCE,
} from '../data/sla.mock';
import { onTimePercentage, overallPerformance } from '../domain/sla';
export function useSlaPerformance() {
  return {
    departmentDetails: DEPARTMENT_DETAILS,
    departmentItems: DEPARTMENT_ITEMS,
    departments: DEPARTMENT_PERFORMANCE,
    onTimePercentage,
    overall: overallPerformance(SLA_LEVELS, SLA_PERFORMANCE),
    performance: SLA_PERFORMANCE,
  };
}
