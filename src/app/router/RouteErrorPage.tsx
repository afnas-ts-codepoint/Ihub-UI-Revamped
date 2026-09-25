import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteError } from 'react-router';

import { logger } from '@/shared/lib/logger';
import { ErrorFallback } from '@/shared/ui/feedback/ErrorFallback';

export function RouteErrorPage() {
  const error = useRouteError();
  const { t } = useTranslation();

  useEffect(() => {
    logger.error('Route rendering failed', error);
  }, [error]);

  return (
    <ErrorFallback
      actionLabel={t('errors.reload')}
      description={t('errors.route.description')}
      onAction={() => {
        window.location.reload();
      }}
      title={t('errors.route.title')}
    />
  );
}
