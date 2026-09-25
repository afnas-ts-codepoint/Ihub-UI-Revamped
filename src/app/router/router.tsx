import {
  createBrowserRouter,
  createHashRouter,
  Outlet,
  type RouteObject,
} from 'react-router';

import { NotFoundPage } from '@/app/router/NotFoundPage';
import { RouteErrorPage } from '@/app/router/RouteErrorPage';
import { env, type AppEnvironment } from '@/shared/config/env';

export const appRoutes = [
  {
    path: '/',
    element: <Outlet />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: null },
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
