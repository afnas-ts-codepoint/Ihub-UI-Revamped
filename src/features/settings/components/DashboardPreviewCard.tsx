import { useTranslation } from 'react-i18next';

import { DashboardSchematicPreview } from './DashboardSchematicPreview';
import type { DashboardBuilderState } from '../hooks/useDashboardBuilder';
import type { PreviewDevice } from '../types/dashboardConfig.types';
import { Icon } from '@/shared/ui/icon/Icon';

type DashboardPreviewCardProps = Readonly<{ builder: DashboardBuilderState }>;

const DEVICES: readonly PreviewDevice[] = ['desktop', 'tablet', 'mobile'];

/**
 * Preview card: Desktop/Tablet/Mobile toggle over the schematic preview,
 * plus the full-size-preview expand button. Both the device toggle AND
 * actual narrow viewports force effectively 1 column for tablet/mobile —
 * the schematic preview itself already collapses to 1 column whenever
 * `device !== 'desktop'` (see `DashboardSchematicPreview`), and narrow
 * viewports get the same single-column layout because the surrounding
 * page grid stacks to one column under the responsive breakpoint (no
 * separate device-detection logic needed).
 * @prototype index.html:L7308-L7315
 */
export function DashboardPreviewCard({ builder }: DashboardPreviewCardProps) {
  const { t } = useTranslation('settings');

  return (
    <div className="min-w-0 rounded-dialog border border-line bg-surface p-5">
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <h3 className="m-0 text-base font-semibold">{t('preview.title')}</h3>
        <div className="flex items-center gap-2">
          <div className="inline-flex gap-0.5 rounded-lg bg-inset p-0.5">
            {DEVICES.map((deviceId) => (
              <button
                className={`rounded-compact px-3 py-1.5 text-sm font-medium ${
                  builder.device === deviceId ? 'bg-surface font-semibold text-accent shadow-segment' : 'text-fg-2'
                }`}
                key={deviceId}
                onClick={() => { builder.setDevice(deviceId); }}
                type="button"
              >
                {t(`preview.${deviceId}`)}
              </button>
            ))}
          </div>
          <button
            aria-label={t('preview.openFullSize')}
            className="rounded-lg px-2 py-1.5 text-fg-2 hover:bg-inset"
            onClick={() => { builder.openPreview(builder.currentConfig, builder.dashboardName); }}
            title={t('preview.openFullSize')}
            type="button"
          >
            <Icon name="arrow-up-right" size={16} />
          </button>
        </div>
      </div>

      {builder.isLive ? null : (
        <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-warn/25 bg-warn/8 p-3 text-sm text-fg-2">
          <Icon className="mt-0.5 shrink-0 text-warn" name="help" size={16} />
          <span>{t('preview.notBuiltYet')}</span>
        </div>
      )}

      <DashboardSchematicPreview cfg={builder.currentConfig} device={builder.device} widgets={builder.availableWidgets} />
    </div>
  );
}
