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

describe('M6.4 Purchase Order', () => {
  it('exposes the outer Purchase Order nav entry alongside the existing 8 segments', () => {
    renderSection('po');
    expect(screen.getByRole('link', { name: 'Purchase Order' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('link').length).toBe(10);
  });

  it('renders the To Do tab with the literal (non-derived) Open 3 / All 142 counts and no SectionHead', () => {
    renderSection('po');
    expect(screen.getByRole('tab', { name: 'Open 3' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'All 142' })).toBeVisible();
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
    const table = screen.getByRole('table');
    expect(within(table).getByText('PO-2025-142')).toBeVisible();
    expect(within(table).getByText('Nasim Facility')).toBeVisible();
    expect(within(table).getByText('PC-2025-088')).toBeVisible();
    expect(within(table).getByText('94,500.000')).toBeVisible();
    expect(within(table).getAllByRole('button', { name: 'Attach Purchase Order' }).length).toBe(4);
  });

  it('narrows the To Do listing via the shared row-filter predicate', async () => {
    const user = userEvent.setup();
    renderSection('po');
    const table = screen.getByRole('table');
    await user.type(screen.getByPlaceholderText(/PC-2025-088/), 'Tech Source');
    expect(within(table).getByText('PO-2025-141')).toBeVisible();
    expect(within(table).queryByText('PO-2025-142')).toBeNull();
  });

  it('switches to History: derived All 3 count, no RecordFilter, and the verbatim fixture rows', async () => {
    const user = userEvent.setup();
    renderSection('po');
    await user.click(screen.getByRole('button', { name: 'History' }));

    expect(screen.getByRole('heading', { name: 'History' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'All 3' })).toBeVisible();
    expect(screen.getByText('PO issued to Nasim Facility.')).toBeVisible();
    expect(screen.getByText('24 of 40 laptops received.')).toBeVisible();
    // Unlike Request History, the prototype's `poInner` history branch never renders a RecordFilter.
    expect(screen.queryByPlaceholderText(/PC-2025-088/)).toBeNull();
  });

  it('switches to Report: inert placeholder, filter present, never a table', async () => {
    const user = userEvent.setup();
    renderSection('po');
    await user.click(screen.getByRole('button', { name: 'Report' }));

    expect(screen.getByRole('heading', { name: 'Report' })).toBeVisible();
    expect(screen.getByPlaceholderText(/PC-2025-088/)).toBeVisible();
    expect(screen.getByText('Run the report to generate results. The table will render here.')).toBeVisible();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('opens the Attach dialog seeded from the row and the matching request, with no captions/fields prefilled', async () => {
    const user = userEvent.setup();
    renderSection('po');
    const attachButtons = screen.getAllByRole('button', { name: 'Attach Purchase Order' });
    await user.click(nth(attachButtons, 0));

    const dialog = screen.getByTestId('po-attach-dialog');
    // The title also backs the dialog's sr-only accessible description, so it
    // appears twice in the DOM (visible "Subject" meta + sr-only description).
    expect(within(dialog).getAllByText('Cleaning services renewal — 24 months').length).toBeGreaterThan(0);
    expect(within(dialog).getByText('Procurement')).toBeVisible();
    expect(within(dialog).getByText('Pending CEO')).toBeVisible();
    expect(within(dialog).getByPlaceholderText('PO-2025-000')).toHaveValue('');
    expect(within(dialog).getByPlaceholderText('0.000')).toHaveValue('');
  });

  it('attaches a purchase order with a missing caption and blank PO number/actual value — no validation blocks it', async () => {
    const user = userEvent.setup();
    renderSection('po');
    await user.click(nth(screen.getAllByRole('button', { name: 'Attach Purchase Order' }), 0));

    const dialog = screen.getByTestId('po-attach-dialog');
    // The dialog renders through a Radix portal appended to `document.body`,
    // outside RTL's `container`, so the file input is queried from `document`.
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, new File(['x'], 'grn.pdf', { type: 'application/pdf' }));
    expect(within(dialog).getByPlaceholderText('Caption (required)…').parentElement).toHaveClass('border-bad');

    await user.click(within(dialog).getByRole('button', { name: 'Attach purchase order' }));
    expect(screen.queryByTestId('po-attach-dialog')).toBeNull();
  });

  it('resets every field to blank when a different row is opened, and when the same row is reopened', async () => {
    const user = userEvent.setup();
    renderSection('po');
    const attachButtons = screen.getAllByRole('button', { name: 'Attach Purchase Order' });

    await user.click(nth(attachButtons, 0));
    let dialog = screen.getByTestId('po-attach-dialog');
    await user.type(within(dialog).getByPlaceholderText('PO-2025-000'), 'PO-2025-200');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('po-attach-dialog')).toBeNull();

    // Reopening the SAME row seeds a brand-new blank object (no leaked draft).
    await user.click(nth(attachButtons, 0));
    dialog = screen.getByTestId('po-attach-dialog');
    expect(within(dialog).getByPlaceholderText('PO-2025-000')).toHaveValue('');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    // Opening a DIFFERENT row also starts blank and recaps that row's own request.
    await user.click(nth(attachButtons, 1));
    dialog = screen.getByTestId('po-attach-dialog');
    expect(within(dialog).getByPlaceholderText('PO-2025-000')).toHaveValue('');
    expect(within(dialog).getAllByText('IT hardware — 40 laptops').length).toBeGreaterThan(0);
  });

  it('dismisses via the shared Radix Dialog outside-close mechanism (Escape), without validation', async () => {
    // Same `onOpenChange` handler that closes on a real backdrop/overlay
    // pointer-down (Radix `Dialog.Overlay`, already relied on by
    // `ReviewDialog`); Escape is the established way this codebase exercises
    // that dismissal path in jsdom (see `overlay.test.tsx`).
    const user = userEvent.setup();
    renderSection('po');
    await user.click(nth(screen.getAllByRole('button', { name: 'Attach Purchase Order' }), 0));
    expect(screen.getByTestId('po-attach-dialog')).toBeVisible();

    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('po-attach-dialog')).toBeNull();
  });

  it('renders translated Arabic Purchase Order chrome in RTL', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderSection('po');

    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('link', { name: 'أمر الشراء' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'المهام' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'السجل' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'تقرير' })).toBeVisible();
  });
});

