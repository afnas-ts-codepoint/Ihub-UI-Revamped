import { Clock3, Edit3, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { durMins, fmtTotal } from '../domain/duration';
import type { WorkflowTask } from '../types/workflow.types';
import { useLocalizedText } from '@/shared/i18n/localized';

type OperationalFlowProps = Readonly<{
  onTaskChange: (id: string) => void;
  task: WorkflowTask;
  tasks: readonly WorkflowTask[];
}>;

export function OperationalFlow({ onTaskChange, task, tasks }: OperationalFlowProps) {
  const { t } = useTranslation('workflows');
  const localize = useLocalizedText();
  const totalMinutes = task.steps.reduce((total, step) => total + durMins(step.duration), 0);
  const ownerCount = new Set(task.steps.map((step) => step.owner)).size;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {tasks.map((item) => (
          <button
            aria-pressed={item.id === task.id}
            className="rounded-full border border-line-strong bg-surface px-3.5 py-2 text-base-plus font-medium text-fg-2 data-[active=true]:border-accent data-[active=true]:bg-accent-dim data-[active=true]:font-semibold data-[active=true]:text-accent"
            data-active={item.id === task.id}
            key={item.id}
            onClick={() => { onTaskChange(item.id); }}
            type="button"
          >
            {localize(item.name)}
          </button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-6 rounded-lg border border-accent/25 bg-accent-dim px-5 py-4" data-testid="workflow-kpis">
        {[
          [t('flow.steps'), String(task.steps.length)],
          [t('flow.target'), fmtTotal(totalMinutes)],
          [t('flow.owners'), String(ownerCount)],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 text-xs font-bold tracking-[0.05em] text-accent uppercase">{label}</div>
            <div className="num text-4xl font-bold text-fg">{value}</div>
          </div>
        ))}
      </div>
      <div className="relative ps-2" data-testid="workflow-timeline">
        {task.steps.map((step, index) => {
          const last = index === task.steps.length - 1;
          return (
            <div className={last ? 'relative flex gap-[18px]' : 'relative flex gap-[18px] pb-[22px]'} key={`${step.action}-${String(index)}`}>
              <div className="flex shrink-0 flex-col items-center">
                <div className="z-[1] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-accent text-md font-bold text-accent-ink">{index + 1}</div>
                {last ? null : <div className="mt-1 min-h-6 w-0.5 flex-1 bg-line-strong" />}
              </div>
              <div className="flex flex-1 flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface px-[18px] py-3.5">
                <div>
                  <div className="mb-1 text-lg font-semibold text-fg">{step.action}</div>
                  <div className="inline-flex items-center gap-1.5 text-base text-fg-3"><UserRound aria-hidden="true" size={14} />{step.owner}</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="num inline-flex items-center gap-1.5 rounded-full bg-inset px-3 py-1.5 text-base font-bold text-fg"><Clock3 aria-hidden="true" className="text-fg-3" size={14} />{step.duration}</span>
                  {/* PROTOTYPE-NOOP(D2): step editing is intentionally inert. */}
                  <button aria-label={t('actions.editStep', { action: step.action })} className="rounded-lg p-1.5 text-fg-2 hover:bg-inset" data-noop="edit-step" type="button">
                    <Edit3 aria-hidden="true" size={15} strokeWidth={1.6} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
