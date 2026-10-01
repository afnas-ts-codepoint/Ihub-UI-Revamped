import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { Toaster } from '@/shared/ui/feedback/Toaster';

import { ACTIONS } from '../../data/actions.mock';
import { useHomeQueueStore } from '../../store/homeQueue.store';
import { TrackPromptDialog } from './TrackPromptDialog';

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

/** A single approve is the only thing that raises the prompt. */
function approveA5() {
  render(
    <>
      <TrackPromptDialog />
      <Toaster />
    </>,
  );
  act(() => {
    useHomeQueueStore.getState().actOnAction('approve', A5);
  });
}

describe('TrackPromptDialog', () => {
  it('renders nothing without a prompt', () => {
    render(<TrackPromptDialog />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the recorded decision, the id and the question', () => {
    approveA5();
    expect(
      screen.getByRole('dialog', { name: 'Decision recorded' }),
    ).toBeVisible();
    expect(screen.getByText('A5')).toBeVisible();
    expect(
      screen.getByText(
        'Do you want to track this item? Tracked items stream their updates in your live feed.',
      ),
    ).toBeVisible();
  });

  it('Track adds the item to the tracker, flashes and closes', async () => {
    const user = userEvent.setup();
    approveA5();
    await user.click(screen.getByRole('button', { name: 'Track' }));
    const state = useHomeQueueStore.getState();
    expect(state.trackedTasks).toEqual([
      { id: 'A5', title: 'Budget Approval — Q3 Capex, Arcade Refresh' },
    ]);
    expect(state.trackPrompt).toBeNull();
    expect(await screen.findByText('A5 added to live feed')).toBeVisible();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Not now closes without tracking', async () => {
    const user = userEvent.setup();
    approveA5();
    await user.click(screen.getByRole('button', { name: 'Not now' }));
    expect(useHomeQueueStore.getState().trackPrompt).toBeNull();
    expect(useHomeQueueStore.getState().trackedTasks).toHaveLength(0);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Escape behaves like Not now', async () => {
    const user = userEvent.setup();
    approveA5();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(useHomeQueueStore.getState().trackPrompt).toBeNull();
    expect(useHomeQueueStore.getState().trackedTasks).toHaveLength(0);
  });

  it('renders the Arabic copy', async () => {
    await i18n.changeLanguage('ar');
    approveA5();
    expect(
      screen.getByRole('dialog', { name: 'تم تسجيل القرار' }),
    ).toBeVisible();
    expect(
      screen.getByText(
        'هل تريد متابعة هذا العنصر؟ تظهر العناصر المتابَعة وتحديثاتها في البث المباشر.',
      ),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'ليس الآن' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'متابعة' })).toBeVisible();
  });
});
