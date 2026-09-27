export type BudgetSection = 'budgeting' | 'dashboard';

export type BudgetSubView =
  | 'balanceReport'
  | 'ceoPay'
  | 'history'
  | 'onHold'
  | 'preApproved'
  | 'rejected';

export type BudgetTone = 'bad' | 'ok' | 'warn';

export type BudgetRequest = Readonly<{
  dept: string;
  id: string;
  period: string;
  projected: string;
  requested: string;
  status: string;
  title: string;
  tone: BudgetTone;
}>;

export type DepartmentBalance = Readonly<{
  balance: string;
  budget: string;
  committed: string;
  dept: string;
  status: string;
  tone: BudgetTone;
  utilised: string;
}>;
