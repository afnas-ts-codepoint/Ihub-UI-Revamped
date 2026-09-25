import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router';

import { RouteErrorPage } from '@/app/router/RouteErrorPage';
import { appRoutes, createAppRouter } from '@/app/router/router';
import { initializeI18n } from '@/shared/i18n/i18n';
import { logger } from '@/shared/lib/logger';

function RouteFailure(): never {
  throw new Error('private stack detail');
}

beforeAll(async () => {
  await initializeI18n('en');
});

describe('router skeleton', () => {
  it('renders NotFoundPage for an unknown URL', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/not-migrated'],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
    router.dispose();
  });

  it('renders a safe route fallback without exposing the thrown error', async () => {
    const log = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const controlledRoutes = [
      {
        path: '/',
        element: <RouteFailure />,
        errorElement: <RouteErrorPage />,
      },
    ] satisfies RouteObject[];
    const router = createMemoryRouter(controlledRoutes, {
      initialEntries: ['/'],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole('heading', {
        name: 'This page could not be displayed',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/private stack detail/)).not.toBeInTheDocument();
    expect(log).toHaveBeenCalledWith(
      'Route rendering failed',
      expect.any(Error),
    );
    router.dispose();
    log.mockRestore();
    consoleError.mockRestore();
  });

  it('creates browser and hash routers with the configured basename', () => {
    window.history.replaceState({}, '', '/portal/');
    const browserRouter = createAppRouter({
      basePath: '/portal',
      routerMode: 'browser',
    });
    expect(browserRouter.basename).toBe('/portal');
    browserRouter.dispose();

    window.location.hash = '#/portal/';
    const hashRouter = createAppRouter({
      basePath: '/portal',
      routerMode: 'hash',
    });
    expect(hashRouter.basename).toBe('/portal');
    hashRouter.dispose();

    window.history.replaceState({}, '', '/');
    window.location.hash = '';
  });
});
