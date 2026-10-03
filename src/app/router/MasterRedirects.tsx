import { Navigate, useParams } from 'react-router';

import { NotFoundPage } from '@/app/router/NotFoundPage';
import { ADMIN_MASTER_CATALOG, MASTER_CATALOG } from '@/features/masters';

export type MasterRouteMode = 'masters' | 'masters-list';

export function MasterCategoryRedirect({ mode }: { mode: MasterRouteMode }) {
  const { category } = useParams();
  const first = MASTER_CATALOG.find((entry) => entry.category === category);

  if (!first) return <NotFoundPage />;

  return (
    <Navigate replace to={mode === 'masters' ? first.path : first.listPath} />
  );
}

export function MastersRootRedirect({ mode }: { mode: MasterRouteMode }) {
  const first = ADMIN_MASTER_CATALOG[0];
  if (!first) return <NotFoundPage />;

  return (
    <Navigate replace to={mode === 'masters' ? first.path : first.listPath} />
  );
}
