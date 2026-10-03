import { create } from 'zustand';

import type { TrackRecord } from '@/store/tracking.store';

import { ACTIONS } from '../data/actions.mock';
import { INCIDENTS } from '../data/incidents.mock';
import { JOB_ORDERS } from '../data/jobOrders.mock';
import {
  actionShortTitle,
  escalateAction,
  escalateSeverity,
} from '../domain/escalation';
import type {
  DrawerState,
  FormModalState,
  HomeTaskDraft,
  QueueAction,
  QueueActionVerb,
  QueueIncident,
  QueueIncidentVerb,
  QueueJobOrder,
  QueueJobOrderVerb,
  QueueToast,
  RejectedEntry,
  TrackedTask,
  TrackingLabels,
  TrackPromptState,
} from '../types/queue.types';

/** Action kinds that open the Form Preview dialog instead of the workflow drawer. */
const FORM_PREVIEW_KINDS: ReadonlySet<string> = new Set([
  'action-sheet',
  'budget',
  'budget-release',
  'petty-cash',
]);

export const opensFormPreview = (item: Pick<QueueAction, 'kind'>) =>
  FORM_PREVIEW_KINDS.has(item.kind);

type HomeQueueState = {
  actions: readonly QueueAction[];
  incidents: readonly QueueIncident[];
  jobOrders: readonly QueueJobOrder[];
  selected: readonly string[];
  drawer: DrawerState | null;
  formModal: FormModalState | null;
  sendbackFor: QueueAction | null;
  taskOpen: HomeTaskDraft | null;
  trackPrompt: TrackPromptState | null;
  trackedTasks: readonly TrackedTask[];
  rejectedFeed: readonly RejectedEntry[];
  actOnAction: (
    type: QueueActionVerb,
    item: QueueAction,
    reason?: string,
  ) => QueueToast | undefined;
  actOnIncident: (
    type: QueueIncidentVerb,
    item: QueueIncident,
  ) => QueueToast | undefined;
  actOnJobOrder: (type: QueueJobOrderVerb, item: QueueJobOrder) => QueueToast;
  batch: (type: 'approve' | 'reject') => QueueToast;
  closeDrawer: () => void;
  closeFormModal: () => void;
  closeSendBack: () => void;
  closeTask: () => void;
  dismissRejected: (id: string) => void;
  dismissTrackPrompt: () => void;
  openDrawer: (
    type: DrawerState['type'],
    item: DrawerState['item'],
    verify?: boolean,
  ) => void;
  openFormModal: (
    item: QueueAction,
    options?: { creator?: boolean; verify?: boolean },
  ) => void;
  openSendBack: (item: QueueAction) => void;
  openTask: (task: HomeTaskDraft) => void;
  reset: () => void;
  resubmit: (id: string) => QueueToast;
  selectAll: (ids: readonly string[]) => void;
  toggleSelected: (id: string) => void;
  trackItem: () => QueueToast | undefined;
  trackRecord: (record: TrackRecord, labels: TrackingLabels) => void;
};

/** @prototype index.html:L14282 default tracker when a record names none */
const DEFAULT_TRACKER = 'M. Faris';

const initialState = () => ({
  actions: ACTIONS.map((action) => ({ ...action })),
  drawer: null,
  formModal: null,
  incidents: INCIDENTS.map((incident) => ({ ...incident })),
  jobOrders: JOB_ORDERS.map((jobOrder) => ({ ...jobOrder })),
  rejectedFeed: [],
  selected: [],
  sendbackFor: null,
  taskOpen: null,
  trackedTasks: [],
  trackPrompt: null,
});

/** Toast of the incident menu actions that only note the request (and mark the incident read). */
const INCIDENT_NOTE_TOAST = {
  callback: 'callbackRequested',
  compensate: 'compensationLogged',
  feedback: 'feedbackSaved',
  investigate: 'investigationRequested',
} as const satisfies Partial<Record<QueueIncidentVerb, QueueToast['key']>>;

const withoutId = <Item extends { id: string }>(
  list: readonly Item[],
  id: string,
) => list.filter((entry) => entry.id !== id);

/**
 * Home queue state (approvals, incidents, job orders, drawer and decision
 * dialogs). The store is pure state: mutations return a toast descriptor that
 * `useHomeQueueActions` localises. State lives for as long as the Home
 * layout is mounted, like `DashboardOCC`'s local state.
 * @prototype ihub/index.html:L12080-L12292 `DashboardOCC` queue state and handlers
 */
