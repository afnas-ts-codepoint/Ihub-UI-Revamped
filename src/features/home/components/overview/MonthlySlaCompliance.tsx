import { useTranslation } from 'react-i18next';

import { useSlaLevels, useSlaPerformance } from '@/features/sla';
import { cn } from '@/shared/lib/cn';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

import { actionButtonClass } from '../actions/actionButtonStyles';

const DOT_CLASS = {
  P1: 'bg-bad',
  P2: 'bg-warn',
  P3: 'bg-interactive',
  P4: 'bg-fg-3',
} as const;

export type MonthlySlaComplianceProps = Readonly<{ onOpenSla: () => void }>;

/**
 * "SLA compliance this month": the share of work orders closed inside the
 * agreed time per priority, against that priority's monthly target. This is
 * the SLA & Compliance model (M3.8) — it reads the same levels and monthly
 * performance as that page and shares nothing with the live queue clock above
 * it (D4).
 * @prototype index.html:L13302-L13328 `SLASection` compliance block
 */
export function MonthlySlaCompliance({ onOpenSla }: MonthlySlaComplianceProps) {
  const { t } = useTranslation('home');
  const { t: tSla } = useTranslation('sla');
  const { levels } = useSlaLevels();
  const { onTimePercentage, performance } = useSlaPerformance();

  return (
    <div
      className="mt-4 border-t border-line pt-3.5"
      data-testid="monthly-sla-compliance"
    >
      <div className="mb-1 flex flex-wrap items-baseline gap-2.5">
        <span className="text-xs font-semibold tracking-[0.08em] text-fg-3 uppercase">
          {t('overview.compliance.title')}
        </span>
        <button
          className={cn(actionButtonClass('ghost', 'sm'), 'ms-auto')}
          onClick={onOpenSla}
          type="button"
        >
          {t('overview.compliance.open')}
          <Icon name="arrow-right" size={14} />
        </button>
      </div>
      <p className="mt-0 mb-3 max-w-[560px] text-base-plus leading-[1.55] text-fg-3">
        {t('overview.compliance.description')}
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-2.5">
        {levels.map((level) => {
          const { onTime, workOrders } = performance[level.id];
          const percentage = onTimePercentage(performance[level.id]);
          const met = percentage >= level.target;
          const gap = Math.round((level.target - percentage) * 10) / 10;
          return (
            <div
              className="flex flex-col gap-2 rounded-menu border border-line bg-surface px-3.5 py-[13px]"
              data-testid={`sla-level-${level.id}`}
              key={level.id}
            >
              <div className="flex items-center gap-[7px]">
                <span
                  className={cn('size-2 shrink-0 rounded-full', DOT_CLASS[level.id])}
                />
                <span className="text-base-plus font-semibold whitespace-nowrap">
                  {tSla(`priorities.${level.id}`)}
                </span>
                <Chip
                  className="ms-auto px-[7px] py-0.5 text-xs"
                  tone={met ? 'ok' : 'bad'}
                >
                  {met ? t('overview.compliance.onTarget') : t('overview.compliance.below')}
                </Chip>
              </div>
              <div className="flex items-baseline gap-[7px]">
                <span
                  className={cn(
                    'num text-4xl leading-none font-semibold tracking-[-0.02em]',
                    met ? 'text-ok' : 'text-bad',
                  )}
                >
                  {`${String(percentage)}%`}
                </span>
                <span className="text-base text-fg-3">
                  {t('overview.compliance.ofTarget', { target: level.target })}
                </span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-inset">
                <div
                  className={cn('h-full rounded-full', met ? 'bg-ok' : 'bg-bad')}
                  style={{ width: `${String(Math.min(100, percentage))}%` }}
                />
                <div
                  className="absolute -top-0.5 h-2.5 w-0.5 bg-fg opacity-50"
                  style={{ insetInlineStart: `calc(${String(level.target)}% - 1px)` }}
                />
              </div>
              <span className="text-base leading-normal text-fg-3">
                {`${String(onTime)}/${String(workOrders)} ${t('overview.compliance.closedInTime')} · ${
                  met
                    ? t('overview.compliance.meeting')
                    : t('overview.compliance.shortBy', { gap })
                }`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
