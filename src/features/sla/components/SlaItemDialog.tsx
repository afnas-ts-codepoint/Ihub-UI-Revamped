import { Eye } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { priorityDotClass, priorityId, secondaryButton } from './sla.styles';
import { timeUsedProgress } from '../domain/sla';
import type { SlaItem, SlaLevel } from '../types/sla.types';
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
  department: string;
  item: SlaItem | null;
  levels: readonly SlaLevel[];
  onClose: () => void;
}>;
const stateTone = {
  closed: 'text-ok',
  due: 'text-[var(--brand-yellow)]',
  late: 'text-bad',
  running: 'text-[var(--blue-med)]',
} as const;
function DetailRow({
  label,
  value,
}: Readonly<{ label: string; value: ReactNode }>) {
  return (
    <div className="flex items-start justify-between gap-3.5 border-t border-line py-2.5 first:border-t-0">
      <span className="shrink-0 text-base text-fg-2">{label}</span>
      <span className="text-end text-base font-semibold">{value}</span>
    </div>
  );
}

export function SlaItemDialog({ department, item, levels, onClose }: Props) {
  const { t } = useTranslation('sla');
  if (!item) return null;
  const level = levels.find((candidate) => candidate.label === item.priority);
  const progress = timeUsedProgress(item.agreed, item.used);
  const priority = priorityId(item.priority);
  const closed = item.state === 'closed';
  const progressTone = closed
    ? 'bg-ok'
    : progress.over
      ? 'bg-bad'
      : progress.ratio > 75
        ? 'bg-[var(--brand-yellow)]'
        : 'bg-[var(--blue-med)]';
  const stateLabel = t(`states.${item.state}`);
  const summary = closed
    ? t('item.closedAfter', { value: item.used })
    : progress.over
      ? t('item.overBy', { value: Math.round(progress.used - progress.agreed) })
      : t('item.usedOf', { used: item.used, agreed: item.agreed });
  const updates = [
    progress.over && !closed
      ? t('item.updates.overdue', {
          value: Math.round(progress.used - progress.agreed),
        })
      : closed
        ? t('item.updates.closed', { used: item.used, agreed: item.agreed })
        : t('item.updates.current', { used: item.used, agreed: item.agreed }),
    item.state === 'late'
      ? t('item.updates.waiting')
      : t('item.updates.progressing'),
    t('item.updates.created', {
      assignee: item.assignee,
      priority: item.priority,
      agreed: item.agreed,
    }),
  ];
  return (
    <DialogRoot
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open
    >
      <DialogContent
        className="top-[3vh] max-h-[94vh] w-[min(1100px,calc(100%-32px))] translate-y-0"
        data-testid="sla-item-dialog"
      >
        <DialogHeader className="flex-wrap px-5 py-4">
          <span className="num text-sm-plus font-semibold text-accent">
            {item.id}
          </span>
          <span className="rounded-full border border-line-strong bg-inset px-2 py-0.5 text-xs font-semibold">
            {item.type}
          </span>
          <span className="text-sm-plus text-fg-3">
            {t('item.departmentAssignee', {
              assignee: item.assignee,
              department,
            })}
          </span>
          <span
            className={cn(
              'ms-auto inline-flex items-center gap-1.5 text-sm-plus font-semibold',
              stateTone[item.state],
            )}
          >
            <span className="size-2 rounded-full bg-current" />
            {stateLabel}
          </span>
          <span
            className={cn(
              'text-sm-plus',
              progress.over ? 'text-bad' : 'text-fg-3',
            )}
          >
            {summary}
          </span>
          <DialogClose className={secondaryButton}>
            {t('actions.close')}
          </DialogClose>
          <DialogTitle className="sr-only">{item.title}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('item.dialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <ProgressBar
          className="h-[5px] rounded-none"
          indicatorClassName={progressTone}
          label={t('item.progressLabel')}
          value={progress.fillPercentage}
        />
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-inset px-5 py-2.5">
          <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
            {t('item.status')}
          </span>
          <span
            className={cn(
              'rounded-full border border-line px-2 py-0.5 text-xs font-semibold',
              stateTone[item.state],
            )}
          >
            {t(`item.statusValues.${item.state}`)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm-plus text-fg-2">
            <span
              className={cn('size-2 rounded-full', priorityDotClass[priority])}
            />
            {item.priority}
          </span>
          <span className="ms-auto text-xs text-fg-3">{t('item.sla')}</span>
          <ProgressBar
            className="h-1.5 w-[90px]"
            indicatorClassName={progressTone}
            label={t('item.progressLabel')}
            value={progress.fillPercentage}
          />
          <span
            className={cn(
              'num text-xs font-semibold',
              progress.over ? 'text-bad' : 'text-fg-2',
            )}
          >
            {`${String(progress.percentage)}%`}
          </span>
        </div>
        <div className="flex items-center gap-2 border-b border-line bg-inset px-6 py-2 text-xs text-fg-3">
          <Eye aria-hidden="true" size={14} />
          {t('item.readOnly')}
        </div>
        <DialogBody className="max-h-[78vh] p-6">
          <div data-prototype-noop="item-preview" inert>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
                {item.type}
              </span>
              <h2 className="m-0 text-xl font-semibold tracking-tight">
                {item.title}
              </h2>
            </div>
            <div className="mt-4">
              <DetailRow label={t('item.reference')} value={item.id} />
              <DetailRow label={t('item.department')} value={department} />
              <DetailRow label={t('item.raisedBy')} value={item.assignee} />
              <DetailRow
                label={t('item.priority')}
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        priorityDotClass[priority],
                      )}
                    />
                    {item.priority}
                  </span>
                }
              />
              <DetailRow
                label={t('item.agreedResponse')}
                value={level?.response ?? '—'}
              />
              <DetailRow
                label={t('item.agreedResolution')}
                value={item.agreed}
              />
              <DetailRow label={t('item.timeUsed')} value={item.used} />
              <DetailRow
                label={t('item.coverage')}
                value={level?.coverage ?? '—'}
              />
              <DetailRow label={t('item.state')} value={stateLabel} />
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2.5 border-t border-line pt-4">
            <h3 className="m-0 text-base font-semibold">
              {t('item.updates.title')}{' '}
              <span className="ms-1 rounded-full border border-line px-2 py-0.5 text-xs">
                {updates.length}
              </span>
            </h3>
            {updates.map((update, index) => (
              <div
                className="flex gap-2.5 rounded-menu border border-line bg-inset px-3 py-2.5"
                key={update}
              >
                <span
                  className={cn(
                    'mt-2 size-1.5 shrink-0 rounded-full',
                    index === 1 ? 'bg-accent' : 'bg-[var(--brand-yellow)]',
                  )}
                />
                <span className="text-base leading-relaxed">{update}</span>
              </div>
            ))}
          </div>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
