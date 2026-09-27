import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { initializeI18n } from '@/shared/i18n/i18n';

import { PoAttachDialog } from './PoAttachDialog';
import type { PoAttachSeed } from '../types/purchasing.types';

beforeAll(async () => initializeI18n('en'));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const seed: PoAttachSeed = {
  pcDept: 'Procurement',
  pcRef: 'PC-2025-088',
  pcStatus: 'Pending CEO',
  pcTitle: 'Cleaning services renewal — 24 months',
  pcValue: '94,500.000',
  po: 'PO-2025-142',
  supplier: 'Nasim Facility',
};

describe('PoAttachDialog', () => {
  it('recaps the seeded request details as read-only', () => {
    const onClose = vi.fn();
    render(<PoAttachDialog onClose={onClose} seed={seed} />);
    const dialog = screen.getByTestId('po-attach-dialog');

    expect(within(dialog).getAllByText('Attach Purchase Order').length).toBeGreaterThan(0);
    expect(within(dialog).getByText('Against approved request')).toBeVisible();
    expect(within(dialog).getByText('Read only')).toBeVisible();
    expect(within(dialog).getAllByText('PC-2025-088').length).toBeGreaterThan(0);
    expect(within(dialog).getByText('Nasim Facility')).toBeVisible();
    expect(within(dialog).getByText('Procurement')).toBeVisible();
    expect(within(dialog).getByText('94,500.000 KWD')).toBeVisible();
    expect(within(dialog).getByText('Pending CEO')).toBeVisible();
    // The title also backs the dialog's sr-only accessible description, so it
    // appears twice in the DOM (visible "Subject" meta + sr-only description).
    expect(within(dialog).getAllByText('Cleaning services renewal — 24 months').length).toBeGreaterThan(0);
  });

  it('starts every editable field blank', () => {
    render(<PoAttachDialog onClose={vi.fn()} seed={seed} />);
    expect(screen.getByPlaceholderText('PO-2025-000')).toHaveValue('');
    expect(screen.getByPlaceholderText('0.000')).toHaveValue('');
    expect(screen.getByPlaceholderText(/Who authorised this PO/)).toHaveValue('');
    expect(screen.queryByPlaceholderText('Caption (required)…')).toBeNull();
  });

  it('lets the PO number, actual value, and remarks fields be edited', async () => {
    const user = userEvent.setup();
    render(<PoAttachDialog onClose={vi.fn()} seed={seed} />);

    await user.type(screen.getByPlaceholderText('PO-2025-000'), 'PO-2025-200');
    await user.type(screen.getByPlaceholderText('0.000'), '95,100.000');
    await user.type(screen.getByPlaceholderText(/Who authorised this PO/), 'Authorised by CFO.');

    expect(screen.getByPlaceholderText('PO-2025-000')).toHaveValue('PO-2025-200');
    expect(screen.getByPlaceholderText('0.000')).toHaveValue('95,100.000');
    expect(screen.getByPlaceholderText(/Who authorised this PO/)).toHaveValue('Authorised by CFO.');
  });

  it('adds a file via the picker and highlights its missing caption', async () => {
    const user = userEvent.setup();
    render(<PoAttachDialog onClose={vi.fn()} seed={seed} />);
    // The dialog renders through a Radix portal appended to `document.body`,
    // outside RTL's `container`, so the file input is queried from `document`.
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(fileInput, new File(['x'], 'quote.pdf', { type: 'application/pdf' }));

    expect(screen.getByText('quote.pdf')).toBeVisible();
    const captionInput = screen.getByPlaceholderText('Caption (required)…');
    expect(captionInput.parentElement).toHaveClass('border-bad');

    await user.type(captionInput, 'Vendor quotation');
    expect(captionInput.parentElement).toHaveClass('border-line');
  });

  it('removes an attachment from the list', async () => {
    const user = userEvent.setup();
    render(<PoAttachDialog onClose={vi.fn()} seed={seed} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, new File(['x'], 'quote.pdf', { type: 'application/pdf' }));
    expect(screen.getByText('quote.pdf')).toBeVisible();

    const row = screen.getByText('quote.pdf').closest('div') as HTMLElement;
    await user.click(within(row).getByRole('button'));

    expect(screen.queryByText('quote.pdf')).toBeNull();
  });

  it('closes with no validation when Attach is clicked despite missing caption and blank fields', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PoAttachDialog onClose={onClose} seed={seed} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, new File(['x'], 'quote.pdf', { type: 'application/pdf' }));

    // PO number, actual value and remarks are all still blank, and the
    // caption is still missing — none of this may block Attach.
    await user.click(screen.getByRole('button', { name: 'Attach purchase order' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByPlaceholderText('PO-2025-000')).toHaveValue('');
  });

  it('closes with no validation when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PoAttachDialog onClose={onClose} seed={seed} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes via the header close (×) control', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PoAttachDialog onClose={onClose} seed={seed} />);
    const dialog = screen.getByTestId('po-attach-dialog');
    const closeButtons = within(dialog).getAllByRole('button');
    const firstButton = closeButtons[0];
    if (!firstButton) throw new Error('Expected at least one button in the dialog');
    // The first button in the header is the icon-only × close control.
    await user.click(firstButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders translated Arabic copy', async () => {
    const { i18n } = await import('@/shared/i18n/i18n');
    await i18n.changeLanguage('ar');
    render(<PoAttachDialog onClose={vi.fn()} seed={seed} />);

    expect(screen.getAllByText('إرفاق أمر الشراء').length).toBeGreaterThan(0);
    expect(screen.getByText('مقابل الطلب المعتمد')).toBeVisible();
    expect(screen.getByRole('button', { name: 'إلغاء' })).toBeVisible();
    await i18n.changeLanguage('en');
  });
});
