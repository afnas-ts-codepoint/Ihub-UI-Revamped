import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { appRoutes } from './router';
import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(cleanup);

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('M7.3 Observation routes', () => {
  it.each([
    ['/home/work-centre/observations', 'observation-add'],
    ['/home/work-centre/observations/add', 'observation-add'],
    ['/home/work-centre/observations/assignment', 'observation-assignment'],
    ['/home/work-centre/observations/history', 'observation-history'],
  ])(
    'renders the real view at %s without redirecting',
    async (path, testId) => {
      const router = renderRoute(path);
      expect(await screen.findByTestId(testId)).toBeVisible();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(router.state.location.pathname).toBe(path);
      router.dispose();
    },
  );

  it('renders the real report and rejects an invalid child', async () => {
    const reportRouter = renderRoute('/home/work-centre/observations/report');
    expect(
      await screen.findByRole('heading', { name: 'Observations — Report' }),
    ).toBeVisible();
    reportRouter.dispose();
    cleanup();

    const invalidRouter = renderRoute('/home/work-centre/observations/unknown');
    expect(
      await screen.findByRole('heading', { name: /not found/i }),
    ).toBeVisible();
    invalidRouter.dispose();
  });
});
