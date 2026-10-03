import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { Toaster } from '@/shared/ui/feedback/Toaster';

import { HomeQueueHost } from '../components/HomeQueueHost';
import { useHomeQueueStore } from '../store/homeQueue.store';
import { OverviewPage } from './OverviewPage';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  useHomeQueueStore.getState().reset();
  document.documentElement.dir = 'ltr';
  await i18n.changeLanguage('en');
});

function Where() {
  return <output data-testid="where">{useLocation().pathname}</output>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/home/overview']}>
      <Routes>
        <Route
          element={
            <>
              <OverviewPage />
              <HomeQueueHost />
              <Toaster />
              <Where />
            </>
          }
          path="*"
        />
      </Routes>
    </MemoryRouter>,
  );
}

const store = () => useHomeQueueStore.getState();
const clock = () => within(screen.getByTestId('on-the-clock'));

describe('Overview — recommended next action', () => {
  it('surfaces the top-ranked approval with why it is first', () => {
    renderPage();
    const next = within(screen.getByTestId('recommended-next-action'));
    expect(next.getByText('Recommended next action')).toBeVisible();
    expect(
      next.getByRole('heading', { name: 'Budget Release — Eid Activation, 360 Mall' }),
    ).toBeVisible();
    expect(
      next.getByText(
        'Surfaced first because it is overdue · critical priority · high financial impact.',
      ),
    ).toBeVisible();
  });

  it('lists the critical incident and the next two approvals', () => {
    renderPage();
    const next = within(screen.getByTestId('recommended-next-action'));
    expect(next.getByText('Critical incident')).toBeVisible();
    expect(next.getByText('POS network outage — 360 Mall — SLA breached · 18m over')).toBeVisible();
    expect(next.getByText('Purchase Approval (PC) — Cinema Projector Units ×2')).toBeVisible();
    expect(next.getByText('Action Sheet — Crowd Safety Plan, Summer Festival')).toBeVisible();
  });

  it('approves the top item in one click: it leaves the queue and a track prompt opens', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(
      within(screen.getByTestId('recommended-next-action')).getByRole('button', {
        name: 'Release funds',
      }),
    );
    expect(store().actions.some((action) => action.id === 'A1')).toBe(false);
    expect(store().trackPrompt?.id).toBe('A1');
    expect(
      within(screen.getByTestId('recommended-next-action')).getByRole('heading', {
        hidden: true, // the track prompt is modal
        name: 'Purchase Approval (PC) — Cinema Projector Units ×2',
      }),
    ).toBeVisible();
  });

  it('opens the form preview for a budget release on Review', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(
      within(screen.getByTestId('recommended-next-action')).getByRole('button', {
        name: /Review/,
      }),
    );
    expect(store().formModal?.item.id).toBe('A1');
  });

  it('renders nothing when the queue is empty', () => {
    renderPage();
    store().batch('approve');
    store().selectAll(store().actions.map((action) => action.id));
    store().batch('approve');
    return Promise.resolve().then(() => {
      expect(screen.queryByTestId('recommended-next-action')).not.toBeInTheDocument();
    });
  });
});

describe('Overview — needs you now', () => {
  it('lists the six top-ranked approvals with the live queue size', () => {
    renderPage();
    const needs = within(screen.getByTestId('needs-you-now'));
    expect(needs.getAllByTestId(/^action-card-(?!body)/)).toHaveLength(6);
    expect(needs.getByRole('button', { name: /See all 10/ })).toBeVisible();
    expect(needs.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('opens Assigned from "See all"', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /See all 10/ }));
    expect(screen.getByTestId('where')).toHaveTextContent('/home/assigned/approvals');
  });

  it('shows a returned card first, with its reason, and reopens it in resubmit mode', async () => {
    const user = userEvent.setup();
    renderPage();
    const item = store().actions.find((action) => action.id === 'A6');
    if (!item) throw new Error('missing A6');
    store().actOnAction('sendback', item, 'Budget code missing');
    const card = await screen.findByTestId('returned-card-A6');
    expect(within(card).getByText('Returned — needs action')).toBeVisible();
    expect(within(card).getByText('Reason: Budget code missing')).toBeVisible();
    await user.click(card);
    expect(store().formModal).toMatchObject({ creator: true, item: { id: 'A6' } });
  });
});

