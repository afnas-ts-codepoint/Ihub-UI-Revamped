import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

import {
  CLOCK_QUEUES,
  buildClockRows,
  summariseClock,
  type ClockRow,
} from '../../domain/onTheClock';
import { useSlaLabels } from '../../hooks/useSlaLabels';
import type {
  QueueAction,
  QueueIncident,
  QueueJobOrder,
  SlaState,
} from '../../types/queue.types';
import { actionButtonClass } from '../actions/actionButtonStyles';
import { HomeSectionHead } from '../sections/HomeSectionHead';
import { MonthlySlaCompliance } from './MonthlySlaCompliance';

/** Rows shown before "See all". */
const ROW_LIMIT = 6;

const TONE_BG: Readonly<Record<SlaState, string>> = {
  'at-risk': 'bg-warn',
  breached: 'bg-bad',
  ok: 'bg-ok',
};
const TONE_TEXT: Readonly<Record<SlaState, string>> = {
  'at-risk': 'text-warn',
  breached: 'text-bad',
  ok: 'text-fg-3',
};

export type ClockJump = 'approvals' | 'assigned' | 'incidents' | 'sla';

export type OnTheClockProps = Readonly<{
  actions: readonly QueueAction[];
  incidents: readonly QueueIncident[];
  jobOrders: readonly QueueJobOrder[];
  onJump: (view: ClockJump) => void;
  onOpen: (row: ClockRow) => void;
}>;

/**
 * Every queue item against the time it has to be closed in: a stacked bar and
 * key, a Needs-attention / On-time list, one chip per queue, and the monthly
 * SLA compliance panel.
 * @prototype index.html:L13238-L13329 `SLASection`
 */
