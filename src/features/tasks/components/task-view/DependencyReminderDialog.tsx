import { Bell, Calendar, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { DependencyReminderItem } from '../../domain/taskView';
import { Chip } from '@/shared/ui/chip/Chip';
import { DialogBody, DialogContent, DialogHeader, DialogRoot, DialogTitle } from '@/shared/ui/overlay/Dialog';

function formatDue(date: Date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(date.getDate())} ${months[date.getMonth()] ?? ''} ${String(date.getFullYear())}`;
}

/**
 * The reminder popup that opens automatically (0ms delay in read-only Task
 * View) when at least one pending dependency is due within the reminder
 * window or already overdue. "View dependencies" closes the reminder and
 * scrolls to/opens/highlights the Dependencies panel.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L17314-L17369 `DependencyReminderModal`.
 */
export function DependencyReminderDialog({
  items,
  onClose,
  onView,
  open,
}: Readonly<{
  items: readonly DependencyReminderItem[];
  onClose: () => void;
  onView: () => void;
  open: boolean;
}>) {
  const { t } = useTranslation('taskView');
  const overdueCount = items.filter((item) => item.workdaysLeft < 0).length;

  const leftLabel = (workdaysLeft: number) => {
    if (workdaysLeft < 0) return t('dependencyReminder.overdueBy', { count: -workdaysLeft });
    if (workdaysLeft === 0) return t('dependencyReminder.dueToday');
    return t('dependencyReminder.workdaysLeft', { count: workdaysLeft });
  };

  return (
    <DialogRoot
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      open={open}
    >
      <DialogContent className="top-[10vh] max-h-[80vh] w-[min(520px,calc(100%-32px))] translate-y-0">
        <DialogHeader>
          <span
            className={`flex size-7.5 shrink-0 items-center justify-center rounded-lg border border-line-strong ${overdueCount ? 'text-bad' : 'text-warn'}`}
          >
            <Bell aria-hidden size={16} />
          </span>
          <DialogTitle className="text-md font-bold">{t('dependencyReminder.title')}</DialogTitle>
          <button
            aria-label={t('common.close')}
            className="ms-auto flex size-7.5 shrink-0 items-center justify-center rounded-lg text-fg-3 hover:bg-inset"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden size={16} />
          </button>
        </DialogHeader>
        <DialogBody>
          <p className="m-0 text-sm-plus text-fg-2">
            {t('dependencyReminder.summary', { count: items.length, days: 5 })}
          </p>
          <div className="flex flex-col gap-2.5">
            {items.map((item) => (
              <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-raised p-3.5" key={item.id}>
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="num text-sm-plus font-bold">{item.id}</span>
                    {item.blocking ? <Chip tone="bad">{t('dependencies.blocking')}</Chip> : null}
                  </div>
                  <Chip tone={item.workdaysLeft < 0 ? 'bad' : item.workdaysLeft <= 2 ? 'warn' : 'info'}>
                    {leftLabel(item.workdaysLeft)}
                  </Chip>
                </div>
                <div className="text-sm-plus font-semibold">
                  {item.category}
                  {item.type ? ` · ${item.type}` : ''}
                </div>
                <div className="flex items-center gap-1.5 text-xs-plus text-fg-3">
                  <Calendar aria-hidden size={12} />
                  {t('dependencyReminder.due')}
                  {': '}
                  <span className="num font-semibold text-fg">{formatDue(item.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </DialogBody>
        <div className="flex justify-end gap-2 border-t border-line bg-inset px-5.5 py-3.5">
          <button
            className="rounded-lg border border-line-strong px-3.5 py-2 text-sm font-semibold text-fg-2"
            onClick={() => {
              onClose();
              onView();
            }}
            type="button"
          >
            {t('dependencyReminder.viewDependencies')}
          </button>
          <button
            className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink"
            onClick={onClose}
            type="button"
          >
            {t('common.close')}
          </button>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
