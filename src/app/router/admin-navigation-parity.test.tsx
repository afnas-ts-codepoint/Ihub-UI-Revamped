import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, matchRoutes, RouterProvider } from 'react-router';

import { appRoutes } from '@/app/router/router';
import { ADMIN_MASTER_CATALOG } from '@/features/masters';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => {
  await initializeI18n('en');
});

afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  const view = render(<RouterProvider router={router} />);
  return { ...view, router };
}

describe('temporary M2.1 Admin route parity', () => {
  it('resolves all 27 entries through both Masters route variants', () => {
    for (const entry of ADMIN_MASTER_CATALOG) {
      expect(matchRoutes(appRoutes, entry.path)).not.toBeNull();
      expect(matchRoutes(appRoutes, entry.listPath)).not.toBeNull();
    }
  });

  it.each([
    ['/masters', '/masters/admin/project-category-master'],
    ['/masters/admin', '/masters/admin/project-category-master'],
    ['/masters-list', '/masters-list/admin/project-category-master'],
    ['/masters-list/admin', '/masters-list/admin/project-category-master'],
  ])('redirects %s to the first Admin leaf', async (from, expected) => {
    const { router, unmount } = renderRoute(from);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(expected);
    });
    unmount();
    router.dispose();
  });

  it('routes the built Project Category screen to MigrationPending', async () => {
    const { router } = renderRoute('/masters/admin/project-category-master');

    expect(await screen.findByRole('status')).toHaveAttribute(
      'data-migration-pending',
      'Project Category Master',
    );
    router.dispose();
  });

  it('routes prototype-screenless Admin entries to PlaceholderPage', async () => {
    const { router } = renderRoute('/masters/admin/brand');

    expect(
      await screen.findByRole('heading', { name: 'Brand' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Module landing — connect your data to see live content.',
      ),
    ).toBeInTheDocument();
    router.dispose();
  });

  it('keeps the prototype English item-label fallback in Arabic mode', async () => {
    await i18n.changeLanguage('ar');
    const { router } = renderRoute('/masters-list/admin/brand');

    expect(
      await screen.findByRole('heading', { name: 'Brand' }),
    ).toBeInTheDocument();
    router.dispose();
  });

  it('does not accept unapproved categories or unknown Admin items', async () => {
    const first = renderRoute('/masters/general/machine-master');
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
    first.unmount();
    first.router.dispose();

    const second = renderRoute('/masters/admin/not-in-the-prototype');
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
    second.router.dispose();
  });
});