describe('M6.5 Supplier Quotations', () => {
  it('exposes the quotations route in the flat Purchasing navigation', () => {
    renderSection('quotations');
    expect(screen.getByRole('link', { name: 'Supplier Quotations' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('link')).toHaveLength(10);
  });

  it('renders exact fixtures and literal/derived counts while table tabs remain visual only', async () => {
    const user = userEvent.setup();
    renderSection('quotations');
    const table = screen.getByRole('table');
    expect(screen.getByRole('tab', { name: 'Open 4' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'All quotations 6' })).toBeVisible();
    expect(within(table).getByText('SQ-2025-311')).toBeVisible();
    expect(within(table).getByText('Gulf Facilities Services Co.')).toBeVisible();
    expect(within(table).getByText('4,250.000')).toBeVisible();
    expect(within(table).getAllByRole('button', { name: 'Add Quotation' })).toHaveLength(6);
    await user.click(screen.getByRole('tab', { name: 'All quotations 6' }));
    expect(within(table).getAllByRole('button', { name: 'Add Quotation' })).toHaveLength(6);
  });

  it('filters quotation rows and opens a freshly seeded builder', async () => {
    const user = userEvent.setup();
    renderSection('quotations');
    await user.type(screen.getByPlaceholderText(/PC-2025-088/), 'Advanced Tech');
    const table = screen.getByRole('table');
    expect(within(table).getByText('SQ-2025-309')).toBeVisible();
    expect(within(table).queryByText('SQ-2025-311')).toBeNull();
    await user.click(within(table).getByRole('button', { name: 'Add Quotation' }));
    const dialog = screen.getByTestId('add-quotation-dialog');
    expect(within(dialog).getAllByText('PC-2025-086')).toHaveLength(2);
    expect(within(dialog).getByText('Marketing')).toBeVisible();
    expect(within(dialog).getByText('6,840.000 KWD')).toBeVisible();
  });

  it('renders History with inherited PO # heading and no RecordFilter', async () => {
    const user = userEvent.setup();
    renderSection('quotations');
    await user.click(screen.getByRole('button', { name: 'History' }));
    expect(screen.getByRole('tab', { name: 'All 3' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'PO #' })).toBeVisible();
    expect(screen.getByText('Quotation received from Gulf Facilities.')).toBeVisible();
    expect(screen.queryByPlaceholderText(/PC-2025-088/)).toBeNull();
  });

  it('renders the permanent report placeholder with a filter and no table', async () => {
    const user = userEvent.setup();
    renderSection('quotations');
    await user.click(screen.getByRole('button', { name: 'Report' }));
    expect(screen.getByText('Run the report to generate results. The table will render here.')).toBeVisible();
    expect(screen.getByPlaceholderText(/PC-2025-088/)).toBeVisible();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('renders translated Arabic quotation navigation and builder in RTL', async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderSection('quotations');
    expect(screen.getByRole('link', { name: 'عروض الموردين' })).toHaveAttribute('aria-current', 'page');
    await user.click(nth(screen.getAllByRole('button', { name: 'إضافة عرض' }), 0));
    const dialog = screen.getByTestId('add-quotation-dialog');
    expect(within(dialog).getByText('إضافة عرض سعر')).toBeVisible();
    expect(within(dialog).getByRole('button', { name: 'المورّد A' })).toBeVisible();
  });
});
