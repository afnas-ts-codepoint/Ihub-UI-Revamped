import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { isAssignedQueue } from '../constants/assignedQueue';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { Toaster } from '@/shared/ui/feedback/Toaster';

import { HomeQueueHost } from '../components/HomeQueueHost';
import { useHomeQueueStore } from '../store/homeQueue.store';
import { AssignedPage } from './AssignedPage';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  useHomeQueueStore.getState().reset();
  document.documentElement.dir = 'ltr';
  await i18n.changeLanguage('en');
});

function Probe() {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{pathname + search}</output>;
}

function QueueRoute() {
  const { pathname } = useLocation();
  const queue = pathname.split('/').at(-1) ?? '';
  return isAssignedQueue(queue) ? <AssignedPage queue={queue} /> : null;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<QueueRoute />} path="/home/assigned/:queue" />
      </Routes>
      <HomeQueueHost />
      <Toaster />
      <Probe />
    </MemoryRouter>,
  );
}

const store = () => useHomeQueueStore.getState();
const visibleIds = () =>
  screen
    .queryAllByTestId(/^action-card-A/)
    .map((card) => card.dataset.testid?.replace('action-card-', ''));
const select = (name: string) => screen.getByRole('combobox', { name });
const location = () => screen.getByTestId('location').textContent;

describe('AssignedPage tabs', () => {
  it('shows Approvals, Verify and Assigned Tasks with live counts and marks the active queue', () => {
    renderAt('/home/assigned/approvals');
    const tabs = within(screen.getByTestId('assigned-tabs'));
    expect(tabs.getByRole('button', { name: /^Approvals\s*10$/ })).toHaveAttribute('aria-current', 'page');
    expect(tabs.getByRole('button', { name: /^Verify\s*10$/ })).not.toHaveAttribute('aria-current');
    expect(tabs.getByRole('button', { name: /^Assigned Tasks\s*3$/ })).toBeVisible();
  });

  it('switches queue through the URL and keeps priority and search but drops type and sub-type', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/approvals?type=budgets&sub=new-budget&priority=high&q=budget');
    await user.click(screen.getByRole('button', { name: /^Verify/ }));
    expect(location()).toBe('/home/assigned/verify?priority=high&q=budget');
    expect(screen.getByRole('heading', { name: 'Verify' })).toBeVisible();
  });

  it('hides a tab whose count is zero', () => {
    renderAt('/home/assigned/approvals');
    for (const id of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10']) {
      const item = store().actions.find((action) => action.id === id);
      if (item) store().actOnAction('reject', item);
    }
    // Rejecting every approval removes both queue tabs, as in the prototype.
    return waitFor(() => {
      const tabs = within(screen.getByTestId('assigned-tabs'));
      expect(tabs.queryByRole('button', { name: /^Approvals/ })).not.toBeInTheDocument();
      expect(tabs.queryByRole('button', { name: /^Verify/ })).not.toBeInTheDocument();
      expect(tabs.getByRole('button', { name: /^Assigned Tasks/ })).toBeVisible();
    });
  });
});

