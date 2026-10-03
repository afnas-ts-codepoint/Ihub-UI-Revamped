import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import {
  ASSIGNED_TYPES,
  isAssignedPriority,
  isAssignedType,
  type AssignedSubTypeId,
  type AssignedTypeId,
  type AssignedPriorityFilter,
} from '../constants/assignedQueue';
import type { AssignedFilters } from '../domain/assignedQueue';

type FilterKey = 'priority' | 'q' | 'sub' | 'type';

/** Search params that survive a switch between the Assigned queues (the prototype keeps priority and search). */
export const SHARED_ASSIGNED_PARAMS = ['priority', 'q'] as const;

/**
 * Record type, sub-type, priority and search of the Assigned queue, held in
 * the URL search params. Defaults (`all`, empty) are omitted from the URL, an
 * unknown value reads as the default, and edits replace the history entry.
 * @prototype index.html:L14231-L14239 `asgType`, `asgSub`, `asgPrio`, `asgQ`
 */
export function useAssignedFilters() {
  const [params, setParams] = useSearchParams();
  const rawType = params.get('type') ?? '';
  const rawSub = params.get('sub') ?? '';
  const rawPriority = params.get('priority') ?? '';

  const filters = useMemo<AssignedFilters>(() => {
    const type: AssignedTypeId = isAssignedType(rawType) ? rawType : 'all';
    const subTypes: readonly string[] =
      ASSIGNED_TYPES.find((entry) => entry.id === type)?.subTypes ?? [];
    return {
      priority: isAssignedPriority(rawPriority) ? rawPriority : 'all',
      query: params.get('q') ?? '',
      sub: subTypes.includes(rawSub) ? (rawSub as AssignedSubTypeId) : 'all',
      type,
    };
  }, [params, rawPriority, rawSub, rawType]);

  const update = useCallback(
    (changes: Partial<Record<FilterKey, string>>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(changes)) {
            if (value && value !== 'all') next.set(key, value);
            else next.delete(key);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return {
    filters,
    isFiltered:
      filters.type !== 'all' ||
      filters.sub !== 'all' ||
      filters.priority !== 'all' ||
      filters.query !== '',
    reset: () => {
      update({ priority: '', q: '', sub: '', type: '' });
    },
    setPriority: (priority: AssignedPriorityFilter) => {
      update({ priority });
    },
    setQuery: (query: string) => {
      update({ q: query });
    },
    setSub: (sub: AssignedFilters['sub']) => {
      update({ sub });
    },
    setType: (type: AssignedTypeId) => {
      update({ sub: '', type });
    },
  };
}
