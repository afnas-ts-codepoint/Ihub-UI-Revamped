import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter } from 'react-router';

import { App } from '@/app/App';
import { appRoutes } from '@/app/router/router';
import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(cleanup);

const renderRoute = (entries: string[], initialIndex = entries.length - 1) => {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: entries,
    initialIndex,
  });
  render(<App router={router} />);
  return router;
};

describe('SectionLayout', () => {
  it('defaults to Section and switches to the explicit report URL', async () => {
    const user = userEvent.setup();
    const router = renderRoute(['/finance']);
    expect(await screen.findByText('Migration pending')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Report' }));
    expect(router.state.location.search).toBe('?view=report');
    expect(
      await screen.findByRole('heading', { name: 'Budgeting — Report' }),
    ).toBeInTheDocument();
    router.dispose();
  });

  it('supports direct report URLs, path reset, and browser back/forward', async () => {
    const router = renderRoute(['/finance?view=report']);
    expect(
      await screen.findByRole('heading', { name: 'Budgeting — Report' }),
    ).toBeInTheDocument();

    await router.navigate('/hr');
    await waitFor(() => {
      expect(router.state.location.search).toBe('');
    });
    expect(
      await screen.findByRole('heading', { name: 'Workforce' }),
    ).toBeInTheDocument();

    await router.navigate(-1);
    expect(
      await screen.findByRole('heading', { name: 'Budgeting — Report' }),
    ).toBeInTheDocument();
    await router.navigate(1);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/hr');
    });
    router.dispose();
  });

  it('uses explicit keys and fallback reports for wrapped placeholders', async () => {
    const explicit = renderRoute(['/notifications?view=report']);
    expect(
      await screen.findByRole('heading', { name: 'Notifications — Report' }),
    ).toBeInTheDocument();
    explicit.dispose();

    const fallback = renderRoute(['/hr/dashboard?view=report']);
    expect(
      await screen.findByRole('heading', { name: 'Dashboard — Report' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Run search to generate this report.'),
    ).toBeVisible();
    fallback.dispose();
  });

  it('renders the migrated Overtime section and keeps its report view', async () => {
    const section = renderRoute(['/hr']);
    expect(
      await screen.findByRole('heading', { name: 'Workforce' }),
    ).toBeVisible();
    expect(screen.getByRole('tab', { name: 'To Do 14' })).toBeVisible();
    expect(screen.queryByText('Migration pending')).toBeNull();
    section.dispose();

    const report = renderRoute(['/hr?view=report']);
    expect(
      await screen.findByRole('heading', { name: /Overtime.+Report/ }),
    ).toBeVisible();
    report.dispose();
  });

  it('renders the migrated Appraisal section and keeps its report view', async () => {
    const section = renderRoute(['/appraisal']);
    expect(
      await screen.findByRole('heading', { name: 'Appraisal' }),
    ).toBeVisible();
    expect(screen.getByRole('tab', { name: 'All Appraisals 5' })).toBeVisible();
    expect(screen.queryByText('Migration pending')).toBeNull();
    section.dispose();

    const report = renderRoute(['/appraisal?view=report']);
    expect(
      await screen.findByRole('heading', { name: /Appraisal.+Report/ }),
    ).toBeVisible();
    report.dispose();
  });

  it('renders the migrated Notifications section and keeps its report view', async () => {
    const section = renderRoute(['/notifications']);
    expect(
      await screen.findByRole('heading', { name: 'Notifications' }),
    ).toBeVisible();
    expect(screen.getByRole('tab', { name: 'All 5' })).toBeVisible();
    expect(screen.queryByText('Migration pending')).toBeNull();
    section.dispose();

    const report = renderRoute(['/notifications?view=report']);
    expect(
      await screen.findByRole('heading', { name: 'Notifications — Report' }),
    ).toBeVisible();
    report.dispose();
  });

  it('renders the migrated Checklist section and keeps its report view', async () => {
    const section = renderRoute(['/quality']);
    expect(
      await screen.findByRole('heading', { name: 'SOP Checklist' }),
    ).toBeVisible();
    expect(
      screen.getByRole('tab', { name: 'Unapproved Checklist 4' }),
    ).toBeVisible();
    expect(screen.queryByText('Migration pending')).toBeNull();
    section.dispose();

    const report = renderRoute(['/quality?view=report']);
    expect(
      await screen.findByRole('heading', { name: /SOP Checklists.+Report/ }),
    ).toBeVisible();
    report.dispose();
  });

  it.each([
    '/finance',
    '/hr/dashboard',
    '/appraisal',
    '/quality',
    '/quality/sla',
    '/history/hr/overtime',
    '/workflows',
    '/notifications',
    '/settings/work-centre',
  ])('wraps %s', async (path) => {
    const router = renderRoute([path]);
    expect(
      await screen.findByRole('button', { name: 'Section' }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Report' })).toBeVisible();
    router.dispose();
  });

  it.each([
    '/home/overview',
    '/masters/admin/project-category-master',
    '/settings/configuration',
    '/reports',
  ])('keeps %s unwrapped', async (path) => {
    const router = renderRoute([path]);
    await screen.findByRole('banner');
    expect(screen.queryByRole('button', { name: 'Section' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Report' })).toBeNull();
    router.dispose();
  });
});
