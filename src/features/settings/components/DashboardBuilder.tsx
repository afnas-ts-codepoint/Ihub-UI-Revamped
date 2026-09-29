import { DashboardActionsBar } from './DashboardActionsBar';
import { DashboardPreviewCard } from './DashboardPreviewCard';
import { DashboardPreviewModal } from './DashboardPreviewModal';
import { DashPickerCard } from './DashPickerCard';
import { LayoutSettingsCard } from './LayoutSettingsCard';
import { SavedConfigurationsCard } from './SavedConfigurationsCard';
import { ScopeCard } from './ScopeCard';
import { WidgetsCard } from './WidgetsCard';
import { DASHBOARD_USER_NAMES } from '../data/scopeTargets.data';
import { useDashboardBuilder } from '../hooks/useDashboardBuilder';
import type { BuilderMode, DashboardId } from '../types/dashboardConfig.types';

type DashboardBuilderProps = Readonly<{
  dashboardId: DashboardId;
  mode: BuilderMode;
  onDashboardChange: (id: DashboardId) => void;
}>;

/**
 * The one shared builder component used by both the Admin Configuration and
 * User Configuration tabs, parameterized by `mode` exactly as
 * `AdminTaskDashConfig` itself is in the prototype.
 * @prototype index.html:L7146-L7434 (`AdminTaskDashConfig`)
 */
export function DashboardBuilder({ dashboardId, mode, onDashboardChange }: DashboardBuilderProps) {
  const builder = useDashboardBuilder({ dashboardId, mode });

  return (
    <div className="flex flex-col gap-4">
      <DashPickerCard
        onChange={onDashboardChange}
        value={dashboardId}
        widgetCount={builder.widgets.length}
      />
      <ScopeCard builder={builder} userNames={DASHBOARD_USER_NAMES} />
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
        <div className="flex min-w-0 flex-col gap-4">
          <DashboardPreviewCard builder={builder} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <WidgetsCard builder={builder} />
          <LayoutSettingsCard builder={builder} />
          <SavedConfigurationsCard builder={builder} />
        </div>
      </div>
      <DashboardActionsBar builder={builder} />
      <DashboardPreviewModal builder={builder} />
    </div>
  );
}
