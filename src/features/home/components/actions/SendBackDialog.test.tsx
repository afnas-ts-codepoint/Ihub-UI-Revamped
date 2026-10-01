import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { Toaster } from '@/shared/ui/feedback/Toaster';

import { ACTIONS } from '../../data/actions.mock';
import { useHomeQueueStore } from '../../store/homeQueue.store';
import { SendBackDialog } from './SendBackDialog';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  useHomeQueueStore.getState().reset();
  await i18n.changeLanguage('en');
});

const A5 = (() => {
  const found = ACTIONS.find((entry) => entry.id === 'A5');
  if (!found) throw new Error('Missing fixture A5');
  return found;
})();
const SEND = { name: 'Send back' };

function openDialog() {
  render(
    <>
      <SendBackDialog />
      <Toaster />
    </>,
  );
  act(() => {
    useHomeQueueStore.getState().openSendBack(A5);
  });
}

describe('SendBackDialog', () => {
  it('renders nothing until the store asks for it', () => {
    render(<SendBackDialog />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the header, the item title and the five reason categories', () => {
    openDialog();
    expect(
      screen.getByRole('dialog', { name: 'Send back to creator' }),
    ).toBeVisible();
    expect(
      screen.getByText('Budget Approval — Q3 Capex, Arcade Refresh'),
    ).toBeVisible();
    expect(screen.getByText('Reason')).toBeVisible();
    for (const label of [
      'Missing document',
      'Needs more justification',
      'Approval from CEO',
      'Invoice/price missing',
      'Other',
    ])
      expect(screen.getByRole('button', { name: label })).toBeVisible();
    expect(
      screen.getByPlaceholderText('Add details for the creator…'),
    ).toBeVisible();
  });

  it('toggles a category: clicking the active chip clears it', async () => {
    const user = userEvent.setup();
    openDialog();
    const chip = screen.getByRole('button', { name: 'Missing document' });
    await user.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Approval from CEO' }));
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: 'Approval from CEO' }));
    expect(
      screen.getByRole('button', { name: 'Approval from CEO' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('requires details when the category is Other', async () => {
    const user = userEvent.setup();
    openDialog();
    await user.click(screen.getByRole('button', { name: 'Other' }));
    expect(screen.getByRole('button', SEND)).toBeDisabled();
    await user.type(screen.getByRole('textbox'), '   ');
    expect(screen.getByRole('button', SEND)).toBeDisabled();
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Budget code missing');
    expect(screen.getByRole('button', SEND)).toBeEnabled();
    await user.click(screen.getByRole('button', SEND));

    const state = useHomeQueueStore.getState();
    expect(state.actions.some((entry) => entry.id === 'A5')).toBe(false);
    expect(state.trackedTasks[0]).toMatchObject({
      id: 'A5',
      reason: 'Other: Budget code missing',
      returned: true,
    });
    expect(state.sendbackFor).toBeNull();
    expect(state.trackPrompt).toBeNull();
    expect(
      await screen.findByText(
        'Sent back to creator · Other: Budget code missing',
      ),
    ).toBeVisible();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('joins the category and details with a colon', async () => {
    const user = userEvent.setup();
    openDialog();
    await user.click(screen.getByRole('button', { name: 'Missing document' }));
    await user.type(screen.getByRole('textbox'), 'Quote attached? No.');
    await user.click(screen.getByRole('button', SEND));
    expect(useHomeQueueStore.getState().trackedTasks[0]?.reason).toBe(
      'Missing document: Quote attached? No.',
    );
  });

  it('falls back to "No reason given" when nothing was entered', async () => {
    const user = userEvent.setup();
    openDialog();
    await user.click(screen.getByRole('button', SEND));
    expect(useHomeQueueStore.getState().trackedTasks[0]?.reason).toBe(
      'No reason given',
    );
    expect(
      await screen.findByText('Sent back to creator · No reason given'),
    ).toBeVisible();
  });

  it('stores the English category label in Arabic too, but localises the fallback', async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage('ar');
    openDialog();
    expect(screen.getByRole('dialog', { name: 'الإعادة إلى المنشئ' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'مستند ناقص' }));
    await user.click(screen.getByRole('button', { name: 'إعادة' }));
    expect(useHomeQueueStore.getState().trackedTasks[0]?.reason).toBe(
      'Missing document',
    );
    cleanup();
    useHomeQueueStore.getState().reset();
    openDialog();
    await user.click(screen.getByRole('button', { name: 'إعادة' }));
    expect(useHomeQueueStore.getState().trackedTasks[0]?.reason).toBe(
      'بدون سبب',
    );
  });

  it('Cancel closes without changing the queue', async () => {
    const user = userEvent.setup();
    openDialog();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    const state = useHomeQueueStore.getState();
    expect(state.sendbackFor).toBeNull();
    expect(state.actions).toHaveLength(10);
    expect(state.trackedTasks).toHaveLength(0);
  });

  it('Escape closes like Cancel (recorded deviation: the prototype closed on scrim click only)', async () => {
    const user = userEvent.setup();
    openDialog();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(useHomeQueueStore.getState().sendbackFor).toBeNull();
    expect(useHomeQueueStore.getState().actions).toHaveLength(10);
  });

  it('resets the category and details after closing', async () => {
    const user = userEvent.setup();
    openDialog();
    await user.click(screen.getByRole('button', { name: 'Other' }));
    await user.type(screen.getByRole('textbox'), 'draft');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    act(() => {
      useHomeQueueStore.getState().openSendBack(A5);
    });
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Other' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', SEND)).toBeEnabled();
  });
});
