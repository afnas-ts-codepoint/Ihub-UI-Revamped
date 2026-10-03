import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { NotFoundPage } from '@/app/router/NotFoundPage';
import {
  findMaster,
  findMasterDefinition,
  MasterPage,
  MasterPendingPage,
} from '@/features/masters';

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
