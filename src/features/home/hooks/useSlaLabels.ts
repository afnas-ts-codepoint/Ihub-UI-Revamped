import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { SlaLabels } from '../domain/sla';

/** Localised SLA unit and phrase captions (`T(en, ar)` pairs in the prototype). */
export function useSlaLabels(): SlaLabels {
  const { t } = useTranslation('home');
  return useMemo(
    () => ({
      days: t('sla.days'),
      hours: t('sla.hours'),
      left: t('sla.left'),
      minutes: t('sla.minutes'),
      over: t('sla.over'),
      target: t('sla.target'),
      waiting: t('sla.waiting'),
    }),
    [t],
  );
}
