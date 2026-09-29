import { useTranslation } from 'react-i18next';

import type { DashboardConfig, DashboardWidget, PreviewDevice } from '../types/dashboardConfig.types';
import { useLocalizedText } from '@/shared/i18n/localized';
import { Icon } from '@/shared/ui/icon/Icon';

type DashboardSchematicPreviewProps = Readonly<{
  cfg: DashboardConfig;
  device: PreviewDevice;
  height?: string;
  widgets: readonly DashboardWidget[];
}>;

const BAR_HEIGHTS = [62, 88, 48, 74, 56, 92, 40, 68];

/**
 * A placeholder/schematic preview of representative widget tiles (label,
 * icon, size-driven grid placement) reflecting the current in-progress
 * config, used uniformly for all 5 dashboards — see M11.2's documented
 * preview simplification: rendering the real, functioning Task dashboard
 * inside a config-preview pane is genuine runtime integration, deferred to
 * M11.3.
 * @prototype index.html:L7091-L7113 (`WireDashPreview`)
 */
export function DashboardSchematicPreview({ cfg, device, height, widgets }: DashboardSchematicPreviewProps) {
  const { t } = useTranslation('settings');
  const localize = useLocalizedText();
  const cols = device === 'desktop' ? Math.max(1, Math.min(4, cfg.cols)) : 1;
  const ids = cfg.ids.filter((id) => widgets.some((widget) => widget.id === id));

  return (
    <div
      className="overflow-y-auto rounded-lg border border-dashed border-line-strong bg-canvas p-3.5"
      style={{ height: height ?? 420 }}
    >
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${String(cols)}, minmax(0, 1fr))` }}>
        {ids.length ? (
          ids.map((id, index) => {
            const widget = widgets.find((candidate) => candidate.id === id);
            if (!widget) return null;
            return (
              <div
                className="flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-3.5"
                key={id}
                style={{ gridColumn: widget.size === 'full' || cols === 1 ? '1 / -1' : 'span 1' }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-accent">
                    <Icon name={widget.icon} size={14} />
                  </span>
                  <span className="flex-1 truncate text-sm font-semibold">{localize(widget.label)}</span>
                  <span className="font-mono text-2xs text-fg-4">
                    {'#'}
                    {index + 1}
                  </span>
                </div>
                {widget.cat === 'Metrics' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((tile) => (
                      <div className="rounded-lg border border-line bg-canvas p-2.5" key={tile}>
                        <div className="h-1.5 w-1/2 rounded bg-line-strong" />
                        <div
                          className={`mt-2 h-3.5 w-[70%] rounded ${tile === 0 ? 'bg-accent-dim' : 'bg-inset'}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : widget.cat === 'Charts' ? (
                  <div className="flex h-17.5 items-end gap-1.5">
                    {BAR_HEIGHTS.map((value, barIndex) => (
                      <span
                        className={`flex-1 rounded-t-sm ${barIndex % 3 === 0 ? 'bg-accent-dim' : 'bg-inset'}`}
                        key={barIndex}
                        style={{ height: `${String(value)}%` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {[80, 64, 72].map((value, rowIndex) => (
                      <div className="flex items-center gap-2" key={rowIndex}>
                        <span className="size-2 shrink-0 rounded-full bg-line-strong" />
                        <span className="h-2 rounded bg-inset" style={{ width: `${String(value)}%` }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-10 text-center text-sm-plus text-fg-4">{t('preview.noWidgets')}</div>
        )}
      </div>
    </div>
  );
}
