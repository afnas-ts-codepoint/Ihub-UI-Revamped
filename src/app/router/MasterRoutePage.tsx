import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router';

import { NotFoundPage } from '@/app/router/NotFoundPage';
import {
  ADMIN_MASTER_CATALOG,
  findMaster,
  findMasterDefinition,
  MASTER_CATALOG,
  MasterPage,
  MasterPendingPage,
} from '@/features/masters';

type MasterRouteMode = 'masters' | 'masters-list';

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

export function MasterRoutePage() {
  const { category, item } = useParams();
  const { t } = useTranslation('nav');
  const entry = findMaster(category, item);

  if (!entry) return <NotFoundPage />;

  const title = t(entry.labelKey);

  if (entry.routeBehavior !== 'migration-pending') {
    return <MasterPendingPage title={title} />;
  }

  const definition = findMasterDefinition(entry.slug);
  if (!definition) return <MasterPendingPage title={title} />;

  return <MasterPage definition={definition} title={title} />;
}
