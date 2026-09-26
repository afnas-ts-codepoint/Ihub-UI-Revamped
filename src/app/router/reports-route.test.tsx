import { cleanup, render, screen } from '@testing-library/react';
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

describe('M3.9 Reports Library routes', () => {
  it('renders the unwrapped Reports Library at /reports', async () => {
    const router = renderRoute('/reports');
    expect(
      await screen.findByRole('heading', { name: 'Analytics & Reports' }),
    ).toBeVisible();
    expect(screen.queryByText('Section', { selector: 'button' })).toBeNull();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    router.dispose();
  });

  it('preserves the separate future /home/reports view as MigrationPending under D12', async () => {
    const router = renderRoute('/home/reports');
    expect(await screen.findByRole('status')).toHaveAttribute(
      'data-migration-pending',
      'Analytics & Reports',
    );
    router.dispose();
  });

  it('keeps report descendants as final prototype placeholders', async () => {
    const router = renderRoute('/reports/hr/attendance-summary');
    expect(
      await screen.findByRole('heading', { name: 'Attendance Summary' }),
    ).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    router.dispose();
  });

  it('keeps unknown report descendants on the approved 404 path', async () => {
    const router = renderRoute('/reports/not-a-report');
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeVisible();
    router.dispose();
  });
});
