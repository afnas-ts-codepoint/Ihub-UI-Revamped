import { Check, ChevronDown, Clock, Edit as EditIcon, Filter, Folder, Plus, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  buildSubtaskTimeline,
  GANTT_COLUMNS_BY_VIEW,
  GANTT_ROW_META,
  SUBTASK_HISTORY_ROWS,
  type GanttViewOption,
  type SubtaskTimelineEntryType,
} from '../../data/taskView.mock';
import { Chip } from '@/shared/ui/chip/Chip';
import { GanttChart } from '@/shared/ui/charts/GanttChart';
import { DialogBody, DialogContent, DialogHeader, DialogRoot, DialogTitle } from '@/shared/ui/overlay/Dialog';

const TIMELINE_META: Readonly<Record<SubtaskTimelineEntryType, Readonly<{ icon: LucideIcon; tone: string }>>> = {
  assigned: { icon: Clock, tone: 'var(--warn)' },
  completed: { icon: Check, tone: 'var(--ok)' },
  created: { icon: Plus, tone: 'var(--accent)' },
  updated: { icon: EditIcon, tone: 'var(--blue-med)' },
};

const GANTT_VIEWS: readonly GanttViewOption[] = ['Day', 'Week', 'Month'];

/**
 * Sub Task History dialog — Timeline Log and Gantt Chart tabs over the
 * 4-row `SUBTASK_HISTORY` fixture, opened from the header's expand button and
 * from any Sub Tasks Progress row.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L19075-L19173 `subTaskHistoryModal`.
 */
