import { describe, expect, it } from 'vitest';

import enHistory from '@/shared/i18n/locales/en/history.json';
import {
  HISTORY_ROUTE_PATHS,
  historyFilterKind,
  resolveHistoryScope,
} from './historyScopes';

const routeCases = [
  ['/history', null, null, 'history', 'history'],
  ['/history/work-centre', 'work-centre', null, 'workCentre', 'history'],
  ['/history/work-centre/tasks', 'work-centre', 'tasks', 'tasks', 'task'],
  ['/history/work-centre/enquiry', 'work-centre', 'enquiry', 'enquiry', 'enquiry'],
  ['/history/work-centre/observations', 'work-centre', 'observations', 'observations', 'history'],
  ['/history/work-centre/incidents', 'work-centre', 'incidents', 'incidents', 'incident'],
  ['/history/work-centre/checklists', 'work-centre', 'checklists', 'checklists', 'history'],
  ['/history/work-centre/price-change', 'work-centre', 'price-change', 'priceChange', 'history'],
  ['/history/work-centre/promotions', 'work-centre', 'promotions', 'promotions', 'history'],
  ['/history/finance-budgets', 'finance-budgets', null, 'financeBudgets', 'budget'],
  ['/history/finance-budgets/new-budget', 'finance-budgets', 'new-budget', 'newBudget', 'budget'],
  ['/history/finance-budgets/additional-budget', 'finance-budgets', 'additional-budget', 'additionalBudget', 'budget'],
  ['/history/finance-budgets/transfer-fund', 'finance-budgets', 'transfer-fund', 'transferFund', 'budget'],
  ['/history/finance-budgets/payment-settlement', 'finance-budgets', 'payment-settlement', 'paymentSettlement', 'history'],
  ['/history/finance-budgets/petty-cash', 'finance-budgets', 'petty-cash', 'pettyCash', 'history'],
  ['/history/hr', 'hr', null, 'hr', 'history'],
  ['/history/hr/overtime', 'hr', 'overtime', 'overtime', 'history'],
  ['/history/hr/investigations', 'hr', 'investigations', 'investigations', 'history'],
  ['/history/hr/violations', 'hr', 'violations', 'violations', 'history'],
  ['/history/hr/loan', 'hr', 'loan', 'loan', 'history'],
  ['/history/hr/end-of-probation', 'hr', 'end-of-probation', 'endOfProbation', 'history'],
  ['/history/hr/exit-interview', 'hr', 'exit-interview', 'exitInterview', 'history'],
  ['/history/appraisal', 'appraisal', null, 'appraisal', 'history'],
  ['/history/quality-compliance', 'quality-compliance', null, 'qualityCompliance', 'history'],
  ['/history/quality-compliance/observations', 'quality-compliance', 'observations', 'observations', 'history'],
  ['/history/quality-compliance/quality-assurance-checklists', 'quality-compliance', 'quality-assurance-checklists', 'qualityAssuranceChecklists', 'history'],
  ['/history/purchasing', 'purchasing', null, 'purchasing', 'request'],
  ['/history/sop-checklist', 'sop-checklist', null, 'sopChecklist', 'history'],
] as const;

describe('History route-to-scope mapping', () => {
  it.each(routeCases)(
    'resolves %s to its exact module, category, and RecordFilter kind',
    (path, module, category, scopeKey, filterKind) => {
      const scope = resolveHistoryScope(path);
      expect(scope).toMatchObject({
        category,
        module,
        path,
        scopeKey: `scopes.${scopeKey}`,
      });
      expect(
        scope &&
          historyFilterKind(
            scope,
            enHistory.scopes[scopeKey],
          ),
      ).toBe(filterKind);
    },
  );

  it('exposes exactly the 28 prototype History navigation routes', () => {
    expect(HISTORY_ROUTE_PATHS).toEqual(routeCases.map(([path]) => path));
  });

  it.each([
    '/history/unknown',
    '/history/work-centre/unknown',
    '/history/hr/overtime/unknown',
    '/not-history',
  ])('rejects invalid History input %s', (path) => {
    expect(resolveHistoryScope(path)).toBeUndefined();
  });

  it('normalizes one trailing slash without accepting extra segments', () => {
    expect(resolveHistoryScope('/history/work-centre/tasks/')).toMatchObject({
      category: 'tasks',
      module: 'work-centre',
    });
  });
});
