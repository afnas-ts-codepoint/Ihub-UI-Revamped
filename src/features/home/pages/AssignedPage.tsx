import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/shared/config/paths';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { toast } from '@/shared/ui/feedback/Toaster';

import { ActionList } from '../components/actions/ActionList';
import { AssignedFilterBar } from '../components/assigned/AssignedFilterBar';
import { AssignedTabs } from '../components/assigned/AssignedTabs';
import { AssignedTaskCard } from '../components/job-orders/AssignedTaskCard';
import { JobOrderCard } from '../components/job-orders/JobOrderCard';
import { HomeSectionHead } from '../components/sections/HomeSectionHead';
import type { AssignedQueueId } from '../constants/assignedQueue';
import {
  assignedCounts,
  assignedJobOrders,
  filterAssignedActions,
  filterTaskRows,
} from '../domain/assignedQueue';
import { rankQueue } from '../domain/prioritization';
import { jobOrderTaskDraft } from '../domain/taskDraft';
import {
  SHARED_ASSIGNED_PARAMS,
  useAssignedFilters,
} from '../hooks/useAssignedFilters';
import { useHomeQueueActions } from '../hooks/useHomeQueueActions';
import { useHomeQueueStore } from '../store/homeQueue.store';

const GRID = 'grid gap-3.5';

function EmptyCard({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="rounded-lg border border-line bg-surface">{children}</div>
  );
}

/**
 * `/home/assigned/:queue` — Approvals and Verify (the ranked approvals queue
 * narrowed by record type, sub-type, priority and search) and Assigned Tasks
 * (the job orders already assigned to the user).
 * @prototype index.html:L14682-L14745 `view === 'assigned'`
 */
export function AssignedPage({ queue }: Readonly<{ queue: AssignedQueueId }>) {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const actions = useHomeQueueStore((state) => state.actions);
  const jobOrders = useHomeQueueStore((state) => state.jobOrders);
  const selected = useHomeQueueStore((state) => state.selected);
  const toggleSelected = useHomeQueueStore((state) => state.toggleSelected);
  const openDrawer = useHomeQueueStore((state) => state.openDrawer);
  const openTask = useHomeQueueStore((state) => state.openTask);
  const { actOnAction, actOnJobOrder, batch } = useHomeQueueActions();
  const filtering = useAssignedFilters();
  const { filters } = filtering;
  const verify = queue === 'verify';

  const ranked = useMemo(() => rankQueue(actions), [actions]);
  const assigned = useMemo(() => assignedJobOrders(jobOrders), [jobOrders]);
  const counts = useMemo(
    () => assignedCounts(ranked, jobOrders),
    [jobOrders, ranked],
  );
  const items = useMemo(
    () => filterAssignedActions(ranked, filters),
    [filters, ranked],
  );
  const taskRows = useMemo(
    () => filterTaskRows(jobOrders, filters),
    [filters, jobOrders],
  );

  const select = (next: AssignedQueueId) => {
    // The type and sub-type reset; priority and search carry over.
    const carried = new URLSearchParams();
    for (const key of SHARED_ASSIGNED_PARAMS) {
      const value = searchParams.get(key);
      if (value) carried.set(key, value);
    }
    void navigate({
      pathname: paths.home.assigned(next),
      search: carried.toString(),
    });
  };

  const tabs = (
    <AssignedTabs
      active={queue}
      counts={{
        approvals: ranked.length,
        tasks: assigned.length,
        verify: ranked.length,
      }}
      onSelect={select}
    />
  );

  if (queue === 'tasks') {
    return (
      <section>
        {tabs}
        <HomeSectionHead
          sub={t('assigned.tasks.subtitle')}
          title={t('assigned.tasks.title')}
        />
        {assigned.length ? (
          <div className={`${GRID} grid-cols-[repeat(auto-fill,minmax(290px,1fr))]`}>
            {assigned.map((jobOrder) => (
              <JobOrderCard
                item={jobOrder}
                key={jobOrder.id}
                onDismiss={(item) => {
                  actOnJobOrder('dismiss', item);
                }}
                onOpen={(item) => {
                  openTask(jobOrderTaskDraft(item));
                }}
                onOpenDrawer={(item) => {
                  openDrawer('jo', item);
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyCard>
            <EmptyState
              description={t('assigned.tasks.emptyDescription')}
              title={t('assigned.tasks.emptyTitle')}
            />
          </EmptyCard>
        )}
      </section>
    );
  }

  // The prototype tests the raw search text, so whitespace alone counts as a search.
  const searching = filters.query !== '';
  const showingTasks = filters.type === 'tasks';
  const sectionKey = verify ? 'verify' : 'approvals';

  return (
    <section>
      {tabs}
      <HomeSectionHead
        right={
          <AssignedFilterBar
            counts={counts}
            filters={filters}
            isFiltered={filtering.isFiltered}
            matchCount={showingTasks ? taskRows.length : items.length}
            onPriority={filtering.setPriority}
            onQuery={filtering.setQuery}
            onReset={filtering.reset}
            onSub={filtering.setSub}
            onType={filtering.setType}
            queue={queue}
          />
        }
        sub={t(`assigned.${sectionKey}.subtitle`)}
        title={t(`assigned.${sectionKey}.title`)}
      />
      {showingTasks ? (
        taskRows.length ? (
          <div className={`${GRID} grid-cols-[repeat(auto-fill,minmax(300px,1fr))]`}>
            {taskRows.map((jobOrder) => (
              <AssignedTaskCard
                item={jobOrder}
                key={jobOrder.id}
                onApprove={(item) => {
                  actOnJobOrder('approve', item);
                }}
                onEdit={(item) => {
                  openTask(jobOrderTaskDraft(item));
                }}
                onSendBack={(item) => {
                  toast(t('queue.toast.sentBackToRequester', { id: item.id }));
                }}
                verify={verify}
              />
            ))}
          </div>
        ) : (
          <EmptyCard>
            <EmptyState
              description={
                searching
                  ? t('assigned.empty.noTaskMatchDescription')
                  : t('assigned.empty.noTasksDescription')
              }
              icon="folder"
              title={
                searching
                  ? t('assigned.empty.noMatches')
                  : t('assigned.empty.noTasks')
              }
            />
          </EmptyCard>
        )
      ) : items.length ? (
        <ActionList
          items={items}
          onAct={(verb, item) => {
            // "Send back" passes no reason: the store then opens the send-back dialog.
            actOnAction(verb, item);
          }}
          onBatch={batch}
          onOpen={(item) => {
            openDrawer('action', item, verify);
          }}
          onToggle={toggleSelected}
          selectedIds={selected}
          verify={verify}
        />
      ) : (
        <EmptyCard>
          <EmptyState
            description={
              searching
                ? t('assigned.empty.searchDescription')
                : t('assigned.empty.clearDescription')
            }
            icon={verify ? 'eye' : 'inbox'}
            title={
              searching
                ? t('assigned.empty.noMatches')
                : verify
                  ? t('assigned.empty.nothingToVerify')
                  : t('assigned.empty.nothingToApprove')
            }
          />
        </EmptyCard>
      )}
    </section>
  );
}
