import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { appRoutes } from './router';
import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(cleanup);

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('M7.2 Enquiry routes', () => {
  it.each([
    ['/home/work-centre/enquiry', 'Add an Enquiry'],
    ['/home/work-centre/enquiry/add', 'Add an Enquiry'],
  ])(
    'renders the real Add screen at %s without redirecting',
    async (path, heading) => {
      const router = renderRoute(path);
      expect(
        await screen.findByRole('heading', { name: heading }),
      ).toBeVisible();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(router.state.location.pathname).toBe(path);
      router.dispose();
    },
  );

  it('renders History and returns to Add through the visible header action', async () => {
    const user = userEvent.setup();
    const router = renderRoute('/home/work-centre/enquiry/history');
    expect(await screen.findByTestId('enquiry-history')).toBeVisible();
    const addLinks = screen.getAllByRole('link', { name: 'Add an Enquiry' });
    const headerAdd = addLinks[0];
    if (!headerAdd)
      throw new Error('Expected the History Add an Enquiry action');
    await user.click(headerAdd);
    expect(router.state.location.pathname).toBe(
      '/home/work-centre/enquiry/add',
    );
    expect(
      await screen.findByRole('heading', { name: 'Add an Enquiry' }),
    ).toBeVisible();
    router.dispose();
  });

  it('retains not-found behavior for an invalid Enquiry child', async () => {
    const router = renderRoute('/home/work-centre/enquiry/unknown');
    expect(
      await screen.findByRole('heading', { name: /not found/i }),
    ).toBeVisible();
    router.dispose();
  });
});
