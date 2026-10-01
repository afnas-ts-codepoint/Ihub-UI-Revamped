import { create } from 'zustand';

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
  QueueAction,
  QueueActionVerb,
  QueueIncident,
  QueueIncidentVerb,
  QueueJobOrder,
  QueueJobOrderVerb,
  QueueToast,
  RejectedEntry,
  TrackedTask,
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
  reset: () => void;
  resubmit: (id: string) => QueueToast;
  selectAll: (ids: readonly string[]) => void;
  toggleSelected: (id: string) => void;
  trackItem: () => QueueToast | undefined;
};

const initialState = () => ({
  actions: ACTIONS.map((action) => ({ ...action })),
  drawer: null,
  formModal: null,
  incidents: INCIDENTS.map((incident) => ({ ...incident })),
  jobOrders: JOB_ORDERS.map((jobOrder) => ({ ...jobOrder })),
  rejectedFeed: [],
  selected: [],
  sendbackFor: null,
  trackedTasks: [],
  trackPrompt: null,
});

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
      return willPin
        ? { key: 'pinnedTracking', values: { id: item.id } }
        : undefined;
    }
    if (type === 'escalate') {
      set((state) => ({
        incidents: state.incidents.map((incident) =>
          incident.id === item.id
            ? { ...incident, severity: escalateSeverity(incident.severity) }
            : incident,
        ),
      }));
      return { key: 'escalatedIncident', values: { id: item.id } };
    }
    set((state) => ({
      drawer: state.drawer?.item.id === item.id ? null : state.drawer,
      incidents: withoutId(state.incidents, item.id),
    }));
    return { key: 'dismissedIncident', values: { id: item.id } };
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
}));
