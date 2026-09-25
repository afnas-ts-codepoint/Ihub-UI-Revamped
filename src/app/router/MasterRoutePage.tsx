import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router';

import { NotFoundPage } from '@/app/router/NotFoundPage';
import { PlaceholderPage } from '@/app/router/PlaceholderPage';
import { ADMIN_MASTER_CATALOG, findAdminMaster } from '@/features/masters';
import { MigrationPending } from '@/shared/ui/feedback/MigrationPending';

type MasterRouteMode = 'masters' | 'masters-list';

export function MasterCategoryRedirect({ mode }: { mode: MasterRouteMode }) {
  const { category } = useParams();
  const first = ADMIN_MASTER_CATALOG[0];

  if (category !== 'admin' || !first) return <NotFoundPage />;

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
  const entry = findAdminMaster(category, item);

  if (!entry) return <NotFoundPage />;

  const title = t(entry.labelKey);

  return entry.routeBehavior === 'migration-pending' ? (
    <main className="bg-canvas p-7">
      <MigrationPending area={title} />
    </main>
  ) : (
    <PlaceholderPage title={title} />
  );
}
