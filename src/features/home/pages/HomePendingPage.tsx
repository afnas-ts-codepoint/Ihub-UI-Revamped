import { useTranslation } from 'react-i18next';

import { MigrationPending } from '@/shared/ui/feedback/MigrationPending';

export type HomePendingArea =
  | 'approvals'
  | 'assigned'
  | 'budgets'
  | 'company'
  | 'overview'
  | 'paymentSettlement'
  | 'purchasing'
  | 'reports'
  | 'tasks'
  | 'workCentre';

export function HomePendingPage({ area }: Readonly<{ area: HomePendingArea }>) {
  const { t } = useTranslation('home');
  return <MigrationPending area={t(`pending.${area}`)} />;
}
