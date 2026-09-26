import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, matchRoutes, RouterProvider } from 'react-router';

import { navNodes, navTrailForPath } from '@/app/navigation/model';
import { NAV_TREE } from '@/app/navigation/nav.config';
import { appRoutes } from '@/app/router/router';
import arChecklists from '@/shared/i18n/locales/ar/checklists.json';
import arHr from '@/shared/i18n/locales/ar/hr.json';
import arNav from '@/shared/i18n/locales/ar/nav.json';
import enHr from '@/shared/i18n/locales/en/hr.json';
import enChecklists from '@/shared/i18n/locales/en/checklists.json';
import enNav from '@/shared/i18n/locales/en/nav.json';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { paths } from '@/shared/config/paths';

beforeAll(async () => {
  await initializeI18n('en');
});

afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

function resourceValue(resource: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((value, part) => {
    if (!value || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[part];
  }, resource);
}

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  const view = render(<RouterProvider router={router} />);
  return { ...view, router };
}

/**
 * A migrated screen's own heading is not always the sidebar nav label: the
 * prototype's HR sidebar entry reads "HR" (`index.html:2507`) while the
 * migrated Overtime screen's own title is "Workforce" (`index.html:8438`).
 * Both are prototype-faithful; this override lets the generic parity check
 * below assert the real rendered heading instead of the nav label text.
 */
const HEADING_OVERRIDES: Readonly<
  Record<string, Readonly<Record<'ar' | 'en', string>>>
> = {
  checklist: { ar: arChecklists.title, en: enChecklists.title },
  overtime: { ar: arHr.title, en: enHr.title },
};

describe('G6 complete navigation and route parity', () => {
  const nodes = navNodes(NAV_TREE);
  const nonMasterNodes = nodes.filter((node) => !node.id.startsWith('masters'));

  it('preserves all top-level prototype nodes and unique generated ids', () => {
    expect(NAV_TREE.map((node) => node.id)).toEqual([
      'dashboard',
      'budgeting',
      'overtime',
      'appraisal',
      'checklist',
      'settings-configuration',
      'history',
      'workflows',
      'masters',
      'masters-list',
    ]);
    expect(NAV_TREE.map((node) => navNodes([node]).length)).toEqual([
      33, 3, 16, 1, 13, 6, 28, 1, 85, 85,
    ]);
    expect(nodes).toHaveLength(271);
    expect(new Set(nodes.map((node) => node.id))).toHaveLength(nodes.length);
  });

  it('provides matching English and Arabic labels for every nav node', () => {
    for (const node of nodes) {
      expect(resourceValue(enNav, node.labelKey), node.id).toEqual(
        expect.any(String),
      );
      expect(resourceValue(arNav, node.labelKey), node.id).toEqual(
        expect.any(String),
      );
    }
  });

  it('resolves every nav node through both the model and router', () => {
    for (const node of nodes) {
      expect(matchRoutes(appRoutes, node.path), node.id).not.toBeNull();
      expect(navTrailForPath(NAV_TREE, node.path), node.id).not.toHaveLength(0);
    }
  });

  it.each([
    ['en', enNav],
    ['ar', arNav],
  ] as const)(
    'renders every non-Masters nav target in %s',
    async (locale, resource) => {
      await i18n.changeLanguage(locale);
      const uniquePaths = [...new Set(nonMasterNodes.map((node) => node.path))];

      for (const path of uniquePaths) {
        const current = navTrailForPath(NAV_TREE, path).at(-1);
        expect(current).toBeDefined();
        const title = resourceValue(resource, current?.labelKey ?? '');
        expect(title).toEqual(expect.any(String));

        const { router, unmount } = renderRoute(path);
        if (current?.routeBehavior === 'migration-pending') {
          expect(await screen.findByRole('status')).toHaveAttribute(
            'data-migration-pending',
            title,
          );
        } else if (current?.id === 'workflows') {
          expect(await screen.findByRole('tablist')).toBeInTheDocument();
          expect(screen.queryByRole('status')).not.toBeInTheDocument();
        } else {
          const heading =
            HEADING_OVERRIDES[current?.id ?? '']?.[locale] ?? String(title);
          expect(
            await screen.findByRole('heading', { name: heading }),
          ).toBeInTheDocument();
        }
        unmount();
        router.dispose();
      }
    },
  );

  it('matches the Arabic prototype title on a placeholder route', async () => {
    await i18n.changeLanguage('ar');
    const { router } = renderRoute('/quality/observations');

    expect(
      await screen.findByRole('heading', { name: 'الملاحظات' }),
    ).toBeInTheDocument();
    router.dispose();
  });

  it.each([
    '/not-in-the-prototype',
    '/approve',
    '/joborders',
    '/processes',
    '/purchasing',
    '/pettycash',
  ])('keeps unknown or D11-unreachable route %s at 404', async (path) => {
    const { router } = renderRoute(path);
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
    router.dispose();
  });
});

