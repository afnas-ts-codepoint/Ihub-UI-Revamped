import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { BudgetingPage } from './BudgetingPage';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));

afterEach(async () => {
  cleanup();
  document.documentElement.dir = 'ltr';
  await i18n.changeLanguage('en');
});

describe('BudgetingPage', () => {
  it('renders the dashboard fixture and reachable monthly utilisation chart', () => {
    render(<BudgetingPage section="dashboard" />);

    expect(
      screen.getByRole('heading', { name: 'Finance & Budgets' }),
    ).toBeVisible();
    expect(screen.getByText('KWD 8.4M')).toBeVisible();
    expect(screen.getByText('KWD 6.5M')).toBeVisible();
    expect(screen.getByText('KWD 1.9M')).toBeVisible();
    expect(screen.getByText('12')).toBeVisible();
    expect(
      screen.getByRole('img', {
        name: 'Budget utilisation by month, KWD thousands',
      }),
    ).toBeVisible();
    expect(screen.queryByText('Projected vs Actual Revenue')).toBeNull();
  });

  it('renders the exact ordered sub-tabs and Balance Report by default', () => {
    render(<BudgetingPage section="budgeting" />);

    const tabs = within(
      screen.getByRole('tablist', { name: 'Budgeting views' }),
    ).getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'Balance Report',
      'CEO Payment Approval',
      'Pre-approved Listing',
      'On Hold / Partial',
      'Rejected Listing',
      'History',
    ]);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Overspent depts')).toBeVisible();
    expect(screen.getByText('Balance by department')).toBeVisible();
    expect(
      screen.getByRole('tab', { name: 'By department 7' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('preserves the negative Overspent row and its bad tone', () => {
    render(<BudgetingPage section="budgeting" />);

    const row = screen.getByRole('row', { name: /Facilities/ });
    expect(within(row).getByText('-8,000')).toHaveClass('text-bad');
    expect(within(row).getByText('106%')).toBeVisible();
    expect(within(row).getByText('Overspent')).toHaveClass('chip-tone-bad');
  });

  it('switches all approval views with literal counts and fixed prototype rows', async () => {
    const user = userEvent.setup();
    render(<BudgetingPage section="budgeting" />);

    await user.click(screen.getByRole('tab', { name: 'CEO Payment Approval' }));
    expect(screen.getByRole('tab', { name: 'Pending CEO 3' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'All 19' })).toBeVisible();
    expect(screen.getByText('BUD-Q2-014')).toBeVisible();

    const scenarios = [
      ['Pre-approved Listing', 'Pre-approved 8'],
      ['On Hold / Partial', 'On Hold / Partial 3'],
      ['Rejected Listing', 'Rejected 2'],
      ['History', 'Record Listing 60'],
    ] as const;

    for (const [view, tableTab] of scenarios) {
      await user.click(screen.getByRole('tab', { name: view }));
      expect(screen.getByRole('tab', { name: tableTab })).toBeVisible();
      expect(screen.getByText('BUD-Q2-014')).toBeVisible();
      expect(screen.getByText('BUD-Q2-011')).toBeVisible();
    }
  });

  it('keeps budget filtering visual-only and pagination inert', async () => {
    const user = userEvent.setup();
    render(<BudgetingPage section="budgeting" />);

    await user.click(screen.getByRole('tab', { name: 'CEO Payment Approval' }));
    const search = screen.getByPlaceholderText(/BUD-/);
    await user.type(search, 'does-not-match');
    expect(screen.getByText('BUD-Q2-014')).toBeVisible();
    expect(screen.getByText('BUD-Q2-011')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByText('BUD-Q2-014')).toBeVisible();
  });

  it('renders translated Arabic chrome, RTL, Latin digits, and prototype English table vocabulary', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    render(<BudgetingPage section="budgeting" />);

    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(
      screen.getByRole('heading', { name: 'المالية والميزانيات' }),
    ).toBeVisible();
    expect(screen.getByRole('tab', { name: 'تقرير الرصيد' })).toBeVisible();
    expect(screen.getByText('Budget (KWD)')).toBeVisible();
    expect(screen.getByText('-8,000')).toBeVisible();
    expect(document.body.textContent).toMatch(/[0-9]/);
    expect(document.body.textContent).not.toMatch(/[٠-٩]/);
  });
});
