import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { appRoutes } from '@/app/router/router';
import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(cleanup);

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  const view = render(<RouterProvider router={router} />);
  return { ...view, router };
}

/** D14: screenless HR child leaves stay faithful prototype placeholders. */
describe('HR (Overtime) child leaves stay PlaceholderPage (D14)', () => {
  it.each([
    ['/hr/dashboard', 'Dashboard'],
    ['/hr/workforce-statistics', 'Workforce Statistics'],
    ['/hr/overtime', 'Overtime'],
    ['/hr/overtime/to-do', 'To Do'],
    ['/hr/overtime/record-listing', 'Record Listing'],
    ['/hr/investigations', 'Investigations'],
    ['/hr/violations', 'Violations'],
    ['/hr/loan', 'Loan'],
    ['/hr/end-of-probation', 'End of Probation'],
    ['/hr/exit-interview', 'Exit Interview'],
  ])('renders %s as a PlaceholderPage titled %s', async (path, title) => {
    const { router } = renderRoute(path);

    expect(
      await screen.findByRole('heading', { name: title }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Module landing — connect your data to see live content.',
      ),
    ).toBeVisible();
    expect(screen.queryByRole('status')).toBeNull();
    router.dispose();
  });

  it('keeps the migrated /hr root screen distinct from its placeholder children', async () => {
    const { router } = renderRoute('/hr');

    expect(
      await screen.findByRole('heading', { name: 'Workforce' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Module landing — connect your data to see live content.',
      ),
    ).toBeNull();
    router.dispose();
  });
});
