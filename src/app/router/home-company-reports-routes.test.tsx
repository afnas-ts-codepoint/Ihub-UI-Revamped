import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { appRoutes } from './router';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('M10.4 Home Company and Reports routes', () => {
  it('renders /home/company under the Home banner with no Home tab active', async () => {
    const router = renderRoute('/home/company');
    expect(await screen.findByTestId('home-top-banner')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'This quarter' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Company' })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    const tabs = within(screen.getByTestId('home-tab-bar'));
    expect(
      tabs.getAllByRole('button').filter((tab) => tab.getAttribute('aria-current') === 'page'),
    ).toHaveLength(0);
    router.dispose();
  });

  it('renders /home/reports with the Analytics & Reports tab active', async () => {
    const router = renderRoute('/home/reports');
    expect(await screen.findByTestId('home-top-banner')).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Analytics & Reports' }),
    ).toBeVisible();
    const tabs = within(screen.getByTestId('home-tab-bar'));
    expect(tabs.getByRole('button', { current: 'page' })).toHaveTextContent(
      'Analytics & Reports',
    );
    router.dispose();
  });

  it('opens the Home reports view from the Home tab strip', async () => {
    const user = userEvent.setup();
    const router = renderRoute('/home/approvals');
    const tabs = within(await screen.findByTestId('home-tab-bar'));
    await user.click(tabs.getByRole('button', { name: /Analytics & Reports/ }));
    expect(router.state.location.pathname).toBe('/home/reports');
    expect(
      await screen.findByRole('button', { name: 'Attendance Summary' }),
    ).toBeVisible();
    router.dispose();
  });

  it('leaves /home/tasks as MigrationPending until the M10.3 JobOrderCard is available', async () => {
    const router = renderRoute('/home/tasks');
    expect(await screen.findByRole('status')).toHaveAttribute(
      'data-migration-pending',
      'Tasks',
    );
    router.dispose();
  });
});
