import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { Toaster } from '@/shared/ui/feedback/Toaster';

import { SendBackDialog } from '../components/actions/SendBackDialog';
import { TrackPromptDialog } from '../components/actions/TrackPromptDialog';
import { useHomeQueueStore } from '../store/homeQueue.store';
import { ApprovalsPage } from './ApprovalsPage';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  useHomeQueueStore.getState().reset();
  document.documentElement.dir = 'ltr';
  await i18n.changeLanguage('en');
});

function renderPage() {
  return render(
    <>
      <ApprovalsPage />
      <SendBackDialog />
      <TrackPromptDialog />
      <Toaster />
    </>,
  );
}

const store = () => useHomeQueueStore.getState();
const visibleIds = () =>
  screen
    .queryAllByTestId(/^action-card-A/)
    .map((card) => card.dataset.testid?.replace('action-card-', ''));
const card = (id: string) => within(screen.getByTestId(`action-card-${id}`));
const chip = (name: RegExp | string) =>
  screen.getByRole('button', { name });

describe('ApprovalsPage', () => {
  it('lists the queue ranked by priority x due x impact under the prototype header', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: 'Approvals' }),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Ranked by priority × due date × financial impact. Cleared items leave the queue.',
      ),
    ).toBeVisible();
    expect(visibleIds()).toEqual([
      'A1', 'A2', 'A3', 'A5', 'A6', 'A7', 'A10', 'A4', 'A9', 'A8',
    ]);
  });

  it('counts each group from the live queue, independent of the selected chip', async () => {
    const user = userEvent.setup();
    renderPage();
    const expectCounts = () => {
      expect(chip(/^All\s*10$/)).toBeVisible();
      expect(chip(/^Action sheets\s*2$/)).toBeVisible();
      expect(chip(/^New budget request\s*2$/)).toBeVisible();
      expect(chip(/^Transfer funds request\s*2$/)).toBeVisible();
      expect(chip(/^Purchase committee request\s*2$/)).toBeVisible();
    };
    expectCounts();
    expect(chip(/^All/)).toHaveAttribute('aria-pressed', 'true');
    await user.click(chip(/^Action sheets/));
    expectCounts();
    expect(chip(/^Action sheets/)).toHaveAttribute('aria-pressed', 'true');
  });

  it.each([
    [/^Action sheets/, ['A3', 'A9']],
    [/^New budget request/, ['A5', 'A10']],
    [/^Transfer funds request/, ['A1', 'A4']],
    [/^Purchase committee request/, ['A2', 'A7']],
  ] as const)('filters to a group (%s) keeping rank order', async (name, ids) => {
    const user = userEvent.setup();
    renderPage();
    await user.click(chip(name));
    expect(visibleIds()).toEqual(ids);
    await user.click(chip(/^All/));
    expect(visibleIds()).toHaveLength(10);
  });

  it('updates the counts as items leave the queue', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(within(screen.getByTestId('action-card-A6')).getByRole('button', { name: 'Reject' }));
    expect(chip(/^All\s*9$/)).toBeVisible();
    expect(chip(/^Action sheets\s*2$/)).toBeVisible();
    await user.click(card('A3').getByRole('button', { name: 'Reject' }));
    expect(chip(/^All\s*8$/)).toBeVisible();
    expect(chip(/^Action sheets\s*1$/)).toBeVisible();
  });

  it('shows the empty state when the queue is exhausted', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(chip(/^Action sheets/));
    await user.click(card('A3').getByRole('button', { name: 'Reject' }));
    await user.click(card('A9').getByRole('button', { name: 'Reject' }));
    expect(visibleIds()).toEqual([]);
    expect(chip(/^Action sheets\s*0$/)).toBeVisible();
    expect(screen.getByText('Nothing here')).toBeVisible();
  });

  describe('selection', () => {
    it('Select all selects the visible items and flips to Clear selection', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole('button', { name: 'Select all' }));
      expect(store().selected).toHaveLength(10);
      expect(screen.getByTestId('batch-bar')).toHaveTextContent('10 selected');
      await user.click(screen.getByRole('button', { name: 'Clear selection' }));
      expect(store().selected).toEqual([]);
      expect(screen.queryByTestId('batch-bar')).toBeNull();
      expect(screen.getByRole('button', { name: 'Select all' })).toBeVisible();
    });

    it('Select all picks only the filtered items and replaces a prior selection', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(card('A8').getByRole('checkbox'));
      await user.click(chip(/^Transfer funds request/));
      // Selection hidden by the filter still reads "Clear".
      expect(screen.getByRole('button', { name: 'Clear selection' })).toBeVisible();
      await user.click(screen.getByRole('button', { name: 'Clear selection' }));
      await user.click(screen.getByRole('button', { name: 'Select all' }));
      expect([...store().selected].sort()).toEqual(['A1', 'A4']);
    });

    it('keeps the selection across filter changes; batch acts on all of it with the full count', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(chip(/^Transfer funds request/));
      await user.click(card('A1').getByRole('checkbox'));
      await user.click(chip(/^Action sheets/));
      // A1 is hidden: the bar counts only what is in view.
      expect(screen.queryByTestId('batch-bar')).toBeNull();
      await user.click(card('A3').getByRole('checkbox'));
      expect(screen.getByTestId('batch-bar')).toHaveTextContent('1 selected');
      expect(store().selected).toEqual(['A1', 'A3']);

      await user.click(screen.getByRole('button', { name: 'Approve 1' }));

      expect(store().actions.map((action) => action.id)).not.toContain('A1');
      expect(store().actions.map((action) => action.id)).not.toContain('A3');
      expect(store().actions).toHaveLength(8);
      expect(store().selected).toEqual([]);
      expect(await screen.findByText('2 approved in one decision')).toBeVisible();
      // Batch approval never prompts for tracking.
      expect(store().trackPrompt).toBeNull();
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('batch reject removes the selection, feeds the rejected list and does not prompt', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(card('A2').getByRole('checkbox'));
      await user.click(card('A4').getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: 'Reject all' }));
      expect(store().actions).toHaveLength(8);
      expect(store().rejectedFeed.map((entry) => entry.id).sort()).toEqual(['A2', 'A4']);
      expect(store().trackPrompt).toBeNull();
      expect(await screen.findByText('2 rejected in one decision')).toBeVisible();
    });
  });

  describe('single decisions', () => {
    it('approve removes the item, toasts and opens the track prompt', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(card('A5').getByRole('button', { name: 'Approve' }));
      expect(visibleIds()).not.toContain('A5');
      // The open dialog hides the page from the accessibility tree.
      expect(
        screen.getByRole('button', { hidden: true, name: /^All\s*9$/ }),
      ).toBeInTheDocument();
      expect(store().trackPrompt).toEqual({
        id: 'A5',
        title: 'Budget Approval — Q3 Capex, Arcade Refresh',
      });
      expect(
        await screen.findByText('Approved · Review & approve — removed from queue'),
      ).toBeVisible();
      const dialog = screen.getByRole('dialog', { name: 'Decision recorded' });
      expect(within(dialog).getByText('A5')).toBeVisible();

      await user.click(within(dialog).getByRole('button', { name: 'Track' }));
      expect(store().trackedTasks.map((task) => task.id)).toEqual(['A5']);
      expect(await screen.findByText('A5 added to live feed')).toBeVisible();
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('reject removes the item without a track prompt', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(card('A5').getByRole('button', { name: 'Reject' }));
      expect(visibleIds()).not.toContain('A5');
      expect(store().trackPrompt).toBeNull();
      expect(store().rejectedFeed[0]).toMatchObject({ id: 'A5', owner: 'Yazan Malik' });
      expect(await screen.findByText('Rejected · owner notified')).toBeVisible();
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('send back opens the dialog first, and submitting removes the item without a track prompt', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(card('A5').getByRole('button', { name: 'Send back' }));
      // Nothing happened to the queue yet.
      expect(store().actions).toHaveLength(10);
      expect(store().sendbackFor?.id).toBe('A5');
      const dialog = screen.getByRole('dialog', { name: 'Send back to creator' });

      await user.click(within(dialog).getByRole('button', { name: 'Invoice/price missing' }));
      await user.type(within(dialog).getByRole('textbox'), 'Attach invoice');
      await user.click(within(dialog).getByRole('button', { name: 'Send back' }));

      expect(visibleIds()).not.toContain('A5');
      expect(store().trackPrompt).toBeNull();
      expect(store().trackedTasks[0]).toMatchObject({
        id: 'A5',
        reason: 'Invoice/price missing: Attach invoice',
        returned: true,
      });
      expect(
        await screen.findByText('Sent back to creator · Invoice/price missing: Attach invoice'),
      ).toBeVisible();
    });

    it('cancelling send back leaves the item queued', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(card('A5').getByRole('button', { name: 'Send back' }));
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(visibleIds()).toContain('A5');
    });

    it('Pin moves an item to the top and unpinning restores its rank', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(card('A8').getByRole('button', { name: 'Pin to top' }));
      expect(visibleIds()[0]).toBe('A8');
      expect(card('A8').getByRole('button', { name: 'Pin to top' })).toHaveAttribute('aria-pressed', 'true');
      await user.click(card('A9').getByRole('button', { name: 'Pin to top' }));
      // Pinned items keep score order among themselves: A9 (55) before A8 (15).
      expect(visibleIds().slice(0, 2)).toEqual(['A9', 'A8']);
      await user.click(card('A8').getByRole('button', { name: 'Pin to top' }));
      await user.click(card('A9').getByRole('button', { name: 'Pin to top' }));
      expect(visibleIds()).toEqual([
        'A1', 'A2', 'A3', 'A5', 'A6', 'A7', 'A10', 'A4', 'A9', 'A8',
      ]);
      // Pinning is silent (no toast).
      expect(store().trackPrompt).toBeNull();
    });

    it('opens form-preview kinds in the form modal and the rest in the drawer (body and Edit alike)', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(card('A5').getByTestId('action-card-body'));
      expect(store().formModal?.item.id).toBe('A5');
      expect(store().drawer).toBeNull();
      store().closeFormModal();

      await user.click(card('A2').getByRole('button', { name: 'Edit' }));
      expect(store().drawer).toMatchObject({ type: 'action', verify: false });
      expect(store().drawer?.item.id).toBe('A2');
      expect(store().formModal).toBeNull();
      // Opening is not a decision.
      expect(store().actions).toHaveLength(10);
    });
  });

  it('renders the Arabic page in RTL with the exact prototype strings', async () => {
    const user = userEvent.setup();
    document.documentElement.dir = 'rtl';
    await i18n.changeLanguage('ar');
    renderPage();
    expect(screen.getByRole('heading', { name: 'الموافقات' })).toBeVisible();
    expect(
      screen.getByText('مرتبة حسب الأولوية × الموعد × الأثر المالي.'),
    ).toBeVisible();
    expect(chip(/^الكل\s*10$/)).toBeVisible();
    expect(chip(/^أوراق الإجراءات\s*2$/)).toBeVisible();
    expect(chip(/^طلب ميزانية\s*2$/)).toBeVisible();
    expect(chip(/^تحويل أموال\s*2$/)).toBeVisible();
    expect(chip(/^لجنة المشتريات\s*2$/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'تحديد الكل' }));
    expect(screen.getByTestId('batch-bar')).toHaveTextContent('10 محدد');
    expect(screen.getByTestId('batch-bar')).toHaveTextContent('قرار جماعي');
    expect(screen.getByRole('button', { name: 'إلغاء' })).toBeVisible();
    // Queue data stays English in both locales.
    expect(
      screen.getByText('Budget Release — Eid Activation, 360 Mall'),
    ).toBeVisible();
    expect(screen.getByText('BUD-2026-107')).toBeVisible();
  });
});
