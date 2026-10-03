import {
  createBrowserRouter,
  createHashRouter,
  Navigate,
  ScrollRestoration,
  type RouteObject,
  useParams,
} from 'react-router';

import { AppShell } from '@/app/layouts/app-shell/AppShell';
import { SectionLayout } from '@/app/layouts/section/SectionLayout';
import { AppraisalPage } from '@/features/appraisal';
import {
  BudgetingPage,
  defaultHomeBudgetSection,
  HomeBudgetingPage,
  isHomeBudgetSection,
} from '@/features/budgeting';
import { ChecklistPage } from '@/features/checklists';
import { EnquiriesPage } from '@/features/enquiries';
import { HISTORY_ROUTE_PATHS, HistoryPage } from '@/features/history';
import { OvertimePage } from '@/features/hr';
import {
  ApprovalsPage,
  AssignedPage,
  CompanyPage,
  HomeBannerLayout,
  HomeIncidentsPage,
  HomeLayout,
  isAssignedQueue,
  OverviewPage,
  HomeTasksPage,
  ReportsPage,
} from '@/features/home';
import { NotificationsPage } from '@/features/notifications';
import { ObservationsPage } from '@/features/observations';
import {
  HomePaymentSettlementPage,
  isHomePaymentSettlementModule,
} from '@/features/payment-settlement';
import { SnagListsPage } from '@/features/snag-lists';
import {
  defaultHomePurchasingSection,
  HomePurchasingPage,
  isHomePurchasingSection,
} from '@/features/purchasing';
import { ReportsLibraryPage } from '@/features/reports';
import { SettingsConfigurationPage } from '@/features/settings';
import { SlaPage } from '@/features/sla';
import { CreateTaskPage, TaskEditPage, TasksPage, TaskViewPage } from '@/features/tasks';
import { WorkflowsPage } from '@/features/workflows';
import { WorkCentrePage } from '@/features/work-centre';
import { NavRoutePage } from '@/app/router/NavRoutePage';
import { NotFoundPage } from '@/app/router/NotFoundPage';
import {
  MasterCategoryRedirect,
  MasterRoutePage,
  MastersRootRedirect,
} from '@/app/router/MasterRoutePage';
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

function HomeAssignedRoute() {
  const { queue } = useParams();
  return queue && isAssignedQueue(queue) ? (
    <AssignedPage queue={queue} />
  ) : (
    <NotFoundPage />
  );
}

function HomeBudgetingRoute() {
  const { section } = useParams<{ section?: string }>();
  if (section == null)
    return <HomeBudgetingPage section={defaultHomeBudgetSection} />;
  return isHomeBudgetSection(section) ? (
    <HomeBudgetingPage section={section} />
  ) : (
    <NotFoundPage />
  );
}

function HomePaymentSettlementRoute() {
  const { module } = useParams<{ module?: string }>();
  return isHomePaymentSettlementModule(module) ? (
    <HomePaymentSettlementPage module={module} />
  ) : (
    <NotFoundPage />
  );
}

function HomePurchasingRoute() {
  const { section } = useParams<{ section?: string }>();
  if (section == null)
    return <HomePurchasingPage section={defaultHomePurchasingSection} />;
  return isHomePurchasingSection(section) ? (
    <HomePurchasingPage section={section} />
  ) : (
    <NotFoundPage />
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
        element: <HomeLayout />,
        children: [
          {
            index: true,
            element: <Navigate replace to={paths.home.overview} />,
          },
          {
            path: 'overview',
            element: <OverviewPage />,
            handle: { homeTab: 'overview' },
          },
          {
            path: 'approvals',
            element: <ApprovalsPage />,
            handle: { homeTab: 'approvals' },
          },
          {
            path: 'tasks',
            element: <HomeTasksPage />,
            handle: { homeTab: 'tasks' },
          },
          {
            path: 'company',
            element: <CompanyPage />,
            handle: { homeTab: 'company' },
          },
          {
            path: 'assigned/:queue',
            element: <HomeAssignedRoute />,
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
                element: <HomeIncidentsPage activeTab="reports" />,
                handle: { homeTab: 'incidents' },
              },
              {
                path: incidentViews[1],
                element: <HomeIncidentsPage activeTab="live" />,
                handle: { homeTab: 'incidents' },
              },
            ],
          },
          {
            path: 'budgets/:section?',
            element: <HomeBudgetingRoute />,
            handle: { homeTab: 'budgets' },
          },
          {
            path: 'purchasing/:section?',
            element: <HomePurchasingRoute />,
            handle: { homeTab: 'purchasing' },
          },
          {
            path: 'sop-checklist',
            element: <ChecklistPage />,
            handle: { homeTab: 'sop-checklist' },
          },
          {
            path: 'sla',
            element: <SlaPage />,
            handle: { homeTab: 'sla' },
          },
          {
            path: 'reports',
            element: <ReportsPage />,
            handle: { homeTab: 'reports' },
          },
          {
            path: 'work-centre/:section?/:child?',
            element: (
              <WorkCentrePage
                notFound={<NotFoundPage />}
                renderCreateTask={() => <CreateTaskPage />}
                renderEnquiries={(view) => <EnquiriesPage view={view} />}
                renderObservations={(view) => <ObservationsPage view={view} />}
                renderSnagLists={(view) => <SnagListsPage view={view} />}
                renderTasks={() => <TasksPage />}
              />
            ),
            handle: { homeTab: 'work-centre' },
          },
          {
            path: 'payment-settlement/:module',
            element: <HomePaymentSettlementRoute />,
            handle: { homeTab: 'payment-settlement' },
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        element: <HomeBannerLayout />,
        children: [
          {
            path: 'tasks/:taskId',
            element: <TaskViewPage />,
          },
          {
            path: 'tasks/:taskId/edit',
            element: <TaskEditPage />,
          },
        ],
      },
      {
        path: 'finance',
        element: <SectionLayout />,
        children: [
          {
            index: true,
            element: <BudgetingPage section="dashboard" />,
            handle: { reportKey: 'budgeting' },
          },
          {
            path: 'dashboard',
            element: <BudgetingPage section="dashboard" />,
            handle: { reportKey: 'budgeting' },
          },
          {
            path: 'budgeting',
            element: <BudgetingPage section="budgeting" />,
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
            element: <SlaPage />,
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
          { index: true, element: <HistoryPage /> },
          ...HISTORY_ROUTE_PATHS.slice(1).map((path) => ({
            path: path.slice('/history/'.length),
            element: <HistoryPage />,
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
            element: <WorkflowsPage />,
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
        element: <SettingsConfigurationPage />,
      },
      {
        path: 'settings',
        element: <SectionLayout />,
        children: [{ path: '*', element: <NavRoutePage /> }],
      },
      { path: 'reports', element: <ReportsLibraryPage /> },
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
