import {
  Archive,
  Check,
  Copy,
  FileUp,
  Folder,
  MessageSquare,
  Trash2,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TaskProgressSegments } from './TaskProgressSegments';
import { TASK_CHECKLIST } from '../data/tasks.mock';
import { taskBoardColumn } from '../domain/tasks';
import type { TaskViewModel } from '../types/task.types';
import { Chip } from '@/shared/ui/chip/Chip';
import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

type TaskDetailDialogProps = Readonly<{
  onClose: () => void;
  setChecklistCount: (id: string, count: number) => void;
  task: TaskViewModel | undefined;
}>;

const severityTone = {
  Critical: 'bad',
  High: 'warn',
  Low: 'ok',
  Medium: 'info',
} as const;

const modalActions: readonly Readonly<{
  icon: LucideIcon;
  key: 'archive' | 'duplicate' | 'saveDraft';
}>[] = [
  { icon: Check, key: 'saveDraft' },
  { icon: Copy, key: 'duplicate' },
  { icon: Archive, key: 'archive' },
];

export function TaskDetailDialog({
  onClose,
  setChecklistCount,
  task,
}: TaskDetailDialogProps) {
  const { t } = useTranslation('tasks');
  const status = task ? taskBoardColumn(task) : 'new';

  return (
    <DialogRoot
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open={task !== undefined}
    >
      <DialogContent className="top-[3vh] max-h-[94vh] w-[min(1080px,calc(100%-32px))] translate-y-0">
        {task ? (
          <>
            <DialogHeader className="sticky top-0 z-10 bg-surface px-5 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Chip
                  tone={
                    status === 'completed'
                      ? 'ok'
                      : status === 'critical'
                        ? 'bad'
                        : status === 'progress'
                          ? 'warn'
                          : 'info'
                  }
                >
                  {t(`status.${status}`)}
                </Chip>
                <span className="num text-base font-semibold text-accent">
                  {task.id}
                </span>
                <DialogTitle className="truncate text-base-plus font-medium text-fg-2">
                  {task.subject}
                </DialogTitle>
              </div>
              <DialogClose
                aria-label={t('actions.closeDialog')}
                className="ms-auto flex size-8 shrink-0 items-center justify-center rounded-lg text-fg-3 hover:bg-inset"
              >
                <X aria-hidden size={16} />
              </DialogClose>
            </DialogHeader>
            <DialogBody className="gap-4 p-5">
              <section className="rounded-xl border border-line bg-surface p-5">
                <div className="flex items-start gap-3.5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-dim text-accent">
                    <Folder aria-hidden size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-xl font-semibold text-fg">
                      {task.subject}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
                        {t('modal.inList')}
                      </span>
                      <Chip tone={severityTone[task.severity]}>
                        {task.severity}
                      </Chip>
                      <Chip>
                        {task.flow === 'multi' ? 'Multi-step' : 'Direct'}
                      </Chip>
                    </div>
                  </div>
                </div>
                <div className="mt-5 border-t border-line pt-4">
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="text-base font-semibold text-fg-2">
                      {t('modal.overallProgress')}
                    </span>
                    <span className="num text-xl font-semibold text-accent">
                      {`${String(task.progress)}%`}
                    </span>
                  </div>
                  <TaskProgressSegments
                    onChange={(count) => {
                      setChecklistCount(task.id, count);
                    }}
                    task={task}
                  />
                </div>
                <dl className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 border-t border-line pt-4">
                  {[
                    [t('modal.taskType'), 'Emergency Maintenance'],
                    [t('modal.department'), task.department],
                    [t('modal.severity'), task.severity],
                    [t('modal.risk'), task.risk],
                    [t('modal.due'), task.due],
                    [
                      t('modal.kind'),
                      task.kind === 'internal'
                        ? t('kind.internal')
                        : t('kind.external'),
                    ],
                  ].map(([label, value]) => (
                    <div className="min-w-0" key={label}>
                      <dt className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
                        {label}
                      </dt>
                      <dd className="mt-1.5 truncate text-base font-semibold text-fg">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(240px,1fr)] items-start gap-4">
                <div className="flex min-w-0 flex-col gap-3">
                  <section className="rounded-xl border border-line bg-surface p-5">
                    <h3 className="m-0 text-lg font-semibold">
                      {t('modal.checklist', {
                        count: task.checklistCount,
                        total: TASK_CHECKLIST.length,
                      })}
                    </h3>
                    <div className="mt-4 overflow-hidden rounded-xl border border-line">
                      <div className="flex items-center justify-between bg-raised px-3.5 py-2.5 text-base font-semibold text-fg-2">
                        <span>{t('modal.unassigned')}</span>
                        <span className="num text-sm text-fg-3">
                          {`${String(task.progress)}%`}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 p-3">
                        {TASK_CHECKLIST.map((item, index) => {
                          const checked = task.checklistCount >= index + 1;
                          return (
                            <button
                              aria-pressed={checked}
                              className={`flex items-center gap-3 rounded-lg border border-line p-2.5 text-start ${checked ? 'bg-raised text-fg-3 line-through' : 'bg-surface text-fg'}`}
                              key={item}
                              onClick={() => {
                                setChecklistCount(
                                  task.id,
                                  task.checklistCount === index + 1
                                    ? index
                                    : index + 1,
                                );
                              }}
                              type="button"
                            >
                              <span
                                className={`flex size-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong'}`}
                              >
                                {checked ? (
                                  <Check aria-hidden size={11} />
                                ) : null}
                              </span>
                              {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-line bg-surface p-5">
                    <h3 className="m-0 flex items-center gap-2 text-lg font-semibold">
                      <FileUp aria-hidden className="text-accent" size={17} />
                      {t('modal.attachments')}
                    </h3>
                    <button
                      className="mt-4 w-full rounded-xl border border-dashed border-line-strong bg-raised px-4 py-6 text-center"
                      type="button"
                    >
                      <FileUp
                        aria-hidden
                        className="mx-auto text-accent"
                        size={22}
                      />
                      <span className="mt-2 block text-base font-semibold">
                        {t('modal.upload')}
                      </span>
                      <span className="mt-1 block text-xs-plus text-fg-3">
                        {t('modal.uploadTypes')}
                      </span>
                    </button>
                  </section>

                  <section className="rounded-xl border border-line bg-surface p-5">
                    <h3 className="m-0 flex items-center gap-2 text-lg font-semibold">
                      <MessageSquare
                        aria-hidden
                        className="text-accent"
                        size={17}
                      />
                      {t('modal.comments')}
                    </h3>
                    <textarea
                      aria-label={t('modal.commentPlaceholder')}
                      className="mt-4 min-h-20 w-full resize-y rounded-lg border border-line-strong bg-surface p-3 text-base outline-none"
                      placeholder={t('modal.commentPlaceholder')}
                    />
                    <button
                      className="mt-2 w-full rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink"
                      type="button"
                    >
                      {t('actions.addComment')}
                    </button>
                    <p className="mb-0 text-center text-base text-fg-4">
                      {t('modal.noComments')}
                    </p>
                  </section>
                </div>

                <aside className="sticky top-16 rounded-xl border border-line bg-surface p-5">
                  <h3 className="m-0 text-lg font-semibold">
                    {t('modal.actions')}
                  </h3>
                  <div className="mt-4 flex flex-col gap-2">
                    {modalActions.map(({ icon: Icon, key }) => (
                      <button
                        className="flex w-full items-center gap-2.5 rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-start text-base font-semibold"
                        key={key}
                        type="button"
                      >
                        <Icon aria-hidden className="text-accent" size={16} />
                        {t(`actions.${key}`)}
                      </button>
                    ))}
                    <button
                      className="flex w-full items-center gap-2.5 rounded-lg border border-bad/30 bg-surface px-3.5 py-2.5 text-start text-base font-semibold text-bad"
                      onClick={onClose}
                      type="button"
                    >
                      <Trash2 aria-hidden size={16} />
                      {t('actions.delete')}
                    </button>
                  </div>
                </aside>
              </div>
            </DialogBody>
          </>
        ) : null}
      </DialogContent>
    </DialogRoot>
  );
}