describe('Phase 2 section 11 URL map', () => {
  it.each([
    ['/', paths.home.overview],
    [paths.home.root, paths.home.overview],
  ])('redirects %s to %s', async (from, expected) => {
    const { router } = renderRoute(from);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(expected);
    });
    router.dispose();
  });

  it.each([
    paths.home.assigned('verify'),
    paths.home.assigned('tasks'),
    paths.home.view('budgets'),
    `${paths.home.view('budgets')}/department`,
    paths.home.view('purchasing'),
    `${paths.home.view('purchasing')}/orders`,
    paths.home.view('sop-checklist'),
    paths.home.view('sla'),
    paths.home.view('reports'),
    paths.home.workCentre('create-task'),
    paths.home.workCentre('tasks', 'open'),
    paths.home.workCentre('enquiry'),
    paths.home.workCentre('observations'),
    paths.home.workCentre('incidents'),
    paths.home.workCentre('checklists'),
    paths.home.workCentre('snag-lists'),
    paths.home.workCentre('price-change'),
    paths.home.workCentre('promotions'),
    paths.home.paymentSettlement('action-sheet'),
    paths.home.paymentSettlement('petty-cash'),
    paths.home.paymentSettlement('add-supplier'),
    paths.tasks.view('T-100'),
    paths.tasks.edit('T-100'),
  ])('routes the pending prototype screen at %s', async (path) => {
    const { router } = renderRoute(path);
    expect(await screen.findByRole('status')).toHaveAttribute(
      'data-migration-pending',
    );
    router.dispose();
  });

  it.each([
    '/home/assigned/unknown',
    '/home/incidents/unknown',
    '/home/work-centre/unknown',
    '/home/payment-settlement/unknown',
    '/finance/unknown',
    '/hr/unknown',
    '/quality/unknown',
    '/settings/unknown',
    '/history/unknown',
    '/reports/unknown',
  ])('validates route parameters and rejects %s', async (path) => {
    const { router } = renderRoute(path);
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
    router.dispose();
  });

  it.each([
    [paths.home.overview, 'overview'],
    [paths.home.view('approvals'), 'approvals'],
    [paths.home.assigned('approvals'), 'assigned'],
    [paths.home.incidents('reports'), 'incidents'],
    [paths.home.view('tasks'), 'tasks'],
    [paths.home.incidents('live'), 'incidents'],
    [paths.home.view('company'), 'company'],
    [paths.home.view('budgets'), 'budgets'],
    [paths.home.view('purchasing'), 'purchasing'],
    [paths.home.view('sop-checklist'), 'sop-checklist'],
    [paths.home.view('sla'), 'sla'],
    [paths.home.view('reports'), 'reports'],
    [paths.home.workCentre('tasks'), 'work-centre'],
    [paths.home.paymentSettlement('action-sheet'), 'payment-settlement'],
  ])('exposes the D13 homeTab handle for %s', (path, homeTab) => {
    const matches = matchRoutes(appRoutes, path);
    expect(matches?.at(-1)?.route.handle).toEqual({ homeTab });
  });
});