export function SubTaskHistoryDialog({
  onClose,
  open,
}: Readonly<{ onClose: () => void; open: boolean }>) {
  const { t } = useTranslation('taskView');
  const [tab, setTab] = useState<'gantt' | 'timeline'>('timeline');
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [assignee, setAssignee] = useState('all');
  const [department, setDepartment] = useState('all');
  const [subDepartment, setSubDepartment] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [ganttView, setGanttView] = useState<GanttViewOption>('Day');

  const options = useMemo(
    () => ({
      assignees: [...new Set(SUBTASK_HISTORY_ROWS.map((row) => row.assignee))],
      categories: [...new Set(SUBTASK_HISTORY_ROWS.map((row) => row.project))],
      departments: [...new Set(SUBTASK_HISTORY_ROWS.map((row) => row.department))],
      statuses: [...new Set(SUBTASK_HISTORY_ROWS.map((row) => row.status))],
      subDepartments: [...new Set(SUBTASK_HISTORY_ROWS.map((row) => row.subDepartment))],
    }),
    [],
  );

  const filtered = SUBTASK_HISTORY_ROWS.filter(
    (row) =>
      row.title.toLowerCase().includes(query.toLowerCase()) &&
      (assignee === 'all' || row.assignee === assignee) &&
      (department === 'all' || row.department === department) &&
      (subDepartment === 'all' || row.subDepartment === subDepartment) &&
      (category === 'all' || row.project === category) &&
      (status === 'all' || row.status === status),
  );

  const total = SUBTASK_HISTORY_ROWS.length;
  const completed = SUBTASK_HISTORY_ROWS.filter((row) => row.statusKey === 'completed').length;
  const inProgress = SUBTASK_HISTORY_ROWS.filter((row) => row.statusKey === 'inProgress').length;

  const ganttColumns = GANTT_COLUMNS_BY_VIEW[ganttView];
  const ganttRows = filtered.map((row, index) => {
    const meta = GANTT_ROW_META[index % GANTT_ROW_META.length];
    const columns = ganttColumns.length;
    return {
      badge: `${String(row.percent)}%`,
      bar: {
        end: ((meta?.start ?? 0) + (meta?.span ?? 1)) / columns,
        label: row.title,
        start: (meta?.start ?? 0) / columns,
        tone: meta?.tone ?? 'var(--accent)',
      },
      id: row.title,
      meta: row.assignee,
      title: row.title,
    };
  });

  return (
    <DialogRoot
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      open={open}
    >
      <DialogContent className="max-h-[94vh] w-[min(960px,calc(100%-32px))]">
        <DialogHeader>
          <DialogTitle className="text-md font-semibold">{t('subtaskHistory.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
            <span className="flex size-9.5 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-accent">
              <Folder aria-hidden size={18} />
            </span>
            <div>
              <div className="text-sm-plus font-semibold">{t('subtaskHistory.title')}</div>
              <div className="mt-0.5 text-xs-plus text-fg-3">{t('subtaskHistory.subtitle')}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-pressed={tab === 'timeline'}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold aria-pressed:bg-accent aria-pressed:text-accent-ink"
              onClick={() => {
                setTab('timeline');
              }}
              type="button"
            >
              <Clock aria-hidden size={13} />
              {t('subtaskHistory.timelineTab')}
            </button>
            <button
              aria-pressed={tab === 'gantt'}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold aria-pressed:bg-accent aria-pressed:text-accent-ink"
              onClick={() => {
                setTab('gantt');
              }}
              type="button"
            >
              <ChevronDown aria-hidden size={13} />
              {t('subtaskHistory.ganttTab')}
            </button>
          </div>

          <div className="flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-sm-plus font-semibold text-fg-2">{t('subtaskHistory.searchLabel')}</span>
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-sm font-semibold text-fg-2"
                onClick={() => {
                  setShowFilters((value) => !value);
                }}
                type="button"
              >
                <Filter aria-hidden size={13} />
                {t('subtaskHistory.advancedFilters')}
                <ChevronDown
                  aria-hidden
                  size={12}
                  style={{ transform: showFilters ? 'rotate(180deg)' : undefined }}
                />
              </button>
            </div>
            <div className="relative flex items-center">
              <Search aria-hidden className="pointer-events-none absolute inset-s-2.5 text-fg-4" size={14} />
              <input
                aria-label={t('subtaskHistory.searchLabel')}
                className="w-full rounded-lg border border-line-strong bg-canvas py-2 ps-8.5 pe-3 text-sm outline-none"
                onChange={(event) => {
                  setQuery(event.target.value);
                }}
                placeholder={t('subtaskHistory.searchPlaceholder')}
                value={query}
              />
            </div>
            {showFilters ? (
              <div className="grid grid-cols-1 gap-3.5 tablet:grid-cols-2 desktop:grid-cols-5">
                {(
                  [
                    ['assignee', assignee, setAssignee, options.assignees],
                    ['department', department, setDepartment, options.departments],
                    ['subDepartment', subDepartment, setSubDepartment, options.subDepartments],
                    ['category', category, setCategory, options.categories],
                    ['status', status, setStatus, options.statuses],
                  ] as const
                ).map(([key, value, setValue, values]) => (
                  <label className="flex flex-col gap-1.5" key={key}>
                    <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
                      {t(`subtaskHistory.filter.${key}`)}
                    </span>
                    <select
                      className="rounded-lg border border-line-strong bg-canvas px-2.5 py-2 text-sm"
                      onChange={(event) => {
                        setValue(event.target.value);
                      }}
                      value={value}
                    >
                      <option value="all">{t(`subtaskHistory.filter.all.${key}`)}</option>
                      {values.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          {tab === 'timeline' ? (
            filtered.length ? (
              <div className="flex flex-col gap-2.5">
                {filtered.map((row, index) => {
                  const isOpen = expandedIndex === index;
                  const entries = buildSubtaskTimeline(row, index);
                  return (
                    <div key={row.title}>
                      <button
                        aria-expanded={isOpen}
                        className={`flex w-full items-center gap-3.5 border border-line bg-surface p-3.5 text-start ${isOpen ? 'rounded-t-xl' : 'rounded-xl'}`}
                        onClick={() => {
                          setExpandedIndex(isOpen ? null : index);
                        }}
                        type="button"
                      >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-dim text-sm font-bold text-accent">
                          {`${String(row.percent)}%`}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm-plus font-semibold">{row.title}</span>
                            <Chip>{row.status}</Chip>
                          </div>
                          <div className="text-xs-plus text-fg-3">
                            {`${row.assignee} · ${row.department} · ${row.subDepartment}`}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs-plus font-medium text-accent">{row.project}</span>
                        <ChevronDown
                          aria-hidden
                          className="shrink-0 text-fg-4"
                          size={14}
                          style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
                        />
                      </button>
                      {isOpen ? (
                        <div className="rounded-b-xl border border-t-0 border-line bg-surface p-4">
                          <p className="m-0 mb-4 text-sm-plus font-semibold">
                            {t('subtaskHistory.timelineEntries', { count: entries.length })}
                          </p>
                          <div className="flex flex-col">
                            {entries.map((entry, entryIndex) => {
                              const meta = TIMELINE_META[entry.type];
                              const Icon = meta.icon;
                              const isLast = entryIndex === entries.length - 1;
                              return (
                                <div className="flex gap-3.5" key={`${entry.title}-${entry.when}-${String(entryIndex)}`}>
                                  <div className="flex shrink-0 flex-col items-center">
                                    <span
                                      className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-surface"
                                      style={{ borderColor: meta.tone, color: meta.tone }}
                                    >
                                      <Icon aria-hidden size={15} />
                                    </span>
                                    {isLast ? null : <span className="mt-0.5 min-h-10 w-0.5 flex-1 bg-line" />}
                                  </div>
                                  <div className={`min-w-0 flex-1 ${isLast ? 'pb-1' : 'pb-6.5'}`}>
                                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                                      <span className="text-sm-plus font-bold" style={{ color: meta.tone }}>
                                        {entry.title}
                                      </span>
                                      <span className="shrink-0 text-xs-plus text-fg-4">{entry.when}</span>
                                    </div>
                                    <div className="mt-1 text-xs-plus text-fg-2">{entry.desc}</div>
                                    <div className="mt-2 text-xs-plus text-fg-3">{entry.by}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="m-0 rounded-lg border border-dashed border-line-strong py-8 text-center text-sm-plus text-fg-3">
                {t('subtaskHistory.noResults')}
              </p>
            )
          ) : (
            <>
              <div className="flex justify-end">
                <div className="inline-flex gap-0.5 rounded-lg border border-line bg-inset p-0.5">
                  {GANTT_VIEWS.map((view) => (
                    <button
                      aria-pressed={ganttView === view}
                      className="rounded-md px-2.5 py-1.5 text-xs-plus font-medium text-fg-2 aria-pressed:bg-surface aria-pressed:font-semibold aria-pressed:text-accent"
                      key={view}
                      onClick={() => {
                        setGanttView(view);
                      }}
                      type="button"
                    >
                      {/* Day/Week/Month is passed to the prototype's T(o, o, locale) helper
                          (index.html:L18004 `seg`) — never translated to Arabic; kept literal. */}
                      {view}
                    </button>
                  ))}
                </div>
              </div>
              {filtered.length ? (
                <GanttChart columns={ganttColumns} rowHeaderLabel={t('subtaskHistory.subTask')} rows={ganttRows} />
              ) : (
                <p className="m-0 rounded-lg border border-dashed border-line-strong py-8 text-center text-sm-plus text-fg-3">
                  {t('subtaskHistory.noResults')}
                </p>
              )}
              <div className="flex overflow-hidden rounded-xl border border-line">
                {[
                  [t('subtaskHistory.stats.total'), total],
                  [t('subtaskHistory.stats.completed'), completed],
                  [t('subtaskHistory.stats.inProgress'), inProgress],
                ].map(([label, value], index) => (
                  <div className={`flex-1 p-4 ${index ? 'border-s border-line' : ''}`} key={label}>
                    <div className="text-xs font-semibold tracking-wider text-fg-3 uppercase">{label}</div>
                    <div className="num mt-1.5 text-3xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
