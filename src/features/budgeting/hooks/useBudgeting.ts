import {
  balanceChart,
  budgetRequests,
  dashboardBudgetChart,
  departmentBalances,
} from '../data/budgeting.mock';

export function useBudgeting() {
  return {
    data: {
      balanceChart,
      budgetRequests,
      dashboardBudgetChart,
      departmentBalances,
    },
    error: null,
    isError: false,
    isPending: false,
  } as const;
}
