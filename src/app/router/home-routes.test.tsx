import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { appRoutes } from '@/app/router/router';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

function renderPath(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('M5.1 Home routes', () => {
  it('mounts the Home frame and keeps later Overview content pending', async () => {
    const router = renderPath('/home/overview');
    expect(await screen.findByTestId('home-top-banner')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Overview');
    expect(screen.getByRole('button', { name: /Overview/ })).toHaveAttribute('aria-current', 'page');
    router.dispose();
  });

  it('reuses the approved SOP Checklist through the Home frame', async () => {
    const router = renderPath('/home/sop-checklist');
    expect(await screen.findByTestId('home-top-banner')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'SOP Checklist' })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    router.dispose();
  });

  it('reuses the approved SLA screen through the Home frame', async () => {
    const router = renderPath('/home/sla');
    expect(await screen.findByTestId('home-top-banner')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'SLA & Compliance' })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    router.dispose();
  });

  it('switches incidents sub-tabs by URL while their later content stays pending', async () => {
    const router = renderPath('/home/incidents/reports');
    const subTabs = await screen.findByTestId('incidents-sub-tabs');
    expect(withinTab(subTabs, 'Incident Reports')).toHaveAttribute('aria-current', 'page');
    fireEvent.click(withinTab(subTabs, 'Live Incidents'));
    expect(router.state.location.pathname).toBe('/home/incidents/live');
    expect(screen.getByRole('status')).toHaveTextContent('Live Incidents');
    router.dispose();
  });

  it('wraps task detail and edit markers in HomeBannerLayout with no active tab', async () => {
    const viewRouter = renderPath('/tasks/JO-7779');
    expect(await screen.findByTestId('home-top-banner')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Task Details');
    expect(
      within(screen.getByTestId('home-tab-bar')).queryByRole('button', {
        current: 'page',
      }),
    ).not.toBeInTheDocument();
    viewRouter.dispose();
    cleanup();

    const editRouter = renderPath('/tasks/JO-7779/edit');
    expect(await screen.findByTestId('home-top-banner')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Edit Task');
    editRouter.dispose();
  });
});

function withinTab(container: HTMLElement, name: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (candidate) => candidate.textContent === name,
  );
  if (!button) throw new Error(`Expected incidents tab: ${name}`);
  return button;
}
