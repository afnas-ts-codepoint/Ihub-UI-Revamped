import type { RecordFilterValue } from '@/features/organization';

import { TASK_CHECKLIST } from '../data/tasks.mock';
import type {
  Task,
  TaskBoardColumn,
  TaskKindFilter,
  TaskViewModel,
} from '../types/task.types';

export function taskBoardColumn(task: Task): TaskBoardColumn {
  if (task.stage === 'Done') return 'completed';
  if (task.severity === 'Critical') return 'critical';
  if (task.stage === 'In progress' || task.stage === 'Review')
    return 'progress';
  return 'new';
}

export function initialChecklistCount(task: Task): number {
  const column = taskBoardColumn(task);
  if (column === 'completed') return TASK_CHECKLIST.length;
  if (column === 'progress') return 2;
  if (column === 'critical') return 1;
  return 0;
}

export function progressFromChecklist(count: number): number {
  return Math.round((count / TASK_CHECKLIST.length) * 100);
}

export function filterByKind(
  tasks: readonly TaskViewModel[],
  kind: TaskKindFilter,
): readonly TaskViewModel[] {
  return kind === 'all' ? tasks : tasks.filter((task) => task.kind === kind);
}

function matchesCommon(task: Task, filter: RecordFilterValue): boolean {
  if (filter.dept && task.department !== filter.dept) return false;
  if (
    filter.priority &&
    task.severity.toLowerCase() !== filter.priority.toLowerCase()
  )
    return false;
  if (filter.risk && task.risk.toLowerCase() !== filter.risk.toLowerCase())
    return false;
  if (filter.status && task.stage !== filter.status) return false;
  return true;
}

function taskLocation(task: Task): string {
  return /—\s*(.+)$/.exec(task.subject)?.[1]?.trim() ?? '';
}

/** The deliberately partial List predicate from the adopted prototype. */
export function filterListTasks(
  tasks: readonly TaskViewModel[],
  filter: RecordFilterValue,
): readonly TaskViewModel[] {
  const query = filter.num.trim().toLowerCase();
  return tasks.filter((task) => {
    if (query && !task.id.toLowerCase().includes(query)) return false;
    if (
      filter.locations.length > 0 &&
      !filter.locations.some((location) =>
        taskLocation(task).toLowerCase().includes(location.toLowerCase()),
      )
    )
      return false;
    if (
      filter.zones.length > 0 &&
      !filter.zones.some((zone) =>
        task.subject.toLowerCase().includes(zone.toLowerCase()),
      )
    )
      return false;
    return matchesCommon(task, filter);
  });
}

/** The deliberately different, partial Board predicate from the prototype. */
export function filterBoardTasks(
  tasks: readonly TaskViewModel[],
  filter: RecordFilterValue,
): readonly TaskViewModel[] {
  const query = filter.num.trim().toLowerCase();
  return tasks.filter((task) => {
    if (query && !`${task.id} ${task.subject}`.toLowerCase().includes(query))
      return false;
    if (
      filter.locations.length > 0 &&
      !filter.locations.some((location) =>
        task.subject.toLowerCase().includes(location.toLowerCase()),
      )
    )
      return false;
    return matchesCommon(task, filter);
  });
}
