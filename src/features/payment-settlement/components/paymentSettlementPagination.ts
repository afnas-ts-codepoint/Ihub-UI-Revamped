import type { useTranslation } from 'react-i18next';

export const paymentSettlementPaginationLabels = (
  t: ReturnType<typeof useTranslation<'paymentSettlement'>>['t'],
  count: number,
) => ({
  next: t('pagination.next'),
  page: t('pagination.page'),
  previous: t('pagination.previous'),
  summary: t('pagination.summary', { shown: count, total: count }),
});
