import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DepartmentDialog } from './DepartmentDialog';
import { cardClass, priorityDotClass } from './sla.styles';
import type {
  DepartmentDetail,
  DepartmentPerformance,
  SlaItem,
  SlaLevel,
  SlaPerformanceMap,
} from '../types/sla.types';
import { cn } from '@/shared/lib/cn';
import { ProgressBar } from '@/shared/ui/progress/ProgressBar';

type Props = Readonly<{
  departmentDetails: Readonly<Record<string, DepartmentDetail>>;
  departmentItems: Readonly<Record<string, readonly SlaItem[]>>;
  departments: readonly DepartmentPerformance[];
  levels: readonly SlaLevel[];
  onTimePercentage: (performance: {
    onTime: number;
    workOrders: number;
  }) => number;
  overall: { onTime: number; percentage: number; workOrders: number };
  performance: SlaPerformanceMap;
}>;
function SectionHeading({
  description,
  title,
}: Readonly<{ description: string; title: string }>) {
  return (
    <div className="flex flex-col gap-1 pt-1.5">
      <h2 className="m-0 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="m-0 text-base leading-relaxed text-fg-3">{description}</p>
    </div>
  );
}

export function SlaOverview({
  departmentDetails,
  departmentItems,
  departments,
  levels,
  onTimePercentage,
  overall,
  performance,
}: Props) {
  const { t } = useTranslation('sla');
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentPerformance | null>(null);
  const totals = useMemo(
    () =>
      departments.reduce(
        (result, entry) => ({
          open: result.open + entry.open,
          dueSoon: result.dueSoon + entry.dueSoon,
          breached: result.breached + entry.breached,
        }),
        { open: 0, dueSoon: 0, breached: 0 },
      ),
    [departments],
  );
  const departmentAverage =
    Math.round(
      (departments.reduce((total, entry) => total + entry.onTime, 0) /
        departments.length) *
        10,
    ) / 10;
  const sorted = useMemo(
    () => [...departments].sort((a, b) => b.onTime - a.onTime),
    [departments],
  );
  const targetsMet = levels.filter(
    (level) => onTimePercentage(performance[level.id]) >= level.target,
  ).length;
  return (
    <div className="flex flex-col gap-4" data-testid="sla-overview">
      <SectionHeading
        description={t('overview.monthDescription')}
        title={t('overview.monthTitle')}
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(165px,1fr))] gap-3.5">
        {[
          [
            t('overview.scope'),
            String(overall.workOrders),
            t('overview.thisMonth'),
          ],
          [
            t('overview.closed'),
            String(overall.onTime),
            t('overview.overall', { value: overall.percentage }),
          ],
          [
            t('overview.targetsMet'),
            `${String(targetsMet)} / 4`,
            t('overview.byPriority'),
          ],
          [
            t('overview.atRisk'),
            String(levels.length - targetsMet),
            t('overview.belowTarget'),
          ],
        ].map(([label, value, note]) => (
          <div className={cn(cardClass, 'gap-2 p-4.5')} key={label}>
            <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
              {label}
            </span>
            <span className="num text-3xl leading-none font-semibold">
              {value}
            </span>
            <span className="text-sm-plus text-fg-3">{note}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3.5">
        {levels.map((level) => {
          const value = onTimePercentage(performance[level.id]);
          const met = value >= level.target;
          return (
            <div className={cardClass} key={level.id}>
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'size-2.5 shrink-0 rounded-full',
                    priorityDotClass[level.id],
                  )}
                />
                <strong className="text-base">{level.label}</strong>
                <span
                  className={cn(
                    'ms-auto rounded-full border px-2 py-0.5 text-xs font-semibold',
                    met ? 'chip-tone-ok' : 'chip-tone-bad',
                  )}
                >
                  {met ? t('overview.targetMet') : t('overview.belowTarget')}
                </span>
              </div>
              <div className="flex items-end gap-2.5">
                <span
                  className={cn(
                    'num text-4xl leading-none font-semibold',
                    met ? 'text-ok' : 'text-bad',
                  )}
                >
                  {`${String(value)}%`}
                </span>
                <span className="pb-1 text-sm-plus text-fg-3">
                  {t('overview.targetAtLeast', { value: level.target })}
                </span>
              </div>
              <ProgressBar
                indicatorClassName={met ? 'bg-ok' : 'bg-bad'}
                label={t('overview.priorityProgress', {
                  priority: level.label,
                })}
                markerValue={level.target}
                value={value}
              />
              <span className="text-sm-plus text-fg-3">
                {t('overview.closedCount', {
                  onTime: performance[level.id].onTime,
                  total: performance[level.id].workOrders,
                })}
              </span>
            </div>
          );
        })}
      </div>

      <SectionHeading
        description={t('departments.description')}
        title={t('departments.title')}
      />
      <div className={cardClass}>
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="m-0 text-base font-semibold">
            {t('departments.performance')}
          </h3>
          <span className="text-sm-plus text-fg-3">
            {t('departments.summary', totals)}
          </span>
          <span className="ms-auto rounded-full border border-line-strong bg-inset px-2 py-0.5 text-xs-plus">
            {t('departments.average', { value: departmentAverage })}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-base">
            <thead>
              <tr>
                {(
                  [
                    'department',
                    'running',
                    'dueSoon',
                    'late',
                    'onTime',
                    'avgResponse',
                    'avgResolution',
                    'change',
                  ] as const
                ).map((key, index) => (
                  <th
                    className={cn(
                      'px-2 pb-2.5 text-xs font-semibold tracking-wider whitespace-nowrap text-fg-3 uppercase',
                      index === 0 ? 'text-start' : 'text-end',
                    )}
                    key={key}
                  >
                    {t(`departments.columns.${key}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry) => {
                const good = entry.onTime >= 95;
                const warning = !good && entry.onTime >= 90;
                return (
                  <tr
                    className="cursor-pointer border-t border-line hover:bg-inset focus-visible:bg-inset focus-visible:outline-2 focus-visible:outline-accent"
                    key={entry.department}
                    onClick={() => {
                      setSelectedDepartment(entry);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedDepartment(entry);
                      }
                    }}
                    tabIndex={0}
                    title={t('departments.openDetail')}
                  >
                    <td className="px-2 py-3 font-semibold whitespace-nowrap">
                      {entry.department}
                    </td>
                    <td className="num px-2 py-3 text-end">{entry.open}</td>
                    <td
                      className={cn(
                        'num px-2 py-3 text-end',
                        entry.dueSoon
                          ? 'text-[var(--brand-yellow)]'
                          : 'text-fg-3',
                      )}
                    >
                      {entry.dueSoon}
                    </td>
                    <td
                      className={cn(
                        'num px-2 py-3 text-end',
                        entry.breached ? 'font-semibold text-bad' : 'text-fg-3',
                      )}
                    >
                      {entry.breached}
                    </td>
                    <td className="px-2 py-3 text-end">
                      <span className="inline-flex items-center justify-end gap-1.5">
                        <ProgressBar
                          className="h-1.5 w-[38px]"
                          indicatorClassName={
                            good
                              ? 'bg-ok'
                              : warning
                                ? 'bg-[var(--brand-yellow)]'
                                : 'bg-bad'
                          }
                          label={t('overview.priorityProgress', {
                            priority: entry.department,
                          })}
                          value={entry.onTime}
                        />
                        <span
                          className={cn(
                            'num font-semibold',
                            good ? 'text-ok' : warning ? 'text-fg' : 'text-bad',
                          )}
                        >
                          {`${String(entry.onTime)}%`}
                        </span>
                      </span>
                    </td>
                    <td className="num px-2 py-3 text-end whitespace-nowrap text-fg-2">
                      {entry.response}
                    </td>
                    <td className="num px-2 py-3 text-end whitespace-nowrap text-fg-2">
                      {entry.resolution}
                    </td>
                    <td
                      className={cn(
                        'num px-2 py-3 text-end whitespace-nowrap',
                        entry.trend >= 0 ? 'text-ok' : 'text-bad',
                      )}
                    >
                      {entry.trend >= 0 ? '+' : '−'}
                      {Math.abs(entry.trend)} {t('departments.points')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <span className="text-xs-plus leading-relaxed text-fg-3">
          {t('departments.legend')}
        </span>
      </div>

      <SectionHeading
        description={t('framework.description')}
        title={t('framework.title')}
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3.5">
        {levels.map((level) => (
          <div className={cardClass} key={level.id}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'size-2.5 rounded-full',
                  priorityDotClass[level.id],
                )}
              />
              <strong>{level.label}</strong>
            </div>
            <p className="m-0 text-base leading-relaxed text-fg-2">
              {level.definition}
            </p>
            <div>
              {[
                [t('framework.response'), level.response],
                [t('framework.resolution'), level.resolution],
                [
                  t('framework.monthlyTarget'),
                  t('framework.atLeast', { value: level.target }),
                ],
                [t('framework.coverage'), level.coverage],
              ].map(([label, value], index) => (
                <div
                  className={cn(
                    'flex items-center justify-between gap-3 py-2',
                    index > 0 && 'border-t border-line',
                  )}
                  key={label}
                >
                  <span className="text-base text-fg-2">{label}</span>
                  <strong className="text-end text-base">{value}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <DepartmentDialog
        department={selectedDepartment}
        detail={
          selectedDepartment
            ? departmentDetails[selectedDepartment.department]
            : undefined
        }
        items={
          selectedDepartment
            ? (departmentItems[selectedDepartment.department] ?? [])
            : []
        }
        levels={levels}
        onClose={() => {
          setSelectedDepartment(null);
        }}
      />
    </div>
  );
}
