import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorBoundary } from '@/shared/ui/feedback/ErrorBoundary';
import { ErrorFallback } from '@/shared/ui/feedback/ErrorFallback';

type AppErrorBoundaryProps = {
  children: ReactNode;
  onReload?: () => void;
};

function reloadPage() {
  window.location.reload();
}

function AppErrorFallback({ onReload }: { onReload: () => void }) {
  const { t } = useTranslation();

  return (
    <ErrorFallback
      actionLabel={t('errors.reload')}
      description={t('errors.application.description')}
      onAction={onReload}
      title={t('errors.application.title')}
    />
  );
}

export function AppErrorBoundary({
  children,
  onReload = reloadPage,
}: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={<AppErrorFallback onReload={onReload} />}>
      {children}
    </ErrorBoundary>
  );
}
