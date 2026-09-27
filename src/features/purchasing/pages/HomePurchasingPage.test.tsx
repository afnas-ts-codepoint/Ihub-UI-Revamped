import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { HomePurchasingPage } from './HomePurchasingPage';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

const renderSection = (section: Parameters<typeof HomePurchasingPage>[0]['section']) =>
  render(<MemoryRouter initialEntries={[`/home/purchasing/${section}`]}><HomePurchasingPage section={section} /></MemoryRouter>);

function nth<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`Expected an item at index ${String(index)}`);
  return item;
}

describe('HomePurchasingPage', () => {
  it('renders the exact Pending Requests fixture and keeps table pagination inert', async () => {
    const user = userEvent.setup();
    renderSection('pending');
    const table = screen.getByRole('table');
    expect(within(table).getByText('PC-2025-088')).toBeVisible();
    expect(within(table).getByText('Cleaning services renewal — 24 months')).toBeVisible();
    expect(within(table).getByText('94,500.000')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Pending 4' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'All 42' })).toBeVisible();

    // PROTOTYPE-NOOP(D2): pagination renders but never changes the fixed rows.
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(within(table).getByText('PC-2025-088')).toBeVisible();
  });

  it('narrows Pending Requests via the shared row-filter predicate', async () => {
    const user = userEvent.setup();
    renderSection('pending');
    const table = screen.getByRole('table');
    await user.type(screen.getByPlaceholderText(/PC-2025-088/), 'IT hardware');
    expect(within(table).getByText('PC-2025-087')).toBeVisible();
    expect(within(table).queryByText('PC-2025-088')).toBeNull();
  });

  it('renders the Edit segment with an inert row action', async () => {
    const user = userEvent.setup();
    renderSection('edit');
    expect(screen.getByRole('tab', { name: 'Editable 4' })).toBeVisible();
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    expect(editButtons.length).toBeGreaterThan(0);
    await user.click(nth(editButtons, 0));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('PC-2025-088')).toBeVisible();
  });

  it('renders Missing Documents with the missing-doc chips', () => {
    renderSection('missing');
    expect(screen.getByRole('tab', { name: 'All 3' })).toBeVisible();
    const table = screen.getByRole('table');
    expect(within(table).getAllByText('Quotation').length).toBeGreaterThan(0);
    expect(within(table).getByText('Signed contract')).toBeVisible();
    expect(within(table).getByText('5')).toBeVisible();
  });

  it('renders History with the history RecordFilter kind', () => {
    renderSection('history');
    expect(screen.getByRole('tab', { name: 'All 3' })).toBeVisible();
    expect(screen.getByText('Sent to committee for review.')).toBeVisible();
  });

  it('renders the To Do fall-through listing without a SectionHead', () => {
    renderSection('todo');
    expect(screen.getByRole('tab', { name: 'To Do 2' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Record Listing 88' })).toBeVisible();
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
  });

  it('renders the permanent inert Report placeholder', () => {
    renderSection('report');
    expect(screen.getByText('Run the report to generate results. The table will render here.')).toBeVisible();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('creates a combined PC request, enforces attachment captions, and submits without persistence', async () => {
    const user = userEvent.setup();
    const { container } = renderSection('create');
    const submit = screen.getByRole('button', { name: 'Submit request' });

    await user.click(screen.getByRole('button', { name: /Combine PC request/ }));
    expect(screen.getByText('Request 2')).toBeVisible();

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    const file = new File(['x'], 'quote.pdf', { type: 'application/pdf' });
    await user.upload(fileInput as HTMLInputElement, file);
    expect(screen.getByText('quote.pdf')).toBeVisible();

    await user.click(submit);
    expect(screen.getByText('Every attachment needs a caption.')).toBeVisible();

    await user.type(screen.getByPlaceholderText('Caption (required)…'), 'Vendor quotation');
    await user.click(submit);
    expect(screen.getByText('Combined PC request submitted')).toBeVisible();
  });

  it('leaves Create Save as draft inert (PROTOTYPE-NOOP(D2))', async () => {
    const user = userEvent.setup();
    renderSection('create');
    await user.click(screen.getByRole('button', { name: /Save as draft/ }));
    expect(screen.queryByText('Every attachment needs a caption.')).toBeNull();
    expect(screen.queryByText('PC request submitted')).toBeNull();
    expect(screen.queryByText('Combined PC request submitted')).toBeNull();
  });

  it('opens the functional Review dialog and enforces the single-submit supplier lock', async () => {
    const user = userEvent.setup();
    renderSection('review');
    expect(screen.getByRole('heading', { name: 'Review Purchase Requests' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Pending review 2' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'All requests 4' })).toBeVisible();

    const reviewButtons = screen.getAllByRole('button', { name: 'Review' });
    await user.click(nth(reviewButtons, 0));

    const dialog = screen.getByTestId('review-dialog');
    const select = within(dialog).getByLabelText('Awarded supplier');
    const submit = within(dialog).getByRole('button', { name: 'Submit to purchase committee' });

    // (a) opens blank and unlocked
    expect(select).toHaveValue('');
    expect(select).toBeEnabled();
    // (b) disabled until a supplier is chosen
    expect(submit).toBeDisabled();

    await user.selectOptions(select, 'Nasim Facility Services — 94,500.000 KWD');
    expect(submit).toBeEnabled();

    // (c) submit locks the select/button and shows the confirmation
    await user.click(submit);
    expect(within(dialog).getByText(/Submitted — Nasim Facility Services/)).toBeVisible();
    expect(select).toBeDisabled();
    expect(submit).toBeDisabled();

    // (d) after lock, the select cannot change and re-submitting is a no-op
    const confirmation = within(dialog).getByText(/Submitted — Nasim Facility Services/);
    await user.click(submit);
    expect(within(dialog).getByText(/Submitted — Nasim Facility Services/)).toBe(confirmation);

    // close and reopen the same row resets to unlocked blank
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(screen.queryByTestId('review-dialog')).toBeNull();
    await user.click(nth(reviewButtons, 0));
    const reopened = screen.getByTestId('review-dialog');
    expect(within(reopened).getByLabelText('Awarded supplier')).toHaveValue('');
    expect(within(reopened).queryByText(/Submitted —/)).toBeNull();
  });

  it('resets the Review dialog to unlocked blank when a different row is opened', async () => {
    const user = userEvent.setup();
    renderSection('review');
    const reviewButtons = screen.getAllByRole('button', { name: 'Review' });

    await user.click(nth(reviewButtons, 0));
    let dialog = screen.getByTestId('review-dialog');
    await user.selectOptions(within(dialog).getByLabelText('Awarded supplier'), 'Nasim Facility Services — 94,500.000 KWD');
    await user.click(within(dialog).getByRole('button', { name: 'Submit to purchase committee' }));
    expect(within(dialog).getByText(/Submitted —/)).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));

    await user.click(nth(reviewButtons, 1));
    dialog = screen.getByTestId('review-dialog');
    expect(within(dialog).getByLabelText('Awarded supplier')).toHaveValue('');
    expect(within(dialog).queryByText(/Submitted —/)).toBeNull();
  });

  it('renders translated Arabic Home purchasing chrome in RTL', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderSection('review');

    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'المشتريات' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'مراجعة الطلب' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'مراجعة طلبات الشراء' })).toBeVisible();
  });
});
