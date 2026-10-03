import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useTrackingStore } from '@/store/tracking.store';

import { useHomeQueueStore } from '../store/homeQueue.store';
import { FormPreviewDialog } from './form-preview/FormPreviewDialog';
import { SendBackDialog } from './actions/SendBackDialog';
import { TrackPromptDialog } from './actions/TrackPromptDialog';
import { HomeTaskDialog } from './task-form/HomeTaskDialog';
import { WorkflowDrawer } from './workflow-drawer/WorkflowDrawer';

/**
 * Mounts the Home queue overlays once for every `/home/*` route: the workflow
 * drawer, the Form Preview dialog, the send-back dialog, the track prompt and
 * the Home task form. Routed children open them through the home queue store.
 * It also takes the "Track this item" requests other features queue in the
 * tracking store, as the prototype's `__ihubTrack` handler did while Home was
 * mounted.
 * @prototype ihub/index.html:L12733-L12761 `DashboardOCC` overlays
 */
export function HomeQueueHost() {
  const { t } = useTranslation('home');

  useEffect(() => {
    const takeRequests = () => {
      for (const record of useTrackingStore.getState().drain()) {
        useHomeQueueStore.getState().trackRecord(record, {
          feed: t('tracking.feed'),
          justNow: t('tracking.justNow'),
          slaLabel: t('tracking.withinSla'),
          status: t('tracking.status'),
        });
      }
    };
    takeRequests();
    return useTrackingStore.subscribe(takeRequests);
  }, [t]);

  // The tracker lists assigned job orders from the moment Home mounts, on every
  // Home view (the prototype's effect lives in `DashboardOCC`, not the Overview).
  const jobOrders = useHomeQueueStore((state) => state.jobOrders);
  useEffect(() => {
    useHomeQueueStore.getState().syncAssignedTracking();
  }, [jobOrders]);

  return (
    <>
      <WorkflowDrawer />
      <FormPreviewDialog />
      <SendBackDialog />
      <TrackPromptDialog />
      <HomeTaskDialog />
    </>
  );
}