export const useHomeQueueStore = create<HomeQueueState>()((set, get) => ({
  ...initialState(),

  actOnAction: (type, item, reason): QueueToast | undefined => {
    if (type === 'pin') {
      set((state) => ({
        actions: state.actions.map((action) =>
          action.id === item.id
            ? { ...action, pinned: !action.pinned }
            : action,
        ),
      }));
      return undefined;
    }
    if (type === 'escalate') {
      set((state) => ({
        actions: state.actions.map((action) =>
          action.id === item.id ? escalateAction(action) : action,
        ),
      }));
      return {
        key: 'escalatedAction',
        values: { name: actionShortTitle(item.title) },
      };
    }
    if (type === 'sendback') {
      // No reason yet → ask for one. An empty string (embedded forms) is a reason.
      if (reason === undefined) {
        set({ sendbackFor: item });
        return undefined;
      }
      set((state) => ({
        actions: withoutId(state.actions, item.id),
        drawer: state.drawer?.item.id === item.id ? null : state.drawer,
        selected: state.selected.filter((id) => id !== item.id),
        trackedTasks: [
          {
            id: item.id,
            kind: item.kind,
            reason,
            returned: true,
            title: item.title,
            when: reason || undefined,
          },
          ...withoutId(state.trackedTasks, item.id),
        ],
      }));
      return reason
        ? { key: 'sentBackWithReason', values: { reason } }
        : { key: 'sentBack' };
    }
    set((state) => ({
      actions: withoutId(state.actions, item.id),
      drawer: state.drawer?.item.id === item.id ? null : state.drawer,
      rejectedFeed:
        type === 'reject'
          ? [
              {
                id: item.id,
                kind: item.kind,
                owner: item.owner || item.dept,
                title: item.title,
              },
              ...withoutId(state.rejectedFeed, item.id),
            ]
          : state.rejectedFeed,
      selected: state.selected.filter((id) => id !== item.id),
      // Only an approval prompts for tracking; reject and send back do not.
      trackPrompt:
        type === 'approve'
          ? { id: item.id, title: item.title }
          : state.trackPrompt,
    }));
    return type === 'approve'
      ? { key: 'approved', values: { recommended: item.recommended } }
      : { key: 'rejected' };
  },

  actOnIncident: (type, item): QueueToast | undefined => {
    const markRead = (state: HomeQueueState) =>
      state.incidents.map((incident) =>
        incident.id === item.id ? { ...incident, read: true } : incident,
      );
    const values = { id: item.id };

    if (type === 'pin') {
      // `willPin` comes from the (possibly stale) snapshot the drawer holds.
      const willPin = !item.pinned;
      set((state) => ({
        incidents: state.incidents.map((incident) =>
          incident.id === item.id
            ? {
                ...incident,
                pinned: !incident.pinned,
                read: willPin ? true : incident.read,
              }
            : incident,
        ),
        trackedTasks:
          willPin && !state.trackedTasks.some((task) => task.id === item.id)
            ? [{ id: item.id, title: item.title }, ...state.trackedTasks]
            : state.trackedTasks,
      }));
      return willPin ? { key: 'pinnedTracking', values } : undefined;
    }
    if (type === 'escalate') {
      set((state) => ({
        incidents: state.incidents.map((incident) =>
          incident.id === item.id
            ? { ...incident, severity: escalateSeverity(incident.severity) }
            : incident,
        ),
      }));
      return { key: 'escalatedIncident', values };
    }
    if (type === 'dismiss' || type === 'close') {
      set((state) => ({
        drawer: state.drawer?.item.id === item.id ? null : state.drawer,
        incidents: withoutId(state.incidents, item.id),
      }));
      return {
        key: type === 'close' ? 'caseClosed' : 'dismissedIncident',
        values,
      };
    }
    if (type === 'read') {
      set((state) => ({ incidents: markRead(state) }));
      return undefined;
    }
    if (type === 'track') {
      set((state) => ({
        incidents: markRead(state),
        trackedTasks: state.trackedTasks.some((task) => task.id === item.id)
          ? state.trackedTasks
          : [{ id: item.id, title: item.title }, ...state.trackedTasks],
      }));
      return { key: 'trackAdded', values };
    }
    if (type === 'task') {
      // The thin draft of a Home "Raise a task" (M9.1 Usage C2).
      set((state) => ({
        incidents: markRead(state),
        taskOpen: {
          dept: item.owner,
          id: item.id,
          kind: 'internal',
          priority:
            item.severity === 'critical' || item.severity === 'high'
              ? 'high'
              : 'medium',
          title: item.title,
        },
      }));
      return { key: 'taskDrafted', values };
    }
    set((state) => ({ incidents: markRead(state) }));
    return { key: INCIDENT_NOTE_TOAST[type], values };
  },

  actOnJobOrder: (type, item): QueueToast => {
    if (type === 'dismiss') {
      // The drawer deliberately stays open on a dismissed job order.
      set((state) => ({ jobOrders: withoutId(state.jobOrders, item.id) }));
      return { key: 'dismissedJobOrder', values: { id: item.id } };
    }
    set((state) => ({
      drawer: null,
      jobOrders: state.jobOrders.map((jobOrder) =>
        jobOrder.id === item.id
          ? { ...jobOrder, isNew: false, status: 'Assigned' }
          : jobOrder,
      ),
      // Approving (not assigning) a job order also prompts for tracking.
      trackPrompt:
        type === 'approve'
          ? { id: item.id, title: item.title }
          : state.trackPrompt,
    }));
    return { key: 'jobOrderAssigned', values: { id: item.id } };
  },

  /** Acts on the whole selection, including ids hidden by the group filter. */
  batch: (type): QueueToast => {
    const picked = new Set(get().selected);
    set((state) => ({
      actions: state.actions.filter((action) => !picked.has(action.id)),
      rejectedFeed:
        type === 'reject'
          ? [
              ...state.actions
                .filter((action) => picked.has(action.id))
                .map((action) => ({
                  id: action.id,
                  kind: action.kind,
                  owner: action.owner || action.dept,
                  title: action.title,
                })),
              ...state.rejectedFeed.filter((entry) => !picked.has(entry.id)),
            ]
          : state.rejectedFeed,
      selected: [],
    }));
    return {
      key: type === 'approve' ? 'batchApproved' : 'batchRejected',
      values: { n: picked.size },
    };
  },

  closeDrawer: () => {
    set({ drawer: null });
  },
  closeFormModal: () => {
    set({ formModal: null });
  },
  closeSendBack: () => {
    set({ sendbackFor: null });
  },
  closeTask: () => {
    set({ taskOpen: null });
  },
  dismissRejected: (id) => {
    set((state) => ({ rejectedFeed: withoutId(state.rejectedFeed, id) }));
  },
  dismissTrackPrompt: () => {
    set({ trackPrompt: null });
  },

  /**
   * Routes by kind: action-sheet, petty-cash and budget kinds open the Form
   * Preview dialog; everything else opens the workflow drawer.
   * @prototype ihub/index.html:L12122-L12132 `openDrawer`
   */
  openDrawer: (type, item, verify = false) => {
    if (type === 'action' && opensFormPreview(item as QueueAction)) {
      set({
        formModal: { creator: false, item: item as QueueAction, verify },
      });
      return;
    }
    set({ drawer: { item, type, verify } as DrawerState });
  },
  openFormModal: (item, options) => {
    set({
      formModal: {
        creator: options?.creator ?? false,
        item,
        verify: options?.verify ?? false,
      },
    });
  },
  openSendBack: (item) => {
    set({ sendbackFor: item });
  },
  openTask: (task) => {
    set({ taskOpen: task });
  },

  reset: () => {
    set(initialState());
  },

  /** Resubmit only clears the tracker row; the item is not re-queued (prototype behaviour). */
  resubmit: (id): QueueToast => {
    set((state) => ({
      formModal: null,
      trackedTasks: withoutId(state.trackedTasks, id),
    }));
    return { key: 'resubmitted' };
  },

  selectAll: (ids) => {
    set({ selected: [...ids] });
  },
  toggleSelected: (id) => {
    set((state) => ({
      selected: state.selected.includes(id)
        ? state.selected.filter((entry) => entry !== id)
        : [...state.selected, id],
    }));
  },

  trackItem: (): QueueToast | undefined => {
    const { trackPrompt } = get();
    if (!trackPrompt) return undefined;
    set((state) => ({
      trackedTasks: state.trackedTasks.some((task) => task.id === trackPrompt.id)
        ? state.trackedTasks
        : [{ id: trackPrompt.id, title: trackPrompt.title }, ...state.trackedTasks],
      trackPrompt: null,
    }));
    return { key: 'trackAdded', values: { id: trackPrompt.id } };
  },

  /**
   * The tracking hand-off (`window.__ihubTrack`): list the record in the
   * tracker, pin and read an incident that already exists, or open a new
   * "Tracking" incident for it.
   * @prototype index.html:L14274-L14289 `__ihubTrack` handler
   */
  trackRecord: (record, labels) => {
    set((state) => {
      const known = state.incidents.some(
        (incident) => incident.id === record.id,
      );
      const owner = record.by ?? DEFAULT_TRACKER;
      return {
        incidents: known
          ? state.incidents.map((incident) =>
              incident.id === record.id
                ? { ...incident, pinned: true, read: true }
                : incident,
            )
          : [
              {
                detail: record.detail ?? record.title,
                feed: [
                  {
                    t: labels.justNow,
                    text: labels.feed,
                    type: 'status',
                    who: owner,
                  },
                ],
                icon: 'bolt',
                id: record.id,
                lastUpdate: labels.justNow,
                location: record.location ?? '—',
                opened: labels.justNow,
                owner,
                pinned: true,
                progress: 0.1,
                read: true,
                severity: record.severity ?? 'medium',
                sla: 'ok',
                slaLabel: labels.slaLabel,
                status: labels.status,
                title: record.title,
              },
              ...state.incidents,
            ],
        trackedTasks: state.trackedTasks.some((task) => task.id === record.id)
          ? state.trackedTasks
          : [{ id: record.id, title: record.title }, ...state.trackedTasks],
      };
    });
  },
}));
