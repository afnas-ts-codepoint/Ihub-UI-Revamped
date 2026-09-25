import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter } from 'react-router';

import { App } from '@/app/App';
import { appRoutes } from '@/app/router/router';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { usePreferencesStore } from '@/store/preferences.store';

beforeAll(async () => {
  await initializeI18n('en');
});

afterEach(async () => {
  cleanup();
  usePreferencesStore.getState().setLocale('en');
  await i18n.changeLanguage('en');
});

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<App router={router} />);
  return router;
}

describe('AppShell', () => {
  it('marks the active top-level route and renders route-aware secondary tabs', async () => {
    const router = renderRoute('/finance/dashboard');

    expect(
      await screen.findByRole('button', { name: 'Finance & Budgets' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    router.dispose();
  });

  it('opens Masters on the current category, closes on Escape, and restores focus', async () => {
    const user = userEvent.setup();
    const router = renderRoute('/masters/general/departments');
    const trigger = await screen.findByRole('button', { name: /Masters/ });

    await user.click(trigger);
    const menu = screen.getByTestId('mega-menu');
    expect(within(menu).getByRole('button', { name: /General/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(menu).getByRole('button', { name: 'Departments' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('mega-menu')).toBeNull();
    });
    expect(trigger).toHaveFocus();
    router.dispose();
  });

  it('closes Masters from its overlay and restores focus', async () => {
    const user = userEvent.setup();
    const router = renderRoute('/masters/admin/project-category-master');
    const trigger = await screen.findByRole('button', { name: /Masters/ });

    await user.click(trigger);
    await user.click(screen.getByTestId('mega-menu-overlay'));
    await waitFor(() => {
      expect(screen.queryByTestId('mega-menu')).toBeNull();
    });
    expect(trigger).toHaveFocus();
    router.dispose();
  });

  it('opens and closes the React 19 Vaul mobile drawer with focus restoration', async () => {
    const user = userEvent.setup();
    const router = renderRoute('/hr/overtime/verify');
    const trigger = await screen.findByRole('button', {
      name: /Menu|القائمة/,
    });

    await user.click(trigger);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(trigger).toHaveFocus();
    router.dispose();
  });

  it('closes the mobile drawer from its scrim and opens on the RTL inline-start side', async () => {
    const user = userEvent.setup();
    usePreferencesStore.getState().setLocale('ar');
    await i18n.changeLanguage('ar');
    const router = renderRoute('/hr/overtime/verify');
    const trigger = await screen.findByTestId('mobile-nav-trigger');

    await user.click(trigger);
    expect(await screen.findByRole('dialog')).toHaveAttribute(
      'data-vaul-drawer-direction',
      'right',
    );
    await user.click(screen.getByTestId('mobile-nav-overlay'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(trigger).toHaveFocus();
    router.dispose();
  });
});
