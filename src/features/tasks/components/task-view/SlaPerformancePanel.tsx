import { ArrowRight, Check, Clock, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CollapsiblePanel } from './CollapsiblePanel';
import { PanelIntro } from './FieldGrid';
import { TASK_VIEW_SLA_HISTORY, TASK_VIEW_SLA_TARGET } from '../../data/taskView.mock';
import { Chip } from '@/shared/ui/chip/Chip';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function formatSlaDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const hour = date.getHours() % 12 || 12;
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}/${String(date.getFullYear())}, ${pad2(hour)}:${pad2(date.getMinutes())} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
}

/**
 * SLA & Performance — read-only: status banner, target completion (no edit
 * control), and the static 1-entry target-change-history timeline.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18305-L18373 (`slaPanel`); the edit
 * button is `readOnly ? null : slaEditBtn` (L18348), so it is not ported here.
 */
export function SlaPerformancePanel() {
  const { t } = useTranslation('taskView');
  const breached = new Date(TASK_VIEW_SLA_TARGET) < new Date();
  const history = TASK_VIEW_SLA_HISTORY;

  // @prototype ihub/ORIGINAL_SOURCE.html:L18169 `tepOpenCards` — `sla: !!readOnly`,
  // i.e. open by default only in read-only mode, which is always the case here.
  return (
    <CollapsiblePanel defaultOpen icon={Clock} title={t('sla.title')}>
      <PanelIntro>{t('sla.intro')}</PanelIntro>

      <div
        className={`flex items-center gap-3 rounded-lg border p-3.5 ${breached ? 'border-bad/30 bg-bad/10' : 'border-ok/30 bg-ok/10'}`}
      >
        <span
          className={`flex size-8.5 shrink-0 items-center justify-center rounded-full ${breached ? 'bg-bad/20 text-bad' : 'bg-ok/20 text-ok'}`}
        >
          {breached ? <Zap aria-hidden size={16} /> : <Check aria-hidden size={16} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`m-0 text-sm-plus font-bold ${breached ? 'text-bad' : 'text-ok'}`}>
            {breached ? t('sla.breachedTitle') : t('sla.onTrackTitle')}
          </p>
          <p className="m-0 text-xs-plus text-fg-2">
            {breached ? t('sla.breachedSub') : t('sla.onTrackSub')}
          </p>
        </div>
        <Chip tone={breached ? 'bad' : 'ok'}>{breached ? t('sla.breached') : t('sla.onTrack')}</Chip>
      </div>

      <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface p-3.5">
        <span className="flex size-7.5 shrink-0 items-center justify-center rounded-lg border border-line-strong text-accent">
          <Clock aria-hidden size={15} />
        </span>
        <div>
          <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
            {t('sla.targetCompletion')}
          </span>
          <div className={`num text-sm-plus font-bold ${breached ? 'text-bad' : 'text-ok'}`}>
            {formatSlaDate(TASK_VIEW_SLA_TARGET)}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-xs font-semibold tracking-wider text-fg-3 uppercase">
            <Clock aria-hidden size={14} />
            {t('sla.changeHistory')}
          </span>
          <Chip>{t('sla.changeCount', { count: history.length })}</Chip>
        </div>
        {history.length ? (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {history.map((entry) => (
              <li className="flex flex-col gap-1" key={entry.when}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm-plus font-semibold">{entry.who}</span>
                  <span className="num text-xs-plus text-fg-4">{entry.when}</span>
                </div>
                <div className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-line bg-inset px-2.5 py-1 text-xs-plus">
                  <span className="num text-fg-4 line-through">{formatSlaDate(entry.from)}</span>
                  <ArrowRight aria-hidden size={13} className="text-fg-3" />
                  <span className="num font-bold text-bad">{formatSlaDate(entry.to)}</span>
                </div>
                <p className="m-0 text-xs-plus text-fg-3 italic">{entry.reason}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-xs-plus text-fg-4">{t('sla.noChanges')}</p>
        )}
      </div>
    </CollapsiblePanel>
  );
}
