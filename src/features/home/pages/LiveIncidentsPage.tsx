import { useMemo } from 'react';

import { IncidentCenter } from '../components/incidents/IncidentCenter';
import { LiveFeed } from '../components/incidents/LiveFeed';
import { useHomeQueueActions } from '../hooks/useHomeQueueActions';
import { useHomeQueueStore } from '../store/homeQueue.store';

/**
 * `/home/incidents/live` — the incident centre beside a sticky live feed of
 * the pinned/tracked incidents and the rejected approvals.
 * @prototype index.html:L14752-L14778 `view === 'incidents'` (`incTab === 'live'`)
 */
export function LiveIncidentsPage() {
  const incidents = useHomeQueueStore((state) => state.incidents);
  const rejectedFeed = useHomeQueueStore((state) => state.rejectedFeed);
  const openDrawer = useHomeQueueStore((state) => state.openDrawer);
  const dismissRejected = useHomeQueueStore((state) => state.dismissRejected);
  const { actOnIncident } = useHomeQueueActions();
  const pinned = useMemo(
    () => incidents.filter((incident) => incident.pinned),
    [incidents],
  );

  return (
    <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start gap-5 max-desktop:grid-cols-[minmax(0,1fr)]">
      <IncidentCenter
        incidents={incidents}
        onAct={actOnIncident}
        onOpen={(incident) => {
          openDrawer('incident', incident);
        }}
      />
      <div className="sticky top-[124px] min-w-0 max-desktop:static">
        <LiveFeed
          onDismissRejected={dismissRejected}
          onOpen={(incident) => {
            openDrawer('incident', incident);
          }}
          onUnpin={(incident) => {
            actOnIncident('pin', incident);
          }}
          pinned={pinned}
          rejected={rejectedFeed}
        />
      </div>
    </div>
  );
}
