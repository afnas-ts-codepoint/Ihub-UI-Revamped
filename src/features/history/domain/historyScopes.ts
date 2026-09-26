import type { RecordFilterKind } from '@/features/organization';

export const HISTORY_SCOPES = [
  {
    category: null,
    module: null,
    path: '/history',
    scopeKey: 'scopes.history',
    sectionKey: 'scopes.history',
  },
  {
    category: null,
    module: 'work-centre',
    path: '/history/work-centre',
    scopeKey: 'scopes.workCentre',
    sectionKey: 'scopes.workCentre',
  },
  {
    category: 'tasks',
    module: 'work-centre',
    path: '/history/work-centre/tasks',
    scopeKey: 'scopes.tasks',
    sectionKey: 'scopes.workCentre',
  },
  {
    category: 'enquiry',
    module: 'work-centre',
    path: '/history/work-centre/enquiry',
    scopeKey: 'scopes.enquiry',
    sectionKey: 'scopes.workCentre',
  },
  {
    category: 'observations',
    module: 'work-centre',
    path: '/history/work-centre/observations',
    scopeKey: 'scopes.observations',
    sectionKey: 'scopes.workCentre',
  },
  {
    category: 'incidents',
    module: 'work-centre',
    path: '/history/work-centre/incidents',
    scopeKey: 'scopes.incidents',
    sectionKey: 'scopes.workCentre',
  },
  {
    category: 'checklists',
    module: 'work-centre',
    path: '/history/work-centre/checklists',
    scopeKey: 'scopes.checklists',
    sectionKey: 'scopes.workCentre',
  },
  {
    category: 'price-change',
    module: 'work-centre',
    path: '/history/work-centre/price-change',
    scopeKey: 'scopes.priceChange',
    sectionKey: 'scopes.workCentre',
  },
  {
    category: 'promotions',
    module: 'work-centre',
    path: '/history/work-centre/promotions',
    scopeKey: 'scopes.promotions',
    sectionKey: 'scopes.workCentre',
  },
  {
    category: null,
    module: 'finance-budgets',
    path: '/history/finance-budgets',
    scopeKey: 'scopes.financeBudgets',
    sectionKey: 'scopes.financeBudgets',
  },
  {
    category: 'new-budget',
    module: 'finance-budgets',
    path: '/history/finance-budgets/new-budget',
    scopeKey: 'scopes.newBudget',
    sectionKey: 'scopes.financeBudgets',
  },
  {
    category: 'additional-budget',
    module: 'finance-budgets',
    path: '/history/finance-budgets/additional-budget',
    scopeKey: 'scopes.additionalBudget',
    sectionKey: 'scopes.financeBudgets',
  },
  {
    category: 'transfer-fund',
    module: 'finance-budgets',
    path: '/history/finance-budgets/transfer-fund',
    scopeKey: 'scopes.transferFund',
    sectionKey: 'scopes.financeBudgets',
  },
  {
    category: 'payment-settlement',
    module: 'finance-budgets',
    path: '/history/finance-budgets/payment-settlement',
    scopeKey: 'scopes.paymentSettlement',
    sectionKey: 'scopes.financeBudgets',
  },
  {
    category: 'petty-cash',
    module: 'finance-budgets',
    path: '/history/finance-budgets/petty-cash',
    scopeKey: 'scopes.pettyCash',
    sectionKey: 'scopes.financeBudgets',
  },
  {
    category: null,
    module: 'hr',
    path: '/history/hr',
    scopeKey: 'scopes.hr',
    sectionKey: 'scopes.hr',
  },
  {
    category: 'overtime',
    module: 'hr',
    path: '/history/hr/overtime',
    scopeKey: 'scopes.overtime',
    sectionKey: 'scopes.hr',
  },
  {
    category: 'investigations',
    module: 'hr',
    path: '/history/hr/investigations',
    scopeKey: 'scopes.investigations',
    sectionKey: 'scopes.hr',
  },
  {
    category: 'violations',
    module: 'hr',
    path: '/history/hr/violations',
    scopeKey: 'scopes.violations',
    sectionKey: 'scopes.hr',
  },
  {
    category: 'loan',
    module: 'hr',
    path: '/history/hr/loan',
    scopeKey: 'scopes.loan',
    sectionKey: 'scopes.hr',
  },
  {
    category: 'end-of-probation',
    module: 'hr',
    path: '/history/hr/end-of-probation',
    scopeKey: 'scopes.endOfProbation',
    sectionKey: 'scopes.hr',
  },
  {
    category: 'exit-interview',
    module: 'hr',
    path: '/history/hr/exit-interview',
    scopeKey: 'scopes.exitInterview',
    sectionKey: 'scopes.hr',
  },
  {
    category: null,
    module: 'appraisal',
    path: '/history/appraisal',
    scopeKey: 'scopes.appraisal',
    sectionKey: 'scopes.appraisal',
  },
  {
    category: null,
    module: 'quality-compliance',
    path: '/history/quality-compliance',
    scopeKey: 'scopes.qualityCompliance',
    sectionKey: 'scopes.qualityCompliance',
  },
  {
    category: 'observations',
    module: 'quality-compliance',
    path: '/history/quality-compliance/observations',
    scopeKey: 'scopes.observations',
    sectionKey: 'scopes.qualityCompliance',
  },
  {
    category: 'quality-assurance-checklists',
    module: 'quality-compliance',
    path: '/history/quality-compliance/quality-assurance-checklists',
    scopeKey: 'scopes.qualityAssuranceChecklists',
    sectionKey: 'scopes.qualityCompliance',
  },
  {
    category: null,
    module: 'purchasing',
    path: '/history/purchasing',
    scopeKey: 'scopes.purchasing',
    sectionKey: 'scopes.purchasing',
  },
  {
    category: null,
    module: 'sop-checklist',
    path: '/history/sop-checklist',
    scopeKey: 'scopes.sopChecklist',
    sectionKey: 'scopes.sopChecklist',
  },
] as const;

export type HistoryScope = (typeof HISTORY_SCOPES)[number];

export const HISTORY_ROUTE_PATHS = HISTORY_SCOPES.map((scope) => scope.path);

export function resolveHistoryScope(pathname: string): HistoryScope | undefined {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  return HISTORY_SCOPES.find((scope) => scope.path === normalized);
}

/** @prototype index.html:L9739-L9748 HistoryScreen */
export function historyFilterKind(
  scope: HistoryScope,
  scopeLabel: string,
): RecordFilterKind {
  const routeScope = (scope.category ?? scope.module ?? '').toLowerCase();
  const value = `${routeScope} ${scopeLabel.toLowerCase()}`;

  if (/incident/.test(value)) return 'incident';
  if (/task|job/.test(value)) return 'task';
  if (/enquir/.test(value)) return 'enquiry';
  if (/budget|fund|finance/.test(value)) return 'budget';
  if (/purchas|quotation|request|committee/.test(value)) return 'request';
  if (/action sheet|sheet/.test(value)) return 'sheet';
  return 'history';
}
