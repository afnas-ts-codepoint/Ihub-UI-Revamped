import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { ProgressRing } from '@/shared/ui/progress/ProgressRing';

import {
  ANALYTICS_AGING,
  ANALYTICS_BREACH,
  ANALYTICS_DEPARTMENT_PERFORMANCE,
  ANALYTICS_DEPARTMENT_VOLUME,
  ANALYTICS_PRIORITY,
  ANALYTICS_SLA_RING,
  ANALYTICS_SLA_STATS,
  ANALYTICS_STATUS,
  ANALYTICS_TOP_DEPARTMENTS,
  ANALYTICS_TREND_RAISED,
  ANALYTICS_TREND_RESOLVED,
} from '../../data/analytics.mock';
import { HomeSectionHead } from '../sections/HomeSectionHead';
import { Bar, Donut, HBar, Stat, StatTile, VBars } from './AnalyticsCharts';

const SLA_STAT_LABEL = {
  atRisk: 'overview.analytics.sla.atRisk',
  breached: 'overview.analytics.sla.breached',
  met: 'overview.analytics.sla.met',
} as const;

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

type PanelProps = Readonly<{
  bottom?: boolean;
  children: ReactNode;
  className?: string;
  sub: string;
  testId: string;
  title: string;
}>;

/** A titled card; `bottom` pins the content to the card's base so charts line up across a row. */
function Panel({ bottom, children, className, sub, testId, title }: PanelProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-3.5 rounded-lg border border-line bg-surface p-5',
        className,
      )}
      data-testid={testId}
    >
      <HomeSectionHead sub={sub} title={title} />
      {bottom ? (
        <div className="flex flex-1 flex-col justify-end">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

function Kicker({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">
      {children}
    </span>
  );
}

/**
 * Nine illustrative panels: status and priority donuts, SLA ring, top problem
 * areas, issue trend, aging, department performance and SLA breaches. The
 * figures are fixed prototype fixtures (they do not follow the live queues).
 * @prototype index.html:L14134-L14189 `AnalyticsOverview`
 */
export function AnalyticsOverview() {
  const { t } = useTranslation('home');

  return (
    <section className="mt-6" data-testid="analytics-overview">
      <HomeSectionHead
        sub={t('overview.analytics.subtitle')}
        title={t('overview.analytics.title')}
      />
      <div className="mt-4 grid grid-cols-3 items-stretch gap-4 max-desktop:grid-cols-1">
        <Panel sub={t('overview.analytics.status.sub')} testId="analytics-status" title={t('overview.analytics.status.title')}>
          <Donut data={ANALYTICS_STATUS} />
        </Panel>
        <Panel sub={t('overview.analytics.priority.sub')} testId="analytics-priority" title={t('overview.analytics.priority.title')}>
          <Donut data={ANALYTICS_PRIORITY} />
        </Panel>
        <Panel sub={t('overview.analytics.sla.sub')} testId="analytics-sla" title={t('overview.analytics.sla.title')}>
          <div className="flex flex-wrap items-center gap-6">
            <ProgressRing
              color="var(--ok)"
              label={`${String(Math.round(ANALYTICS_SLA_RING * 100))}%`}
              size={96}
              stroke={10}
              value={ANALYTICS_SLA_RING}
            />
            <div className="flex min-w-[160px] flex-1 flex-col gap-2.5">
              {ANALYTICS_SLA_STATS.map((stat) => (
                <StatTile
                  key={stat.key}
                  label={t(SLA_STAT_LABEL[stat.key])}
                  tone={stat.tone}
                  value={stat.value}
                />
              ))}
            </div>
          </div>
        </Panel>
        <Panel sub={t('overview.analytics.problems.sub')} testId="analytics-problems" title={t('overview.analytics.problems.title')}>
          <div className="flex flex-col gap-3.5">
            {ANALYTICS_TOP_DEPARTMENTS.map((department) => (
              <HBar
                color={department.color}
                key={department.label}
                label={department.label}
                max={department.max}
                value={department.value}
              />
            ))}
          </div>
        </Panel>
        <Panel bottom sub={t('overview.analytics.trend.sub')} testId="analytics-trend" title={t('overview.analytics.trend.title')}>
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[150px] flex-1">
              <Stat
                delta="+8%"
                label={t('overview.analytics.trend.raised')}
                spark={ANALYTICS_TREND_RAISED}
                tone="accent"
                value={sum(ANALYTICS_TREND_RAISED)}
              />
            </div>
            <div className="min-w-[150px] flex-1">
              <Stat
                delta="+11%"
                label={t('overview.analytics.trend.resolved')}
                spark={ANALYTICS_TREND_RESOLVED}
                tone="ok"
                value={sum(ANALYTICS_TREND_RESOLVED)}
              />
            </div>
          </div>
        </Panel>
        <Panel bottom sub={t('overview.analytics.aging.sub')} testId="analytics-aging" title={t('overview.analytics.aging.title')}>
          <VBars data={ANALYTICS_AGING} height={170} />
        </Panel>
        <Panel
          className="col-span-2 max-desktop:col-span-1"
          sub={t('overview.analytics.performance.sub')}
          testId="analytics-performance"
          title={t('overview.analytics.performance.title')}
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] items-start gap-x-7 gap-y-3.5">
            <div className="flex min-w-0 flex-col gap-3">
              <Kicker>{t('overview.analytics.performance.volume')}</Kicker>
              <div className="flex flex-col gap-3">
                {ANALYTICS_DEPARTMENT_VOLUME.map((department) => (
                  <HBar
                    key={department.label}
                    label={department.label}
                    max={department.max}
                    value={department.value}
                  />
                ))}
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <Kicker>{t('overview.analytics.performance.resolution')}</Kicker>
              <div className="flex flex-col gap-3">
                {ANALYTICS_DEPARTMENT_PERFORMANCE.map((department) => (
                  <Bar
                    key={department.label}
                    label={department.label}
                    pct={department.pct}
                    tone={department.tone}
                  />
                ))}
              </div>
            </div>
          </div>
        </Panel>
        <Panel bottom sub={t('overview.analytics.breach.sub')} testId="analytics-breach" title={t('overview.analytics.breach.title')}>
          <VBars data={ANALYTICS_BREACH} height={230} />
        </Panel>
      </div>
    </section>
  );
}