export function OnTheClock({
  actions,
  incidents,
  jobOrders,
  onJump,
  onOpen,
}: OnTheClockProps) {
  const { t } = useTranslation('home');
  const labels = useSlaLabels();
  const [tab, setTab] = useState<'attention' | 'ontime'>('attention');
  const rows = useMemo(
    () => buildClockRows(actions, jobOrders, incidents, labels),
    [actions, incidents, jobOrders, labels],
  );
  const { attention, breached, ok, onTime, risk } = useMemo(
    () => summariseClock(rows),
    [rows],
  );
  const list = tab === 'attention' ? attention : onTime;
  const segment = (count: number, tone: string, label: string) =>
    count ? (
      <div
        className={tone}
        style={{ width: `${String((count / rows.length) * 100)}%` }}
        title={`${String(count)} ${label}`}
      />
    ) : null;
  const key = (tone: string, count: number, label: string) => (
    <span className="inline-flex items-center gap-1.5 text-base-plus text-fg-2">
      <span className={cn('size-2 rounded-full', tone)} />
      <span className="num font-semibold text-fg">{count}</span>
      {label}
    </span>
  );
  const tabButton = (id: 'attention' | 'ontime', label: string, count: number) => {
    const active = tab === id;
    return (
      <button
        aria-pressed={active}
        className={cn(
          'cursor-pointer rounded-lg px-3 py-1.5 text-base-plus',
          active
            ? 'bg-surface font-semibold text-accent shadow-[0_1px_2px_rgba(20,20,30,0.08)]'
            : 'font-medium text-fg-3',
        )}
        key={id}
        onClick={() => {
          setTab(id);
        }}
        type="button"
      >
        {label} <span className="num opacity-75">{count}</span>
      </button>
    );
  };

  return (
    <section
      className="mt-6 rounded-lg border border-line bg-surface p-5"
      data-testid="on-the-clock"
    >
      <HomeSectionHead
        right={
          breached ? (
            <Chip className="text-xs" tone="bad">
              {`${String(breached)} ${t('overview.clock.pastDue')}`}
            </Chip>
          ) : risk ? (
            <Chip className="text-xs" tone="warn">
              {`${String(risk)} ${t('overview.clock.runningOut')}`}
            </Chip>
          ) : (
            <Chip className="text-xs" tone="ok">
              {t('overview.clock.allOnTime')}
            </Chip>
          )
        }
        sub={t('overview.clock.subtitle')}
        title={t('overview.clock.title')}
      />
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="display num text-8xl leading-none font-semibold">
          {ok + risk}
        </span>
        <span className="text-base-plus text-fg-2">
          {t('overview.clock.of')} <span className="num">{rows.length}</span>{' '}
          {t('overview.clock.stillInside')}
        </span>
      </div>
      <div className="mt-3 mb-2.5 flex h-2 overflow-hidden rounded-[5px] bg-line">
        {segment(ok, 'bg-ok', t('overview.clock.onTime'))}
        {segment(risk, 'bg-warn', t('overview.clock.running'))}
        {segment(breached, 'bg-bad', t('overview.clock.pastDue'))}
      </div>
      <div className="flex flex-wrap gap-[18px]">
        {key('bg-ok', ok, t('overview.clock.onTime'))}
        {key('bg-warn', risk, t('overview.clock.running'))}
        {key('bg-bad', breached, t('overview.clock.pastDue'))}
      </div>
      <div className="mt-[18px] flex w-fit gap-[3px] rounded-[10px] border border-line bg-inset p-[3px]">
        {tabButton('attention', t('overview.clock.needsAttention'), attention.length)}
        {tabButton('ontime', t('overview.clock.onTimeTab'), ok)}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {list.length ? (
          list.slice(0, ROW_LIMIT).map((row) => (
            <div
              className="flex cursor-pointer items-center gap-[13px] rounded-[10px] border border-line bg-surface px-3.5 py-3 transition-colors hover:border-line-strong max-tablet:gap-2.5 max-tablet:px-3 max-tablet:py-[11px]"
              data-testid="clock-row"
              key={row.key}
              onClick={() => {
                onOpen(row);
              }}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpen(row);
                }
              }}
              role="button"
              tabIndex={0}
              title={row.tip}
            >
              <span className={cn('size-2 shrink-0 rounded-full', TONE_BG[row.state])} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-base-plus leading-[1.35] font-semibold">
                  {row.title}
                </div>
                <div className="mt-[3px] text-base text-fg-3">
                  {`${t(CLOCK_QUEUES.find((queue) => queue.id === row.queue)?.labelKey ?? 'overview.clock.queues.approvals')} · ${row.who}`}
                </div>
              </div>
              <div className="h-1 w-[88px] shrink-0 overflow-hidden rounded-[3px] bg-line max-tablet:hidden">
                <div
                  className={cn('h-full rounded-[3px]', TONE_BG[row.state])}
                  style={{ width: `${String(Math.min(100, Math.round(row.pct * 100)))}%` }}
                />
              </div>
              <span
                className={cn(
                  'min-w-[92px] shrink-0 text-end text-base-plus font-semibold max-tablet:min-w-0',
                  TONE_TEXT[row.state],
                )}
              >
                {row.label}
              </span>
              <Icon
                className="shrink-0 text-fg-4"
                name="arrow-right"
                size={15}
              />
            </div>
          ))
        ) : (
          <div className="rounded-[10px] border border-dashed border-line-strong px-3 py-[22px] text-center text-base text-fg-4">
            {t('overview.clock.nothing')}
          </div>
        )}
        {list.length > ROW_LIMIT ? (
          <button
            className={cn(actionButtonClass('ghost', 'sm'), 'self-start')}
            onClick={() => {
              onJump('approvals');
            }}
            type="button"
          >
            {`${t('overview.needs.seeAll')} ${String(list.length)}`}
          </button>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3.5">
        {CLOCK_QUEUES.map((queue) => {
          const inQueue = rows.filter((row) => row.queue === queue.id);
          if (!inQueue.length) return null;
          const late = inQueue.filter((row) => row.state === 'breached').length;
          const near = inQueue.filter((row) => row.state === 'at-risk').length;
          return (
            <button
              className={cn(actionButtonClass('ghost', 'sm'), 'gap-[7px]')}
              key={queue.id}
              onClick={() => {
                onJump(queue.view);
              }}
              type="button"
            >
              <span
                className={cn(
                  'size-[7px] shrink-0 rounded-full',
                  late ? 'bg-bad' : near ? 'bg-warn' : 'bg-ok',
                )}
              />
              {t(queue.labelKey)}
              <span className="num text-fg-3">{`${String(inQueue.length - late - near)}/${String(inQueue.length)}`}</span>
            </button>
          );
        })}
      </div>
      <MonthlySlaCompliance
        onOpenSla={() => {
          onJump('sla');
        }}
      />
    </section>
  );
}
