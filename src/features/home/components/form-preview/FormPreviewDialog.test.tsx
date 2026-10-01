import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { toast } from '@/shared/ui/feedback/Toaster';

import { useHomeQueueStore } from '../../store/homeQueue.store';
import type { QueueAction } from '../../types/queue.types';
import { FormPreviewDialog } from './FormPreviewDialog';

vi.mock('@/shared/ui/feedback/Toaster', () => ({ toast: vi.fn() }));

beforeAll(async () => initializeI18n('en'));
beforeEach(() => {
  vi.mocked(toast).mockClear();
});
afterEach(async () => {
  cleanup();
  act(() => {
    useHomeQueueStore.getState().reset();
  });
  await i18n.changeLanguage('en');
});

const store = () => useHomeQueueStore.getState();

function action(id: string): QueueAction {
  const found = store().actions.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing fixture ${id}`);
  return found;
}

/** Opens through the real router (`openDrawer`), as the cards do. */
const open = (id: string, verify = false) => {
  act(() => {
    store().openDrawer('action', action(id), verify);
  });
};
const openCreator = (item: QueueAction) => {
  act(() => {
    store().openFormModal(item, { creator: true });
  });
};

const button = (name: string | RegExp) => screen.getByRole('button', { name });
const dialog = () => screen.getByRole('dialog');
const toastText = () => String(vi.mocked(toast).mock.calls.at(-1)?.[0]);
const scrim = () => {
  const element = document.querySelector('[class*="z-[400]"]');
  if (!element) throw new Error('Missing dialog scrim');
  return element;
};

describe('FormPreviewDialog chrome', () => {
  it('renders nothing while no form modal is open', () => {
    render(<FormPreviewDialog />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the item id and title in the header and no footer', () => {
    render(<FormPreviewDialog />);
    open('A3');

    expect(dialog()).toHaveAccessibleName(action('A3').title);
    expect(within(dialog()).getByText('A3')).toHaveClass('text-accent');
    expect(within(dialog()).getByText(action('A3').title)).toHaveClass('truncate');
    expect(within(dialog()).queryByRole('contentinfo')).toBeNull();
    expect(button('Close')).toBeInTheDocument();
  });

  it('closes with the X button, Escape and the scrim', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);

    open('A1');
    await user.click(button('Close'));
    expect(store().formModal).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();

    open('A1');
    await user.keyboard('{Escape}');
    expect(store().formModal).toBeNull();

    open('A1');
    await user.click(scrim());
    expect(store().formModal).toBeNull();
    expect(toast).not.toHaveBeenCalled();
  });

  it('is wider and top-aligned like the prototype', () => {
    render(<FormPreviewDialog />);
    open('A1');
    expect(dialog().className).toContain('w-[min(1080px,calc(100%-32px))]');
    expect(dialog().className).toContain('max-h-[94vh]');
    expect(dialog().className).toContain('top-[3vh]');
    expect(dialog().className).toContain('translate-y-0');
  });
});

describe('FormPreviewDialog, budget summary (A1, A5, A10)', () => {
  it.each(['A1', 'A5', 'A10'])('shows the summary card for %s', (id) => {
    render(<FormPreviewDialog />);
    open(id);
    const item = action(id);
    const body = within(dialog());

    expect(body.getByText('Why this needs you')).toBeInTheDocument();
    expect(body.getByText(item.reason)).toBeInTheDocument();
    expect(body.getByText('Request owner')).toBeInTheDocument();
    expect(body.getByText(item.owner)).toBeInTheDocument();
    expect(body.getByText(item.dept)).toBeInTheDocument();
    expect(body.getByText(item.amount)).toBeInTheDocument();
    expect(body.getByText(item.status)).toBeInTheDocument();
    // The impact card carries no heading in the Form Preview, unlike the drawer.
    expect(body.getByText(item.impact)).toBeInTheDocument();
    expect(body.queryByText('Financial & operational impact')).toBeNull();
    expect(body.queryByText('Attachments')).toBeNull();
    expect(body.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(body.getByRole('button', { name: 'Send back' })).toBeInTheDocument();
    expect(body.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  it('falls back to a dash for missing fields (returned stubs)', () => {
    render(<FormPreviewDialog />);
    act(() => {
      store().openFormModal({ ...action('A1'), amount: '', dept: '', impact: '', owner: '', status: '' });
    });
    expect(within(dialog()).getAllByText('—')).toHaveLength(4);
  });

  it('labels the primary button Verify in verify mode', () => {
    render(<FormPreviewDialog />);
    open('A5', true);
    expect(within(dialog()).queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(button('Verify')).toBeInTheDocument();
  });

  it('Approve approves, closes the modal, prompts to track and toasts', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);
    open('A1');

    await user.click(button('Approve'));
    expect(store().actions.some((entry) => entry.id === 'A1')).toBe(false);
    expect(store().formModal).toBeNull();
    expect(store().trackPrompt?.id).toBe('A1');
    expect(toastText()).toContain('Release funds');
  });

  it('Reject rejects and closes without a track prompt', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);
    open('A5');

    await user.click(button('Reject'));
    expect(store().actions.some((entry) => entry.id === 'A5')).toBe(false);
    expect(store().formModal).toBeNull();
    expect(store().trackPrompt).toBeNull();
    expect(store().rejectedFeed.map((entry) => entry.id)).toEqual(['A5']);
    expect(toastText()).toContain('owner notified');
  });

  it('Send back closes the modal and asks for a reason through the send-back dialog state', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);
    open('A10');

    await user.click(button('Send back'));
    expect(store().formModal).toBeNull();
    expect(store().sendbackFor?.id).toBe('A10');
    // The item stays queued until a reason is submitted.
    expect(store().actions.some((entry) => entry.id === 'A10')).toBe(true);
    expect(toast).not.toHaveBeenCalled();
  });
});

describe('FormPreviewDialog, embedded action-sheet form (A3)', () => {
  it('renders the blank embedded review form with the Decision card', () => {
    render(<FormPreviewDialog />);
    open('A3');
    const body = within(dialog());

    // Embedded: no page <h1>, one blank "Action Sheet 1" block, nothing prefilled from the item.
    expect(body.queryByRole('heading', { level: 1 })).toBeNull();
    expect(body.getByText('Action Sheet 1')).toBeInTheDocument();
    expect(body.queryByText(/Action Sheet 2/)).toBeNull();
    for (const select of body.getAllByRole('combobox')) expect(select).toHaveValue('');
    expect(body.queryByText(action('A3').owner)).toBeNull();
    // Review layout: no create actions.
    expect(body.queryByRole('button', { name: /Create action sheet/ })).toBeNull();
    expect(body.queryByRole('button', { name: 'Combine action sheet' })).toBeNull();
    expect(body.getByRole('heading', { name: 'Decision' })).toBeInTheDocument();
    expect(body.getByText('Preview only. Click Edit to make changes.')).toBeInTheDocument();
    expect(body.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  });

  it('keeps the form read-only until Edit and offers Verify in verify mode', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);
    open('A3', true);

    expect(button('Verify')).toBeInTheDocument();
    const select = within(dialog()).getAllByRole('combobox')[0];
    if (!select) throw new Error('Missing select');
    const leftColumn = select.closest('.opacity-\\[0\\.92\\]');
    expect(leftColumn).toHaveClass('pointer-events-none');

    await user.click(button('Edit'));
    expect(within(dialog()).queryByText('Preview only. Click Edit to make changes.')).toBeNull();
    expect(select.closest('.pointer-events-none')).toBeNull();
    await user.click(button('Done'));
    expect(select.closest('.pointer-events-none')).not.toBeNull();
  });

  it('Approve approves the item, closes and prompts to track', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);
    open('A3');

    await user.click(button('Approve'));
    expect(store().actions.some((entry) => entry.id === 'A3')).toBe(false);
    expect(store().formModal).toBeNull();
    expect(store().trackPrompt?.id).toBe('A3');
    expect(toastText()).toContain('removed from queue');
  });

  it('Reject rejects and closes', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);
    open('A3');

    await user.click(button('Reject'));
    expect(store().actions.some((entry) => entry.id === 'A3')).toBe(false);
    expect(store().formModal).toBeNull();
    expect(store().trackPrompt).toBeNull();
    expect(store().rejectedFeed.map((entry) => entry.id)).toEqual(['A3']);
  });

  it('Send back with no reason returns the item without opening the send-back dialog', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);
    open('A3');

    await user.click(button('Send back'));
    await user.click(button('Confirm send back'));
    expect(store().actions.some((entry) => entry.id === 'A3')).toBe(false);
    expect(store().sendbackFor).toBeNull();
    expect(store().formModal).toBeNull();
    expect(store().trackedTasks[0]).toMatchObject({ id: 'A3', kind: 'action-sheet', reason: '', returned: true });
    expect(store().trackedTasks[0]?.when).toBeUndefined();
    expect(toastText()).toBe('Sent back to creator');
  });

  it('Send back with a category and details reports "Category: details"', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);
    open('A3');

    await user.click(button('Send back'));
    await user.click(button('Missing document'));
    await user.type(screen.getByPlaceholderText('Add details for the creator…'), 'x');
    await user.click(button('Confirm send back'));
    expect(store().trackedTasks[0]).toMatchObject({
      id: 'A3',
      reason: 'Missing document: x',
      returned: true,
      when: 'Missing document: x',
    });
    expect(store().actions.some((entry) => entry.id === 'A3')).toBe(false);
    expect(store().sendbackFor).toBeNull();
    expect(toastText()).toContain('Missing document: x');
  });

  it('resubmit mode (creator) submits: clears the tracker row and leaves the queue untouched', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);
    const a3 = action('A3');
    act(() => {
      store().actOnAction('sendback', a3, 'Missing document');
    });
    expect(store().trackedTasks.map((task) => task.id)).toEqual(['A3']);
    const queueBefore = store().actions;

    openCreator(a3);
    const body = within(dialog());
    expect(body.getByRole('heading', { name: 'Resubmit' })).toBeInTheDocument();
    expect(body.queryByRole('heading', { name: 'Decision' })).toBeNull();
    // Resubmit mode keeps the form editable.
    const select = body.getAllByRole('combobox')[0];
    expect(select?.closest('.pointer-events-none')).toBeNull();

    await user.click(button('Submit'));
    expect(store().trackedTasks).toHaveLength(0);
    expect(store().formModal).toBeNull();
    expect(store().actions).toBe(queueBefore);
    expect(toastText()).toBe('Resubmitted for approval');
  });
});

describe('FormPreviewDialog, embedded petty-cash form (A4)', () => {
  it('renders the blank petty-cash request review form', () => {
    render(<FormPreviewDialog />);
    open('A4');
    const body = within(dialog());

    expect(dialog()).toHaveAccessibleName(action('A4').title);
    expect(body.getByRole('heading', { name: 'Petty Cash Request' })).toBeInTheDocument();
    expect(body.getByText('Request 1')).toBeInTheDocument();
    expect(body.queryByText('Request 2')).toBeNull();
    expect(body.queryByRole('button', { name: 'Add another request' })).toBeNull();
    expect(body.queryByRole('button', { name: 'Submit request' })).toBeNull();
    expect(body.getByRole('heading', { name: 'Decision' })).toBeInTheDocument();
    for (const select of body.getAllByRole('combobox')) expect(select).toHaveValue('');
  });

  it('Approve approves and prompts to track; verify mode relabels it', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);
    open('A4', true);

    await user.click(button('Verify'));
    expect(store().actions.some((entry) => entry.id === 'A4')).toBe(false);
    expect(store().formModal).toBeNull();
    expect(store().trackPrompt?.id).toBe('A4');
  });

  it('Reject and Send back drive the store like the action-sheet form', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);
    open('A4');
    await user.click(button('Reject'));
    expect(store().rejectedFeed.map((entry) => entry.id)).toEqual(['A4']);
    expect(store().formModal).toBeNull();

    open('A9');
    await user.click(button('Send back'));
    await user.click(button('Other'));
    expect(button('Confirm send back')).toBeDisabled();
    await user.type(screen.getByPlaceholderText('Add details for the creator…'), 'why');
    await user.click(button('Confirm send back'));
    expect(store().trackedTasks[0]).toMatchObject({ id: 'A9', reason: 'Other: why', returned: true });
  });

  it('resubmit mode shows the Resubmit card and clears the tracker row', async () => {
    const user = userEvent.setup();
    render(<FormPreviewDialog />);
    const a4 = action('A4');
    act(() => {
      store().actOnAction('sendback', a4, '');
    });

    openCreator(a4);
    expect(within(dialog()).getByRole('heading', { name: 'Resubmit' })).toBeInTheDocument();
    await user.click(button('Submit'));
    expect(store().trackedTasks).toHaveLength(0);
    expect(store().formModal).toBeNull();
    expect(toastText()).toBe('Resubmitted for approval');
  });
});

describe('FormPreviewDialog, Arabic', () => {
  it('renders the Arabic summary labels', async () => {
    await i18n.changeLanguage('ar');
    render(<FormPreviewDialog />);
    open('A1');
    const body = within(dialog());

    expect(body.getByText('لماذا يحتاجك')).toBeInTheDocument();
    expect(body.getByText('مالك الطلب')).toBeInTheDocument();
    expect(body.getByRole('button', { name: 'موافقة' })).toBeInTheDocument();
    expect(body.getByRole('button', { name: 'إعادة' })).toBeInTheDocument();
    expect(body.getByRole('button', { name: 'رفض' })).toBeInTheDocument();
    // Hard-coded English in the prototype.
    expect(body.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('keeps the English category in the sent-back reason while chips are Arabic', async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage('ar');
    render(<FormPreviewDialog />);
    open('A3');

    await user.click(button('إعادة'));
    await user.click(button('مستند ناقص'));
    await user.click(button('تأكيد الإعادة'));
    await waitFor(() => {
      expect(store().trackedTasks[0]?.reason).toBe('Missing document');
    });
  });
});
