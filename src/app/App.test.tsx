import { render, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter } from 'react-router';

import { App } from '@/app/App';
import { appRoutes } from '@/app/router/router';
import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => {
  await initializeI18n('en');
});

describe('App', () => {
  it('redirects the root to the Home overview route', async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ['/'] });
    render(<App router={router} />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/home/overview');
    });
    expect(await screen.findByRole('status')).toHaveAttribute(
      'data-migration-pending',
      'Overview',
    );
    router.dispose();
  });
});
