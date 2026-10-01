import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { HomePaymentSettlementPage } from './HomePaymentSettlementPage';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

const renderModule = (module: Parameters<typeof HomePaymentSettlementPage>[0]['module']) =>
  render(<MemoryRouter initialEntries={[`/home/payment-settlement/${module}`]}><HomePaymentSettlementPage module={module} /></MemoryRouter>);

function nth<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`Expected an item at index ${String(index)}`);
  return item;
}

describe('HomePaymentSettlementPage', () => {
  it('renders the three-tab nav with Action Sheet current', () => {
    renderModule('action-sheet');
    expect(screen.getByRole('heading', { name: 'Payment Settlement' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Action Sheet' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Petty Cash' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Add a Supplier' })).not.toHaveAttribute('aria-current');
  });

  it('serves Petty Cash live (M6.7) with no pending placeholder', () => {
    renderModule('petty-cash');
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Petty Cash Request' })).toBeVisible();
  });

  it('serves Add a Supplier live (M6.8) with no pending placeholder', () => {
    renderModule('add-supplier');
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('link', { name: 'Add a Supplier' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'Supplier details' })).toBeVisible();
  });

  it('defaults the Action Sheet sub-tab to Create and renders the embedded form', () => {
    renderModule('action-sheet');
    expect(screen.getByRole('heading', { name: 'Create an Action Sheet' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Combine action sheet/ })).toBeVisible();
  });

  it('switches Action Sheet sub-tabs: Edit renders the fixture and the row action returns to Create', async () => {
    const user = userEvent.setup();
    renderModule('action-sheet');
    await user.click(screen.getByRole('button', { name: /Edit Action Sheet/ }));

    const table = screen.getByRole('table');
    expect(within(table).getByText('AS-318')).toBeVisible();
    expect(within(table).getByText('Q2 Venue Safety Audit')).toBeVisible();

    await user.click(nth(screen.getAllByRole('button', { name: 'Edit' }), 0));
    expect(screen.getByRole('heading', { name: 'Create an Action Sheet' })).toBeVisible();
  });

  it('renders Missing Documents with the missing-doc chips', async () => {
    const user = userEvent.setup();
    renderModule('action-sheet');
    await user.click(screen.getByRole('button', { name: /Missing Documents/ }));
    const table = screen.getByRole('table');
    expect(within(table).getAllByText('Invoice').length).toBeGreaterThan(0);
    expect(within(table).getAllByText('GRN').length).toBeGreaterThan(0);
    expect(within(table).getByText('Advanced Tech Systems')).toBeVisible();
  });

  it('renders Pre Payments Listing with the exact fixture', async () => {
    const user = userEvent.setup();
    renderModule('action-sheet');
    await user.click(screen.getByRole('button', { name: /Pre Payments Listing/ }));
    const table = screen.getByRole('table');
    expect(within(table).getByText('Gulf Facilities Services Co.')).toBeVisible();
    expect(within(table).getByText('1,225.000')).toBeVisible();
  });

  it('renders Recording Cost with the exact fixture', async () => {
    const user = userEvent.setup();
    renderModule('action-sheet');
    await user.click(screen.getByRole('button', { name: /Recording Cost/ }));
    const table = screen.getByRole('table');
    expect(within(table).getByText('HVAC Repair')).toBeVisible();
    expect(within(table).getByText('+350.000')).toBeVisible();
  });

  it('renders History with the real All/Purchase/Service segmented filter', async () => {
    const user = userEvent.setup();
    renderModule('action-sheet');
    await user.click(screen.getByRole('button', { name: /^History$/ }));
    const table = screen.getByRole('table');
    expect(within(table).getByText('AS-318')).toBeVisible();
    expect(within(table).getByText('AS-316')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Purchase' }));
    expect(within(table).getByText('AS-318')).toBeVisible();
    expect(within(table).queryByText('AS-316')).toBeNull();
  });

  it('renders the permanent inert Report placeholder with its own bespoke filters', async () => {
    const user = userEvent.setup();
    renderModule('action-sheet');
    await user.click(screen.getByRole('button', { name: /^Report$/ }));
    expect(screen.getByText('Run the report to generate results. The table will render here.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Generate report' })).toBeVisible();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('creates a combined action sheet, enforces attachment captions, and submits without persistence', async () => {
    const user = userEvent.setup();
    const { container } = renderModule('action-sheet');

    await user.click(screen.getByRole('button', { name: /Combine action sheet/ }));
    expect(screen.getByText('Action Sheet 2')).toBeVisible();

    const fileInputs = container.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBeGreaterThan(0);
    const file = new File(['x'], 'invoice.pdf', { type: 'application/pdf' });
    await user.upload(fileInputs[0] as HTMLInputElement, file);
    expect(screen.getByText('invoice.pdf')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Create action sheets' }));
    expect(screen.getByText('Every attachment needs a caption.')).toBeVisible();

    await user.type(screen.getByPlaceholderText('Caption (required)…'), 'Vendor invoice');
    await user.click(screen.getByRole('button', { name: 'Create action sheets' }));
    expect(screen.getByText('Combined action sheet created')).toBeVisible();
  });

  it('leaves Create Save as draft inert (PROTOTYPE-NOOP(D2))', async () => {
    const user = userEvent.setup();
    renderModule('action-sheet');
    await user.click(screen.getByRole('button', { name: /Save as draft/ }));
    expect(screen.queryByText('Every attachment needs a caption.')).toBeNull();
    expect(screen.queryByText('Action sheet created')).toBeNull();
  });

  it('renders translated Arabic Payment Settlement chrome in RTL', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderModule('action-sheet');

    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'تسوية المدفوعات' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'ورقة الإجراء' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'إنشاء ورقة إجراء' })).toBeVisible();
  });
});
