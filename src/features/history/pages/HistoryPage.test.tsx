import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { HistoryPage } from './HistoryPage';
import arHistory from '@/shared/i18n/locales/ar/history.json';
import enHistory from '@/shared/i18n/locales/en/history.json';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

const uiCases = [
  ['/history', 'history', 'HIS', 'REC-2026000'],
  ['/history/work-centre', 'workCentre', 'WOR', 'REC-2026000'],
  ['/history/work-centre/tasks', 'tasks', 'TAS', 'TSK-2026-318'],
  ['/history/work-centre/enquiry', 'enquiry', 'ENQ', 'ENQ-118'],
  ['/history/work-centre/observations', 'observations', 'OBS', 'REC-2026000'],
  ['/history/work-centre/incidents', 'incidents', 'INC', 'INC-2041'],
  ['/history/work-centre/checklists', 'checklists', 'CHE', 'REC-2026000'],
  ['/history/work-centre/price-change', 'priceChange', 'PRI', 'REC-2026000'],
  ['/history/work-centre/promotions', 'promotions', 'PRO', 'REC-2026000'],
  ['/history/finance-budgets', 'financeBudgets', 'FIN', 'BUD-2026-014'],
  ['/history/finance-budgets/new-budget', 'newBudget', 'NEW', 'BUD-2026-014'],
  ['/history/finance-budgets/additional-budget', 'additionalBudget', 'ADD', 'BUD-2026-014'],
  ['/history/finance-budgets/transfer-fund', 'transferFund', 'TRA', 'BUD-2026-014'],
  ['/history/finance-budgets/payment-settlement', 'paymentSettlement', 'PAY', 'REC-2026000'],
  ['/history/finance-budgets/petty-cash', 'pettyCash', 'PET', 'REC-2026000'],
  ['/history/hr', 'hr', 'HR', 'REC-2026000'],
  ['/history/hr/overtime', 'overtime', 'OVE', 'REC-2026000'],
  ['/history/hr/investigations', 'investigations', 'INV', 'REC-2026000'],
  ['/history/hr/violations', 'violations', 'VIO', 'REC-2026000'],
  ['/history/hr/loan', 'loan', 'LOA', 'REC-2026000'],
  ['/history/hr/end-of-probation', 'endOfProbation', 'END', 'REC-2026000'],
  ['/history/hr/exit-interview', 'exitInterview', 'EXI', 'REC-2026000'],
  ['/history/appraisal', 'appraisal', 'APP', 'REC-2026000'],
  ['/history/quality-compliance', 'qualityCompliance', 'QUA', 'REC-2026000'],
  ['/history/quality-compliance/observations', 'observations', 'OBS', 'REC-2026000'],
  ['/history/quality-compliance/quality-assurance-checklists', 'qualityAssuranceChecklists', 'QUA', 'REC-2026000'],
  ['/history/purchasing', 'purchasing', 'PUR', 'PC-2025-088'],
  ['/history/sop-checklist', 'sopChecklist', 'SOP', 'REC-2026000'],
] as const;

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

describe('HistoryPage leaf-by-leaf parity', () => {
  it.each(uiCases)(
    'renders the real History screen and correct filter for %s',
    (path, scopeKey, prefix, filterPlaceholder) => {
      const view = render(
        <MemoryRouter initialEntries={[path]}>
          <HistoryPage />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole('heading', { name: enHistory.scopes[scopeKey] }),
      ).toBeVisible();
      expect(screen.getAllByRole('row')).toHaveLength(11);
      expect(screen.getByText(`${prefix}-2026000`)).toBeVisible();
      expect(screen.getByText(`${prefix}-2025937`)).toBeVisible();
      expect(screen.getByPlaceholderText(new RegExp(filterPlaceholder))).toBeVisible();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      view.unmount();
    },
  );

  it('renders localized Arabic scope, rows, columns, and Western digits', async () => {
    await i18n.changeLanguage('ar');
    render(
      <MemoryRouter initialEntries={['/history/work-centre/tasks']}>
        <HistoryPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: arHistory.scopes.tasks }),
    ).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'التاريخ' })).toBeVisible();
    expect(screen.getByText('REC-2026000')).toBeVisible();
    expect(screen.getAllByText(/· أوامر العمل/)).toHaveLength(10);
    expect(i18n.dir()).toBe('rtl');
  });
});
