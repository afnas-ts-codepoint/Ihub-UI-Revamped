import { useTranslation } from 'react-i18next';

import { Icon, type IconName } from '@/shared/ui/icon/Icon';

import type { HomeCounts, HomeTabId } from '../../types/home.types';

type PulseStripProps = Readonly<{
  counts: HomeCounts;
  onJump: (tab: HomeTabId) => void;
}>;

type PulseItem = Readonly<{
  icon: IconName;
  labelKey:
    | 'pulse.actionsWaiting'
    | 'pulse.averageDecision'
    | 'pulse.newTasks'
    | 'pulse.openIncidents'
    | 'pulse.overdue';
  note: string;
  tone: 'bad' | 'ok' | 'default';
  value: number | string;
  view: HomeTabId;
}>;

/** @prototype index.html:L12678-L12783. */
export function PulseStrip({ counts, onJump }: PulseStripProps) {
  const { t } = useTranslation('home');
  const items = [
    { icon: 'inbox', labelKey: 'pulse.actionsWaiting', value: counts.actions, note: `${String(counts.urgent)} urgent`, tone: counts.urgent ? 'bad' : 'default', view: 'assigned' },
    { icon: 'clock', labelKey: 'pulse.overdue', value: counts.overdue, note: 'past due', tone: counts.overdue ? 'bad' : 'ok', view: 'assigned' },
    { icon: 'bolt', labelKey: 'pulse.openIncidents', value: counts.incidents, note: `${String(counts.criticalIncidents)} critical · ${String(counts.breaches)} SLA`, tone: counts.criticalIncidents ? 'bad' : 'default', view: 'incidents' },
    { icon: 'folder', labelKey: 'pulse.newTasks', value: counts.newTasks, note: `${String(counts.totalTasks)} total`, tone: 'default', view: 'work-centre' },
    { icon: 'trend', labelKey: 'pulse.averageDecision', value: '4.2h', note: '↓ 1.1h', tone: 'ok', view: 'overview' },
  ] as const satisfies readonly PulseItem[];

  return (
    <section
      aria-label={t('pulse.label')}
      className="flex flex-wrap overflow-hidden rounded-xl border border-line bg-surface"
      data-testid="pulse-strip"
    >
      {items.map((item) => (
        <button
          className="flex min-w-[160px] flex-[1_1_160px] flex-col gap-1 border-s border-line px-5 py-4 text-start first:border-s-0 hover:bg-raised"
          key={item.labelKey}
          onClick={() => {
            onJump(item.view);
          }}
          type="button"
        >
          <span className="flex items-center gap-[7px] text-fg-3">
            <Icon name={item.icon} size={14} />
            <span className="text-sm font-medium">{t(item.labelKey)}</span>
          </span>
          <span className="flex items-baseline gap-2">
            <span
              className={`display num text-6xl leading-none font-medium ${
                item.tone === 'bad'
                  ? 'text-bad'
                  : item.tone === 'ok'
                    ? 'text-ok'
                    : 'text-fg'
              }`}
            >
              {item.value}
            </span>
            <span
              className={`num text-sm font-medium ${item.tone === 'bad' ? 'text-bad' : 'text-fg-3'}`}
            >
              {item.note}
            </span>
          </span>
        </button>
      ))}
    </section>
  );
}
