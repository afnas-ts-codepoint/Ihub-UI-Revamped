import {
  createBrowserRouter,
  createHashRouter,
  Navigate,
  ScrollRestoration,
  type RouteObject,
} from 'react-router';

import { AppShell } from '@/app/layouts/app-shell/AppShell';
import { SectionLayout } from '@/app/layouts/section/SectionLayout';
import { AppraisalPage } from '@/features/appraisal';
import { ChecklistPage } from '@/features/checklists';
import { OvertimePage } from '@/features/hr';
import { NotificationsPage } from '@/features/notifications';
import {
  NavRoutePage,
  PendingRoutePage,
  ValidatedPendingRoute,
} from '@/app/router/NavRoutePage';
import { NotFoundPage } from '@/app/router/NotFoundPage';
import {
  MasterCategoryRedirect,
  MasterRoutePage,
  MastersRootRedirect,
} from '@/app/router/MasterRoutePage';
import { RouteErrorPage } from '@/app/router/RouteErrorPage';
import { env, type AppEnvironment } from '@/shared/config/env';
import { paths } from '@/shared/config/paths';

const assignedQueues = ['approvals', 'verify', 'tasks'] as const;
const incidentViews = ['reports', 'live'] as const;
const workCentreSections = [
  'create-task',
  'tasks',
  'enquiry',
  'observations',
  'incidents',
  'checklists',
  'snag-lists',
  'price-change',
  'promotions',
] as const;
const paymentModules = ['action-sheet', 'petty-cash', 'add-supplier'] as const;

function RootRoute() {
  return (
    <>
      <AppShell />
      <ScrollRestoration />
    </>
  );
}

const mastersRoute = (mode: 'masters' | 'masters-list'): RouteObject => ({
  path: mode,
  children: [
    { index: true, element: <MastersRootRedirect mode={mode} /> },
    {
      path: ':category',
      children: [
        { index: true, element: <MasterCategoryRedirect mode={mode} /> },
        { path: ':item', element: <MasterRoutePage /> },
      ],
    },
  ],
});

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <RootRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate replace to={paths.home.root} /> },
      {
        path: 'home',
        children: [
          {
            index: true,
            element: <Navigate replace to={paths.home.overview} />,
          },
          {
            path: 'overview',
            element: <NavRoutePage />,
            handle: { homeTab: 'overview' },
          },
          {
            path: 'approvals',
            element: <NavRoutePage />,
            handle: { homeTab: 'approvals' },
          },
          {
            path: 'tasks',
            element: <NavRoutePage />,
            handle: { homeTab: 'tasks' },
          },
          {
            path: 'company',
            element: <NavRoutePage />,
            handle: { homeTab: 'company' },
          },
          {
            path: 'assigned/:queue',
            element: (
              <ValidatedPendingRoute
                allowed={assignedQueues}
                parameter="queue"
                titleKey="navigation.dashboard_assigned"
              />
            ),
            handle: { homeTab: 'assigned' },
          },
          {
            path: 'incidents/:sub',
            element: (
              <ValidatedPendingRoute
                allowed={incidentViews}
                parameter="sub"
                titleKey="navigation.dashboard_incidents"
                titleKeys={{ live: 'navigation.dashboard_live-feed' }}
              />
            ),
            handle: { homeTab: 'incidents' },
          },
          {
            path: 'budgets/:section?',
            element: <PendingRoutePage titleKey="routes.budgets" />,
            handle: { homeTab: 'budgets' },
          },
          {
            path: 'purchasing/:section?',
            element: <PendingRoutePage titleKey="routes.purchasing" />,
            handle: { homeTab: 'purchasing' },
          },
          {
            path: 'sop-checklist',
            element: <PendingRoutePage titleKey="routes.sopChecklist" />,
            handle: { homeTab: 'sop-checklist' },
          },
          {
            path: 'sla',
            element: <PendingRoutePage titleKey="navigation.sla" />,
            handle: { homeTab: 'sla' },
          },
          {
            path: 'reports',
            element: <PendingRoutePage titleKey="navigation.reports" />,
            handle: { homeTab: 'reports' },
          },
          {
            path: 'work-centre/:section/:child?',
            element: (
              <ValidatedPendingRoute
                allowed={workCentreSections}
                parameter="section"
                titleKey="routes.workCentre"
              />
            ),
            handle: { homeTab: 'work-centre' },
          },
          {
            path: 'payment-settlement/:module',
            element: (
              <ValidatedPendingRoute
                allowed={paymentModules}
                parameter="module"
                titleKey="routes.paymentSettlement"
              />
            ),
            handle: { homeTab: 'payment-settlement' },
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        path: 'tasks/:taskId',
        element: <PendingRoutePage titleKey="routes.taskDetails" />,
      },
      {
        path: 'tasks/:taskId/edit',
        element: <PendingRoutePage titleKey="routes.taskEdit" />,
      },
      {
        path: 'finance',
        element: <SectionLayout />,
        children: [
          {
            index: true,
            element: <NavRoutePage />,
            handle: { reportKey: 'budgeting' },
          },
          {
            path: '*',
            element: <NavRoutePage />,
            handle: { reportKey: 'budgeting' },
          },
        ],
      },
      {
        path: 'hr',
        element: <SectionLayout />,
        children: [
          {
            index: true,
            element: <OvertimePage />,
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
            element: <AppraisalPage />,
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
            element: <ChecklistPage />,
            handle: { reportKey: 'checklist' },
          },
          {
            path: 'sla',
            element: <PendingRoutePage titleKey="navigation.sla" />,
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
          { index: true, element: <NavRoutePage /> },
          { path: '*', element: <NavRoutePage /> },
        ],
      },
      {
        path: 'workflows',
        element: <SectionLayout />,
        children: [
          {
            index: true,
            element: <NavRoutePage />,
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
            element: <NotificationsPage />,
            handle: {
              reportKey: 'notifications',
              reportTitleKey: 'routes.notifications',
            },
          },
        ],
      },
      {
        path: 'settings/configuration',
        element: (
          <PendingRoutePage titleKey="navigation.settings-configuration_configuration" />
        ),
      },
      {
        path: 'settings',
        element: <SectionLayout />,
        children: [{ path: '*', element: <NavRoutePage /> }],
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
