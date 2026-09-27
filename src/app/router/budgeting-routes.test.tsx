import { cleanup, render, screen } from '@testing-library/react';
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

  it('does not expose M6.2 routes or content', async () => {
    const router = renderRoute('/home/budgets/new-budget');
    expect(await screen.findByRole('status')).toHaveAttribute(
      'data-migration-pending',
    );
    router.dispose();
  });
});
