import { Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { durMins } from '../domain/duration';
import { escalationTarget } from '../domain/escalation';
import type { WorkflowTask } from '../types/workflow.types';
import { useLocalizedText } from '@/shared/i18n/localized';
import { Table, TBody, Td, Th, THead, Tr } from '@/shared/table/Table';

type SlaEscalationProps = Readonly<{
  onTaskChange: (id: string) => void;
  task: WorkflowTask;
  tasks: readonly WorkflowTask[];
}>;

export function SlaEscalation({ onTaskChange, task, tasks }: SlaEscalationProps) {
  const { t } = useTranslation('workflows');
  const localize = useLocalizedText();
  const maximum = Math.max(1, ...task.steps.map((step) => durMins(step.duration)));

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
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
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <Table>
          <THead>
            <Tr>
              {(['step', 'owner', 'targetTime', 'share', 'escalateTo'] as const).map((key) => (
                <Th className="border-b border-line px-3.5 py-[11px] text-start text-xs font-bold tracking-[0.05em] whitespace-nowrap text-fg-3 uppercase" key={key}>{t(`sla.columns.${key}`)}</Th>
              ))}
            </Tr>
          </THead>
          <TBody>
            {task.steps.map((step, index) => {
              const escalation = escalationTarget(index, task.steps.length);
              return (
                <Tr className="hover:bg-raised" key={`${step.action}-${String(index)}`}>
                  <Td className="border-b border-line px-3.5 py-[13px]">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-inset text-sm font-bold text-fg-2">{index + 1}</span>
                      <span className="font-semibold text-fg">{step.action}</span>
                    </span>
                  </Td>
                  <Td className="border-b border-line px-3.5 py-[13px] text-fg-2">{step.owner}</Td>
                  <Td className="num border-b border-line px-3.5 py-[13px] font-semibold whitespace-nowrap text-fg">{step.duration}</Td>
                  <Td className="border-b border-line px-3.5 py-[13px]">
                    <div className="min-w-[140px] flex-1 overflow-hidden rounded-full bg-inset">
                      <div className="h-[7px] rounded-full bg-accent" style={{ width: `${String((durMins(step.duration) / maximum) * 100)}%` }} />
                    </div>
                  </Td>
                  <Td className="border-b border-line px-3.5 py-[13px]">
                    <span className="inline-flex items-center gap-1.5 font-semibold whitespace-nowrap text-warn">
                      <Flag aria-hidden="true" size={13} strokeWidth={1.6} />
                      {escalation.kind === 'department-head'
                        ? t('sla.departmentHead')
                        : t('sla.nextOwner', { step: escalation.stepNumber })}
                    </span>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
