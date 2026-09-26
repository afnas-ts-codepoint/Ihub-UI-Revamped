import { ArrowRight, ChevronRight, Clock3, Edit3, Plus, UserRound } from 'lucide-react';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { WorkflowRule, WorkflowTask } from '../types/workflow.types';
import { Table, TBody, Td, Th, THead, Tr } from '@/shared/table/Table';
import { Switch } from '@/shared/form/controls/Switch';
import { Chip } from '@/shared/ui/chip/Chip';

type RoutingRulesProps = Readonly<{
  rules: readonly WorkflowRule[];
  tasks: readonly WorkflowTask[];
}>;

export function RoutingRules({ rules, tasks }: RoutingRulesProps) {
  const { t } = useTranslation('workflows');
  const [openRow, setOpenRow] = useState(0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <p className="m-0 max-w-[640px] text-md text-fg-3">
          {t('rules.description')}
        </p>
        {/* PROTOTYPE-NOOP(D2): workflow rule creation is intentionally inert. */}
        <button
          className="inline-flex items-center gap-1.5 rounded-lg bg-interactive px-3 py-2 text-base font-semibold text-[#fff]"
          data-noop="new-rule"
          type="button"
        >
          <Plus aria-hidden="true" size={15} strokeWidth={1.6} />
          {t('actions.newRule')}
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <Table>
          <THead>
            <Tr>
              <Th className="w-[34px] border-b border-line px-0 py-[11px]" />
              {(['taskType', 'triggerLabel', 'condition', 'routesTo', 'sla', 'active'] as const).map((key) => (
                <Th className="border-b border-line px-3.5 py-[11px] text-start text-xs font-bold tracking-[0.05em] whitespace-nowrap text-fg-3 uppercase" key={key}>
                  {t(`rules.columns.${key}`)}
                </Th>
              ))}
              <Th className="border-b border-line px-3.5 py-[11px]" />
            </Tr>
          </THead>
          <TBody>
            {rules.map((rule, index) => {
              const open = openRow === index;
              const steps = tasks.find((task) => task.name.en === rule.type)?.steps;
              return (
                <Fragment key={`${rule.type}-${rule.label}-${rule.condition}`}>
                  <Tr
                    className="cursor-pointer hover:bg-raised"
                    data-expanded={open}
                    onClick={() => { setOpenRow(open ? -1 : index); }}
                  >
                    <Td className="border-b border-line py-[13px] ps-3.5 pe-0 text-fg-3">
                      <ChevronRight aria-hidden="true" className={open ? 'rotate-90 rtl:-rotate-90' : 'rtl:rotate-180'} size={15} strokeWidth={1.6} />
                    </Td>
                    <Td className="border-b border-line px-3.5 py-[13px] font-semibold whitespace-nowrap text-fg">{rule.type}</Td>
                    <Td className="border-b border-line px-3.5 py-[13px] whitespace-nowrap text-fg-2">
                      {rule.label === '—' ? <span className="text-fg-4">{t('rules.any')}</span> : <Chip className="border-transparent" tone="accent">{rule.label}</Chip>}
                    </Td>
                    <Td className="border-b border-line px-3.5 py-[13px] whitespace-nowrap text-fg-2">{rule.condition}</Td>
                    <Td className="border-b border-line px-3.5 py-[13px] whitespace-nowrap">
                      <span className="inline-flex items-center gap-2 font-semibold text-fg">
                        <ArrowRight aria-hidden="true" className="text-accent rtl:rotate-180" size={14} strokeWidth={1.6} />
                        {rule.route}
                      </span>
                    </Td>
                    <Td className="num border-b border-line px-3.5 py-[13px] font-semibold whitespace-nowrap text-fg">{rule.sla}</Td>
                    <Td className="border-b border-line px-3.5 py-[13px]"><Switch checked={rule.active} /></Td>
                    <Td className="border-b border-line px-3.5 py-[13px] text-end">
                      {/* PROTOTYPE-NOOP(D2): row editing is intentionally inert. */}
                      <button
                        aria-label={t('actions.editRule', { type: rule.type })}
                        className="rounded-lg p-1.5 text-fg-2 hover:bg-inset"
                        data-noop="edit-rule"
                        onClick={(event) => { event.stopPropagation(); }}
                        type="button"
                      >
                        <Edit3 aria-hidden="true" size={15} strokeWidth={1.6} />
                      </button>
                    </Td>
                  </Tr>
                  {open ? (
                    <Tr>
                      <Td className="border-b border-line bg-raised p-0" colSpan={8}>
                        <div className="py-4 pe-5 pb-[18px] ps-12">
                          <div className="mb-3 text-xs font-bold tracking-[0.05em] text-fg-3 uppercase">{t('rules.expansionTitle')}</div>
                          {steps ? (
                            <div className="flex flex-wrap items-stretch gap-0">
                              {steps.map((step, stepIndex) => (
                                <Fragment key={`${step.action}-${String(stepIndex)}`}>
                                  <div className="flex min-w-[150px] flex-col gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-3">
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-ink">{stepIndex + 1}</span>
                                      <span className="text-base font-semibold text-fg">{step.action}</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 text-sm text-fg-3"><UserRound aria-hidden="true" size={12} />{step.owner}</span>
                                    <span className="num inline-flex items-center gap-1 self-start rounded-full bg-inset px-2 py-0.5 text-xs-plus font-bold text-fg-2"><Clock3 aria-hidden="true" size={12} />{step.duration}</span>
                                  </div>
                                  {stepIndex < steps.length - 1 ? <div className="flex items-center px-1.5 text-line-strong"><ChevronRight aria-hidden="true" className="rtl:rotate-180" size={16} /></div> : null}
                                </Fragment>
                              ))}
                            </div>
                          ) : <div className="text-base text-fg-3">{t('rules.noFlow')}</div>}
                        </div>
                      </Td>
                    </Tr>
                  ) : null}
                </Fragment>
              );
            })}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
