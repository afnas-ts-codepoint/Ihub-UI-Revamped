import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';

import { PettyCashRequestForm } from '../components/PettyCashRequestForm';
import { pettyCashMatchRow, pettyCashRowsF } from '../domain/pettyCashMatchRow';
import { formatPettyCashKwd, pettyCashTotal } from '../domain/pettyCashFinancials';
import { subActivitiesOrAll, subActivityNames } from '../domain/activityMaster';
import { pettyCashEditRows, pettyCashHistoryRows, pettyCashListingRows } from '../data/pettyCash.mock';
import { createEmptyRecordFilter } from '@/features/organization';
import { HomePaymentSettlementPage } from './HomePaymentSettlementPage';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

const renderPettyCash = () =>
  render(
    <MemoryRouter initialEntries={['/home/payment-settlement/petty-cash']}>
      <HomePaymentSettlementPage module="petty-cash" />
    </MemoryRouter>,
  );

function nth<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`Expected an item at index ${String(index)}`);
  return item;
}

const topTab = (name: string) => screen.getByRole('button', { name, pressed: undefined });

describe('Petty Cash domain', () => {
  it('pcMatch searches id/employee/dept/status/action/by/note and skips absent dept/status fields', () => {
    const filter = { ...createEmptyRecordFilter(), num: ' haddad ' };
    expect(pettyCashMatchRow(nth(pettyCashListingRows, 0), filter)).toBe(true);
    expect(pettyCashMatchRow(nth(pettyCashListingRows, 1), filter)).toBe(false);
    // History rows have no dept/status: a dept/status filter must not exclude them.
    const scoped = { ...createEmptyRecordFilter(), dept: 'Finance', status: 'Approved' };
    expect(pettyCashRowsF(pettyCashHistoryRows, scoped)).toHaveLength(pettyCashHistoryRows.length);
    expect(pettyCashRowsF(pettyCashEditRows, { ...createEmptyRecordFilter(), dept: 'HR' }).map((row) => row.id)).toEqual(['PCR-0420']);
  });

  it('formats KWD to three decimals and totals only numeric amounts', () => {
    expect(formatPettyCashKwd(0)).toBe('KWD 0.000');
    expect(formatPettyCashKwd(1234.5)).toBe('KWD 1,234.500');
    expect(pettyCashTotal([{ amount: '10.25' }, { amount: '' }, { amount: 'x' }, { amount: '5' }])).toBe(15.25);
  });

  it('SUBS_OF falls back to every sub-activity when no activity is chosen', () => {
    expect(subActivitiesOrAll('')).toEqual(subActivityNames());
    expect(subActivitiesOrAll('Facilities & Maintenance')).toEqual(['Planned maintenance', 'Reactive repairs', 'Refurbishment']);
  });
});

