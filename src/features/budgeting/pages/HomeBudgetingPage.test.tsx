import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { HomeBudgetingPage } from './HomeBudgetingPage';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

const renderSection = (section: Parameters<typeof HomeBudgetingPage>[0]['section']) =>
  render(<MemoryRouter initialEntries={[`/home/budgets/${section}`]}><HomeBudgetingPage section={section} /></MemoryRouter>);

describe('HomeBudgetingPage', () => {
  it('renders the exact worksheet fixtures and triggers the golden CSV download contract', async () => {
    const user = userEvent.setup();
    const createObjectUrl = vi.fn(() => 'blob:budget-sheet');
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    renderSection('sheet');

    expect(screen.getByText('Commercial & Marketing')).toBeVisible();
    expect(screen.getByText('ACT-01')).toBeVisible();
    expect(screen.getByText('Seasonal campaigns')).toBeVisible();
    expect(screen.getByText('14,000')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Export CSV' }));
    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
  });

  it('enforces the prototype New Budget fields, derives account data, and submits without persistence', async () => {
    const user = userEvent.setup();
    renderSection('new-budget');
    const submit = screen.getByRole('button', { name: /Submit budget/ });
    expect(submit).toBeDisabled();

    await user.selectOptions(screen.getByLabelText('Location'), 'The Avenues');
    await user.selectOptions(screen.getByLabelText('Department'), 'Marketing');
    await user.selectOptions(screen.getByLabelText('Activity'), 'Marketing & Campaigns');
    await user.selectOptions(screen.getByLabelText('Sub activity'), 'Seasonal campaigns');
    await user.selectOptions(screen.getByLabelText('Budgeting year'), '2026');
    await user.type(screen.getByLabelText('Jan'), '1000');

    expect(screen.getByDisplayValue('Marketing & Promotions')).toBeVisible();
    expect(screen.getByDisplayValue('5100-2040')).toBeVisible();
    expect(submit).toBeEnabled();
    await user.click(submit);
    expect(screen.getByText(/Budget submitted · BUD-2026-015/)).toBeVisible();
    expect(screen.getByDisplayValue('1000')).toBeVisible();
  });

  it('creates a local budget activity and exposes it in the listing', async () => {
    const user = userEvent.setup();
    renderSection('activities');
    await user.type(screen.getByLabelText('Name'), 'Training & Development');
    const create = screen.getByRole('button', { name: /^Create/ });
    expect(create).toBeEnabled();
    await user.click(create);
    expect(screen.getByText('Training & Development')).toBeVisible();
    expect(screen.getByText(/ACT-08/)).toBeVisible();
  });

  it('preserves Additional Budget and Transfer Fund fixed rows and inert filtering', async () => {
    const user = userEvent.setup();
    const { rerender } = renderSection('additional-budget');
    expect(screen.getByRole('tab', { name: 'Pending 4' })).toBeVisible();
    const table = screen.getByRole('table');
    expect(within(table).getByText('BUD-Q2-014')).toBeVisible();
    await user.type(screen.getByPlaceholderText(/BUD-/), 'does-not-match');
    expect(within(table).getByText('BUD-Q2-014')).toBeVisible();

    rerender(<MemoryRouter initialEntries={['/home/budgets/transfer-fund']}><HomeBudgetingPage section="transfer-fund" /></MemoryRouter>);
    expect(screen.getByRole('tab', { name: 'Pending 4' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'All 28' })).toBeVisible();
  });

  it('renders translated Arabic Home budgeting chrome in RTL with Latin financial digits', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderSection('report');

    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'الميزانيات' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'تقرير' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('KWD 11.2M')).toBeVisible();
    expect(document.body.textContent).not.toMatch(/[٠-٩]/);
  });
});
