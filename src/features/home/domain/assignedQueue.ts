import {
  ASSIGNED_TYPES,
  SUB_TYPE_KIND,
  type AssignedPriorityFilter,
  type AssignedSubTypeId,
  type AssignedTypeDefinition,
  type AssignedTypeId,
} from '../constants/assignedQueue';
import type { QueueAction, QueueJobOrder } from '../types/queue.types';
import { referenceCode } from './referenceCode';

export type AssignedFilters = Readonly<{
  priority: AssignedPriorityFilter;
  query: string;
  sub: 'all' | AssignedSubTypeId;
  type: AssignedTypeId;
}>;

export type AssignedCounts = Readonly<{
  sub: Readonly<Record<AssignedSubTypeId, number>>;
  type: Readonly<Record<AssignedTypeId, number>>;
}>;

/** Case-insensitive substring match over the joined parts; an empty query matches everything. */
export function matchesQuery(
  query: string,
  parts: readonly (string | undefined)[],
) {
  const needle = query.trim().toLowerCase();
  return (
    !needle ||
    parts.filter(Boolean).join(' | ').toLowerCase().includes(needle)
  );
}

/** Tasks assigned to the user: every job order that is no longer `New`. */
export const assignedJobOrders = (jobOrders: readonly QueueJobOrder[]) =>
  jobOrders.filter((jobOrder) => jobOrder.status !== 'New');

/**
 * Live counts of the record-type and sub-type selects, from the ranked queue
 * and the assigned job orders.
 * @prototype index.html:L14518-L14533 dynamic queue counts
 */
export function assignedCounts(
  ranked: readonly QueueAction[],
  jobOrders: readonly QueueJobOrder[],
): AssignedCounts {
  const sub = {} as Record<AssignedSubTypeId, number>;
  const type = {} as Record<AssignedTypeId, number>;
  for (const definition of ASSIGNED_TYPES) {
    if (definition.id === 'all') {
      type.all = ranked.length;
    } else if (definition.subTypes) {
      for (const id of definition.subTypes) {
        sub[id] = ranked.filter((action) => action.kind === SUB_TYPE_KIND[id]).length;
      }
      type[definition.id] = definition.subTypes.reduce((n, id) => n + sub[id], 0);
    } else if (definition.groups) {
      type[definition.id] = ranked.filter((action) =>
        definition.groups?.includes(action.group),
      ).length;
    } else if (definition.id === 'tasks') {
      type.tasks = externalJobOrders(jobOrders).length;
    } else {
      type[definition.id] = definition.seedCount ?? 0;
    }
  }
  return { sub, type };
}

const externalJobOrders = (jobOrders: readonly QueueJobOrder[]) =>
  assignedJobOrders(jobOrders).filter((jobOrder) => jobOrder.kind === 'external');

function typeActions(
  ranked: readonly QueueAction[],
  definition: AssignedTypeDefinition | undefined,
  sub: AssignedFilters['sub'],
) {
  if (!definition || definition.id === 'all') return ranked;
  if (definition.subTypes) {
    const kinds = (sub === 'all' ? definition.subTypes : [sub]).map(
      (id) => SUB_TYPE_KIND[id],
    );
    return ranked.filter((action) => kinds.includes(action.kind));
  }
  if (definition.groups) {
    return ranked.filter((action) => definition.groups?.includes(action.group));
  }
  return [];
}

/**
 * Approvals/Verify list for the chosen record type, priority and search.
 * @prototype index.html:L14537-L14548 `asgActionsRaw`, `asgActions`
 */
export function filterAssignedActions(
  ranked: readonly QueueAction[],
  { priority, query, sub, type }: AssignedFilters,
) {
  const definition = ASSIGNED_TYPES.find((entry) => entry.id === type);
  return typeActions(ranked, definition, sub).filter(
    (action) =>
      (priority === 'all' || action.priority === priority) &&
      matchesQuery(query, [
        referenceCode(action),
        action.title,
        action.owner,
        action.dept,
        action.status,
      ]),
  );
}

/**
 * External assigned tasks listed under the `tasks` record type.
 * @prototype index.html:L14549 `asgTaskRows`
 */
export function filterTaskRows(
  jobOrders: readonly QueueJobOrder[],
  { priority, query }: Pick<AssignedFilters, 'priority' | 'query'>,
) {
  return externalJobOrders(jobOrders).filter(
    (jobOrder) =>
      (priority === 'all' || jobOrder.priority === priority) &&
      matchesQuery(query, [
        jobOrder.id,
        jobOrder.title,
        jobOrder.dept,
        jobOrder.location,
      ]),
  );
}

/**
 * Progress shown on a job-order card, derived from its status text.
 * @prototype index.html:L13437 `joPct`
 */
export function jobOrderProgress(status: string) {
  const text = status.toLowerCase();
  if (text.includes('done') || text.includes('complet')) return 100;
  if (text.includes('progress') || text.includes('review')) return 67;
  if (
    text.includes('assign') ||
    text.includes('sched') ||
    text.includes('accept')
  )
    return 33;
  return 0;
}