describe('HomePaymentSettlementPage — Petty Cash (M6.7)', () => {
  it('replaces the pending placeholder and opens on Request → Petty Cash Request', () => {
    renderPettyCash();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('link', { name: 'Petty Cash' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'Petty Cash Request' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Request Petty Cash' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Submit request' })).toBeVisible();
  });

  it('renders Request → Edit with the editable fixture and an inert Edit action', async () => {
    const user = userEvent.setup();
    renderPettyCash();
    await user.click(screen.getByRole('button', { name: 'Edit Petty Cash' }));
    const table = screen.getByRole('table');
    expect(within(table).getByText('PCR-0417')).toBeVisible();
    expect(within(table).getByText('55.000')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Editable 3' })).toBeVisible();
    await user.click(nth(within(table).getAllByRole('button', { name: 'Edit' }), 0));
    expect(screen.getByRole('heading', { name: 'Edit Petty Cash' })).toBeVisible();
  });

  it('renders Request → History and filters it through the shared filter', async () => {
    const user = userEvent.setup();
    renderPettyCash();
    await user.click(screen.getByRole('button', { name: 'History' }));
    const table = screen.getByRole('table');
    expect(within(table).getByText('Receipt missing — resubmit.')).toBeVisible();
    await user.type(screen.getByPlaceholderText(/REC-2026000/), 'finance');
    expect(within(table).getByText('PCR-0417')).toBeVisible();
    expect(within(table).queryByText('PCR-0421')).toBeNull();
  });

  it('shares one filter across listings and keeps the Reimburse tab counts literal', async () => {
    const user = userEvent.setup();
    renderPettyCash();
    await user.click(screen.getByRole('button', { name: 'Edit Petty Cash' }));
    await user.type(screen.getByPlaceholderText(/PC-2025-088/), 'salem');

    await user.click(topTab('Reimburse Petty Cash'));
    await user.click(screen.getByRole('button', { name: 'Petty Cash Listing' }));
    // Filter state survives the Request → Reimburse tab switch.
    expect(screen.getByPlaceholderText(/PC-2025-088/)).toHaveValue('salem');
    const table = screen.getByRole('table');
    expect(within(table).getByText('PCR-0420')).toBeVisible();
    expect(within(table).queryByText('PCR-0421')).toBeNull();
    // Literal counts ignore the filter.
    expect(screen.getByRole('tab', { name: 'Pending 2' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'All 134' })).toBeVisible();
  });

  it('Reimburse listing row action only switches to the Reimburse Request sub-tab', async () => {
    const user = userEvent.setup();
    renderPettyCash();
    await user.click(topTab('Reimburse Petty Cash'));
    await user.click(screen.getByRole('button', { name: 'Petty Cash Listing' }));
    await user.click(nth(within(screen.getByRole('table')).getAllByRole('button', { name: 'Reimburse Request' }), 0));
    expect(screen.getByRole('heading', { name: 'Reimburse Petty Cash Request' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Submit reimbursement' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Reimburse Petty Cash Request' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders Reimburse → Edit and History', async () => {
    const user = userEvent.setup();
    renderPettyCash();
    await user.click(topTab('Reimburse Petty Cash'));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByText('Select a reimbursement to edit.')).toBeVisible();
    expect(within(screen.getByRole('table')).getByText('PCR-0421')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'History' }));
    expect(screen.getByText('Full activity trail across reimbursements.')).toBeVisible();
  });

  it('Settle renders literal statuses and ignores the shared filter, with inert Settle Request', async () => {
    const user = userEvent.setup();
    renderPettyCash();
    await user.click(topTab('Settle Petty Cash'));
    const table = screen.getByRole('table');
    expect(within(table).getAllByText('To settle')).toHaveLength(2);
    expect(within(table).getByText('Settled')).toBeVisible();
    expect(within(table).getByText('0.000')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'To settle 2' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'All 58' })).toBeVisible();

    await user.type(screen.getByPlaceholderText(/PC-2025-088/), 'no-such-record');
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(4); // header + 3 unfiltered rows
    expect(within(table).getByText('PCF-0205')).toBeVisible();

    await user.click(nth(within(table).getAllByRole('button', { name: 'Settle Request' }), 0));
    expect(screen.getByRole('heading', { name: 'Settle Petty Cash' })).toBeVisible();
  });

  it('request form: an empty Submit succeeds and the flash clears after 2.8s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    renderPettyCash();
    await user.click(screen.getByRole('button', { name: 'Submit request' }));
    expect(screen.getByText('Petty cash request submitted')).toBeVisible();
    act(() => { vi.advanceTimersByTime(2700); });
    expect(screen.getByText('Petty cash request submitted')).toBeVisible();
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByText('Petty cash request submitted')).toBeNull();
  });

  it('request form: combines requests, totals amounts, and gates Submit only on attachment captions (3s error flash)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    const { container } = renderPettyCash();

    await user.click(screen.getByRole('button', { name: 'Add another request' }));
    expect(screen.getByText('Request 2')).toBeVisible();
    expect(screen.getByText('2 requests')).toBeVisible();

    const amounts = screen.getAllByPlaceholderText('0.000');
    await user.type(nth(amounts, 0), '10.5');
    await user.type(nth(amounts, 1), '4');
    expect(screen.getAllByText('KWD 14.500').length).toBeGreaterThan(0);

    const fileInputs = container.querySelectorAll('input[type="file"]');
    await user.upload(fileInputs[0] as HTMLInputElement, new File(['x'], 'receipt.pdf', { type: 'application/pdf' }));
    await user.click(screen.getByRole('button', { name: 'Submit request' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Every attachment needs a caption.');
    act(() => { vi.advanceTimersByTime(3100); });
    expect(screen.queryByRole('alert')).toBeNull();

    await user.type(screen.getByPlaceholderText('Caption (required)…'), 'Receipt');
    await user.click(screen.getByRole('button', { name: 'Submit request' }));
    expect(screen.getByText('Petty cash requests submitted')).toBeVisible();
  });

  it('request form: Save as draft is inert and a single request cannot be removed', async () => {
    const user = userEvent.setup();
    renderPettyCash();
    expect(screen.queryByRole('button', { name: /Remove request/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Save as draft' }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Add another request' }));
    await user.click(screen.getByRole('button', { name: 'Remove request 2' }));
    expect(screen.queryByText('Request 2')).toBeNull();
  });

  it('request form exposes no review/decision UI in create mode (dead branches not ported)', () => {
    render(<PettyCashRequestForm />);
    expect(screen.queryByText('Decision')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Send back' })).toBeNull();
    expect(screen.getByText('Total amount')).toBeVisible();
  });

  it('reimburse form: extra fields, full sub-activity fallback, no reset on activity change, submit copy', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    renderPettyCash();
    await user.click(topTab('Reimburse Petty Cash'));

    expect(screen.getByText('Invoice #')).toBeVisible();
    expect(screen.getByText('Total Petty Cash')).toBeVisible();
    const subSelect = screen.getByRole('combobox', { name: /Sub Activity/ });
    const allSubs = subActivityNames();
    expect(within(subSelect).getAllByRole('option')).toHaveLength(allSubs.length + 1);

    await user.selectOptions(subSelect, 'Refurbishment');
    await user.selectOptions(screen.getByRole('combobox', { name: /^Activity/ }), 'Marketing & Campaigns');
    // The stale value is kept in state (no reset) but has no matching option, so the control shows the placeholder...
    expect(subSelect).toHaveValue('');
    // ...and it reappears once the owning activity is selected again.
    await user.selectOptions(screen.getByRole('combobox', { name: /^Activity/ }), 'Facilities & Maintenance');
    expect(subSelect).toHaveValue('Refurbishment');

    await user.click(screen.getByRole('button', { name: 'Submit reimbursement' }));
    expect(screen.getByText('Reimbursement request submitted')).toBeVisible();
    act(() => { vi.advanceTimersByTime(2900); });
    expect(screen.queryByText('Reimbursement request submitted')).toBeNull();
  });

  it('renders translated Arabic Petty Cash chrome in RTL', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderPettyCash();
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('link', { name: 'النثرية' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'تسوية النثرية' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'طلب نثرية' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'إرسال الطلب' })).toBeVisible();
  });
});
