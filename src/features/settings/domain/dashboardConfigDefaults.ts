import type { DashboardConfig, DashboardWidget } from '../types/dashboardConfig.types';

/** @prototype index.html:L7154 */
export const MAX_WIDGETS = 15;

/**
 * The factory-standard configuration: every widget on, 2 columns, drag and
 * hide both allowed, mandatory widgets not locked.
 * @prototype index.html:L7157 (`STD`)
 */
export function standardDashboardConfig(
  widgets: readonly DashboardWidget[],
): DashboardConfig {
  return {
    cols: 2,
    dnd: true,
    hide: true,
    ids: widgets.map((widget) => widget.id),
    lock: false,
  };
}
