import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/icon/Icon';

import {
  ASSIGNED_PRIORITIES,
  ASSIGNED_TYPES,
  type AssignedPriorityFilter,
  type AssignedQueueId,
  type AssignedSubTypeId,
  type AssignedTypeId,
} from '../../constants/assignedQueue';
import type { AssignedCounts, AssignedFilters } from '../../domain/assignedQueue';
import { actionButtonClass } from '../actions/actionButtonStyles';

export type AssignedFilterBarProps = Readonly<{
  counts: AssignedCounts;
  filters: AssignedFilters;
  isFiltered: boolean;
  /** The result count shown beside an active search. */
  matchCount: number;
  onPriority: (priority: AssignedPriorityFilter) => void;
  onQuery: (query: string) => void;
  onReset: () => void;
  onSub: (sub: AssignedFilters['sub']) => void;
  onType: (type: AssignedTypeId) => void;
  queue: Exclude<AssignedQueueId, 'tasks'>;
}>;

const TYPE_LABEL_KEY = {
  all: 'assigned.types.all',
  appraisal: 'assigned.types.appraisal',
  budgets: 'assigned.types.budgets',
  checklists: 'assigned.types.checklists',
  'investigation-request': 'assigned.types.investigationRequest',
  observation: 'assigned.types.observation',
  'payment-settlement': 'assigned.types.paymentSettlement',
  'pc-request': 'assigned.types.pcRequest',
  'qa-submissions': 'assigned.types.qaSubmissions',
  tasks: 'assigned.types.tasks',
} as const satisfies Record<AssignedTypeId, string>;

const SUB_LABEL_KEY = {
  'action-sheets': 'assigned.subTypes.actionSheets',
  'additional-budget': 'assigned.subTypes.additionalBudget',
  'advance-payment': 'assigned.subTypes.advancePayment',
  'new-budget': 'assigned.subTypes.newBudget',
  'petty-cash': 'assigned.subTypes.pettyCash',
  'transfer-funds': 'assigned.subTypes.transferFunds',
} as const satisfies Record<AssignedSubTypeId, string>;

const PRIORITY_LABEL_KEY = {
  all: 'assigned.filters.anyPriority',
  critical: 'assigned.filters.critical',
  high: 'assigned.filters.high',
  low: 'assigned.filters.low',
  medium: 'assigned.filters.medium',
} as const satisfies Record<AssignedPriorityFilter, string>;

const SELECT_CLASS =
  'cursor-pointer border-y-0 border-s-0 border-e border-line bg-inset px-2.5 py-2 font-[inherit] text-base font-medium text-fg outline-none';

const withCount = (label: string, count: number | undefined) =>
  count ? `${label}  (${String(count)})` : label;

/**
 * Record type, sub-type, priority and search of the Assigned approvals queue.
 * @prototype index.html:L14695-L14727 Assigned header controls
 */
export function AssignedFilterBar({
  counts,
  filters,
  isFiltered,
  matchCount,
  onPriority,
  onQuery,
  onReset,
  onSub,
  onType,
  queue,
}: AssignedFilterBarProps) {
  const { t } = useTranslation('home');
  const verify = queue === 'verify';
  const typeLabel = (id: AssignedTypeId) => {
    if (id === 'tasks')
      return verify
        ? t('assigned.types.tasksVerify')
        : t('assigned.types.tasksApprove');
    if (id === 'budgets')
      return verify
        ? t('assigned.types.budgetsVerify')
        : t('assigned.types.budgetsApprove');
    return t(TYPE_LABEL_KEY[id]);
  };
  const definition = ASSIGNED_TYPES.find((entry) => entry.id === filters.type);
  const subTypes = definition?.subTypes;
  const active = filters.query !== '' || filters.type !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className={cn(
          'flex items-stretch overflow-hidden rounded border bg-surface',
          active ? 'border-accent' : 'border-line-strong',
        )}
      >
        <select
          aria-label={t('assigned.filters.recordType')}
          className={SELECT_CLASS}
          onChange={(event) => {
            onType(event.target.value as AssignedTypeId);
          }}
          value={filters.type}
        >
          {ASSIGNED_TYPES.filter(
            (entry) => entry.id === 'all' || counts.type[entry.id] > 0,
          ).map((entry) => (
            <option key={entry.id} value={entry.id}>
              {withCount(typeLabel(entry.id), counts.type[entry.id])}
            </option>
          ))}
        </select>
        {subTypes ? (
          <select
            aria-label={t('assigned.filters.subType')}
            className={SELECT_CLASS}
            onChange={(event) => {
              onSub(event.target.value as AssignedFilters['sub']);
            }}
            value={filters.sub}
          >
            <option value="all">
              {t('assigned.filters.allOf', { label: typeLabel(filters.type) })}
            </option>
            {subTypes
              .filter(
                (id) => counts.sub[id] > 0 || filters.type === 'budgets',
              )
              .map((id) => (
                <option key={id} value={id}>
                  {withCount(t(SUB_LABEL_KEY[id]), counts.sub[id])}
                </option>
              ))}
          </select>
        ) : null}
        <select
          aria-label={t('assigned.filters.priority')}
          className={SELECT_CLASS}
          onChange={(event) => {
            onPriority(event.target.value as AssignedPriorityFilter);
          }}
          value={filters.priority}
        >
          {ASSIGNED_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {t(PRIORITY_LABEL_KEY[priority])}
            </option>
          ))}
        </select>
        <div className="flex min-w-[230px] items-center gap-2 px-3 max-tablet:min-w-0 max-tablet:flex-1">
          <Icon className="shrink-0 text-fg-4" name="search" size={14} />
          <input
            aria-label={t('assigned.filters.searchPlaceholder')}
            className="w-full min-w-0 border-0 bg-transparent py-2 font-[inherit] text-base text-fg outline-none"
            onChange={(event) => {
              onQuery(event.target.value);
            }}
            placeholder={t('assigned.filters.searchPlaceholder')}
            value={filters.query}
          />
          {filters.query ? (
            <button
              aria-label={t('assigned.filters.clearSearch')}
              className="inline-flex cursor-pointer border-0 bg-transparent p-0 text-fg-3"
              onClick={() => {
                onQuery('');
              }}
              type="button"
            >
              <Icon name="close" size={12} />
            </button>
          ) : null}
        </div>
      </div>
      {filters.query ? (
        <span className="text-sm whitespace-nowrap text-fg-3">
          {`${String(matchCount)} ${t('assigned.filters.match')}`}
        </span>
      ) : null}
      {isFiltered ? (
        <button
          className={actionButtonClass('ghost', 'sm')}
          onClick={onReset}
          type="button"
        >
          {t('assigned.filters.reset')}
        </button>
      ) : null}
    </div>
  );
}
