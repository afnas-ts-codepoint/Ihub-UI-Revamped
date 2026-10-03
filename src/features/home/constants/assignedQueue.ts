import type { HomePriority } from '../types/home.types';

/** `/home/assigned/:queue` — the prototype's `ASG_L3` sub-navigation (Approvals, Verify, Assigned Tasks). */
export const ASSIGNED_QUEUES = ['approvals', 'verify', 'tasks'] as const;
export type AssignedQueueId = (typeof ASSIGNED_QUEUES)[number];

export const isAssignedQueue = (value: string): value is AssignedQueueId =>
  (ASSIGNED_QUEUES as readonly string[]).includes(value);

export type AssignedSubTypeId =
  | 'action-sheets'
  | 'additional-budget'
  | 'advance-payment'
  | 'new-budget'
  | 'petty-cash'
  | 'transfer-funds';

export type AssignedTypeId =
  | 'all'
  | 'appraisal'
  | 'budgets'
  | 'checklists'
  | 'investigation-request'
  | 'observation'
  | 'payment-settlement'
  | 'pc-request'
  | 'qa-submissions'
  | 'tasks';

export type AssignedTypeDefinition = Readonly<{
  /** Approval groups the type lists (types without sub-types). */
  groups?: readonly string[];
  id: AssignedTypeId;
  /** Hard-coded count of a type that has no live source (prototype data). */
  seedCount?: number;
  subTypes?: readonly AssignedSubTypeId[];
}>;

/**
 * Record types of the Assigned approvals/verify queue. The five types with a
 * `seedCount` have no source records in the prototype: they list their seed
 * count but always open an empty queue.
 * @prototype index.html:L14496-L14517 `ASG_QUEUE`, `asgGroupFilter`
 */
export const ASSIGNED_TYPES: readonly AssignedTypeDefinition[] = [
  { id: 'all' },
  {
    id: 'payment-settlement',
    subTypes: ['petty-cash', 'advance-payment', 'action-sheets'],
  },
  { id: 'tasks' },
  {
    id: 'budgets',
    subTypes: ['new-budget', 'additional-budget', 'transfer-funds'],
  },
  { groups: ['purchase-committee'], id: 'pc-request' },
  { id: 'appraisal', seedCount: 2 },
  { id: 'qa-submissions', seedCount: 5 },
  { id: 'observation', seedCount: 3 },
  { id: 'checklists', seedCount: 4 },
  { id: 'investigation-request', seedCount: 1 },
];

/**
 * Record `kind` a sub-type lists. `advance-payment` and `additional-budget`
 * match no queue record, so those sub-types are always empty (prototype data).
 * @prototype index.html:L14519 `SUB_KIND`
 */
export const SUB_TYPE_KIND: Readonly<Record<AssignedSubTypeId, string>> = {
  'action-sheets': 'action-sheet',
  'additional-budget': 'additional-budget',
  'advance-payment': 'advance-payment',
  'new-budget': 'budget',
  'petty-cash': 'petty-cash',
  'transfer-funds': 'budget-release',
};

export const ASSIGNED_PRIORITIES = [
  'all',
  'critical',
  'high',
  'medium',
  'low',
] as const satisfies readonly ('all' | HomePriority)[];
export type AssignedPriorityFilter = (typeof ASSIGNED_PRIORITIES)[number];

export const isAssignedType = (value: string): value is AssignedTypeId =>
  ASSIGNED_TYPES.some((type) => type.id === value);

export const isAssignedPriority = (
  value: string,
): value is AssignedPriorityFilter =>
  (ASSIGNED_PRIORITIES as readonly string[]).includes(value);
