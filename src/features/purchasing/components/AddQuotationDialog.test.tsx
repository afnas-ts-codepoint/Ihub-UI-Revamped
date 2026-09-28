import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { initializeI18n } from '@/shared/i18n/i18n';
import { AddQuotationDialog } from './AddQuotationDialog';

beforeAll(async () => initializeI18n('en'));
afterEach(cleanup);

const seed = {
  pcDept: 'Procurement', pcRef: 'PC-2025-088', pcStatus: 'Pending CEO', pcSubmitted: 'Apr 28',
  pcTitle: 'Cleaning services renewal — 24 months', pcValue: '94,500.000',
} as const;

describe('AddQuotationDialog', () => {
  it('starts with expanded Supplier A and exact request recap/defaults', () => {
    render(<AddQuotationDialog onClose={() => undefined} seed={seed} />);
    const dialog = screen.getByTestId('add-quotation-dialog');
    expect(within(dialog).getAllByText('PC-2025-088')).toHaveLength(2);
    expect(within(dialog).getByText('Procurement')).toBeVisible();
    expect(within(dialog).getByText('1 supplier')).toBeVisible();
    expect(within(dialog).getByRole('button', { name: 'Supplier A' })).toBeVisible();
    expect(within(dialog).getByLabelText('Currency')).toHaveValue('KWD');
    expect(within(dialog).getByLabelText('Quoted amount')).toHaveValue('');
  });

  it('implements automatic conversion and sticky per-supplier user override semantics', async () => {
    const user = userEvent.setup();
    render(<AddQuotationDialog onClose={() => undefined} seed={seed} />);
    const dialog = screen.getByTestId('add-quotation-dialog');
    const amount = within(dialog).getByLabelText('Quoted amount');
    const currency = within(dialog).getByLabelText('Currency');
    const converted = within(dialog).getByLabelText('Converted amount (KWD)');

    await user.selectOptions(currency, 'USD');
    await user.type(amount, '100');
    expect(converted).toHaveValue('30.700');

    await user.clear(converted);
    await user.type(converted, '31.111');
    await user.clear(amount);
    await user.type(amount, '200');
    await user.selectOptions(currency, 'EUR');
    expect(converted).toHaveValue('31.111');

    await user.clear(converted);
    expect(converted).toHaveValue('');
    await user.clear(amount);
    await user.type(amount, '300');
    expect(converted).toHaveValue('');
  });

  it('keeps supplier state independent and allows multiple cards to remain open', async () => {
    const user = userEvent.setup();
    render(<AddQuotationDialog onClose={() => undefined} seed={seed} />);
    const dialog = screen.getByTestId('add-quotation-dialog');
    await user.type(within(dialog).getByLabelText('Quotation name'), 'Supplier A quote');
    await user.click(within(dialog).getByRole('button', { name: /Add supplier B$/ }));
    expect(within(dialog).queryByLabelText('Quotation name')).toHaveValue('');
    await user.type(within(dialog).getByLabelText('Quotation name'), 'Supplier B quote');
    await user.click(within(dialog).getByRole('button', { name: /^Supplier A/ }));
    const names = within(dialog).getAllByLabelText('Quotation name');
    expect(names).toHaveLength(2);
    expect(names[0]).toHaveValue('Supplier A quote');
    expect(names[1]).toHaveValue('Supplier B quote');
  });

  it('ADOPTS unlimited suppliers and preserves the prototype undefined post-H letter', async () => {
    const user = userEvent.setup();
    render(<AddQuotationDialog onClose={() => undefined} seed={seed} />);
    const dialog = screen.getByTestId('add-quotation-dialog');
    for (const letter of ['B', 'C', 'D', 'E', 'F', 'G', 'H']) {
      await user.click(within(dialog).getByRole('button', { name: new RegExp(`Add supplier ${letter}$`) }));
    }
    // The H card exists and the add control remains enabled with an undefined
    // ninth letter, which React renders as no text — exactly the prototype defect.
    expect(within(dialog).getByRole('button', { name: 'Supplier H' })).toBeVisible();
    const postHAdd = within(dialog).getByRole('button', { name: /Add supplier$/ });
    expect(postHAdd).toBeEnabled();
    await user.click(postHAdd);
    expect(within(dialog).getByText('9 suppliers')).toBeVisible();
    expect(within(dialog).getByRole('button', { name: 'Supplier' })).toBeVisible();
    expect(within(dialog).getByRole('button', { name: /Add supplier$/ })).toBeEnabled();
  });

  it('reuses captioned attachments and Save closes without validation or persistence', async () => {
    const user = userEvent.setup();
    let closed = false;
    const { container } = render(<AddQuotationDialog onClose={() => { closed = true; }} seed={seed} />);
    const fileInput = container.ownerDocument.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, new File(['quote'], 'quote.pdf', { type: 'application/pdf' }));
    const dialog = screen.getByTestId('add-quotation-dialog');
    const filename = within(dialog).getByText('quote.pdf');
    expect(filename).toBeVisible();
    expect(filename.closest('div')?.querySelector('input')?.parentElement).toHaveClass('border-bad');
    await user.click(within(dialog).getByRole('button', { name: 'Save quotations' }));
    expect(closed).toBe(true);
  });
});
