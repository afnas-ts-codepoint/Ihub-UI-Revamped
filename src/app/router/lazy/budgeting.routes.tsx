import { BudgetingPage } from '@/features/budgeting';

export function BudgetingDashboardRoute() {
  return <BudgetingPage section="dashboard" />;
}

export function BudgetingSectionRoute() {
  return <BudgetingPage section="budgeting" />;
}
