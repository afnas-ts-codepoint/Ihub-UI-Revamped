import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router';

import { navTrailForPath } from '@/app/navigation/model';
import { NAV_TREE } from '@/app/navigation/nav.config';
import { NotFoundPage } from '@/app/router/NotFoundPage';
import { PlaceholderPage } from '@/app/router/PlaceholderPage';
import { MigrationPending } from '@/shared/ui/feedback/MigrationPending';

function PendingPage({ title }: { title: string }) {
  return (
    <main className="bg-canvas p-7">
      <MigrationPending area={title} />
    </main>
  );
}

export function NavRoutePage() {
  const { pathname } = useLocation();
  const { t } = useTranslation('nav');
  const trail = navTrailForPath(NAV_TREE, pathname);
  const current = trail.at(-1);

  if (!current) return <NotFoundPage />;

  const title = t(current.labelKey, { defaultValue: current.id });
  return current.routeBehavior === 'migration-pending' ? (
    <PendingPage title={title} />
  ) : (
    <PlaceholderPage title={title} />
  );
}

export function PendingRoutePage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation('nav');
  return <PendingPage title={t(titleKey, { defaultValue: titleKey })} />;
}

type ValidatedPendingRouteProps = {
  allowed: readonly string[];
  parameter: string;
  titleKey: string;
  titleKeys?: Readonly<Record<string, string>>;
};

export function ValidatedPendingRoute({
  allowed,
  parameter,
  titleKey,
  titleKeys,
}: ValidatedPendingRouteProps) {
  const params = useParams();
  const value = params[parameter];

  return value && allowed.includes(value) ? (
    <PendingRoutePage titleKey={titleKeys?.[value] ?? titleKey} />
  ) : (
    <NotFoundPage />
  );
}