describe('Overview — incident center', () => {
  it('searches and shares the incident store with the live feed', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByPlaceholderText('Search incidents…'), 'payments');
    const center = within(screen.getByTestId('incident-center'));
    expect(center.getAllByTestId(/^incident-card-INC/)).toHaveLength(1);
    expect(within(screen.getByTestId('live-feed')).getByText('1 tracked')).toBeVisible();
  });
});

describe('Overview — on the clock', () => {
  it('shows the live queue clock summary', () => {
    renderPage();
    expect(clock().getByText('18')).toBeVisible();
    expect(clock().getByText('3 past due time')).toBeVisible();
    expect(clock().getByRole('button', { name: /Needs attention 8/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(clock().getAllByTestId('clock-row')).toHaveLength(6);
    expect(clock().getByRole('button', { name: /^See all 8$/ })).toBeVisible();
  });

  it('switches to the on-time list', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(clock().getByRole('button', { name: /^On time 13$/ }));
    expect(clock().getAllByTestId('clock-row')).toHaveLength(6);
    expect(clock().getByRole('button', { name: /^See all 13$/ })).toBeVisible();
  });

  it('tallies each queue and jumps to its Home view', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(clock().getByRole('button', { name: /Approvals\s*5\/8/ })).toBeVisible();
    expect(clock().getByRole('button', { name: /Action sheets\s*1\/2/ })).toBeVisible();
    await user.click(clock().getByRole('button', { name: /Tasks\s*4\/6/ }));
    expect(screen.getByTestId('where')).toHaveTextContent('/home/assigned/approvals');
  });

  it('opens the drawer for an approval row, and an incident row marks it read', async () => {
    const user = userEvent.setup();
    renderPage();
    const rows = clock().getAllByTestId('clock-row');
    await user.click(rows[2] as HTMLElement); // POS network outage
    expect(store().drawer).toMatchObject({ item: { id: 'INC-2041' }, type: 'incident' });
    expect(store().incidents.find((entry) => entry.id === 'INC-2041')?.read).toBe(true);
  });

  it('opens the task form for a job-order row', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(clock().getAllByTestId('clock-row')[1] as HTMLElement); // Arcade machine maintenance
    expect(store().taskOpen?.title).toBe('Arcade machine maintenance — 12 units');
  });

  it('keeps the monthly SLA compliance separate from the queue clock (D4)', async () => {
    const user = userEvent.setup();
    renderPage();
    const monthly = within(screen.getByTestId('monthly-sla-compliance'));
    expect(monthly.getByText('SLA compliance this month')).toBeVisible();
    // Monthly model: 14/14 critical, 80/86 high (below target), from the SLA feature's data.
    expect(monthly.getByText('100%')).toBeVisible();
    expect(monthly.getByText('93%')).toBeVisible();
    expect(monthly.getByText('80/86 closed in time · short by 2 points')).toBeVisible();
    expect(within(screen.getByTestId('sla-level-P2')).getByText('Below')).toBeVisible();
    expect(within(screen.getByTestId('sla-level-P1')).getByText('On target')).toBeVisible();
    await user.click(monthly.getByRole('button', { name: /SLA & Compliance/ }));
    expect(screen.getByTestId('where')).toHaveTextContent('/home/sla');
  });
});

