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
        element: (
          <WorkCentrePage
            notFound={<div data-testid="not-found" />}
            renderEnquiries={(view) => (
              <div data-testid="enquiries-view">{view}</div>
            )}
            renderObservations={(view) => (
              <div data-testid="observations-view">{view}</div>
            )}
            renderSnagLists={(view) => (
              <div data-testid="snag-lists-view">{view}</div>
            )}
          />
        ),
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
    expect(screen.getByRole('link', { name: 'General' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('link', { name: 'Create a New Task' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('status')).toHaveAttribute(
      'data-migration-pending',
      'Create a New Task',
    );
    expect(router.state.location.pathname).toBe('/home/work-centre');
  });

  it('switches groups to the first visible section and does not remember an earlier selection', async () => {
    const user = userEvent.setup();
    const router = renderPath('/home/work-centre/observations/history');
    await user.click(screen.getByRole('link', { name: 'Commercial' }));
    expect(router.state.location.pathname).toBe(
      '/home/work-centre/price-change',
    );
    expect(screen.getByRole('heading', { name: 'Price Change' })).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'General' }));
    expect(router.state.location.pathname).toBe(
      '/home/work-centre/create-task',
    );
  });

  it('switches sections and defaults child sections to their first visible child', async () => {
    const user = userEvent.setup();
    const router = renderPath('/home/work-centre/create-task');
    await user.click(screen.getByRole('link', { name: 'Enquiry' }));
    expect(router.state.location.pathname).toBe(
      '/home/work-centre/enquiry/add',
    );
    expect(
      screen.getByRole('link', { name: 'Add an Enquiry' }),
    ).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('link', { name: 'History' }));
    expect(router.state.location.pathname).toBe(
      '/home/work-centre/enquiry/history',
    );
  });

  it('keeps Create Task, Tasks, and future dedicated screens pending', () => {
    for (const path of [
      '/home/work-centre/create-task',
      '/home/work-centre/tasks',
    ]) {
      const router = renderPath(path);
      expect(screen.getByRole('status')).toHaveAttribute(
        'data-migration-pending',
      );
      router.dispose();
      cleanup();
    }
  });

  it('renders all real Observation destinations without changing their URLs', () => {
    for (const [path, view] of [
      ['/home/work-centre/observations', 'add'],
      ['/home/work-centre/observations/add', 'add'],
      ['/home/work-centre/observations/assignment', 'assignment'],
      ['/home/work-centre/observations/history', 'history'],
      ['/home/work-centre/observations/report', 'report'],
    ] as const) {
      const router = renderPath(path);
      expect(screen.getByTestId('observations-view')).toHaveTextContent(view);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(router.state.location.pathname).toBe(path);
      router.dispose();
      cleanup();
    }
  });

  it('renders all real Snag Lists destinations without changing their URLs', () => {
    for (const [path, view] of [
      ['/home/work-centre/snag-lists', 'add'],
      ['/home/work-centre/snag-lists/add', 'add'],
      ['/home/work-centre/snag-lists/listing', 'listing'],
      ['/home/work-centre/snag-lists/report', 'report'],
    ] as const) {
      const router = renderPath(path);
      expect(screen.getByTestId('snag-lists-view')).toHaveTextContent(view);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(router.state.location.pathname).toBe(path);
      router.dispose();
      cleanup();
    }
  });

  it('renders the real Enquiry Add and History destinations and keeps their URLs stable', async () => {
    const user = userEvent.setup();
    const router = renderPath('/home/work-centre/enquiry');
    expect(screen.getByTestId('enquiries-view')).toHaveTextContent('add');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/home/work-centre/enquiry');

    await user.click(screen.getByRole('link', { name: 'History' }));
    expect(router.state.location.pathname).toBe(
      '/home/work-centre/enquiry/history',
    );
    expect(screen.getByTestId('enquiries-view')).toHaveTextContent('history');
    expect(
      screen.getAllByRole('link', { name: 'Add an Enquiry' }),
    ).toHaveLength(2);

    const addLinks = screen.getAllByRole('link', { name: 'Add an Enquiry' });
    const headerAdd = addLinks[0];
    if (!headerAdd)
      throw new Error('Expected the History Add an Enquiry action');
    await user.click(headerAdd);
    expect(router.state.location.pathname).toBe(
      '/home/work-centre/enquiry/add',
    );
    expect(screen.getByTestId('enquiries-view')).toHaveTextContent('add');
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
    await user.click(
      screen.getByRole('button', { name: 'Create a New Checklist' }),
    );
    expect(router.state.location.pathname).toBe(
      '/home/work-centre/checklists/create',
    );
    expect(screen.getByTestId('work-centre-fallback')).toBeVisible();
  });

  it.each([
    ['/home/work-centre/checklists', 'Create', 'Create a New Checklist'],
    ['/home/work-centre/checklists/create', 'Create', 'Create a New Checklist'],
    ['/home/work-centre/checklists/sequence', 'Sequence', 'Create a Sequence'],
    ['/home/work-centre/checklists/fill', 'Fill', 'Fill a Checklist'],
    [
      '/home/work-centre/checklists/edit-filled',
      'Edit Filled Checklist',
      'Create a New Checklist',
    ],
  ])(
    'renders the verified checklist fallback at %s with the exact child and action labels',
    async (path, childLabel, actionLabel) => {
      const user = userEvent.setup();
      const router = renderPath(path);
      expect(screen.getByRole('link', { name: childLabel })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(screen.getByRole('button', { name: actionLabel })).toBeVisible();
      expect(screen.getByPlaceholderText(/AS-2026-114/)).toBeVisible();
      expect(screen.getByRole('tab', { name: 'Open 12' })).toBeVisible();
      expect(screen.getByRole('tab', { name: 'Closed 47' })).toBeVisible();
      expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
        5,
      );
      expect(screen.getByRole('table')).toHaveTextContent('ENQ-118');
      expect(screen.getByRole('table')).toHaveTextContent('ENQ-115');

      await user.click(screen.getByRole('button', { name: actionLabel }));
      expect(router.state.location.pathname).toBe(path);
      expect(screen.getByTestId('work-centre-fallback')).toBeVisible();
    },
  );

  it('preserves the prototype English checklist action copy in RTL', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderPath('/home/work-centre/checklists/sequence');
    expect(screen.getByRole('button', { name: 'Create a Sequence' })).toBeVisible();
    expect(screen.getByTestId('work-centre-fallback')).toBeVisible();
  });

  it('renders literal Open/Closed counts and keeps the same four rows after tab switching', async () => {
    const user = userEvent.setup();
    renderPath('/home/work-centre/price-change');
    const table = screen.getByRole('table');
    expect(screen.getByRole('tab', { name: 'Open 12' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Closed 47' })).toBeVisible();
    expect(within(table).getByText('ENQ-118')).toBeVisible();
    expect(
      within(table).getByText(
        'Aircon noise on floor 3 — escalating after 8 PM',
      ),
    ).toBeVisible();
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    await user.click(screen.getByRole('tab', { name: 'Closed 47' }));
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    expect(within(table).getByText('ENQ-118')).toBeVisible();
  });

  it('does not expose the hidden legacy create tab or the absent incident pill', () => {
    renderPath('/home/work-centre/create-task');
    expect(
      screen.queryByRole('link', { name: 'Create' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Incidents' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: 'Create a New Task' }),
    ).toHaveLength(1);
  });

  it.each([
    '/home/work-centre/unknown',
    '/home/work-centre/create-task/legacy-create',
    '/home/work-centre/checklists/unknown',
    '/home/work-centre/snag-lists/unknown',
  ])('rejects the invalid Work Centre path %s', (path) => {
    renderPath(path);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    expect(
      screen.queryByTestId('work-centre-fallback'),
    ).not.toBeInTheDocument();
  });

  it('renders Arabic navigation in RTL while preserving English-only fallback content and Latin digits', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderPath('/home/work-centre/price-change');
    expect(screen.getByRole('link', { name: 'تجاري' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('heading', { name: 'تغيير السعر' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Ref #' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Open 12' })).toBeVisible();
  });
});
