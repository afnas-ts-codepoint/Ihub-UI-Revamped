import type {
  HomeAction,
  HomeIncident,
  HomeJobOrder,
  HomePriority,
} from './home.types';

export type ActionKind =
  | 'action-sheet'
  | 'budget'
  | 'budget-release'
  | 'contract'
  | 'leave'
  | 'overtime'
  | 'petty-cash'
  | 'purchase';

export type ApprovalGroupId =
  | 'action-sheet'
  | 'new-budget'
  | 'other'
  | 'purchase-committee'
  | 'transfer-funds';

export type QueueIconName =
  | 'bolt'
  | 'calendar'
  | 'chart'
  | 'clock'
  | 'dollar'
  | 'flag'
  | 'megaphone'
  | 'receipt'
  | 'shield'
  | 'sun'
  | 'wallet';

/** An approvals-queue record (`ACTIONS`) plus the runtime-only `pinned` flag (`_pinned`). */
export type QueueAction = HomeAction &
  Readonly<{
    amountNum: number;
    attachments: readonly string[];
    group: ApprovalGroupId;
    icon: QueueIconName;
    impact: string;
    kind: ActionKind;
    pinned?: boolean;
    reason: string;
    recommended: string;
    status: string;
    steps: readonly string[];
  }>;

export type IncidentFeedType =
  | 'comment'
  | 'escalation'
  | 'owner'
  | 'resolution'
  | 'status';

export type IncidentFeedEntry = Readonly<{
  t: string;
  text: string;
  type: IncidentFeedType;
  who: string;
}>;

export type QueueIncident = HomeIncident &
  Readonly<{
    detail: string;
    feed: readonly IncidentFeedEntry[];
    icon: QueueIconName;
    lastUpdate: string;
    location: string;
    opened: string;
    owner: string;
    read?: boolean;
    slaLabel: string;
  }>;

export type JobOrderKind = 'external' | 'internal';

export type QueueJobOrder = HomeJobOrder &
  Readonly<{
    dept: string;
    detail: string;
    due: string;
    kind: JobOrderKind;
    location: string;
    partner: string;
    priority: HomePriority;
    steps: readonly string[];
    title: string;
  }>;

export type SlaState = 'at-risk' | 'breached' | 'ok';

export type SlaResult = Readonly<{
  elapsed: number;
  left: number;
  pct: number;
  state: SlaState;
  target: number;
}>;

/** Shape `slaOf` reads: an action (kind/dueState) or a job order (`JO-` id, priority, due text). */
export type SlaSubject = Readonly<{
  dueState?: string;
  due?: string;
  id: string;
  kind?: string;
  priority?: string;
}>;

export type DrawerState =
  | Readonly<{ item: QueueAction; type: 'action'; verify: boolean }>
  | Readonly<{ item: QueueIncident; type: 'incident'; verify: boolean }>
  | Readonly<{ item: QueueJobOrder; type: 'jo'; verify: boolean }>;

/** `formModal` — a queue action plus the open-time `verify` and (resubmit) `creator` flags. */
export type FormModalState = Readonly<{
  creator: boolean;
  item: QueueAction;
  verify: boolean;
}>;

export type TrackPromptState = Readonly<{ id: string; title: string }>;

/** `trackedTasks` entry. `when` is undefined for "just now" (rendered by the consumer). */
export type TrackedTask = Readonly<{
  id: string;
  kind?: ActionKind;
  reason?: string;
  returned?: boolean;
  title: string;
  when?: string;
}>;

export type RejectedEntry = Readonly<{
  id: string;
  kind: ActionKind;
  owner: string;
  title: string;
}>;

export type QueueActionVerb = 'approve' | 'escalate' | 'pin' | 'reject' | 'sendback';
export type QueueIncidentVerb =
  | 'callback'
  | 'close'
  | 'compensate'
  | 'dismiss'
  | 'escalate'
  | 'feedback'
  | 'investigate'
  | 'pin'
  | 'read'
  | 'task'
  | 'track';
export type QueueJobOrderVerb = 'approve' | 'assign' | 'dismiss';

/** The `taskOpen` record: a Home job order, or the thin draft raised from a live incident. */
export type HomeTaskDraft = Readonly<{
  dept?: string;
  id: string;
  kind: JobOrderKind;
  location?: string;
  priority: HomePriority;
  title: string;
}>;

/** Localised strings of the incident the tracking hand-off creates (the prototype builds them with `T`). */
export type TrackingLabels = Readonly<{
  feed: string;
  justNow: string;
  slaLabel: string;
  status: string;
}>;

/** Toast descriptor returned by store mutations; the hook layer localises it. */
export type QueueToast = Readonly<{
  key:
    | 'approved'
    | 'batchApproved'
    | 'batchRejected'
    | 'callbackRequested'
    | 'caseClosed'
    | 'compensationLogged'
    | 'dismissedIncident'
    | 'dismissedJobOrder'
    | 'escalatedAction'
    | 'escalatedIncident'
    | 'feedbackSaved'
    | 'investigationRequested'
    | 'jobOrderAssigned'
    | 'pinnedTracking'
    | 'rejected'
    | 'resubmitted'
    | 'sentBack'
    | 'sentBackToRequester'
    | 'sentBackWithReason'
    | 'taskDrafted'
    | 'trackAdded';
  values?: Readonly<Record<string, number | string>>;
}>;
