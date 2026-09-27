export type BudgetSection = 'budgeting' | 'dashboard';

export const HOME_BUDGET_SECTIONS = [
  'sheet',
  'activities',
  'new-budget',
  'additional-budget',
  'transfer-fund',
  'report',
] as const;

export type HomeBudgetSection = (typeof HOME_BUDGET_SECTIONS)[number];

export type BudgetSubActivity = Readonly<{
  active: boolean;
  alloc: number;
  code: string;
  committed: number;
  desc: string;
  name: string;
  nameAr: string;
}>;

export type BudgetActivity = Readonly<{
  account: string;
  accountNo: string;
  active: boolean;
  budget: number;
  code: string;
  committed: number;
  desc: string;
  name: string;
  nameAr: string;
  owner: string;
  subs: readonly BudgetSubActivity[];
  type: 'Capex' | 'Opex';
  year: string;
}>;

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
