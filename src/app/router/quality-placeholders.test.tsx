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

/** D14: screenless Quality & Compliance child leaves stay faithful placeholders. */
describe('Quality & Compliance child leaves stay PlaceholderPage (D14)', () => {
  it.each([
    ['/quality/dashboard', 'Dashboard'],
    ['/quality/observations', 'Observations'],
    ['/quality/quality-assurance-checklists', 'Quality Assurance Checklists'],
    ['/quality/quality-assurance-checklists/risk-levels', 'Risk Levels'],
    [
      '/quality/quality-assurance-checklists/standard-parameters',
      'Standard Parameters',
    ],
    [
      '/quality/quality-assurance-checklists/zone-accountability',
      'Zone Accountability',
    ],
    ['/quality/quality-assurance-checklists/standards', 'Standards'],
    [
      '/quality/quality-assurance-checklists/create-checklist',
      'Create Checklist',
    ],
    ['/quality/quality-assurance-checklists/fill-checklist', 'Fill Checklist'],
    [
      '/quality/quality-assurance-checklists/edit-filled-checklist',
      'Edit Filled Checklist',
    ],
    ['/quality/quality-assurance-checklists/report', 'Report'],
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

  it('keeps SLA pending and distinct from D14 placeholders', async () => {
    const { router } = renderRoute('/quality/sla');

    expect(await screen.findByRole('status')).toHaveAttribute(
      'data-migration-pending',
    );
    expect(
      screen.queryByText(
        'Module landing — connect your data to see live content.',
      ),
    ).toBeNull();
    router.dispose();
  });

  it('keeps the migrated /quality root distinct from its children', async () => {
    const { router } = renderRoute('/quality');

    expect(
      await screen.findByRole('heading', { name: 'SOP Checklist' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
    router.dispose();
  });
});
