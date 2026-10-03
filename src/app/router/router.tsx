import {
  createBrowserRouter,
  createHashRouter,
  Navigate,
  ScrollRestoration,
  type RouteObject,
} from 'react-router';
import { useTranslation } from 'react-i18next';

import { AppShell } from '@/app/layouts/app-shell/AppShell';
import { SectionLayout } from '@/app/layouts/section/SectionLayout';
import { HISTORY_ROUTE_PATHS } from '@/features/history';
import { NavRoutePage } from '@/app/router/NavRoutePage';
import { NotFoundPage } from '@/app/router/NotFoundPage';
import {
  MasterCategoryRedirect,
  MastersRootRedirect,
  type MasterRouteMode,
} from '@/app/router/MasterRedirects';
import { RouteErrorPage } from '@/app/router/RouteErrorPage';
import { env, type AppEnvironment } from '@/shared/config/env';
import { paths } from '@/shared/config/paths';

const incidentViews = ['reports', 'live'] as const;
function RootRoute() {
  return (
    <>
      <AppShell />
      <ScrollRestoration />
    </>
  );
}

function RouteLoadingFallback() {
  const { t } = useTranslation('common');

  return (
    <main
      aria-label={t('routeLoading.label')}
      className="grid min-h-screen place-items-center bg-canvas text-sm text-fg-3"
    >
      {t('routeLoading.message')}
    </main>
  );
}

