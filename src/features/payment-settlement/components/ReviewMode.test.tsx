import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';

import { ActionSheetForm } from './ActionSheetForm';
import { PettyCashRequestForm } from './PettyCashRequestForm';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  vi.useRealTimers();
  await i18n.changeLanguage('en');
});

const button = (name: string | RegExp) => screen.getByRole('button', { name });
const leftColumn = () => screen.getAllByRole('combobox')[0]?.closest('.pointer-events-none');
const isReadOnly = () => screen.getAllByRole('combobox')[0]?.closest('.pointer-events-none') !== null;
const HINT = 'Preview only. Click Edit to make changes.';
const REASON_PLACEHOLDER = 'Add details for the creator…';

/** Both forms share the prototype's review/resubmit/verify behaviour. */
const forms: readonly (readonly [string, (props: Record<string, unknown>) => ReactElement, string])[] = [
  ['ActionSheetForm', (props) => <ActionSheetForm embedded {...props} />, 'Action Sheet 1'],
  ['PettyCashRequestForm', (props) => <PettyCashRequestForm {...props} />, 'Request 1'],
];

describe.each(forms)('%s review mode', (_name, renderForm, blockLabel) => {
  it('renders a blank, read-only form with the Decision card instead of the create actions', () => {
    render(renderForm({ review: true }));

    expect(screen.getByText(blockLabel)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Decision' })).toBeInTheDocument();
    expect(screen.getByText(HINT)).toBeInTheDocument();
    expect(isReadOnly()).toBe(true);
    expect(leftColumn()).toHaveClass('opacity-[0.92]');
    expect(screen.queryByRole('heading', { name: 'Actions' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Save as draft/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Combine action sheet|Add another request/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^(Create action sheet|Submit request)/ })).toBeNull();
    for (const select of screen.getAllByRole('combobox')) expect(select).toHaveValue('');
  });

  it('Approve and Reject report their decision without a reason', async () => {
    const user = userEvent.setup();
    const onDecision = vi.fn();
    render(renderForm({ onDecision, review: true }));

    await user.click(button('Approve'));
    await user.click(button('Reject'));
    expect(onDecision.mock.calls).toEqual([['approve'], ['reject']]);
  });

  it('shows Verify instead of Approve in verify mode but still reports approve', async () => {
    const user = userEvent.setup();
    const onDecision = vi.fn();
    render(renderForm({ onDecision, review: true, verify: true }));

    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    await user.click(button('Verify'));
    expect(onDecision).toHaveBeenCalledWith('approve');
  });

  it('Edit unlocks the form, hides the preview hint and toggles to Done', async () => {
    const user = userEvent.setup();
    render(renderForm({ review: true }));

    await user.click(button('Edit'));
    expect(isReadOnly()).toBe(false);
    expect(screen.queryByText(HINT)).toBeNull();
    expect(button('Done')).toBeInTheDocument();
    await user.click(button('Done'));
    expect(isReadOnly()).toBe(true);
    expect(screen.getByText(HINT)).toBeInTheDocument();
  });

  it('the send-back panel toggles and its categories toggle off on a second click', async () => {
    const user = userEvent.setup();
    render(renderForm({ review: true }));

    expect(screen.queryByText('Reason (optional)')).toBeNull();
    await user.click(button('Send back'));
    expect(screen.getByText('Reason (optional)')).toBeInTheDocument();
    for (const label of ['Missing document', 'Needs more justification', 'Approval from CEO', 'Invoice/price missing', 'Other']) {
      expect(button(label)).toHaveAttribute('aria-pressed', 'false');
    }
    await user.click(button('Approval from CEO'));
    expect(button('Approval from CEO')).toHaveAttribute('aria-pressed', 'true');
    await user.click(button('Approval from CEO'));
    expect(button('Approval from CEO')).toHaveAttribute('aria-pressed', 'false');
    await user.click(button('Send back'));
    expect(screen.queryByText('Reason (optional)')).toBeNull();
  });

  it('sends back with an empty reason when nothing is chosen', async () => {
    const user = userEvent.setup();
    const onDecision = vi.fn();
    render(renderForm({ onDecision, review: true }));

    await user.click(button('Send back'));
    await user.click(button('Confirm send back'));
    expect(onDecision).toHaveBeenCalledWith('sendback', '');
  });

  it('joins the category and details with ": " and works with details only', async () => {
    const user = userEvent.setup();
    const onDecision = vi.fn();
    render(renderForm({ onDecision, review: true }));

    await user.click(button('Send back'));
    await user.click(button('Missing document'));
    await user.type(screen.getByPlaceholderText(REASON_PLACEHOLDER), 'invoice');
    await user.click(button('Confirm send back'));
    expect(onDecision).toHaveBeenLastCalledWith('sendback', 'Missing document: invoice');

    await user.click(button('Missing document'));
    await user.click(button('Confirm send back'));
    expect(onDecision).toHaveBeenLastCalledWith('sendback', 'invoice');
  });

  it('requires details when the category is Other', async () => {
    const user = userEvent.setup();
    const onDecision = vi.fn();
    render(renderForm({ onDecision, review: true }));

    await user.click(button('Send back'));
    await user.click(button('Other'));
    expect(button('Confirm send back')).toBeDisabled();
    await user.type(screen.getByPlaceholderText(REASON_PLACEHOLDER), '   ');
    expect(button('Confirm send back')).toBeDisabled();
    await user.clear(screen.getByPlaceholderText(REASON_PLACEHOLDER));
    await user.type(screen.getByPlaceholderText(REASON_PLACEHOLDER), 'because');
    expect(button('Confirm send back')).toBeEnabled();
    await user.click(button('Confirm send back'));
    expect(onDecision).toHaveBeenCalledWith('sendback', 'Other: because');
  });

  it('resubmit mode swaps the Decision card for Resubmit, keeps the form editable and submits', async () => {
    const user = userEvent.setup();
    const onDecision = vi.fn();
    render(renderForm({ onDecision, resubmit: true, review: true }));

    expect(screen.getByRole('heading', { name: 'Resubmit' })).toBeInTheDocument();
    expect(screen.getByText('Address the reason it was returned, then resubmit for approval.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Decision' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(isReadOnly()).toBe(false);
    await user.click(button('Submit'));
    expect(onDecision).toHaveBeenCalledWith('submit');
  });

  it('keeps collapse and edit interactions working once unlocked', async () => {
    const user = userEvent.setup();
    render(renderForm({ review: true }));

    await user.click(button('Edit'));
    await user.click(button(new RegExp(blockLabel)));
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
  });

  it('renders the Arabic Decision card and reports English categories', async () => {
    const user = userEvent.setup();
    const onDecision = vi.fn();
    await i18n.changeLanguage('ar');
    render(renderForm({ onDecision, review: true, verify: true }));

    expect(screen.getByRole('heading', { name: 'القرار' })).toBeInTheDocument();
    expect(screen.getByText('معاينة فقط. اضغط تعديل لإجراء تغييرات.')).toBeInTheDocument();
    expect(button('تحقق')).toBeInTheDocument();
    await user.click(button('تعديل'));
    expect(button('تم')).toBeInTheDocument();
    await user.click(button('إعادة'));
    expect(screen.getByText('السبب (اختياري)')).toBeInTheDocument();
    await user.click(button('موافقة الرئيس التنفيذي'));
    await user.click(button('تأكيد الإعادة'));
    expect(onDecision).toHaveBeenCalledWith('sendback', 'Approval from CEO');
  });
});

describe('ActionSheetForm create mode is unchanged', () => {
  it('still shows the create actions and the combine button', () => {
    render(<ActionSheetForm embedded />);
    expect(screen.getByRole('heading', { name: 'Actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Combine action sheet' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Decision' })).toBeNull();
    expect(isReadOnly()).toBe(false);
  });

  it('renders the page title only when not embedded', () => {
    const { rerender } = render(<ActionSheetForm />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    rerender(<ActionSheetForm embedded />);
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });
});

describe('PettyCashRequestForm create mode is unchanged', () => {
  it('still shows the actions card and the add-another button', () => {
    render(<PettyCashRequestForm />);
    expect(screen.getByRole('heading', { name: 'Actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit request' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add another request' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Decision' })).toBeNull();
    expect(isReadOnly()).toBe(false);
  });

  it('adds a second request in create mode', async () => {
    const user = userEvent.setup();
    render(<PettyCashRequestForm />);
    await user.click(button('Add another request'));
    expect(within(document.body).getByText('Request 2')).toBeInTheDocument();
  });
});
