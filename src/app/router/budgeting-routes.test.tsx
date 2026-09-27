import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { appRoutes } from '@/app/router/router';
import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(cleanup);

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('M6.1 finance routes', () => {
  it.each(['/finance', '/finance/dashboard'])(
    'renders the dashboard at %s',
    async (path) => {
      const router = renderRoute(path);
      expect(
        await screen.findByRole('heading', { name: 'Finance & Budgets' }),
      ).toBeVisible();
      expect(screen.getByText('Budget utilisation by month')).toBeVisible();
      expect(screen.queryByText('Migration pending')).toBeNull();
      router.dispose();
    },
  );

  it('renders the Budgeting workspace at /finance/budgeting', async () => {
    const router = renderRoute('/finance/budgeting');
    expect(
      await screen.findByRole('heading', { name: 'Finance & Budgets' }),
    ).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Balance Report' })).toBeVisible();
    expect(screen.queryByText('Migration pending')).toBeNull();
    router.dispose();
  });

  it('keeps the approved Section report at every M6.1 route', async () => {
    const router = renderRoute('/finance/budgeting?view=report');
    expect(
      await screen.findByRole('heading', { name: 'Budgeting — Report' }),
    ).toBeVisible();
    router.dispose();
  });

  it.each([
    ['/home/budgets', 'Budget sheet'],
    ['/home/budgets/sheet', 'Budget sheet'],
    ['/home/budgets/activities', 'New Budget Activity'],
    ['/home/budgets/new-budget', 'Add a New Budget'],
    ['/home/budgets/additional-budget', 'Pending 4'],
    ['/home/budgets/transfer-fund', 'Pending 4'],
    ['/home/budgets/report', 'Projected revenue by month'],
  ])('renders the Home Budgeting section at %s', async (path, expected) => {
    const router = renderRoute(path);
    expect(await screen.findByTestId('home-top-banner')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Budgets' })).toBeVisible();
    if (expected.startsWith('Pending')) {
      expect(screen.getByRole('tab', { name: expected })).toBeVisible();
    } else {
      expect(screen.getAllByText(expected)[0]).toBeVisible();
    }
    expect(screen.queryByText('Projected vs Actual Revenue')).toBeNull();
    expect(screen.queryByText('Migration pending')).toBeNull();
    router.dispose();
  });

  it('renders 404 for an unknown Home Budgeting section', async () => {
    const router = renderRoute('/home/budgets/not-a-section');
    expect(await screen.findByRole('heading', { name: /not found/i })).toBeVisible();
    router.dispose();
  });

  it('navigates between Home Budgeting sections and restores the default sheet on browser back', async () => {
    const user = userEvent.setup();
    const router = renderRoute('/home/budgets');
    await screen.findByRole('heading', { name: 'Budgets' });

    await user.click(screen.getByRole('link', { name: 'Budget activities' }));
    await waitFor(() => { expect(router.state.location.pathname).toBe('/home/budgets/activities'); });
    expect(screen.getByRole('link', { name: 'Budget activities' })).toHaveAttribute('aria-current', 'page');

    await act(async () => { await router.navigate(-1); });
    await waitFor(() => { expect(router.state.location.pathname).toBe('/home/budgets'); });
    expect(screen.getByRole('link', { name: 'Budget sheet' })).toHaveAttribute('aria-current', 'page');
    router.dispose();
  });
});
