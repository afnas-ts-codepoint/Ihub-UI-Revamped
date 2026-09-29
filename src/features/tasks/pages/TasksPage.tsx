import { Columns3, Download, LayoutDashboard, List, Plus, RefreshCw, Settings } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TaskBoard } from '../components/TaskBoard';
import { TaskDetailDialog } from '../components/TaskDetailDialog';
import { TaskTable } from '../components/TaskTable';
import {
  filterBoardTasks,
  filterByKind,
  filterListTasks,
  taskBoardColumn,
} from '../domain/tasks';
import { useTask, useTasks, useTasksStore } from '../store/tasks.store';
import type { TaskKindFilter } from '../types/task.types';
import {
  createEmptyRecordFilter,
  RecordFilter,
  type RecordFilterValue,
} from '@/features/organization';
import { MigrationPending } from '@/shared/ui/feedback/MigrationPending';

type TaskView = 'board' | 'dashboard' | 'list';
type ListStatus = 'all' | 'completed' | 'critical' | 'new' | 'progress';

type SegmentOption<T extends string> = Readonly<{
  id: T;
  label: string;
}>;

function Segments<T extends string>({
  active,
  ariaLabel,
  onChange,
  options,
}: Readonly<{
  active: T;
  ariaLabel: string;
  onChange: (id: T) => void;
  options: readonly SegmentOption<T>[];
}>) {
  return (
    <div
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-0.5 rounded-[10px] border border-line bg-inset p-0.5"
      role="group"
    >
      {options.map((option) => (
        <button
          aria-pressed={active === option.id}
          className="rounded-md px-3 py-1.5 text-base font-medium whitespace-nowrap text-fg-2 aria-pressed:bg-surface aria-pressed:font-semibold aria-pressed:text-accent aria-pressed:shadow-segment"
          key={option.id}
          onClick={() => {
            onChange(option.id);
          }}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function TaskListView({
  kind,
  onOpen,
}: Readonly<{ kind: TaskKindFilter; onOpen: (id: string) => void }>) {
  const { t } = useTranslation('tasks');
  const tasks = filterByKind(useTasks(), kind);
  const [filter, setFilter] = useState<RecordFilterValue>(
    createEmptyRecordFilter,
  );
  const [status, setStatus] = useState<ListStatus>('all');
  const setChecklistCount = useTasksStore((state) => state.setChecklistCount);
  const toggleClosed = useTasksStore((state) => state.toggleClosed);
  const filtered = filterListTasks(tasks, filter);
  const rows =
    status === 'all'
      ? filtered
      : filtered.filter((task) => taskBoardColumn(task) === status);
  const statuses: readonly ListStatus[] = [
    'all',
    'new',
    'progress',
    'critical',
    'completed',
  ];

  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h2 className="m-0 text-lg font-semibold">{t('list.title')}</h2>
      <div className="mt-4">
        <RecordFilter
          kind="task"
          midActions={
            <>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-sm font-semibold text-fg-2" type="button">
                <Settings aria-hidden size={14} /> {t('list.settings')}
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-sm font-semibold text-fg-2" type="button">
                <Download aria-hidden size={14} /> {t('list.export')}
              </button>
            </>
          }
          onChange={setFilter}
          value={filter}
        />
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {statuses.map((item) => {
          const count =
            item === 'all'
              ? filtered.length
              : filtered.filter((task) => taskBoardColumn(task) === item)
                  .length;
          return (
            <button
              aria-pressed={status === item}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-1.5 text-base font-medium text-fg-2 aria-pressed:border-transparent aria-pressed:bg-raised aria-pressed:font-semibold aria-pressed:text-fg"
              key={item}
              onClick={() => {
                setStatus(item);
              }}
              type="button"
            >
              {t(`status.${item}`)}
              <span className="num text-sm font-semibold text-fg-3">
                {count}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mb-4 flex items-center gap-2 text-sm text-fg-3">
        <span>{t('list.group')}</span>
        {['Status', 'Priority', 'Assignee', 'Dept'].map((label) => (
          <button className="font-semibold text-fg-2 hover:text-accent" key={label} type="button">
            {label}
          </button>
        ))}
      </div>
      {rows.length > 0 ? (
        <TaskTable
          onOpen={onOpen}
          rows={rows}
          setChecklistCount={setChecklistCount}
          toggleClosed={toggleClosed}
        />
      ) : (
        <p className="py-6 text-center text-base text-fg-4">{t('empty')}</p>
      )}
    </section>
  );
}

function TaskBoardView({
  kind,
  onOpen,
}: Readonly<{ kind: TaskKindFilter; onOpen: (id: string) => void }>) {
  const tasks = filterByKind(useTasks(), kind);
  const [filter, setFilter] = useState<RecordFilterValue>(
    createEmptyRecordFilter,
  );
  return (
    <>
      <RecordFilter kind="task" onChange={setFilter} value={filter} />
      <TaskBoard onOpen={onOpen} rows={filterBoardTasks(tasks, filter)} />
    </>
  );
}

export function TasksPage() {
  const { t } = useTranslation('tasks');
  const [view, setView] = useState<TaskView>('list');
  const [kind, setKind] = useState<TaskKindFilter>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = useTask(activeId);
  const setChecklistCount = useTasksStore((state) => state.setChecklistCount);
  const viewOptions: readonly SegmentOption<TaskView>[] = [
    { id: 'dashboard', label: t('views.dashboard') },
    { id: 'list', label: t('views.list') },
    { id: 'board', label: t('views.board') },
  ];
  const kindOptions: readonly SegmentOption<TaskKindFilter>[] = [
    { id: 'all', label: t('kind.all') },
    { id: 'internal', label: t('kind.internal') },
    { id: 'external', label: t('kind.external') },
  ];

  return (
    <div className="flex flex-col gap-7" data-testid="tasks-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-raised p-1">
            {viewOptions.map((option) => {
              const Icon =
                option.id === 'dashboard'
                  ? LayoutDashboard
                  : option.id === 'list'
                    ? List
                    : Columns3;
              return (
                <button
                  aria-pressed={view === option.id}
                  className="aria-pressed:shadow-sm inline-flex items-center gap-2 rounded-lg px-4 py-2 text-base-plus font-medium text-fg-3 aria-pressed:bg-surface aria-pressed:font-semibold aria-pressed:text-fg"
                  key={option.id}
                  onClick={() => {
                    setView(option.id);
                  }}
                  type="button"
                >
                  <Icon aria-hidden size={15} />
                  {option.label}
                </button>
              );
            })}
          </div>
          <Segments
            active={kind}
            ariaLabel={t('kind.ariaLabel')}
            onChange={setKind}
            options={kindOptions}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm-plus text-fg-3">
            <RefreshCw aria-hidden size={14} />
            {t('lastUpdated')}
            <strong className="num text-fg-2">{t('updatedAt')}</strong>
          </span>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink"
            type="button"
          >
            <Plus aria-hidden size={15} />
            {t('actions.create')}
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <TaskListView kind={kind} onOpen={setActiveId} />
      ) : view === 'board' ? (
        <TaskBoardView kind={kind} onOpen={setActiveId} />
      ) : (
        <div data-testid="task-dashboard-pending">
          <MigrationPending area={t('dashboard.pending')} />
          <button
            className="mt-3 rounded-lg px-3 py-2 text-sm font-semibold text-accent"
            type="button"
          >
            {t('actions.goToTasks')}
          </button>
        </div>
      )}

      <TaskDetailDialog
        onClose={() => {
          setActiveId(null);
        }}
        setChecklistCount={setChecklistCount}
        task={activeTask}
      />
    </div>
  );
}