describe('AssignedPage approvals and verify', () => {
  it('lists the whole ranked queue under the Approvals header', () => {
    renderAt('/home/assigned/approvals');
    expect(screen.getByRole('heading', { name: 'Approvals' })).toBeVisible();
    expect(screen.getByText('Items awaiting your approval, by type.')).toBeVisible();
    expect(visibleIds()).toEqual(['A1', 'A2', 'A3', 'A5', 'A6', 'A7', 'A10', 'A4', 'A9', 'A8']);
    expect(screen.getAllByRole('button', { name: 'Approve' })).toHaveLength(10);
  });

  it('uses Verify captions and the Verify header on the verify queue', () => {
    renderAt('/home/assigned/verify');
    expect(screen.getByRole('heading', { name: 'Verify' })).toBeVisible();
    expect(screen.getByText('Items awaiting your verification, by type.')).toBeVisible();
    expect(screen.getAllByRole('button', { name: 'Verify' }).length).toBeGreaterThanOrEqual(10);
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
  });

  it('opens an item in verify mode from the verify queue only', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/verify');
    await user.click(within(screen.getByTestId('action-card-A2')).getByTestId('action-card-body'));
    expect(store().drawer).toMatchObject({ type: 'action', verify: true });
    store().closeDrawer();
    cleanup();
    renderAt('/home/assigned/approvals');
    await user.click(within(screen.getByTestId('action-card-A2')).getByTestId('action-card-body'));
    expect(store().drawer).toMatchObject({ type: 'action', verify: false });
  });

  it('lists the record types that have records, with counts, and hides the empty ones', () => {
    renderAt('/home/assigned/approvals');
    const type = within(select('Record type'));
    expect(type.getByRole('option', { name: /^All\s+\(10\)$/ })).toBeVisible();
    expect(type.getByRole('option', { name: /^Payment settlement\s+\(3\)$/ })).toBeVisible();
    expect(type.getByRole('option', { name: /^Approve tasks\s+\(1\)$/ })).toBeVisible();
    expect(type.getByRole('option', { name: /^Budget approvals\s+\(3\)$/ })).toBeVisible();
    expect(type.getByRole('option', { name: /^PC Request\s+\(2\)$/ })).toBeVisible();
    expect(type.getByRole('option', { name: /^QA Submissions\s+\(5\)$/ })).toBeVisible();
    expect(screen.queryByRole('combobox', { name: 'Sub type' })).not.toBeInTheDocument();
  });

  it('labels the verify record types Verify tasks and Budget verifications', () => {
    renderAt('/home/assigned/verify');
    const type = within(select('Record type'));
    expect(type.getByRole('option', { name: /^Verify tasks/ })).toBeVisible();
    expect(type.getByRole('option', { name: /^Budget verifications/ })).toBeVisible();
  });

  it('keeps the record type in the URL, narrows the list and resets the sub-type on a new type', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/approvals');
    await user.selectOptions(select('Record type'), 'budgets');
    expect(location()).toBe('/home/assigned/approvals?type=budgets');
    expect(visibleIds()).toEqual(['A1', 'A5', 'A10']);

    const sub = within(select('Sub type'));
    expect(sub.getByRole('option', { name: 'All Budget approvals' })).toBeVisible();
    expect(sub.getByRole('option', { name: /^New Budget\s+\(2\)$/ })).toBeVisible();
    // Budgets keep an empty sub-type listed; other types hide it.
    expect(sub.getByRole('option', { name: 'Additional Budget' })).toBeVisible();

    await user.selectOptions(select('Sub type'), 'new-budget');
    expect(location()).toBe('/home/assigned/approvals?type=budgets&sub=new-budget');
    expect(visibleIds()).toEqual(['A5', 'A10']);

    await user.selectOptions(select('Record type'), 'payment-settlement');
    expect(location()).toBe('/home/assigned/approvals?type=payment-settlement');
    expect(visibleIds()).toEqual(['A3', 'A4', 'A9']);
    expect(within(select('Sub type')).queryByRole('option', { name: /Advance payment/ })).not.toBeInTheDocument();
  });

  it('filters by priority through the URL', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/approvals');
    await user.selectOptions(select('Priority'), 'critical');
    expect(location()).toBe('/home/assigned/approvals?priority=critical');
    expect(visibleIds()).toEqual(['A1']);
  });

  it('searches by reference code or subject, shows the match count and clears the search', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/approvals');
    await user.type(screen.getByPlaceholderText('Search code or subject…'), 'sign-off');
    expect(location()).toBe('/home/assigned/approvals?q=sign-off');
    expect(visibleIds()).toEqual(['A3', 'A9']);
    expect(screen.getByText('2 match')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(location()).toBe('/home/assigned/approvals');
    expect(visibleIds()).toHaveLength(10);
  });

  it('shows the no-matches state, and Reset clears every filter', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/approvals?type=budgets&priority=low&q=zzz');
    expect(screen.getByText('No matches')).toBeVisible();
    expect(screen.getByText('Nothing matches that code or subject — try a shorter search.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(location()).toBe('/home/assigned/approvals');
    expect(visibleIds()).toHaveLength(10);
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
  });

  it('shows the clear-queue state for a seed-only type', () => {
    renderAt('/home/assigned/approvals?type=appraisal');
    expect(screen.getByText('Nothing to approve')).toBeVisible();
    expect(screen.getByText('This queue is clear right now.')).toBeVisible();
  });

  it('shows the verify variant of the clear-queue state', () => {
    renderAt('/home/assigned/verify?type=appraisal');
    expect(screen.getByText('Nothing to verify')).toBeVisible();
  });

  it('treats an unknown type, sub-type or priority as the default', () => {
    renderAt('/home/assigned/approvals?type=bogus&sub=nope&priority=urgent');
    expect(select('Record type')).toHaveValue('all');
    expect(select('Priority')).toHaveValue('all');
    expect(visibleIds()).toHaveLength(10);
  });

  it('ignores a sub-type that does not belong to the type', () => {
    renderAt('/home/assigned/approvals?type=payment-settlement&sub=new-budget');
    expect(select('Sub type')).toHaveValue('all');
    expect(visibleIds()).toEqual(['A3', 'A4', 'A9']);
  });

  it('removes a decided item from the list and the type counts', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/approvals?type=payment-settlement');
    await user.click(within(screen.getByTestId('action-card-A4')).getByRole('button', { name: 'Reject' }));
    expect(visibleIds()).toEqual(['A3', 'A9']);
    expect(within(select('Record type')).getByRole('option', { name: /^Payment settlement\s+\(2\)$/ })).toBeVisible();
  });
});

