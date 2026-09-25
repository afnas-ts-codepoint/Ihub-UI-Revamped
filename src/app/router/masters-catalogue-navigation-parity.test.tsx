import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, matchRoutes, RouterProvider } from 'react-router';

import { appRoutes } from '@/app/router/router';
import { MASTER_CATALOG } from '@/features/masters';
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

describe('M2.1 complete Masters catalogue route parity', () => {
  it('resolves all 80 entries through both Masters route variants', () => {
    for (const entry of MASTER_CATALOG) {
      expect(matchRoutes(appRoutes, entry.path)).not.toBeNull();
      expect(matchRoutes(appRoutes, entry.listPath)).not.toBeNull();
    }
  });

  it.each([
    ['/masters', '/masters/admin/project-category-master'],
    ['/masters/admin', '/masters/admin/project-category-master'],
    ['/masters/general', '/masters/general/machine-master'],
    ['/masters/hr', '/masters/hr/appraisal-deduction'],
    ['/masters/operation', '/masters/operation/assignment-areas'],
    ['/masters-list', '/masters-list/admin/project-category-master'],
    ['/masters-list/admin', '/masters-list/admin/project-category-master'],
    ['/masters-list/general', '/masters-list/general/machine-master'],
    ['/masters-list/hr', '/masters-list/hr/appraisal-deduction'],
    ['/masters-list/operation', '/masters-list/operation/assignment-areas'],
  ])('redirects %s to the correct first leaf', async (from, expected) => {
    const { router, unmount } = renderRoute(from);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(expected);
    });
    unmount();
    router.dispose();
  });

  it.each([
    ['/masters/admin/project-category-master', 'Project Category Master'],
    ['/masters-list/general/machine-master', 'Machine Master'],
    ['/masters/operation/assignment-areas', 'Assignment Areas'],
    ['/masters-list/operation/task-mapping', 'Task Mapping'],
    ['/masters/operation/sub-area', 'Sub Area'],
  ])(
    'routes the built screen at %s to MigrationPending',
    async (path, title) => {
      const { router } = renderRoute(path);

      expect(await screen.findByRole('status')).toHaveAttribute(
        'data-migration-pending',
        title,
      );
      router.dispose();
    },
  );

  it.each([
    ['/masters/admin/brand', 'Brand'],
    ['/masters-list/general/asset-category', 'Asset Category'],
    ['/masters/hr/employees', 'Employees'],
    ['/masters-list/operation/area', 'Area'],
  ])(
    'routes the screenless entry at %s to PlaceholderPage',
    async (path, title) => {
      const { container, router } = renderRoute(path);

      expect(
        await screen.findByRole('heading', { name: title }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Module landing — connect your data to see live content.',
        ),
      ).toBeInTheDocument();
      expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(
        6,
      );
      router.dispose();
    },
  );

  it('keeps the prototype English item-label fallback in Arabic mode', async () => {
    await i18n.changeLanguage('ar');
    const { router } = renderRoute('/masters/operation/item-unit');

    expect(
      await screen.findByRole('heading', { name: 'Item Unit' }),
    ).toBeInTheDocument();
    router.dispose();
  });

  it('returns 404 for unknown categories and items', async () => {
    const first = renderRoute('/masters/finance/unknown');
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
    first.unmount();
    first.router.dispose();

    const second = renderRoute('/masters/operation/not-in-the-prototype');
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
    second.router.dispose();
  });
});
