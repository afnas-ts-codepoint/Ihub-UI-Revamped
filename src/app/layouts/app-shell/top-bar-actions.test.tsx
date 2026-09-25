import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRouter } from 'react-router';

import { App } from '@/app/App';
import { bootstrap } from '@/app/bootstrap';
import { appRoutes } from '@/app/router/router';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import {
  preferencesStorageKey,
  usePreferencesStore,
} from '@/store/preferences.store';

beforeAll(async () => {
  await initializeI18n('en');
});

beforeEach(async () => {
  localStorage.clear();
  usePreferencesStore.setState({ locale: 'en', theme: 'paper' });
  await i18n.changeLanguage('en');
  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
  document.documentElement.dataset.theme = 'paper';
});

afterEach(() => {
  cleanup();
});

function renderRoute(path = '/home/overview') {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<App router={router} />);
  return router;
}

describe('M2.3 top-bar actions', () => {
  it('searches, highlights, moves selection, navigates, and closes with Escape', async () => {
    const user = userEvent.setup();
    const router = renderRoute();

    await user.click(await screen.findByRole('button', { name: 'Search' }));
    const input = screen.getByPlaceholderText('Search menu');
    await user.type(input, 'Dashboard');

    const options = await screen.findAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(
      within(options[0] ?? document.body).getByText('Dashboard').tagName,
    ).toBe('MARK');

    await user.keyboard('{ArrowDown}');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowUp}');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/finance/dashboard');
    });
    expect(screen.queryByRole('listbox')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Search' }));
    await user.type(screen.getByPlaceholderText('Search menu'), 'history');
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    router.dispose();
  });

  it('switches and persists Paper/Ink and EN/AR through the existing preference store', async () => {
    const stopBootstrap = await bootstrap();
    const user = userEvent.setup();
    const router = renderRoute();

    await user.click(await screen.findByRole('button', { name: 'Dark mode' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'ink');
    expect(localStorage.getItem(preferencesStorageKey)).toContain(
      '"theme":"ink"',
    );
    await user.click(screen.getByRole('button', { name: 'Light mode' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'paper');

    await user.click(screen.getByRole('button', { name: 'Switch to Arabic' }));
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('lang', 'ar');
      expect(document.documentElement).toHaveAttribute('dir', 'rtl');
      expect(
        screen.getByRole('button', { name: 'الإعدادات والتهيئة' }),
      ).toBeInTheDocument();
    });
    expect(localStorage.getItem(preferencesStorageKey)).toContain(
      '"locale":"ar"',
    );

    await user.click(
      screen.getByRole('button', { name: 'التبديل إلى الإنجليزية' }),
    );
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('lang', 'en');
      expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    });

    stopBootstrap();
    router.dispose();
  });

  it('shows prototype notification data, filters unread, and routes View all', async () => {
    const user = userEvent.setup();
    const router = renderRoute();

    expect(await screen.findByTestId('unread-indicator')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Notifications' }));
    const allTab = screen.getByRole('button', {
      name: 'All, 8 notifications',
    });
    const unreadTab = screen.getByRole('button', {
      name: 'Unread, 6 notifications',
    });
    expect(allTab).toHaveAttribute('data-count', '8');
    expect(unreadTab).toHaveAttribute('data-count', '6');
    expect(
      screen.getByText(/Budget Release, Eid Activation/),
    ).toBeInTheDocument();

    await user.click(unreadTab);
    expect(screen.getAllByTestId('notification-row')).toHaveLength(6);
    expect(screen.queryByText(/Cleaning vendor renewal/)).toBeNull();

    await user.click(
      screen.getByRole('button', { name: 'View all notifications' }),
    );
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/notifications');
    });
    router.dispose();
  });

  it('uses D19 current user and routes Settings through the shared path', async () => {
    const user = userEvent.setup();
    const router = renderRoute();

    expect(
      await screen.findByRole('img', { name: 'Ahmad Al Osaimi' }),
    ).toHaveTextContent('AA');
    await user.click(
      screen.getByRole('button', { name: 'Settings & Configuration' }),
    );
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/settings/configuration');
    });
    router.dispose();
  });
});
