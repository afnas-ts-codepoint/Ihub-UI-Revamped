import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TaskProgressSegments } from './TaskProgressSegments';
import { taskBoardColumn } from '../domain/tasks';
import type { TaskViewModel } from '../types/task.types';
import { TablePaginationBar } from '@/shared/table/TablePaginationBar';

type TaskTableProps = Readonly<{
  onOpen: (id: string) => void;
  rows: readonly TaskViewModel[];
  setChecklistCount: (id: string, count: number) => void;
  toggleClosed: (id: string) => void;
}>;

const columns = [
  'Task',
  'Subject',
  'Location/Zone',
  'Department',
  'Due',
  'SLA Status',
  'Progress',
  'Action',
] as const;

const statusColor = {
  completed: 'bg-ok',
  critical: 'bg-bad',
  new: 'bg-info',
  progress: 'bg-warn',
} as const;

export function TaskTable({
  onOpen,
  rows,
  setChecklistCount,
  toggleClosed,
}: TaskTableProps) {
  const { t } = useTranslation('tasks');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="overflow-x-auto" data-testid="task-table-scroll">
      <table className="w-full border-collapse text-base">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className="px-3.5 pb-2.5 text-start text-xs font-semibold tracking-[0.07em] whitespace-nowrap text-fg-3 uppercase"
                key={column}
                scope="col"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((task) => {
            const boardColumn = taskBoardColumn(task);
            const done = task.stage === 'Done';
            return (
              <tr
                aria-label={t('table.openTask', { id: task.id })}
                className="cursor-pointer border-t border-line"
                key={task.id}
                onClick={() => {
                  onOpen(task.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpen(task.id);
                  }
                }}
                tabIndex={0}
              >
                <td className="px-3.5 py-3.5">
                  <span
                    className={`block size-[9px] rounded-full ${statusColor[boardColumn]}`}
                    title={t(`status.${boardColumn}`)}
                  />
                </td>
                <td className="px-3.5 py-3.5">
                  <p className="num m-0 font-semibold whitespace-nowrap text-accent">{task.id}</p>
                  {task.dependencies > 0 ? <p className="m-0 text-xs text-fg-4">{`${String(task.dependencies)} dependencies`}</p> : null}
                </td>
                <td className="min-w-56 px-3.5 py-3.5 text-fg">
                  {task.subject}
                </td>
                <td className="px-3.5 py-3.5 text-fg-2">
                  <p className="m-0">{task.location}</p>
                  <p className="m-0 text-xs text-fg-4">{task.zone}</p>
                </td>
                <td className="px-3.5 py-3.5 whitespace-nowrap text-fg-2">{task.department}</td>
                <td className="num px-3.5 py-3.5 whitespace-nowrap text-fg-2">
                  {task.due}
                </td>
                <td
                  className={`px-3.5 py-3.5 text-base font-semibold whitespace-nowrap ${task.sla === 'exceeded' ? 'text-bad' : 'text-ok'}`}
                >
                  {task.sla === 'exceeded' ? 'SLA exceeded' : 'On track'}
                </td>
                <td className="px-3.5 py-3.5 whitespace-nowrap text-fg-3">
                  {task.department}
                </td>
                <td
                  className="min-w-40 px-3.5 py-3"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <TaskProgressSegments
                    onChange={(count) => {
                      setChecklistCount(task.id, count);
                    }}
                    task={task}
                  />
                </td>
                <td
                  className="px-3.5 py-3 text-end whitespace-nowrap"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <div className="flex items-center justify-end gap-1">
                    <button aria-label="View" className="rounded-lg p-1.5 text-fg-3 hover:bg-inset" onClick={(event) => { event.stopPropagation(); }} type="button"><Eye size={14} /></button>
                    <button aria-label="Edit" className="rounded-lg p-1.5 text-fg-3 hover:bg-inset" onClick={(event) => { event.stopPropagation(); }} type="button"><Pencil size={14} /></button>
                    <button aria-label="Remove" className="rounded-lg p-1.5 text-fg-3 hover:bg-inset" onClick={(event) => { event.stopPropagation(); }} type="button"><Trash2 size={14} /></button>
                    <button
                      className={`rounded-lg px-2 py-1.5 text-sm font-semibold ${done ? 'text-fg-2 hover:bg-inset' : 'border border-accent/30 bg-accent-dim text-accent'}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleClosed(task.id);
                      }}
                      type="button"
                    >
                      {done ? t('actions.reopen') : t('actions.close')}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <TablePaginationBar
        entriesAriaLabel="Entries per page"
        entriesOptions={['6']}
        entriesUnitLabel="entries"
        entriesValue="6"
        entriesValueLabel={(value) => value}
        nextLabel="Next page"
        onEntriesChange={() => undefined}
        onPageChange={setPage}
        page={currentPage}
        pageLabel="Page"
        previousLabel="Previous page"
        showLabel="Show"
        summary={`Showing ${String(Math.min(pageSize, Math.max(rows.length - (currentPage - 1) * pageSize, 0)))} of ${String(rows.length)} records`}
        totalPages={totalPages}
      />
    </div>
  );
}
