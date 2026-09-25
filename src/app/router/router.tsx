import {
  createBrowserRouter,
  createHashRouter,
  Outlet,
  type RouteObject,
} from 'react-router';

import { NotFoundPage } from '@/app/router/NotFoundPage';
import {
  MasterCategoryRedirect,
  MasterRoutePage,
  MastersRootRedirect,
} from '@/app/router/MasterRoutePage';
import { RouteErrorPage } from '@/app/router/RouteErrorPage';
import { env, type AppEnvironment } from '@/shared/config/env';

export const appRoutes = [
  {
    path: '/',
    element: <Outlet />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: null },
      {
        path: 'masters',
        children: [
          { index: true, element: <MastersRootRedirect mode="masters" /> },
          {
            path: ':category',
            children: [
              {
                index: true,
                element: <MasterCategoryRedirect mode="masters" />,
              },
              { path: ':item', element: <MasterRoutePage /> },
            ],
          },
        ],
      },
      {
        path: 'masters-list',
        children: [
          {
            index: true,
            element: <MastersRootRedirect mode="masters-list" />,
          },
          {
            path: ':category',
            children: [
              {
                index: true,
                element: <MasterCategoryRedirect mode="masters-list" />,
              },
              { path: ':item', element: <MasterRoutePage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
] satisfies RouteObject[];

export function createAppRouter(config: AppEnvironment = env) {
  const options = { basename: config.basePath };

  return config.routerMode === 'hash'
    ? createHashRouter(appRoutes, options)
    : createBrowserRouter(appRoutes, options);
}

export const appRouter = createAppRouter();
