import { RouterProvider } from 'react-router';

import { AppErrorBoundary } from '@/app/AppErrorBoundary';
import { appRouter, createAppRouter } from '@/app/router/router';

type AppProps = {
  router?: ReturnType<typeof createAppRouter>;
};

export function App({ router = appRouter }: AppProps) {
  return (
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  );
}
