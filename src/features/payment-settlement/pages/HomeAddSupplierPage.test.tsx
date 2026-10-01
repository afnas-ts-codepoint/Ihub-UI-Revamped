import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';

import { HomePaymentSettlementPage } from './HomePaymentSettlementPage';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

const renderAddSupplier = () =>
  render(
    <MemoryRouter initialEntries={['/home/payment-settlement/add-supplier']}>
      <HomePaymentSettlementPage module="add-supplier" />
    </MemoryRouter>,
  );

const pdf = (name: string) => new File(['x'], name, { type: 'application/pdf' });
const fileInput = () => {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('Expected the attachment file input');
  return input;
};

function nth<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`Expected an item at index ${String(index)}`);
  return item;
}

describe('HomePaymentSettlementPage — Add a Supplier (M6.8)', () => {
  it('replaces the pending placeholder and shows the four cards with the embedded layout (no page title of its own)', () => {
    renderAddSupplier();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('link', { name: 'Add a Supplier' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    for (const name of ['Supplier details', 'Banking', 'Attachments', 'Actions']) {
      expect(screen.getByRole('heading', { name })).toBeVisible();
    }
  });

  it('renders every prototype field with its label and placeholder', () => {
    renderAddSupplier();
    expect(screen.getByLabelText('Supplier name')).toHaveAttribute('placeholder', 'Full name');
    expect(screen.getByLabelText('Supplier Company')).toHaveAttribute('placeholder', 'e.g. Gulf Facilities Services Co.');
    expect(screen.getByLabelText('Supplier tel / fax')).toHaveAttribute('placeholder', '+965 …');
    expect(screen.getByLabelText('Supplier mobile')).toHaveAttribute('placeholder', '+965 …');
    expect(screen.getByLabelText('Supplier email')).toHaveAttribute('type', 'email');
    // The prototype's date inputs render as the branded calendar field ("Any date"), not a native date input.
    expect(screen.getByRole('button', { name: 'Tax validity from' })).toHaveTextContent('Any date');
    expect(screen.getByRole('button', { name: 'Tax validity to' })).toHaveTextContent('Any date');
    expect(screen.getByLabelText('Supplier address').tagName).toBe('TEXTAREA');
    expect(screen.getByLabelText('Bank name')).toHaveAttribute('placeholder', 'e.g. NBK');
    expect(screen.getByLabelText('Branch')).toHaveAttribute('placeholder', 'Branch name');
    expect(screen.getByLabelText('Account number')).toHaveAttribute('placeholder', '—');
    expect(screen.getByLabelText('IBAN')).toHaveAttribute('placeholder', 'KW…');
  });

  it('adds a supplier from a completely empty form (no field is validated) and clears the flash after 2.6 s', () => {
    vi.useFakeTimers();
    renderAddSupplier();
    act(() => { screen.getByRole('button', { name: 'Add supplier' }).click(); });
    expect(screen.getByRole('status')).toHaveTextContent('Supplier added');
    act(() => { vi.advanceTimersByTime(2599); });
    expect(screen.getByRole('status')).toBeVisible();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('keeps entered values after submit (nothing is reset or persisted)', async () => {
    const user = userEvent.setup();
    renderAddSupplier();
    await user.type(screen.getByLabelText('Supplier name'), 'Acme');
    await user.click(screen.getByRole('button', { name: 'Add supplier' }));
    expect(screen.getByLabelText('Supplier name')).toHaveValue('Acme');
  });

  it('gates only on attachment captions: a blank or whitespace caption errors for 3 s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderAddSupplier();
    await user.upload(fileInput(), pdf('licence.pdf'));
    expect(screen.getByText('licence.pdf')).toBeVisible();
    const caption = screen.getByPlaceholderText('Caption (required)…');
    expect(caption).toHaveClass('!border-bad');
    await user.click(screen.getByRole('button', { name: 'Add supplier' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Every attachment needs a caption.');
    expect(screen.queryByRole('status')).toBeNull();
    await user.type(caption, '   ');
    await user.click(screen.getByRole('button', { name: 'Add supplier' }));
    expect(screen.getByRole('alert')).toBeVisible();
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('submits once every attachment has a caption and supports removing attachments', async () => {
    const user = userEvent.setup();
    renderAddSupplier();
    await user.upload(fileInput(), [pdf('a.pdf'), pdf('b.pdf')]);
    expect(screen.getAllByPlaceholderText('Caption (required)…')).toHaveLength(2);
    await user.click(nth(screen.getAllByRole('button', { name: 'Remove attachment' }), 1));
    expect(screen.queryByText('b.pdf')).toBeNull();
    await user.type(screen.getByPlaceholderText('Caption (required)…'), 'Trade licence');
    await user.click(screen.getByRole('button', { name: 'Add supplier' }));
    expect(screen.getByRole('status')).toHaveTextContent('Supplier added');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('leaves Save as draft inert (PROTOTYPE-NOOP D2)', async () => {
    const user = userEvent.setup();
    renderAddSupplier();
    await user.click(screen.getByRole('button', { name: 'Save as draft' }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('keeps the click-only upload copy (the prototype has no drag-and-drop handlers)', () => {
    renderAddSupplier();
    expect(screen.getByText('Click to upload or drag and drop')).toBeVisible();
    expect(screen.getByText('PDF, Images, Documents (Max 10MB each)')).toBeVisible();
  });

  it('renders translated Arabic chrome', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderAddSupplier();
    expect(screen.getByRole('heading', { name: 'بيانات المورّد' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'البيانات البنكية' })).toBeVisible();
    expect(screen.getByLabelText('شركة المورّد')).toHaveAttribute('placeholder', 'مثال: شركة الخليج للخدمات');
    expect(screen.getByRole('button', { name: 'إضافة المورّد' })).toBeVisible();
  });
});
