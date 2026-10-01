import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { toast } from '@/shared/ui/feedback/Toaster';

import { useHomeQueueStore } from '../store/homeQueue.store';
import type { QueueToast } from '../types/queue.types';

/**
 * Store mutations that flash the prototype's toast. The store stays pure and
 * returns a descriptor; this hook localises it and shows it (`flash`).
 */
export function useHomeQueueActions() {
  const { t } = useTranslation('home');

  return useMemo(() => {
    const notify = (descriptor: QueueToast | undefined) => {
      if (descriptor)
        toast(t(`queue.toast.${descriptor.key}`, descriptor.values));
    };
    const store = () => useHomeQueueStore.getState();

    return {
      actOnAction: (...args: Parameters<ReturnType<typeof store>['actOnAction']>) => {
        notify(store().actOnAction(...args));
      },
      actOnIncident: (...args: Parameters<ReturnType<typeof store>['actOnIncident']>) => {
        notify(store().actOnIncident(...args));
      },
      actOnJobOrder: (...args: Parameters<ReturnType<typeof store>['actOnJobOrder']>) => {
        notify(store().actOnJobOrder(...args));
      },
      batch: (type: 'approve' | 'reject') => {
        notify(store().batch(type));
      },
      resubmit: (id: string) => {
        notify(store().resubmit(id));
      },
      trackItem: () => {
        notify(store().trackItem());
      },
    };
  }, [t]);
}
