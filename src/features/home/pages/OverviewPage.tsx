import { lazy, Suspense, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@/shared/config/paths';

import { CalendarCard } from '../components/company/CalendarCard';
import { IncidentCenter } from '../components/incidents/IncidentCenter';
import { LiveFeed } from '../components/incidents/LiveFeed';
import { NeedsYouNow } from '../components/overview/NeedsYouNow';
import { OnTheClock, type ClockJump } from '../components/overview/OnTheClock';
import { RecommendedNextAction } from '../components/overview/RecommendedNextAction';
import { TrackerCard } from '../components/overview/TrackerCard';
import { jobOrderTaskDraft } from '../domain/taskDraft';
import { rankIncidents, rankQueue } from '../domain/prioritization';
import { returnedFormItem } from '../domain/returnedItem';
import { useHomeQueueActions } from '../hooks/useHomeQueueActions';
import { useHomeQueueStore } from '../store/homeQueue.store';
import type { QueueIncident, TrackedTask } from '../types/queue.types';

const AnalyticsOverview = lazy(async () => {
  const module = await import('../components/overview/AnalyticsOverview');
  return { default: module.AnalyticsOverview };
});

const WorkloadSection = lazy(async () => {
  const module = await import('../components/overview/WorkloadSection');
  return { default: module.WorkloadSection };
});

const JUMP_PATH: Readonly<Record<ClockJump, string>> = {
  approvals: paths.home.view('approvals'),
  assigned: paths.home.assigned('approvals'),
  incidents: paths.home.incidents('reports'),
  sla: paths.home.view('sla'),
};

/**
 * `/home/overview` — the recommended next action, the ranked queue beside the
 * incident centre, the live SLA clock and monthly compliance, the workload
 * heatmap, the analytics snapshot, and the tracker with the live feed beside
 * the calendar. Every list reads the Home queue store, so decisions made here
 * and on the other Home views show everywhere; the dialogs and drawer are
 * mounted once by `HomeLayout`.
 * @prototype index.html:L14542-L14636 `view === 'overview'`
 */
export function OverviewPage() {
  const navigate = useNavigate();
  const actions = useHomeQueueStore((state) => state.actions);
  const incidents = useHomeQueueStore((state) => state.incidents);
  const jobOrders = useHomeQueueStore((state) => state.jobOrders);
  const trackedTasks = useHomeQueueStore((state) => state.trackedTasks);
  const openDrawer = useHomeQueueStore((state) => state.openDrawer);
  const openFormModal = useHomeQueueStore((state) => state.openFormModal);
  const openTask = useHomeQueueStore((state) => state.openTask);
  const untrack = useHomeQueueStore((state) => state.untrack);
  const { actOnAction, actOnIncident } = useHomeQueueActions();

  const ranked = useMemo(() => rankQueue(actions), [actions]);
  const criticalIncident = useMemo(
    () =>
      rankIncidents(incidents).find(
        (incident) =>
          incident.severity === 'critical' && incident.sla === 'breached',
      ),
    [incidents],
  );
  const pinned = useMemo(
    () => incidents.filter((incident) => incident.pinned),
    [incidents],
  );
  const returned = useMemo(
    () => trackedTasks.filter((task) => task.returned),
    [trackedTasks],
  );

  const openIncident = (incident: QueueIncident) => {
    openDrawer('incident', incident);
  };
  // A tracker row opens its incident (marking it read), else its job order,
  // else a bare task with only the id and title.
  const openTracked = (task: TrackedTask) => {
    const incident = incidents.find((entry) => entry.id === task.id);
    if (incident) {
      actOnIncident('read', incident);
      openIncident(incident);
      return;
    }
    const jobOrder = jobOrders.find((entry) => entry.id === task.id);
    openTask(
      jobOrder
        ? jobOrderTaskDraft(jobOrder)
        : { id: task.id, title: task.title },
    );
  };

  return (
    <div className="flex flex-col gap-6" data-testid="home-overview">
      <RecommendedNextAction
        criticalIncident={criticalIncident}
        onAct={actOnAction}
        onOpenAction={(item) => {
          openDrawer('action', item);
        }}
        onOpenIncident={openIncident}
        ranked={ranked}
      />
      <div className="grid grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)] items-start gap-6 max-desktop:grid-cols-[minmax(0,1fr)]">
        <NeedsYouNow
          onAct={actOnAction}
          onOpen={(item) => {
            openDrawer('action', item);
          }}
          onOpenReturned={(task) => {
            openFormModal(returnedFormItem(task), { creator: true });
          }}
          onSeeAll={() => {
            void navigate(JUMP_PATH.assigned);
          }}
          queueSize={actions.length}
          ranked={ranked}
          returned={returned}
        />
        <div className="sticky top-[124px] min-w-0 max-desktop:static">
          <IncidentCenter
            incidents={incidents}
            onAct={actOnIncident}
            onOpen={openIncident}
          />
        </div>
      </div>
      <OnTheClock
        actions={actions}
        incidents={incidents}
        jobOrders={jobOrders}
        onJump={(view) => {
          void navigate(JUMP_PATH[view]);
        }}
        onOpen={(row) => {
          if (row.source.type === 'action') {
            openDrawer('action', row.source.item);
          } else if (row.source.type === 'jo') {
            openTask(jobOrderTaskDraft(row.source.item));
          } else {
            actOnIncident('read', row.source.item);
            openIncident(row.source.item);
          }
        }}
      />
      <Suspense
        fallback={
          <div aria-hidden="true" className="mt-6 h-64 animate-pulse rounded-lg bg-inset" />
        }
      >
        <WorkloadSection />
        <AnalyticsOverview />
      </Suspense>
      <div className="mt-6 grid grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)] items-start gap-6 max-desktop:grid-cols-[minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <TrackerCard
            onOpen={openTracked}
            onUntrack={untrack}
            tasks={trackedTasks}
          />
          <LiveFeed
            onOpen={openIncident}
            onUnpin={(incident) => {
              actOnIncident('pin', incident);
            }}
            pinned={pinned}
          />
        </div>
        <CalendarCard />
      </div>
    </div>
  );
}
