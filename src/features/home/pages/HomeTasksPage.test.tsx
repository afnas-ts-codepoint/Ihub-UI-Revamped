import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { Toaster } from '@/shared/ui/feedback/Toaster';

import { HomeQueueHost } from '../components/HomeQueueHost';
import { useHomeQueueStore } from '../store/homeQueue.store';
import { HomeTasksPage } from './HomeTasksPage';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  useHomeQueueStore.getState().reset();
  document.documentElement.dir = 'ltr';
  await i18n.changeLanguage('en');
});

function renderPage() {
  return render(
    <>
      <HomeTasksPage />
      <HomeQueueHost />
      <Toaster />
    </>,
  );
}

const store = () => useHomeQueueStore.getState();
const cardIds = () =>
  screen
    .queryAllByTestId(/^job-order-card-JO/)
    .map((card) => card.dataset.testid?.replace('job-order-card-', ''));
const chip = (name: RegExp) => screen.getByRole('button', { name });

describe('HomeTasksPage', () => {
  it('shows the header, the new-task count and every job order in seed order', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Tasks' })).toBeVisible();
    expect(screen.getByText('3 new since yesterday · internal & external')).toBeVisible();
    expect(screen.getByRole('button', { name: /Board view/ })).toBeVisible();
    expect(cardIds()).toEqual(['JO-7782', 'JO-7781', 'JO-7779', 'JO-7775', 'JO-7770', 'JO-7768']);
  });

  it('counts the kinds and starts on All', () => {
    renderPage();
    expect(chip(/^All\s*6$/)).toHaveAttribute('aria-pressed', 'true');
    expect(chip(/^Internal\s*3$/)).toHaveAttribute('aria-pressed', 'false');
    expect(chip(/^External\s*3$/)).toBeVisible();
  });

  it.each([
    [/^Internal/, ['JO-7782', 'JO-7779', 'JO-7770']],
    [/^External/, ['JO-7781', 'JO-7775', 'JO-7768']],
  ] as const)('filters to %s keeping the order', async (name, ids) => {
    const user = userEvent.setup();
    renderPage();
    await user.click(chip(name));
    expect(cardIds()).toEqual(ids);
    expect(chip(name)).toHaveAttribute('aria-pressed', 'true');
  });

  it('Board view does nothing', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /Board view/ }));
    expect(cardIds()).toHaveLength(6);
    expect(store().drawer).toBeNull();
  });

  it('Assign opens the workflow drawer and Track does too; a card click opens the drawer', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(within(screen.getByTestId('job-order-card-JO-7782')).getByRole('button', { name: 'Assign' }));
    expect(store().drawer).toMatchObject({ type: 'jo' });
    expect(store().drawer?.item.id).toBe('JO-7782');
    store().closeDrawer();
    await user.click(within(screen.getByTestId('job-order-card-JO-7779')).getByTestId('job-order-card-body'));
    expect(store().drawer?.item.id).toBe('JO-7779');
    expect(store().taskOpen).toBeNull();
  });

  it('Dismiss removes a new job order, toasts and updates the counts and the new count', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(within(screen.getByTestId('job-order-card-JO-7781')).getByRole('button', { name: 'Dismiss' }));
    expect(await screen.findByText('JO-7781 dismissed')).toBeVisible();
    expect(cardIds()).not.toContain('JO-7781');
    expect(chip(/^All\s*5$/)).toBeVisible();
    expect(chip(/^External\s*2$/)).toBeVisible();
    expect(screen.getByText('2 new since yesterday · internal & external')).toBeVisible();
  });

  it('assigning from the drawer flips the card to a Track card and drops it from the new count', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(within(screen.getByTestId('job-order-card-JO-7782')).getByRole('button', { name: 'Assign' }));
    await user.click(await screen.findByRole('button', { name: 'Assign & approve' }));
    expect(await screen.findByText('JO-7782 assigned')).toBeVisible();
    expect(within(screen.getByTestId('job-order-card-JO-7782')).getByRole('button', { name: /Track/ })).toBeVisible();
    expect(screen.getByText('2 new since yesterday · internal & external')).toBeVisible();
    await user.click(chip(/^Internal/));
    expect(cardIds()).toContain('JO-7782');
  });

  it('localises the page in Arabic', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderPage();
    expect(screen.getByRole('heading', { name: 'أوامر العمل' })).toBeVisible();
    expect(screen.getByText('3 جديدة منذ الأمس · داخلية وخارجية')).toBeVisible();
    expect(screen.getByRole('button', { name: /عرض اللوحة/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /^الكل/ })).toBeVisible();
  });
});
