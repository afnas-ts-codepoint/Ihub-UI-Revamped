import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { appRoutes } from '@/app/router/router';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

describe('History route integration', () => {
  it('updates the route-derived scope and rows between History leaves', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/history/work-centre/tasks'],
    });
    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'Tasks' })).toBeVisible();
    expect(screen.getByText('TAS-2026000')).toBeVisible();

    await router.navigate('/history/work-centre/incidents');
    expect(
      await screen.findByRole('heading', { name: 'Incidents' }),
    ).toBeVisible();
    expect(screen.getByText('INC-2026000')).toBeVisible();
    expect(screen.queryByText('TAS-2026000')).not.toBeInTheDocument();
    router.dispose();
  });

  it('keeps report behavior and resets to Section on a leaf transition', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/history/work-centre/tasks?view=report'],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole('heading', { name: 'History — Report' }),
    ).toBeVisible();
    await router.navigate('/history/work-centre/incidents');
    await waitFor(() => {
      expect(router.state.location.search).toBe('');
    });
    expect(
      await screen.findByRole('heading', { name: 'Incidents' }),
    ).toBeVisible();
    router.dispose();
  });
});
