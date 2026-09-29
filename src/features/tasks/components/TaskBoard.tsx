import { Clock, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { taskBoardColumn } from '../domain/tasks';
import type { TaskBoardColumn, TaskViewModel } from '../types/task.types';
import { Chip } from '@/shared/ui/chip/Chip';

type TaskBoardProps = Readonly<{
  onOpen: (id: string) => void;
  rows: readonly TaskViewModel[];
}>;

const columns: readonly Readonly<{
  color: string;
  headerColor: string;
  id: TaskBoardColumn;
}>[] = [
  { color: 'bg-info', headerColor: 'border-t-info', id: 'new' },
  { color: 'bg-warn', headerColor: 'border-t-warn', id: 'progress' },
  { color: 'bg-bad', headerColor: 'border-t-bad', id: 'critical' },
  { color: 'bg-ok', headerColor: 'border-t-ok', id: 'completed' },
];

const severityTone = {
  Critical: 'bad',
  High: 'warn',
  Low: 'ok',
  Medium: 'info',
} as const;

export function TaskBoard({ onOpen, rows }: TaskBoardProps) {
  const { t } = useTranslation('tasks');

  return (
    <div
      className="grid grid-cols-4 items-start gap-4 overflow-x-auto"
      data-testid="task-board"
    >
      {columns.map((column) => {
        const tasks = rows.filter(
          (task) => taskBoardColumn(task) === column.id,
        );
        return (
          <section
            className="min-w-52 overflow-hidden rounded-xl border border-line-strong bg-raised"
            data-board-column={column.id}
            key={column.id}
          >
            <header
              className={`flex items-center justify-between gap-2 border-t-[3px] border-b border-line px-3.5 py-2.5 ${column.headerColor}`}
            >
              <span className="flex items-center gap-2 text-base font-semibold text-fg">
                <span className={`size-2 rounded-[3px] ${column.color}`} />
                {t(`status.${column.id}`)}
              </span>
              <span className="num rounded-full border border-line-strong bg-surface px-2 py-0.5 text-xs-plus font-semibold text-fg-3">
                {tasks.length}
              </span>
            </header>
            <div className="flex min-h-30 flex-col gap-2.5 p-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <button
                    aria-label={t('board.openCard', { id: task.id })}
                    className="shadow-sm flex cursor-grab flex-col gap-2.5 rounded-xl border border-line bg-surface p-3 text-start"
                    key={task.id}
                    onClick={() => {
                      onOpen(task.id);
                    }}
                    type="button"
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="num text-xs-plus font-semibold text-accent">
                        {task.id}
                      </span>
                      <Chip tone={severityTone[task.severity]}>
                        {task.severity}
                      </Chip>
                    </span>
                    <span className="text-base leading-[1.45] text-fg">
                      {task.subject}
                    </span>
                    <span className="flex w-full items-center justify-between gap-2 text-xs-plus text-fg-3">
                      <Chip>
                        {task.flow === 'multi' ? 'Multi-step' : 'Direct'}
                      </Chip>
                      <span className="num inline-flex items-center gap-1">
                        <Clock aria-hidden size={12} />
                        {task.due}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="py-5 text-center text-sm text-fg-4">
                  {t('empty')}
                </p>
              )}
              <button
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-3 hover:bg-inset"
                type="button"
              >
                <Plus aria-hidden size={14} />
                {t('actions.addCard')}
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
