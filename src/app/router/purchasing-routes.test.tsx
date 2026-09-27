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

describe('M6.3 Home Purchasing routes', () => {
  it.each([
    ['/home/purchasing', 'Purchase Committee Request'],
    ['/home/purchasing/create', 'Purchase Committee Request'],
    ['/home/purchasing/pending', 'Pending Requests'],
    ['/home/purchasing/edit', 'Edit PC Request'],
    ['/home/purchasing/review', 'Review Purchase Requests'],
    ['/home/purchasing/todo', 'To Do 2'],
    ['/home/purchasing/missing', 'Missing Documents'],
    ['/home/purchasing/history', 'History'],
    ['/home/purchasing/report', 'Run the report to generate results. The table will render here.'],
  ])('renders the Home Purchasing section at %s', async (path, expected) => {
    const router = renderRoute(path);
    expect(await screen.findByTestId('home-top-banner')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Purchasing' })).toBeVisible();
    if (expected.endsWith('2')) {
      expect(screen.getByRole('tab', { name: expected })).toBeVisible();
    } else {
      expect(screen.getAllByText(expected)[0]).toBeVisible();
    }
    expect(screen.queryByText('Migration pending')).toBeNull();
    router.dispose();
  });

  it('renders 404 for an unknown Home Purchasing section', async () => {
    const router = renderRoute('/home/purchasing/not-a-section');
    expect(await screen.findByRole('heading', { name: /not found/i })).toBeVisible();
    router.dispose();
  });

  it('navigates between Home Purchasing sections and restores the default create section on browser back', async () => {
    const user = userEvent.setup();
    const router = renderRoute('/home/purchasing');
    await screen.findByRole('heading', { name: 'Purchasing' });

    await user.click(screen.getByRole('link', { name: 'Missing Documents' }));
    await waitFor(() => { expect(router.state.location.pathname).toBe('/home/purchasing/missing'); });
    expect(screen.getByRole('link', { name: 'Missing Documents' })).toHaveAttribute('aria-current', 'page');

    await act(async () => { await router.navigate(-1); });
    await waitFor(() => { expect(router.state.location.pathname).toBe('/home/purchasing'); });
    expect(screen.getByRole('link', { name: 'Purchase Committee Request' })).toHaveAttribute('aria-current', 'page');
    router.dispose();
  });

  it('keeps /home/budgets and /finance routes unaffected', async () => {
    const budgets = renderRoute('/home/budgets');
    expect(await screen.findByRole('heading', { name: 'Budgets' })).toBeVisible();
    budgets.dispose();

    const finance = renderRoute('/finance');
    expect(await screen.findByRole('heading', { name: 'Finance & Budgets' })).toBeVisible();
    finance.dispose();
  });
});
