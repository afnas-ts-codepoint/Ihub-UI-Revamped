import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { appRoutes } from '@/app/router/router';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

function renderPath(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('M10.1 /home/approvals route', () => {
  it('replaces the pending marker with the ranked approvals queue inside the Home frame', async () => {
    const router = renderPath('/home/approvals');
    expect(await screen.findByTestId('home-top-banner')).toBeVisible();
    expect(await screen.findByRole('heading', { name: 'Approvals' })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    // No Home tab is highlighted while the Approvals view is open (prototype: no tab owns it).
    expect(within(screen.getByTestId('home-top-banner')).queryByRole('button', { current: 'page' })).not.toBeInTheDocument();
    router.dispose();
  });

  it('keeps the banner counts in step with the live queue and mounts the decision overlays', async () => {
    const router = renderPath('/home/approvals');
    const pulse = await screen.findByTestId('pulse-strip');
    expect(within(pulse).getByText('10')).toBeVisible();
    // A1 is ranked first; rejecting it leaves the queue and updates the banner.
    fireEvent.click(screen.getAllByRole('button', { name: 'Reject' })[0] as HTMLElement);
    expect(within(pulse).getByText('9')).toBeVisible();
    // Approving opens the track prompt hosted by the Home layout.
    fireEvent.click(screen.getAllByRole('button', { name: 'Approve' })[0] as HTMLElement);
    expect(await screen.findByRole('dialog', { name: 'Decision recorded' })).toBeVisible();
    expect(within(pulse).getByText('8')).toBeVisible();
    router.dispose();
  });

  it('opens the workflow drawer from a card and closes it with Escape', async () => {
    const router = renderPath('/home/approvals');
    // A2 (purchase) is ranked second and opens the drawer (A1 is a form-preview kind).
    fireEvent.click(await screen.findByText('Purchase Approval (PC) — Cinema Projector Units ×2'));
    const drawer = await screen.findByRole('dialog');
    expect(drawer).toHaveTextContent('Approval workflow');
    fireEvent.keyDown(drawer, { key: 'Escape' });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByText('Approval workflow')).not.toBeInTheDocument();
    router.dispose();
  });

  it('opens the form preview for form kinds', async () => {
    const router = renderPath('/home/approvals');
    fireEvent.click(await screen.findByText('Budget Release — Eid Activation, 360 Mall'));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Why this needs you');
    router.dispose();
  });

  it('keeps queue state across Home views and discards it when Home unmounts', async () => {
    const router = renderPath('/home/approvals');
    const pulse = await screen.findByTestId('pulse-strip');
    fireEvent.click(screen.getAllByRole('button', { name: 'Reject' })[0] as HTMLElement);
    expect(within(pulse).getByText('9')).toBeVisible();
    await act(async () => {
      await router.navigate('/home/overview');
    });
    expect(within(screen.getByTestId('pulse-strip')).getByText('9')).toBeVisible();
    // The task page banner (HomeBannerLayout) shows the seed data again: Home state was discarded.
    await act(async () => {
      await router.navigate('/tasks/JO-7779');
    });
    expect(within(await screen.findByTestId('pulse-strip')).getByText('10')).toBeVisible();
    router.dispose();
  });
});
