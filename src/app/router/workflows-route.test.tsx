import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { appRoutes } from './router';
import enWorkflows from '@/shared/i18n/locales/en/workflows.json';
import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(cleanup);

describe('Workflows route', () => {
  it('renders the real screen instead of MigrationPending', async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ['/workflows'] });
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole('tab', { name: enWorkflows.tabs.rules })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    router.dispose();
  });

  it('retains SectionLayout report mode and returns to the workflow screen', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(appRoutes, { initialEntries: ['/workflows?view=report'] });
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole('heading', { name: /Workflows.*Report/ })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Section' }));
    expect(await screen.findByRole('tab', { name: enWorkflows.tabs.rules })).toBeVisible();
    router.dispose();
  });
});
