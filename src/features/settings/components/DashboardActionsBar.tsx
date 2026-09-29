import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { DashboardBuilderState } from '../hooks/useDashboardBuilder';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

type DashboardActionsBarProps = Readonly<{ builder: DashboardBuilderState }>;

/**
 * Sticky bottom action bar: a live summary (scope, widget count, columns,
 * drag & drop, flash/dirty status) plus Reset / Import / Export / Save.
 * @prototype index.html:L7321-L7334
 */
export function DashboardActionsBar({ builder }: DashboardActionsBarProps) {
  const { t } = useTranslation('settings');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dndEnabled = builder.isUser ? builder.ruleDnd : builder.currentConfig.dnd;

  return (
    <div className="sticky bottom-0 z-20 -mt-1 pb-3">
      <div className="flex flex-wrap items-center gap-4 rounded-dialog border border-line bg-surface p-4 shadow-[0_12px_32px_rgba(20,20,30,.16)]">
        <div className="flex min-w-0 flex-wrap items-center gap-4 text-sm-plus">
          <span>
            <span className="text-fg-3">{t('summary.scope')}</span>{' '}
            <b className="font-mono font-semibold text-accent">
              {builder.isUser ? t('myDashboard.title') : builder.scope}
            </b>
          </span>
          <span>
            <span className="text-fg-3">{t('summary.widgets')}</span>{' '}
            <b className="font-mono font-semibold">
              {builder.currentConfig.ids.length}
              {' / '}
              {builder.isUser ? builder.availableIds.length : 15}
            </b>
          </span>
          <span>
            <span className="text-fg-3">{t('summary.columns')}</span>{' '}
            <b className="font-mono font-semibold">{builder.currentConfig.cols}</b>
          </span>
          <span>
            <span className="text-fg-3">{t('summary.dragAndDrop')}</span>{' '}
            <b className={`font-mono font-semibold ${dndEnabled ? 'text-ok' : 'text-fg-3'}`}>
              {dndEnabled ? t('summary.enabled') : t('summary.disabled')}
            </b>
          </span>
          {builder.flashMessage ? (
            <Chip role="status" tone="ok">
              {builder.flashMessage}
            </Chip>
          ) : builder.isDirty ? (
            <Chip tone="warn">{t('scope.unsavedChanges')}</Chip>
          ) : null}
        </div>
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-fg-2 hover:bg-inset"
            onClick={builder.resetScope}
            type="button"
          >
            <Icon name="refresh" size={15} />
            {t('actions.reset')}
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-sm font-semibold text-fg"
            onClick={() => { fileInputRef.current?.click(); }}
            type="button"
          >
            <Icon name="arrow-up-right" size={15} />
            {t('actions.import')}
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-sm font-semibold text-fg"
            onClick={builder.exportConfig}
            type="button"
          >
            <Icon name="download" size={15} />
            {t('actions.export')}
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
            onClick={builder.save}
            type="button"
          >
            <Icon name="check" size={15} />
            {builder.isUser ? t('actions.saveMine') : t('actions.save')}
          </button>
          <input
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void builder.importConfig(file);
              event.target.value = '';
            }}
            ref={fileInputRef}
            type="file"
          />
        </div>
      </div>
    </div>
  );
}