describe('Overview — workload, analytics, tracker, feed and calendar', () => {
  it('shows the workload heatmap in its plain variant with the Overview legend', () => {
    renderPage();
    const section = within(screen.getByTestId('workload-section'));
    expect(
      section.getByRole('heading', { name: 'Department resource availability & workload' }),
    ).toBeVisible();
    expect(section.getByText('Load')).toBeVisible();
    expect(section.getByText('V.Hi')).toBeVisible();
    expect(section.getByText('View')).toBeVisible();
    expect(section.queryByText('View by')).not.toBeInTheDocument();
  });

  it('switches the heatmap to employees', async () => {
    const user = userEvent.setup();
    renderPage();
    const section = within(screen.getByTestId('workload-section'));
    await user.click(section.getByRole('button', { name: 'Employee' }));
    expect(section.getByText('Total employees')).toBeVisible();
  });

  it('renders the nine analytics panels with the fixed prototype figures', () => {
    renderPage();
    const analytics = within(screen.getByTestId('analytics-overview'));
    expect(analytics.getByRole('heading', { name: 'Analytics & Insights' })).toBeVisible();
    for (const title of [
      'Status Distribution',
      'Priority Distribution',
      'SLA Compliance',
      'Top Problem Areas',
      'Issue Trend',
      'Issue Aging',
      'Department Performance',
      'SLA Breach Analysis',
    ]) {
      expect(analytics.getByRole('heading', { name: title })).toBeVisible();
    }
    const status = within(screen.getByTestId('analytics-status'));
    expect(status.getByText('164')).toBeVisible();
    expect(within(screen.getByTestId('analytics-priority')).getByText('164')).toBeVisible();
    const trend = within(screen.getByTestId('analytics-trend'));
    expect(trend.getByText('107')).toBeVisible();
    expect(trend.getByText('103')).toBeVisible();
    expect(within(screen.getByTestId('analytics-sla')).getByText('82%', { selector: 'span' })).toBeVisible();
  });

  it('lists assigned job orders in the tracker as soon as Home mounts', () => {
    renderPage();
    const tracker = within(screen.getByTestId('tracker'));
    expect(tracker.getAllByText('Assigned to you')).toHaveLength(3);
    expect(tracker.getByText('Repair escalator B2')).toBeVisible();
    expect(store().trackedTasks.every((task) => task.assigned)).toBe(true);
  });

  it('removes a tracker row on the X without opening it, and opens a job order on click', async () => {
    const user = userEvent.setup();
    renderPage();
    const tracker = within(screen.getByTestId('tracker'));
    const row = tracker.getByTestId('tracker-row-JO-7779');
    await user.click(within(row).getByRole('button', { name: 'Untrack' }));
    expect(screen.queryByTestId('tracker-row-JO-7779')).not.toBeInTheDocument();
    expect(store().taskOpen).toBeNull();
    await user.click(screen.getByTestId('tracker-row-JO-7775'));
    expect(store().taskOpen?.id).toBe('JO-7775');
  });

  it('adds a pinned incident to the tracker and the live feed, and opens it from the tracker', async () => {
    const user = userEvent.setup();
    renderPage();
    const incident = store().incidents.find((entry) => entry.id === 'INC-2039');
    if (!incident) throw new Error('missing INC-2039');
    store().actOnIncident('pin', incident);
    const row = await screen.findByTestId('tracker-row-INC-2039');
    expect(within(row).getByText('just now')).toBeVisible();
    expect(within(screen.getByTestId('live-feed')).getByText('2 tracked')).toBeVisible();
    await user.click(row);
    expect(store().drawer).toMatchObject({ item: { id: 'INC-2039' }, type: 'incident' });
  });

  it('shows the calendar beside the live feed', () => {
    renderPage();
    expect(screen.getByText('Calendar')).toBeVisible();
    expect(screen.getByText('Q2 All-Hands')).toBeVisible();
  });
});

describe('Overview — Arabic', () => {
  it('renders the Arabic headings and keeps the English fixtures', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderPage();
    expect(screen.getByText('يحتاجك الآن')).toBeVisible();
    expect(screen.getByText('على المؤقّت')).toBeVisible();
    expect(screen.getByText('التحليلات والرؤى')).toBeVisible();
    expect(screen.getByText('المتابعة')).toBeVisible();
    expect(screen.getAllByText('Facilities').length).toBeGreaterThan(0);
  });
});