const mastersRoute = (mode: MasterRouteMode): RouteObject => ({
  path: mode,
  children: [
    { index: true, element: <MastersRootRedirect mode={mode} /> },
    {
      path: ':category',
      children: [
        { index: true, element: <MasterCategoryRedirect mode={mode} /> },
        {
          path: ':item',
          lazy: async () => {
            const { MasterRoutePage } = await import(
              '@/app/router/MasterRoutePage'
            );
            return { Component: MasterRoutePage };
          },
        },
      ],
    },
  ],
});

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <RootRoute />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <RouteLoadingFallback />,
    children: [
      { index: true, element: <Navigate replace to={paths.home.root} /> },
      {
        path: 'home',
        lazy: async () => {
          const { HomeLayout } = await import('@/features/home');
          return { Component: HomeLayout };
        },
        children: [
          {
            index: true,
            element: <Navigate replace to={paths.home.overview} />,
          },
          {
            path: 'overview',
            lazy: async () => {
              const { OverviewRoute } = await import(
                '@/app/router/lazy/home-chart.routes'
              );
              return { Component: OverviewRoute };
            },
            handle: { homeTab: 'overview' },
          },
          {
            path: 'approvals',
            lazy: async () => {
              const { ApprovalsRoute } = await import(
                '@/app/router/lazy/home.routes'
              );
              return { Component: ApprovalsRoute };
            },
            handle: { homeTab: 'approvals' },
          },
          {
            path: 'tasks',
            lazy: async () => {
              const { HomeTasksRoute } = await import(
                '@/app/router/lazy/home.routes'
              );
              return { Component: HomeTasksRoute };
            },
            handle: { homeTab: 'tasks' },
          },
          {
            path: 'company',
            lazy: async () => {
              const { CompanyRoute } = await import(
                '@/app/router/lazy/home-chart.routes'
              );
              return { Component: CompanyRoute };
            },
            handle: { homeTab: 'company' },
          },
          {
            path: 'assigned/:queue',
            lazy: async () => {
              const { AssignedRoute } = await import(
                '@/app/router/lazy/home.routes'
              );
              return { Component: AssignedRoute };
            },
            handle: { homeTab: 'assigned' },
          },
          {
            path: 'incidents',
            children: [
              {
                index: true,
                element: (
                  <Navigate replace to={paths.home.incidents('reports')} />
                ),
              },
              {
                path: incidentViews[0],
                lazy: async () => {
                  const { IncidentReportsRoute } = await import(
                    '@/app/router/lazy/home.routes'
                  );
                  return { Component: IncidentReportsRoute };
                },
                handle: { homeTab: 'incidents' },
              },
              {
                path: incidentViews[1],
                lazy: async () => {
                  const { IncidentLiveRoute } = await import(
                    '@/app/router/lazy/home.routes'
                  );
                  return { Component: IncidentLiveRoute };
                },
                handle: { homeTab: 'incidents' },
              },
            ],
          },
          {
            path: 'budgets/:section?',
            lazy: async () => {
              const { HomeBudgetingRoute } = await import(
                '@/app/router/lazy/home-chart.routes'
              );
              return { Component: HomeBudgetingRoute };
            },
            handle: { homeTab: 'budgets' },
          },
          {
            path: 'purchasing/:section?',
            lazy: async () => {
              const { PurchasingRoute } = await import(
                '@/app/router/lazy/commerce.routes'
              );
              return { Component: PurchasingRoute };
            },
            handle: { homeTab: 'purchasing' },
          },
          {
            path: 'sop-checklist',
            lazy: async () => {
              const { ChecklistRoute } = await import(
                '@/app/router/lazy/portal.routes'
              );
              return { Component: ChecklistRoute };
            },
            handle: { homeTab: 'sop-checklist' },
          },
          {
            path: 'sla',
            lazy: async () => {
              const { SlaRoute } = await import(
                '@/app/router/lazy/portal.routes'
              );
              return { Component: SlaRoute };
            },
            handle: { homeTab: 'sla' },
          },
          {
            path: 'reports',
            lazy: async () => {
              const { HomeReportsRoute } = await import(
                '@/app/router/lazy/home.routes'
              );
              return { Component: HomeReportsRoute };
            },
            handle: { homeTab: 'reports' },
          },
          {
            path: 'work-centre/:section?/:child?',
            lazy: async () => {
              const { WorkCentreRoute } = await import(
                '@/app/router/lazy/task.routes'
              );
              return { Component: WorkCentreRoute };
            },
            handle: { homeTab: 'work-centre' },
          },
          {
            path: 'payment-settlement/:module',
            lazy: async () => {
              const { PaymentSettlementRoute } = await import(
                '@/app/router/lazy/commerce.routes'
              );
              return { Component: PaymentSettlementRoute };
            },
            handle: { homeTab: 'payment-settlement' },
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        lazy: async () => {
          const { HomeBannerLayout } = await import('@/features/home');
          return { Component: HomeBannerLayout };
        },
        children: [
          {
            path: 'tasks/:taskId',
            lazy: async () => {
              const { TaskViewRoute } = await import(
                '@/app/router/lazy/task.routes'
              );
              return { Component: TaskViewRoute };
            },
          },
          {
            path: 'tasks/:taskId/edit',
            lazy: async () => {
              const { TaskEditRoute } = await import(
                '@/app/router/lazy/task.routes'
              );
              return { Component: TaskEditRoute };
            },
          },
        ],
      },
      {
        path: 'finance',
        element: <SectionLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { BudgetingDashboardRoute } = await import(
                '@/app/router/lazy/budgeting.routes'
              );
              return { Component: BudgetingDashboardRoute };
            },
            handle: { reportKey: 'budgeting' },
          },
          {
            path: 'dashboard',
            lazy: async () => {
              const { BudgetingDashboardRoute } = await import(
                '@/app/router/lazy/budgeting.routes'
              );
              return { Component: BudgetingDashboardRoute };
            },
            handle: { reportKey: 'budgeting' },
          },
          {
            path: 'budgeting',
            lazy: async () => {
              const { BudgetingSectionRoute } = await import(
                '@/app/router/lazy/budgeting.routes'
              );
              return { Component: BudgetingSectionRoute };
            },
            handle: { reportKey: 'budgeting' },
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        path: 'hr',
        element: <SectionLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { OvertimeRoute } = await import(
                '@/app/router/lazy/portal.routes'
              );
              return { Component: OvertimeRoute };
            },
            handle: { reportKey: 'overtime' },
          },
          { path: '*', element: <NavRoutePage /> },
        ],
      },
      {
        path: 'appraisal',
        element: <SectionLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { AppraisalRoute } = await import(
                '@/app/router/lazy/portal.routes'
              );
              return { Component: AppraisalRoute };
            },
            handle: { reportKey: 'appraisal' },
          },
        ],
      },
      {
        path: 'quality',
        element: <SectionLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { ChecklistRoute } = await import(
                '@/app/router/lazy/portal.routes'
              );
              return { Component: ChecklistRoute };
            },
            handle: { reportKey: 'checklist' },
          },
          {
            path: 'sla',
            lazy: async () => {
              const { SlaRoute } = await import(
                '@/app/router/lazy/portal.routes'
              );
              return { Component: SlaRoute };
            },
            handle: { reportKey: 'sla' },
          },
          { path: '*', element: <NavRoutePage /> },
        ],
      },
      {
        path: 'history',
        element: <SectionLayout />,
        handle: { reportKey: 'history' },
        children: [
          {
            index: true,
            lazy: async () => {
              const { HistoryRoute } = await import(
                '@/app/router/lazy/portal.routes'
              );
              return { Component: HistoryRoute };
            },
          },
          ...HISTORY_ROUTE_PATHS.slice(1).map((path) => ({
            path: path.slice('/history/'.length),
            lazy: async () => {
              const { HistoryRoute } = await import(
                '@/app/router/lazy/portal.routes'
              );
              return { Component: HistoryRoute };
            },
          })),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        path: 'workflows',
        element: <SectionLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { WorkflowsRoute } = await import(
                '@/app/router/lazy/portal.routes'
              );
              return { Component: WorkflowsRoute };
            },
            handle: { reportKey: 'workflows' },
          },
        ],
      },
      {
        path: 'notifications',
        element: <SectionLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { NotificationsRoute } = await import(
                '@/app/router/lazy/portal.routes'
              );
              return { Component: NotificationsRoute };
            },
            handle: {
              reportKey: 'notifications',
              reportTitleKey: 'routes.notifications',
            },
          },
        ],
      },
      {
        path: 'settings/configuration',
        lazy: async () => {
          const { SettingsConfigurationRoute } = await import(
            '@/app/router/lazy/portal.routes'
          );
          return { Component: SettingsConfigurationRoute };
        },
      },
      {
        path: 'settings',
        element: <SectionLayout />,
        children: [{ path: '*', element: <NavRoutePage /> }],
      },
      {
        path: 'reports',
        lazy: async () => {
          const { ReportsLibraryRoute } = await import(
            '@/app/router/lazy/portal.routes'
          );
          return { Component: ReportsLibraryRoute };
        },
      },
      { path: 'reports/*', element: <NavRoutePage /> },
      mastersRoute('masters'),
      mastersRoute('masters-list'),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createAppRouter(config: AppEnvironment = env) {
  const options = { basename: config.basePath };

  return config.routerMode === 'hash'
    ? createHashRouter(appRoutes, options)
    : createBrowserRouter(appRoutes, options);
}

export const appRouter = createAppRouter();
