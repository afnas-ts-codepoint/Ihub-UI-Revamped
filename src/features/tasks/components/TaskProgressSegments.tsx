import { useTranslation } from 'react-i18next';

import { TASK_CHECKLIST } from '../data/tasks.mock';
import type { TaskViewModel } from '../types/task.types';
import { cn } from '@/shared/lib/cn';

type TaskProgressSegmentsProps = Readonly<{
  onChange: (count: number) => void;
  task: TaskViewModel;
}>;

export function TaskProgressSegments({
  onChange,
  task,
}: TaskProgressSegmentsProps) {
  const { t } = useTranslation('tasks');
  const complete = task.progress >= 100;
  const advanced = task.progress >= 60;

  return (
    <div className="flex min-w-40 items-center gap-2">
      <div
        aria-label={t('progress.label', { id: task.id })}
        className="flex min-w-24 flex-1 gap-0.5"
        role="group"
      >
        {TASK_CHECKLIST.map((item, index) => {
          const selected = task.checklistCount >= index + 1;
          return (
            <button
              aria-label={item}
              aria-pressed={selected}
              className={cn(
                'h-2 flex-1 rounded-[3px] border border-line transition-colors',
                selected && complete && 'bg-ok',
                selected && !complete && advanced && 'bg-interactive',
                selected && !complete && !advanced && 'bg-warn',
                !selected && 'bg-inset',
              )}
              key={item}
              onClick={() => {
                onChange(task.checklistCount === index + 1 ? index : index + 1);
              }}
              title={item}
              type="button"
            />
          );
        })}
      </div>
      <span className="num w-9 text-end text-sm font-semibold text-fg-2">
        {`${String(task.progress)}%`}
      </span>
    </div>
  );
}
