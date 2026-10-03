import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { Toaster } from '@/shared/ui/feedback/Toaster';

import { HomeQueueHost } from '../components/HomeQueueHost';
import { useHomeQueueStore } from '../store/homeQueue.store';
import { LiveIncidentsPage } from './LiveIncidentsPage';

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
      <LiveIncidentsPage />
      <HomeQueueHost />
      <Toaster />
    </>,
  );
}

const store = () => useHomeQueueStore.getState();
const card = (id: string) => within(screen.getByTestId(`incident-card-${id}`));
const cardIds = () =>
  screen
    .queryAllByTestId(/^incident-card-INC/)
    .map((element) => element.dataset.testid?.replace('incident-card-', ''));
const incident = (id: string) => {
  const found = store().incidents.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};

async function chooseAction(id: string, name: string) {
  const user = userEvent.setup();
  await user.click(card(id).getByRole('button', { name: 'Action' }));
  await user.click(await screen.findByRole('menuitem', { name }));
}

describe('Incident center', () => {
  it('ranks the incidents by severity and SLA, with unread and breached counts', () => {
    renderPage();
    const center = within(screen.getByTestId('incident-center'));
    expect(center.getByRole('heading', { name: 'Incident center' })).toBeVisible();
    expect(cardIds()).toEqual(['INC-2041', 'INC-2039', 'INC-2037', 'INC-2034', 'INC-2030']);
    expect(center.getByText('3 unread')).toBeVisible();
    expect(center.getByText('1 SLA')).toBeVisible();
  });

  it('shows the unread dot, severity, status and SLA caption of an incident', () => {
    renderPage();
    const first = card('INC-2041');
    expect(first.getByTitle('Unread')).toBeVisible();
    expect(first.getByText('POS network outage — 360 Mall')).toBeVisible();
    expect(first.getByText('Critical')).toBeVisible();
    expect(first.getByText('Investigating')).toBeVisible();
    expect(first.getByText('SLA breached · 18m over')).toBeVisible();
    expect(within(screen.getByTestId('incident-card-INC-2037')).queryByTitle('Unread')).not.toBeInTheDocument();
  });

  it('searches the title, id, owner, location and status, and reports an empty result', async () => {
    const user = userEvent.setup();
    renderPage();
    const search = screen.getByPlaceholderText('Search incidents…');
    await user.type(search, 'payments');
    expect(cardIds()).toEqual(['INC-2037']);
    await user.clear(search);
    await user.type(search, 'zzzz');
    expect(cardIds()).toEqual([]);
    expect(screen.getByText('No incidents match your search.')).toBeVisible();
  });

  it('says there are no open incidents once every case is closed', () => {
    renderPage();
    for (const id of ['INC-2041', 'INC-2039', 'INC-2037', 'INC-2034', 'INC-2030']) {
      store().actOnIncident('close', incident(id));
    }
    return screen.findByText('No open incidents.');
  });

  it('opens the drawer and marks the incident read on a body click', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(card('INC-2039').getByTestId('incident-card-body'));
    expect(store().drawer).toMatchObject({ type: 'incident' });
    expect(store().drawer?.item.id).toBe('INC-2039');
    expect(incident('INC-2039').read).toBe(true);
    expect(within(screen.getByTestId('incident-center')).getByText('2 unread')).toBeVisible();
  });

  it('pins and unpins from the card without opening the drawer', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(card('INC-2039').getByRole('button', { name: 'Pin to feed' }));
    expect(incident('INC-2039')).toMatchObject({ pinned: true, read: true });
    expect(store().drawer).toBeNull();
    expect(await screen.findByText('INC-2039 pinned & tracking — updates in live feed')).toBeVisible();
    expect(card('INC-2039').getByRole('button', { name: 'Unpin' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Incident action menu', () => {
  it('lists the seven actions with Close case last', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(card('INC-2041').getByRole('button', { name: 'Action' }));
    const items = (await screen.findAllByRole('menuitem')).map((item) => item.textContent);
    expect(items).toEqual([
      'Track',
      'Compensate',
      'Raise a task',
      'Request investigation',
      'Write feedback',
      'Callback request',
      'Close case',
    ]);
  });

  it('Track lists the incident in the tracker and toasts', async () => {
    renderPage();
    await chooseAction('INC-2039', 'Track');
    expect(await screen.findByText('INC-2039 added to live feed')).toBeVisible();
    // The host also lists the assigned job orders behind it; the new entry goes first.
    expect(store().trackedTasks[0]?.id).toBe('INC-2039');
    expect(incident('INC-2039').read).toBe(true);
  });

  it('Close case removes the incident and toasts', async () => {
    renderPage();
    await chooseAction('INC-2034', 'Close case');
    expect(await screen.findByText('INC-2034 · case closed')).toBeVisible();
    expect(cardIds()).not.toContain('INC-2034');
  });

  it.each([
    ['Compensate', 'INC-2039 · Compensation logged'],
    ['Request investigation', 'INC-2039 · Investigation requested'],
    ['Write feedback', 'INC-2039 · Feedback saved'],
    ['Callback request', 'INC-2039 · Callback requested'],
  ])('%s only toasts and keeps the incident', async (name, message) => {
    renderPage();
    await chooseAction('INC-2039', name);
    expect(await screen.findByText(message)).toBeVisible();
    expect(cardIds()).toContain('INC-2039');
    expect(store().drawer).toBeNull();
  });

  it('Raise a task opens the Home task form with the live-incident draft', async () => {
    renderPage();
    await chooseAction('INC-2041', 'Raise a task');
    const dialog = await screen.findByRole('dialog');
    expect(await screen.findByText('Task drafted from INC-2041')).toBeVisible();
    expect(within(dialog).getByText('INC-2041')).toBeVisible();
    expect(within(dialog).getByRole('heading', { name: 'POS network outage — 360 Mall' })).toBeVisible();
    expect(within(dialog).getByLabelText('Task subject')).toHaveValue('POS network outage — 360 Mall');
    expect(dialog).toHaveAttribute('data-mode', 'homeTask');
    expect(incident('INC-2041').read).toBe(true);
  });

  it('closing the task form discards the draft', async () => {
    const user = userEvent.setup();
    renderPage();
    await chooseAction('INC-2041', 'Raise a task');
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(store().taskOpen).toBeNull();
  });
});

describe('Live feed', () => {
  it('streams the pinned incident with its timeline and a tracked count', () => {
    renderPage();
    const feed = within(screen.getByTestId('live-feed'));
    expect(feed.getByRole('heading', { name: 'Live feed' })).toBeVisible();
    expect(feed.getByText('1 tracked')).toBeVisible();
    expect(feed.getByText('INC-2041 · Yazan Malik (IT)')).toBeVisible();
    expect(feed.getByText('Failover to backup switch initiated. ETA to restore 10–15 min.')).toBeVisible();
  });

  it('unpinning removes the incident from the feed and shows the empty hint', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(within(screen.getByTestId('live-feed')).getByRole('button', { name: 'Unpin' }));
    expect(incident('INC-2041').pinned).toBe(false);
    expect(screen.getByText('Pin or track an incident to stream its live updates here.')).toBeVisible();
  });

  it('opens the drawer from a feed entry', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(within(screen.getByTestId('live-feed')).getByRole('button', { name: /POS network outage/ }));
    expect(store().drawer?.item.id).toBe('INC-2041');
  });

  it('lists a rejected approval above the feed and dismisses it', async () => {
    const user = userEvent.setup();
    renderPage();
    const reject = store().actions.find((action) => action.id === 'A1');
    if (reject) store().actOnAction('reject', reject);
    const rejected = await screen.findByTestId('rejected-feed');
    expect(within(rejected).getByRole('heading', { name: 'Rejected' })).toBeVisible();
    expect(within(rejected).getByText(/^A1 · .* · rejected just now$/)).toBeVisible();
    await user.click(within(rejected).getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByTestId('rejected-feed')).not.toBeInTheDocument();
    expect(store().rejectedFeed).toEqual([]);
  });
});

describe('Arabic', () => {
  it('localises the centre, the menu and the feed', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByRole('heading', { name: 'مركز الحوادث' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'بث مباشر' })).toBeVisible();
    await user.click(card('INC-2041').getByRole('button', { name: 'إجراء' }));
    expect(await screen.findByRole('menuitem', { name: 'إغلاق الحالة' })).toBeVisible();
  });
});
