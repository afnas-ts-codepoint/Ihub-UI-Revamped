import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, matchRoutes, RouterProvider } from 'react-router';

import { appRoutes } from '@/app/router/router';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { paths } from '@/shared/config/paths';
import { useTrackingStore } from '@/store/tracking.store';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  useTrackingStore.getState().reset();
  await i18n.changeLanguage('en');
});

function renderPath(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('M10.3 /home/assigned/:queue', () => {
  it.each([
    [paths.home.assigned('approvals'), 'Approvals'],
    [paths.home.assigned('verify'), 'Verify'],
    [paths.home.assigned('tasks'), 'Assigned Tasks'],
  ])('mounts the Assigned page (not the pending marker) at %s', async (path, heading) => {
    const router = renderPath(path);
    expect(await screen.findByTestId('home-top-banner')).toBeVisible();
    expect(screen.getByRole('heading', { name: heading })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(within(screen.getByTestId('home-tab-bar')).getByRole('button', { current: 'page' })).toHaveTextContent('Assigned');
    router.dispose();
  });

  it('keeps the D13 homeTab handle for every queue', () => {
    for (const queue of ['approvals', 'verify', 'tasks']) {
      expect(matchRoutes(appRoutes, paths.home.assigned(queue))?.at(-1)?.route.handle).toEqual({ homeTab: 'assigned' });
    }
  });

  it('renders 404 for an unknown queue', async () => {
    const router = renderPath('/home/assigned/unknown');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeVisible();
    router.dispose();
  });

  it('restores the filters from the URL', async () => {
    const router = renderPath('/home/assigned/verify?type=budgets&sub=new-budget&priority=high&q=budget');
    expect(await screen.findByRole('combobox', { name: 'Record type' })).toHaveValue('budgets');
    expect(screen.getByRole('combobox', { name: 'Sub type' })).toHaveValue('new-budget');
    expect(screen.getByRole('combobox', { name: 'Priority' })).toHaveValue('high');
    expect(screen.getByPlaceholderText('Search code or subject…')).toHaveValue('budget');
    router.dispose();
  });

  it('keeps the queue state while moving between Home tabs inside the layout', async () => {
    const user = userEvent.setup();
    const router = renderPath('/home/assigned/approvals');
    await screen.findByTestId('assigned-tabs');
    await user.click(screen.getAllByRole('button', { name: 'Reject' })[0] as HTMLElement);
    expect(screen.getAllByTestId(/^action-card-A/)).toHaveLength(9);
    await router.navigate(paths.home.view('approvals'));
    expect(await screen.findByRole('heading', { name: 'Approvals' })).toBeVisible();
    expect(screen.getAllByTestId(/^action-card-A/)).toHaveLength(9);
    router.dispose();
  });
});

describe('M10.3 /home/incidents/live', () => {
  it('mounts the incident centre and live feed under the Incidents tab', async () => {
    const router = renderPath(paths.home.incidents('live'));
    expect(await screen.findByTestId('home-top-banner')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Incident center' })).toBeVisible();
    expect(screen.getByTestId('live-feed')).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(within(screen.getByTestId('home-tab-bar')).getByRole('button', { current: 'page' })).toHaveTextContent('Incidents');
    router.dispose();
  });

  it('switches between the sub-tabs without losing queue state', async () => {
    const user = userEvent.setup();
    const router = renderPath(paths.home.incidents('live'));
    const subTabs = await screen.findByTestId('incidents-sub-tabs');
    await user.click(within(screen.getByTestId('incident-card-INC-2034')).getByRole('button', { name: 'Action' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Close case' }));
    expect(screen.queryByTestId('incident-card-INC-2034')).not.toBeInTheDocument();

    fireEvent.click(within(subTabs).getByRole('button', { name: 'Incident Reports' }));
    expect(router.state.location.pathname).toBe('/home/incidents/reports');
    fireEvent.click(within(await screen.findByTestId('incidents-sub-tabs')).getByRole('button', { name: 'Live Incidents' }));
    expect(await screen.findByTestId('incident-center')).toBeVisible();
    expect(screen.queryByTestId('incident-card-INC-2034')).not.toBeInTheDocument();
    router.dispose();
  });

  it('tracks an Incident Reports record into the Live Incidents centre and feed', async () => {
    const user = userEvent.setup();
    const router = renderPath(paths.home.incidents('reports'));
    const subTabs = await screen.findByTestId('incidents-sub-tabs');
    fireEvent.click(await screen.findByRole('button', { name: 'Incident Listing' }));
    await user.click(screen.getByRole('button', { name: 'Actions INC-2036' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Track' }));

    fireEvent.click(within(subTabs).getByRole('button', { name: 'Live Incidents' }));
    const tracked = await screen.findByTestId('incident-card-INC-2036');
    expect(within(tracked).getByText('Trampoline pad tear — bay 3')).toBeVisible();
    expect(within(tracked).getByText('Tracking')).toBeVisible();
    expect(within(tracked).getByText('Within SLA')).toBeVisible();
    const feed = within(screen.getByTestId('live-feed'));
    expect(feed.getByText('2 tracked')).toBeVisible();
    expect(feed.getByText('Added to tracking from the incident listing.')).toBeVisible();
    router.dispose();
  });

  it('keeps the D13 homeTab handle', () => {
    expect(matchRoutes(appRoutes, paths.home.incidents('live'))?.at(-1)?.route.handle).toEqual({ homeTab: 'incidents' });
  });
});
