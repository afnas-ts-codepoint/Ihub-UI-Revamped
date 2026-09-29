import { Calendar, Clock, Globe } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CollapsiblePanel } from './CollapsiblePanel';
import { PanelIntro } from './FieldGrid';
import { TASK_VIEW_DEPENDENCIES } from '../../data/taskView.mock';
import { addWorkdays, toUsDate } from '@/shared/lib/date/workdays';
import { Chip } from '@/shared/ui/chip/Chip';

export const DEPENDENCIES_PANEL_ANCHOR_ID = 'task-view-dependencies';

/**
 * Dependencies — read-only list of the current dependency fixture; Add/Edit/
 * Remove are hidden (`readOnly ? null : …`). `highlighted` briefly tints the
 * panel when the dependency reminder's "View dependencies" button opens and
 * scrolls to it, matching the prototype's `depFlash` effect.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18662-L18685 (`dependenciesPanel`),
 * L18637-L18646 (`focusCurrentDeps`).
 */
export function DependenciesPanel({
  highlighted,
  onOpenChange,
  open,
}: Readonly<{ highlighted: boolean; onOpenChange: (open: boolean) => void; open: boolean }>) {
  const { t } = useTranslation('taskView');
  const dependencies = useMemo(
    () =>
      TASK_VIEW_DEPENDENCIES.map((dependency) => ({
        ...dependency,
        impactDate: toUsDate(addWorkdays(new Date(), dependency.workdaysFromNow)),
      })),
    [],
  );

  return (
    <CollapsiblePanel
      icon={Globe}
      onOpenChange={onOpenChange}
      open={open}
      title={t('dependencies.title')}
    >
      <PanelIntro>{t('dependencies.intro')}</PanelIntro>
      <div
        className={`flex flex-col gap-2.5 rounded-xl p-3 transition-colors ${highlighted ? 'bg-accent-dim outline outline-accent' : ''}`}
        id={DEPENDENCIES_PANEL_ANCHOR_ID}
        tabIndex={-1}
      >
        <p className="m-0 text-xs font-bold tracking-wider text-fg-2 uppercase">
          {t('dependencies.current', { count: dependencies.length })}
        </p>
        {dependencies.length ? (
          <div className="flex flex-col gap-2.5">
            {dependencies.map((dependency) => (
              <div
                className="flex flex-col gap-1.5 rounded-lg border border-line bg-raised p-3.5"
                key={dependency.id}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="num text-sm-plus font-bold">{dependency.id}</span>
                  {dependency.blocking ? <Chip tone="bad">{t('dependencies.blocking')}</Chip> : null}
                  {dependency.status ? <Chip tone="warn">{dependency.status}</Chip> : null}
                </div>
                <div className="text-sm-plus font-semibold">
                  {dependency.category}
                  {dependency.type ? ` · ${dependency.type}` : ''}
                </div>
                <div className="flex items-center gap-1.5 text-xs-plus text-fg-3">
                  <Clock aria-hidden size={12} />
                  {t('dependencies.leadTime')}{': '}
                  {dependency.leadTime}
                </div>
                <div className="flex items-center gap-1.5 text-xs-plus">
                  <Calendar aria-hidden className="shrink-0 text-bad" size={12} />
                  <span className="text-fg-3">{t('dependencies.dateImpact')}{': '}</span>
                  <span className="font-semibold text-bad">
                    {t('dependencies.startDelayedTo')} {dependency.impactDate}
                  </span>
                </div>
                {dependency.remarks ? (
                  <div className="text-xs-plus text-fg-3">{dependency.remarks}</div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="m-0 rounded-lg border border-dashed border-line-strong py-4.5 text-center text-xs-plus text-fg-4">
            {t('dependencies.empty')}
          </p>
        )}
      </div>
    </CollapsiblePanel>
  );
}