describe('AssignedPage Tasks record type', () => {
  it('lists the external assigned tasks as approve / edit / send-back cards', () => {
    renderAt('/home/assigned/approvals?type=tasks');
    const card = within(screen.getByTestId('assigned-task-JO-7775'));
    expect(card.getByText('Install digital signage — main concourse')).toBeVisible();
    expect(card.getByText('Medium')).toBeVisible();
    expect(card.getByText('Marketing Tech')).toBeVisible();
    expect(card.getByText('The Avenues')).toBeVisible();
    expect(card.getByRole('button', { name: 'Approve' })).toBeVisible();
    expect(card.getByRole('button', { name: 'Edit' })).toBeVisible();
    expect(card.getByRole('button', { name: 'Send back' })).toBeVisible();
    expect(screen.queryAllByTestId(/^action-card-/)).toHaveLength(0);
  });

  it('says Verify on the verify queue', () => {
    renderAt('/home/assigned/verify?type=tasks');
    expect(within(screen.getByTestId('assigned-task-JO-7775')).getByRole('button', { name: 'Verify' })).toBeVisible();
  });

  it('approving assigns the job order, toasts and prompts to track it', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/approvals?type=tasks');
    await user.click(within(screen.getByTestId('assigned-task-JO-7775')).getByRole('button', { name: 'Approve' }));
    expect(await screen.findByText('JO-7775 assigned')).toBeVisible();
    expect(await screen.findByText('Decision recorded')).toBeVisible();
    expect(store().jobOrders.find((jobOrder) => jobOrder.id === 'JO-7775')?.status).toBe('Assigned');
  });

  it('send back only toasts', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/approvals?type=tasks');
    await user.click(within(screen.getByTestId('assigned-task-JO-7775')).getByRole('button', { name: 'Send back' }));
    expect(await screen.findByText('JO-7775 sent back to requester')).toBeVisible();
    expect(screen.getByTestId('assigned-task-JO-7775')).toBeVisible();
  });

  it.each(['Edit', 'body'])('opens the Home task form from the %s trigger', async (trigger) => {
    const user = userEvent.setup();
    renderAt('/home/assigned/approvals?type=tasks');
    const card = within(screen.getByTestId('assigned-task-JO-7775'));
    await user.click(trigger === 'Edit' ? card.getByRole('button', { name: 'Edit' }) : card.getByTestId('assigned-task-body'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('JO-7775')).toBeVisible();
    expect(within(dialog).getByRole('heading', { name: 'Install digital signage — main concourse' })).toBeVisible();
    expect(within(dialog).getByLabelText('Task subject')).toHaveValue('Install digital signage — main concourse');
    expect(dialog).toHaveAttribute('data-mode', 'homeTask');
  });

  it('shows the no-tasks and no-match states', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/approvals?type=tasks&priority=high');
    expect(screen.getByText('No tasks')).toBeVisible();
    expect(screen.getByText('Internal tasks don’t need approval or verification.')).toBeVisible();
    await user.type(screen.getByPlaceholderText('Search code or subject…'), 'nothing');
    expect(screen.getByText('No matches')).toBeVisible();
    expect(screen.getByText('No task matches that code or subject.')).toBeVisible();
  });

  it('searches the task rows and counts them', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/approvals?type=tasks');
    await user.type(screen.getByPlaceholderText('Search code or subject…'), 'signage');
    expect(screen.getByText('1 match')).toBeVisible();
    expect(screen.getByTestId('assigned-task-JO-7775')).toBeVisible();
  });
});

describe('AssignedPage Assigned Tasks', () => {
  it('lists every assigned job order as a task card under the Assigned Tasks header', () => {
    renderAt('/home/assigned/tasks');
    expect(screen.getByRole('heading', { name: 'Assigned Tasks' })).toBeVisible();
    expect(screen.getByText('Work you own and are progressing.')).toBeVisible();
    for (const id of ['JO-7779', 'JO-7775', 'JO-7770']) {
      expect(screen.getByTestId(`job-order-card-${id}`)).toBeVisible();
    }
    expect(screen.queryByTestId('job-order-card-JO-7782')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Record type' })).not.toBeInTheDocument();
  });

  it('opens the Home task form from a card click', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/tasks');
    await user.click(within(screen.getByTestId('job-order-card-JO-7779')).getByTestId('job-order-card-body'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('JO-7779')).toBeVisible();
    expect(within(dialog).getByRole('heading', { name: 'Repair escalator B2' })).toBeVisible();
    expect(store().drawer).toBeNull();
  });

  it('Track opens the workflow drawer, not the task form', async () => {
    const user = userEvent.setup();
    renderAt('/home/assigned/tasks');
    await user.click(within(screen.getByTestId('job-order-card-JO-7779')).getByRole('button', { name: /Track/ }));
    expect(store().drawer).toMatchObject({ type: 'jo', verify: false });
    expect(store().drawer?.item.id).toBe('JO-7779');
    expect(store().taskOpen).toBeNull();
  });

  it('shows the empty state when nothing is assigned', () => {
    renderAt('/home/assigned/tasks');
    for (const id of ['JO-7779', 'JO-7775', 'JO-7770']) {
      store().actOnJobOrder('dismiss', store().jobOrders.find((jobOrder) => jobOrder.id === id) ?? (() => { throw new Error(id); })());
    }
    return waitFor(() => {
      expect(screen.getByText('Nothing assigned')).toBeVisible();
      expect(screen.getByText('No active tasks assigned to you.')).toBeVisible();
    });
  });
});
