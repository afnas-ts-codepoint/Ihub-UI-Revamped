import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlaItemDialog } from './SlaItemDialog';
import { priorityDotClass, priorityId, secondaryButton } from './sla.styles';
import { timeUsedProgress } from '../domain/sla';
import type {
  DepartmentDetail,
  DepartmentPerformance,
  SlaItem,
  SlaItemState,
  SlaItemType,
  SlaLevel,
} from '../types/sla.types';
import { cn } from '@/shared/lib/cn';
import { ProgressBar } from '@/shared/ui/progress/ProgressBar';
import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

type Props = Readonly<{
  department: DepartmentPerformance | null;
  detail?: DepartmentDetail;
  items: readonly SlaItem[];
  levels: readonly SlaLevel[];
  onClose: () => void;
}>;
const states: readonly ('all' | SlaItemState)[] = [
  'all',
  'running',
  'due',
  'late',
  'closed',
];
const types: readonly ('all' | SlaItemType)[] = [
  'all',
  'Task',
  'Action sheet',
  'Purchase request',
];

export function DepartmentDialog({
  department,
  detail,
  items,
  levels,
  onClose,
}: Props) {
  const { t } = useTranslation('sla');
  const [stateFilter, setStateFilter] =
    useState<(typeof states)[number]>('all');
  const [typeFilter, setTypeFilter] = useState<(typeof types)[number]>('all');
  const [selectedItem, setSelectedItem] = useState<SlaItem | null>(null);
  const shown = useMemo(
    () =>
      items.filter(
        (entry) =>
          (stateFilter === 'all' || entry.state === stateFilter) &&
          (typeFilter === 'all' || entry.type === typeFilter),
      ),
    [items, stateFilter, typeFilter],
  );
  if (!department || !detail) return null;
  const good = department.onTime >= 95;
  const warning = !good && department.onTime >= 90;
  return (
    <>
      <DialogRoot
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        open
      >
        <DialogContent data-testid="department-dialog">
          <DialogHeader className="items-start">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
                {t('departments.performance')}
              </span>
              <DialogTitle className="mt-1 text-2xl font-semibold tracking-tight">
                {department.department}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm-plus text-fg-3">
                {t('departments.ledBy', {
                  lead: detail.lead,
                  count: detail.members,
                })}
              </DialogDescription>
            </div>
            <DialogClose className={secondaryButton}>
              {t('actions.close')}
            </DialogClose>
          </DialogHeader>
          <DialogBody className="gap-4">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
              {[
                [
                  t('departments.columns.onTime'),
                  `${String(department.onTime)}%`,
                  good ? 'text-ok' : warning ? 'text-fg' : 'text-bad',
                ],
                [
                  t('departments.columns.running'),
                  String(department.open),
                  'text-fg',
                ],
                [
                  t('departments.columns.dueSoon'),
                  String(department.dueSoon),
                  department.dueSoon
                    ? 'text-[var(--brand-yellow)]'
                    : 'text-fg-3',
                ],
                [
                  t('departments.columns.late'),
                  String(department.breached),
                  department.breached ? 'text-bad' : 'text-fg-3',
                ],
              ].map(([label, value, tone]) => (
                <div
                  className="flex flex-col gap-1 rounded-menu border border-line bg-inset px-3.5 py-3"
                  key={label}
                >
                  <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
                    {label}
                  </span>
                  <span className={cn('num text-2xl font-semibold', tone)}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
              <div className="rounded-menu border border-line px-3.5 py-3">
                <strong className="block text-sm-plus">
                  {t('departments.columns.avgResponse')}
                </strong>
                <span className="num text-xl font-semibold">
                  {department.response}
                </span>
                <small className="block text-fg-3">
                  {t('departments.firstAttendance')}
                </small>
              </div>
              <div className="rounded-menu border border-line px-3.5 py-3">
                <strong className="block text-sm-plus">
                  {t('departments.columns.avgResolution')}
                </strong>
                <span className="num text-xl font-semibold">
                  {department.resolution}
                </span>
                <small className="block text-fg-3">
                  {t('departments.timeToClose')}
                </small>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-base font-semibold">
                {t('departments.byPriority')}
              </h3>
              {detail.byPriority.map(([priority, open, onTime]) => {
                const level = levels.find(
                  (candidate) => candidate.label === priority,
                );
                const none = open === 0;
                const met = onTime >= (level?.target ?? 90);
                return (
                  <div
                    className="max-sm:grid-cols-[96px_1fr] grid grid-cols-[96px_1fr_120px] items-center gap-3 border-t border-line py-2.5 first:border-t-0"
                    key={priority}
                  >
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-base font-semibold',
                        none && 'text-fg-3',
                      )}
                    >
                      <span
                        className={cn(
                          'size-2 rounded-full',
                          none
                            ? 'bg-line-strong'
                            : priorityDotClass[priorityId(priority)],
                        )}
                      />
                      {priority}
                    </span>
                    <ProgressBar
                      indicatorClassName={met ? 'bg-ok' : 'bg-bad'}
                      label={`${priority} ${t('departments.columns.onTime')}`}
                      value={none ? 0 : onTime}
                    />
                    <span className="max-sm:col-span-2 text-end text-sm-plus text-fg-3">
                      {none
                        ? t('departments.noneThisMonth')
                        : `${String(onTime)}% · ${String(open)} ${t('departments.open')}`}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-base font-semibold">
                  {t('departments.items')}
                </h3>
                <span className="text-xs-plus text-fg-3">
                  {t('departments.mostRecent', {
                    shown: items.length,
                    total: department.open + department.breached,
                  })}
                </span>
                <div className="ms-auto flex flex-wrap gap-1">
                  {states.map((state) => {
                    const count =
                      state === 'all'
                        ? items.filter(
                            (entry) =>
                              typeFilter === 'all' || entry.type === typeFilter,
                          ).length
                        : items.filter(
                            (entry) =>
                              entry.state === state &&
                              (typeFilter === 'all' ||
                                entry.type === typeFilter),
                          ).length;
                    return (
                      <button
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-xs font-semibold',
                          stateFilter === state
                            ? 'text-white border-accent bg-accent'
                            : 'border-line-strong bg-surface text-fg-2',
                        )}
                        key={state}
                        onClick={() => {
                          setStateFilter(state);
                        }}
                        type="button"
                      >
                        {t(`filters.states.${state}`)} {count}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {types.map((type) => {
                  const count =
                    type === 'all'
                      ? items.length
                      : items.filter((entry) => entry.type === type).length;
                  const key = type.replaceAll(' ', '') as
                    'all' | 'Task' | 'Actionsheet' | 'Purchaserequest';
                  return (
                    <button
                      className={cn(
                        'rounded-menu border px-3 py-1.5 text-sm-plus font-semibold',
                        typeFilter === type
                          ? 'border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent'
                          : 'border-line-strong bg-inset text-fg-2',
                        count === 0 &&
                          type !== 'all' &&
                          'cursor-not-allowed opacity-[.45]',
                      )}
                      disabled={count === 0 && type !== 'all'}
                      key={type}
                      onClick={() => {
                        setTypeFilter(type);
                      }}
                      type="button"
                    >
                      {t('filters.typeCount', {
                        count,
                        type: t(`filters.types.${key}`),
                      })}
                    </button>
                  );
                })}
              </div>
              {shown.length ? (
                shown.map((entry) => {
                  const progress = timeUsedProgress(entry.agreed, entry.used);
                  const tone =
                    entry.state === 'closed'
                      ? 'bg-ok'
                      : progress.over
                        ? 'bg-bad'
                        : progress.ratio > 75
                          ? 'bg-[var(--brand-yellow)]'
                          : 'bg-[var(--blue-med)]';
                  return (
                    <button
                      className="flex flex-col gap-2 rounded-menu border border-line bg-surface px-3 py-2.5 text-start hover:border-line-strong hover:bg-inset"
                      key={entry.id}
                      onClick={() => {
                        setSelectedItem(entry);
                      }}
                      type="button"
                    >
                      <span className="flex w-full flex-wrap items-center gap-2">
                        <span className="num text-xs font-semibold text-accent">
                          {entry.id}
                        </span>
                        <span className="rounded-full border border-line px-2 py-0.5 text-xs">
                          {entry.type}
                        </span>
                        <strong className="min-w-[150px] flex-1 text-base">
                          {entry.title}
                        </strong>
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            stateTone(entry.state),
                          )}
                        >
                          {t(`states.${entry.state}`)}
                        </span>
                      </span>
                      <span className="flex w-full flex-wrap items-center gap-2 text-xs-plus text-fg-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={cn(
                              'size-2 rounded-full',
                              priorityDotClass[priorityId(entry.priority)],
                            )}
                          />
                          {entry.priority}
                        </span>
                        <span>{entry.assignee}</span>
                        <span
                          className={cn('ms-auto', progress.over && 'text-bad')}
                        >
                          {entry.state === 'closed'
                            ? t('item.closedOf', {
                                used: entry.used,
                                agreed: entry.agreed,
                              })
                            : progress.over
                              ? t('item.overAgreed', { agreed: entry.agreed })
                              : t('item.usedOf', {
                                  used: entry.used,
                                  agreed: entry.agreed,
                                })}
                        </span>
                      </span>
                      <ProgressBar
                        className="h-[5px] w-full"
                        indicatorClassName={tone}
                        label={t('item.progressLabel')}
                        value={progress.fillPercentage}
                      />
                    </button>
                  );
                })
              ) : (
                <div className="rounded-menu border border-dashed border-line-strong p-4 text-center text-base text-fg-3">
                  {t('filters.noItems')}
                </div>
              )}
            </div>
            <p className="m-0 border-t border-line pt-3 text-base leading-relaxed text-fg-2">
              {detail.note}
            </p>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
      <SlaItemDialog
        department={department.department}
        item={selectedItem}
        levels={levels}
        onClose={() => {
          setSelectedItem(null);
        }}
      />
    </>
  );
}

function stateTone(state: SlaItemState) {
  if (state === 'late') return 'text-bad';
  if (state === 'closed') return 'text-ok';
  if (state === 'due') return 'text-[var(--brand-yellow)]';
  return 'text-[var(--blue-med)]';
}
