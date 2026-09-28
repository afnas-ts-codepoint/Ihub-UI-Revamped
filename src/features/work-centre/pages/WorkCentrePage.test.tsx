import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { WorkCentrePage } from './WorkCentrePage';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

function renderPath(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/home/work-centre/:section?/:child?',
        element: <WorkCentrePage notFound={<div data-testid="not-found" />} />,
      },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('M7.1 Work Centre hub', () => {
  it('defaults at the sectionless URL to General / Create a New Task without redirecting', () => {
    const router = renderPath('/home/work-centre');
    expect(screen.getByRole('link', { name: 'General' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Create a New Task' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('status')).toHaveAttribute('data-migration-pending', 'Create a New Task');
    expect(router.state.location.pathname).toBe('/home/work-centre');
  });

  it('switches groups to the first visible section and does not remember an earlier selection', async () => {
    const user = userEvent.setup();
    const router = renderPath('/home/work-centre/observations/history');
    await user.click(screen.getByRole('link', { name: 'Commercial' }));
    expect(router.state.location.pathname).toBe('/home/work-centre/price-change');
    expect(screen.getByRole('heading', { name: 'Price Change' })).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'General' }));
    expect(router.state.location.pathname).toBe('/home/work-centre/create-task');
  });

  it('switches sections and defaults child sections to their first visible child', async () => {
    const user = userEvent.setup();
    const router = renderPath('/home/work-centre/create-task');
    await user.click(screen.getByRole('link', { name: 'Enquiry' }));
    expect(router.state.location.pathname).toBe('/home/work-centre/enquiry/add');
    expect(screen.getByRole('link', { name: 'Add an Enquiry' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('link', { name: 'History' }));
    expect(router.state.location.pathname).toBe('/home/work-centre/enquiry/history');
  });

  it('keeps Create Task, Tasks, and future dedicated screens pending', () => {
    for (const path of [
      '/home/work-centre/create-task',
      '/home/work-centre/tasks',
      '/home/work-centre/enquiry/add',
      '/home/work-centre/observations/add',
      '/home/work-centre/snag-lists/add',
    ]) {
      const router = renderPath(path);
      expect(screen.getByRole('status')).toHaveAttribute('data-migration-pending');
      router.dispose();
      cleanup();
    }
  });

  it.each([
    ['/home/work-centre/price-change', 'Price Change'],
    ['/home/work-centre/promotions', 'Promotions'],
    ['/home/work-centre/checklists/create', 'Checklists'],
  ])('renders the prototype fallback at %s', (path, heading) => {
    renderPath(path);
    expect(screen.getByRole('heading', { name: heading })).toBeVisible();
    expect(screen.getByTestId('work-centre-fallback')).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('uses the sheet filter and preserves the inert checklist header action', async () => {
    const user = userEvent.setup();
    const router = renderPath('/home/work-centre/checklists/create');
    expect(screen.getByPlaceholderText(/AS-2026-114/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Create a New Checklist' }));
    expect(router.state.location.pathname).toBe('/home/work-centre/checklists/create');
    expect(screen.getByTestId('work-centre-fallback')).toBeVisible();
  });

  it('renders literal Open/Closed counts and keeps the same four rows after tab switching', async () => {
    const user = userEvent.setup();
    renderPath('/home/work-centre/price-change');
    const table = screen.getByRole('table');
    expect(screen.getByRole('tab', { name: 'Open 12' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Closed 47' })).toBeVisible();
    expect(within(table).getByText('ENQ-118')).toBeVisible();
    expect(within(table).getByText('Aircon noise on floor 3 — escalating after 8 PM')).toBeVisible();
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    await user.click(screen.getByRole('tab', { name: 'Closed 47' }));
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    expect(within(table).getByText('ENQ-118')).toBeVisible();
  });

  it('does not expose the hidden legacy create tab or the absent incident pill', () => {
    renderPath('/home/work-centre/create-task');
    expect(screen.queryByRole('link', { name: 'Create' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Incidents' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Create a New Task' })).toHaveLength(1);
  });

  it.each([
    '/home/work-centre/unknown',
    '/home/work-centre/create-task/legacy-create',
    '/home/work-centre/checklists/unknown',
  ])('rejects the invalid Work Centre path %s', (path) => {
    renderPath(path);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    expect(screen.queryByTestId('work-centre-fallback')).not.toBeInTheDocument();
  });

  it('renders Arabic navigation in RTL while preserving English-only fallback content and Latin digits', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderPath('/home/work-centre/price-change');
    expect(screen.getByRole('link', { name: 'تجاري' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'تغيير السعر' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Ref #' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Open 12' })).toBeVisible();
  });
});
